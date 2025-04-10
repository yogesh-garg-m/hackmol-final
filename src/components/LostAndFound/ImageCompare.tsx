import React, { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ItemDetails } from "@/types/lost-found";
import { useToast } from "@/components/ui/use-toast";
import { AutoProcessor, CLIPModel, env } from '@xenova/transformers';
import { findMatchesForLostItem, findMatchesForFoundItem } from "@/services/lostFoundService";
import { supabase } from "@/lib/supabase";

// Configure transformers.js to use browser cache
env.allowLocalModels = false;
env.useBrowserCache = true;

interface ImageCompareProps {
  isOpen: boolean;
  onClose: () => void;
  lostItem: ItemDetails | null;
  foundItem: ItemDetails | null;
}

const ImageCompare: React.FC<ImageCompareProps> = ({ isOpen, onClose, lostItem, foundItem }) => {
  const { toast } = useToast();
  const [confidence, setConfidence] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisComplete, setAnalysisComplete] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<ItemDetails[]>([]);
  const modelRef = useRef<{ processor: any; model: any } | null>(null);

  // Load the model and processor when the component mounts
  useEffect(() => {
    const loadModel = async () => {
      try {
        if (!modelRef.current) {
          console.log("Loading image embedding model...");
          const processor = await AutoProcessor.from_pretrained('Xenova/clip-vit-base-patch32');
          const model = await CLIPModel.from_pretrained('Xenova/clip-vit-base-patch32');
          modelRef.current = { processor, model };
          console.log("Model and processor loaded successfully");
        }
      } catch (err) {
        console.error("Error loading model:", err);
        setError("Failed to load image comparison model. Please try again later.");
      }
    };
    loadModel();
  }, []);

  // Perform image comparison when the dialog opens
  useEffect(() => {
    if (isOpen && lostItem && foundItem && !analysisComplete && !isAnalyzing) {
      compareImages();
    }
  }, [isOpen, lostItem, foundItem, analysisComplete, isAnalyzing]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setAnalysisComplete(false);
      setError(null);
      setMatches([]);
    }
  }, [isOpen]);

  // Compare the images using the CLIP model
  const compareImages = async () => {
    if (!lostItem || !foundItem || !modelRef.current) return;

    setIsAnalyzing(true);
    setConfidence(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => setConfidence(prev => Math.min(prev + 5, 95)), 200);

      const lostImageUrl = lostItem.imageUrl;
      const foundImageUrl = foundItem.imageUrl;

      // Convert images to ImageBitmap
      let lostBitmap, foundBitmap;
      if (lostImageUrl.startsWith('data:image')) {
        lostBitmap = await createImageBitmapFromBase64(lostImageUrl);
      } else if (lostImageUrl.startsWith('http')) {
        lostBitmap = await fetchImageBitmapFromUrl(lostImageUrl);
      } else {
        lostBitmap = await createImageBitmapFromBase64(`data:image/jpeg;base64,${lostImageUrl}`);
      }

      if (foundImageUrl.startsWith('data:image')) {
        foundBitmap = await createImageBitmapFromBase64(foundImageUrl);
      } else if (foundImageUrl.startsWith('http')) {
        foundBitmap = await fetchImageBitmapFromUrl(foundImageUrl);
      } else {
        foundBitmap = await createImageBitmapFromBase64(`data:image/jpeg;base64,${foundImageUrl}`);
      }

      // Preprocess images (pass as arrays)
      const processedLostImage = await modelRef.current.processor([lostBitmap]);
      const processedFoundImage = await modelRef.current.processor([foundBitmap]);

      // Get image features
      const { image_embeds: lostEmbeds } = await modelRef.current.model.get_image_features(processedLostImage);
      const { image_embeds: foundEmbeds } = await modelRef.current.model.get_image_features(processedFoundImage);

      clearInterval(progressInterval);

      // Calculate similarity
      const similarityScore = calculateCosineSimilarity(lostEmbeds.data, foundEmbeds.data);
      const confidencePercentage = Math.round(similarityScore * 100);

      setConfidence(confidencePercentage);
      setIsAnalyzing(false);
      setAnalysisComplete(true);

      // If confidence is high enough, fetch potential matches
      if (confidencePercentage > 70) {
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) throw new Error("Failed to get user information");

          const serviceItem = {
            id: parseInt(lostItem.id),
            user_id: user.id,
            title: lostItem.title,
            description: lostItem.description,
            category: lostItem.category,
            location: lostItem.location,
            date: lostItem.date,
            contact_email: lostItem.contactEmail || "",
            contact_phone: lostItem.contactPhone,
            image_base64: lostItem.imageUrl,
            imageUrl: lostItem.imageUrl,
            status: lostItem.status
          };

          const potentialMatches = lostItem.status === 'lost'
            ? await findMatchesForLostItem(serviceItem)
            : await findMatchesForFoundItem(serviceItem);

          const convertedMatches = potentialMatches.map(match => ({
            id: match.id.toString(),
            status: match.status,
            title: match.title,
            description: match.description,
            category: match.category,
            location: match.location,
            date: match.date,
            imageUrl: match.imageUrl,
            contactEmail: match.contact_email,
            contactPhone: match.contact_phone,
            matches: []
          }));

          setMatches(convertedMatches);
        } catch (err) {
          console.error("Error fetching potential matches:", err);
        }
      }
    } catch (err) {
      console.error("Error comparing images:", err);
      setError("Error analyzing images. Please try again.");
      setIsAnalyzing(false);
      setConfidence(0);
    }
  };

  // Helper function to create an ImageBitmap from base64
  const createImageBitmapFromBase64 = async (base64String: string): Promise<ImageBitmap> => {
    const img = new Image();
    img.src = base64String;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    const bitmap = await createImageBitmap(img);
    return bitmap;
  };

  // Helper function to fetch an ImageBitmap from a URL
  const fetchImageBitmapFromUrl = async (url: string): Promise<ImageBitmap> => {
    const response = await fetch(url);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    return bitmap;
  };

  // Calculate cosine similarity between two vectors
  const calculateCosineSimilarity = (vecA: number[], vecB: number[]) => {
    if (vecA.length !== vecB.length) throw new Error("Vectors must have the same length");
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  if (!lostItem || !foundItem) return null;

  const handleConfirmMatch = () => {
    toast({ title: "Match Confirmed", description: "The owner has been notified of the potential match." });
    onClose();
  };

  const getConfidenceColor = () => {
    if (confidence < 40) return "text-red-500";
    if (confidence < 70) return "text-yellow-500";
    return "text-green-500";
  };

  const getConfidenceLabel = () => {
    if (confidence < 40) return "Low Match Probability";
    if (confidence < 70) return "Possible Match";
    return "High Match Probability";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Compare Items</DialogTitle>
          <DialogDescription>Our AI is analyzing visual similarities between the lost and found items.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium flex items-center">
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded mr-2">LOST</span>
              {lostItem.title}
            </h3>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <img src={lostItem.imageUrl} alt={lostItem.title} className="w-full h-64 object-cover" />
            </div>
            <p className="text-sm">{lostItem.description}</p>
            <div className="text-xs text-gray-500">
              <p>Lost at: {lostItem.location}</p>
              <p>Lost on: {lostItem.date}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium flex items-center">
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded mr-2">FOUND</span>
              {foundItem.title}
            </h3>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <img src={foundItem.imageUrl} alt={foundItem.title} className="w-full h-64 object-cover" />
            </div>
            <p className="text-sm">{foundItem.description}</p>
            <div className="text-xs text-gray-500">
              <p>Found at: {foundItem.location}</p>
              <p>Found on: {foundItem.date}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Image Analysis</h4>
          {error ? (
            <div className="text-red-500 text-sm">
              {error}
              <Button variant="outline" size="sm" className="mt-2" onClick={compareImages}>Try Again</Button>
            </div>
          ) : isAnalyzing ? (
            <div className="space-y-2">
              <p className="text-xs text-yellow-700">Analyzing image similarities using computer vision... This may take a moment.</p>
              <Progress value={confidence} className="h-2" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Match confidence:</p>
                <p className={`text-lg font-bold ${getConfidenceColor()}`}>{confidence}%</p>
              </div>
              <Progress value={confidence} className="h-2" />
              <p className={`text-sm font-medium mt-2 ${getConfidenceColor()}`}>{getConfidenceLabel()}</p>
              <p className="text-xs text-yellow-700 mt-1">
                {confidence >= 70
                  ? "The images show strong visual similarities detected by computer vision. This is likely to be the same item."
                  : confidence >= 40
                    ? "The AI detects some visual similarities. Review carefully before confirming."
                    : "The AI detects few visual similarities. These are likely different items."}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between mt-4">
          <Button variant="outline" onClick={onClose}>Not a Match</Button>
          <Button className="bg-lostfound-primary hover:bg-lostfound-secondary" onClick={handleConfirmMatch} disabled={isAnalyzing || confidence < 40}>
            {isAnalyzing ? "Analyzing..." : "Confirm Match"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCompare;