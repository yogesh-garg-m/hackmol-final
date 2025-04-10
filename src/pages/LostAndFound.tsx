import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";
import ItemCard from "@/components/LostAndFound/ItemCard";
import LostItemForm from "@/components/LostAndFound/LostitemForm";
import FoundItemForm from "@/components/LostAndFound/FoundItemForm";
import ItemDetails from "@/components/LostAndFound/ItemDetails";
import ContactDialog from "@/components/LostAndFound/ContactDialog";
import ImageCompare from "@/components/LostAndFound/ImageCompare";

import { ItemDetails as ItemDetailsType, ItemStatus } from "@/types/lost-found";

import { getLostItems, getFoundItems } from "@/services/lostFoundService";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { AutoProcessor, CLIPModel, env } from '@xenova/transformers';

// Configure transformers.js to use browser cache
env.allowLocalModels = false;
env.useBrowserCache = true;

const LostAndFound: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("browse");
  const [showLostForm, setShowLostForm] = useState<boolean>(false);
  const [showFoundForm, setShowFoundForm] = useState<boolean>(false);
  const [lostItems, setLostItems] = useState<ItemDetailsType[]>([]);
  const [foundItems, setFoundItems] = useState<ItemDetailsType[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemDetailsType | null>(null);
  const [showContactDialog, setShowContactDialog] = useState<boolean>(false);
  const [showImageCompare, setShowImageCompare] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [potentialMatches, setPotentialMatches] = useState<{
    lost: ItemDetailsType[];
    found: ItemDetailsType[];
  }>({ lost: [], found: [] });
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  const [model, setModel] = useState<{ processor: any; model: any } | null>(null);
  const session = useSession();
  const { toast } = useToast();

  // Load the image comparison model and processor
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("Loading image embedding model...");
        const processor = await AutoProcessor.from_pretrained('Xenova/clip-vit-base-patch32');
        const model = await CLIPModel.from_pretrained('Xenova/clip-vit-base-patch32');
        console.log("Model and processor loaded successfully");
        setModel({ processor, model });
        setModelLoaded(true);
      } catch (err) {
        console.error("Error loading model:", err);
        toast({
          title: "Error Loading Model",
          description: "Failed to load image comparison model. Some features may be limited.",
          variant: "destructive",
        });
      }
    };
    loadModel();
  }, [toast]);

  // Fetch items from the database
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const [lost, found] = await Promise.all([getLostItems(), getFoundItems()]);
        const convertedLostItems = lost.map(item => ({
          id: item.id.toString(),
          status: 'lost' as const,
          title: item.title,
          description: item.description,
          category: item.category,
          location: item.location,
          date: item.date,
          imageUrl: item.imageUrl,
          contactEmail: item.contact_email,
          contactPhone: item.contact_phone,
          matches: []
        }));
        const convertedFoundItems = found.map(item => ({
          id: item.id.toString(),
          status: 'found' as const,
          title: item.title,
          description: item.description,
          category: item.category,
          location: item.location,
          date: item.date,
          imageUrl: item.imageUrl,
          contactEmail: item.contact_email,
          contactPhone: item.contact_phone,
          matches: []
        }));
        setLostItems(convertedLostItems);
        setFoundItems(convertedFoundItems);
      } catch (error) {
        console.error("Error fetching items:", error);
        toast({
          title: "Error Loading Items",
          description: "There was an error loading the lost and found items. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [toast]);

  // Compare lost and found items for potential matches
  useEffect(() => {
    const compareItems = async () => {
      console.log("compareItems called, modelLoaded:", modelLoaded, "model:", model);
      console.log("lostItems:", lostItems.length, "foundItems:", foundItems.length);
      
      if (!modelLoaded || !model || lostItems.length === 0 || foundItems.length === 0) {
        console.log("Skipping comparison due to missing requirements");
        return;
      }

      setIsComparing(true);
      const newPotentialMatches = {
        lost: [...lostItems],
        found: [...foundItems]
      };

      try {
        // Get the current user ID from Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error getting user:", userError);
          return;
        }

        // Compare each lost item with all found items
        for (const lostItem of lostItems) {
          console.log("Processing lost item:", lostItem.id);
          const lostImageUrl = lostItem.imageUrl;
          console.log("lostImageUrl:", lostImageUrl);
          // Convert base64 to actual image bitmap
          let lostBitmap;
          try {
            if (lostImageUrl.startsWith('data:image')) {
              console.log("Creating bitmap from base64 data URL");
              lostBitmap = await createImageBitmapFromBase64(lostImageUrl);
            } else if (lostImageUrl.startsWith('http')) {
              console.log("Fetching bitmap from URL:", lostImageUrl);
              lostBitmap = await fetchImageBitmapFromUrl(lostImageUrl);
            } else {
              console.log("Creating bitmap from raw base64 string");
              lostBitmap = await createImageBitmapFromBase64(`data:image/jpeg;base64,${lostImageUrl}`);
            }
            
            console.log("Lost bitmap created successfully");
            
            // Get lost item embedding
            console.log("Getting embedding for lost item");
            const inputText = [lostBitmap];
            // const processedLostImage = await model.processor(inputText);
            
              
              const processedLostImage = await model.processor(inputText);
              console.log("Processed lost image:", processedLostImage);
            
            
            const { image_embeds: lostEmbeds } = await model.model.get_image_features(processedLostImage);
            
            const lostEmbedding = lostEmbeds;
            console.log("Lost item embedding created successfully:", lostEmbedding);
            
            // Compare with each found item
            for (const foundItem of foundItems) {
              console.log("Comparing with found item:", foundItem.id);
              const foundImageUrl = foundItem.imageUrl;
              
              // Convert base64 to actual image bitmap
              let foundBitmap;
              if (foundImageUrl.startsWith('data:image')) {
                foundBitmap = await createImageBitmapFromBase64(foundImageUrl);
              } else if (foundImageUrl.startsWith('http')) {
                foundBitmap = await fetchImageBitmapFromUrl(foundImageUrl);
              } else {
                foundBitmap = await createImageBitmapFromBase64(`data:image/jpeg;base64,${foundImageUrl}`);
              }
              
              console.log("Found bitmap created successfully");
              
              // Get found item embedding
              console.log("Getting embedding for found item");
              const processedFoundImage = await model.processor([foundBitmap]);
              const { image_embeds: foundEmbeds } = await model.model.get_image_features(processedFoundImage);
              const foundEmbedding = foundEmbeds;
              console.log("Found item embedding created successfully:", foundEmbedding);
              
              // Calculate similarity
              const similarityScore = calculateCosineSimilarity(
                lostEmbedding.data, 
                foundEmbedding.data
              );
              
              // Convert similarity to percentage (0.7 → 70%)
              const confidencePercentage = Math.round(similarityScore * 100);
              
              console.log("Similarity score:", similarityScore, "Confidence:", confidencePercentage);
              
              // If confidence is high enough, mark as potential match
              if (confidencePercentage > 70) {
                console.log("High confidence match found!");
                if (!newPotentialMatches.lost.find(item => item.id === lostItem.id)?.matches.includes(foundItem.id)) {
                  newPotentialMatches.lost = newPotentialMatches.lost.map(item => 
                    item.id === lostItem.id 
                      ? { ...item, matches: [...item.matches, foundItem.id] } 
                      : item
                  );
                }
                
                if (!newPotentialMatches.found.find(item => item.id === foundItem.id)?.matches.includes(lostItem.id)) {
                  newPotentialMatches.found = newPotentialMatches.found.map(item => 
                    item.id === foundItem.id 
                      ? { ...item, matches: [...item.matches, lostItem.id] } 
                      : item
                  );
                }
              }
            }
          } catch (itemError) {
            console.error("Error processing lost item:", lostItem.id, itemError);
            // Continue with next item instead of breaking the entire process
          }
        }
        
        setPotentialMatches(newPotentialMatches);
        setLostItems(newPotentialMatches.lost);
        setFoundItems(newPotentialMatches.found);
        
        const totalMatches = newPotentialMatches.lost.reduce((count, item) => count + item.matches.length, 0);
        if (totalMatches > 0) {
          toast({
            title: "Potential Matches Found",
            description: `We found ${totalMatches} potential matches between lost and found items.`,
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Error comparing items:", error);
        toast({
          title: "Error Comparing Items",
          description: "There was an error comparing lost and found items. Please try again later.",
          
        });
      } finally {
        setIsComparing(false);
      }
    };

    compareItems();
  }, [modelLoaded, model, lostItems.length, foundItems.length, toast]);

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

  const handleLostItemSubmit = async (imageUrl: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      console.log("Submitting lost item with user ID:", user.id);
      setShowLostForm(false);
      window.location.reload();
    } catch (error) {
      console.error("Error submitting lost item:", error);
      toast({ title: "Error", description: "Failed to submit lost item. Please try again.", variant: "destructive" });
    }
  };

  const handleFoundItemSubmit = async (imageUrl: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      console.log("Submitting found item with user ID:", user.id);
      setShowFoundForm(false);
      window.location.reload();
    } catch (error) {
      console.error("Error submitting found item:", error);
      toast({ title: "Error", description: "Failed to submit found item. Please try again.", variant: "destructive" });
    }
  };

  const handleViewDetails = (item: ItemDetailsType) => setSelectedItem(item);
  const handleContactClick = (item: ItemDetailsType) => { setSelectedItem(item); setShowContactDialog(true); };
  const handleCompareImages = (lostItem: ItemDetailsType, foundItem: ItemDetailsType) => setShowImageCompare(true);
  const getPotentialMatches = (item: ItemDetailsType) =>
    item.status === 'lost'
      ? foundItems.filter(foundItem => item.matches.includes(foundItem.id))
      : lostItems.filter(lostItem => item.matches.includes(lostItem.id));

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Lost & Found</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowLostForm(true)} className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200">
            <Plus className="h-4 w-4 mr-2" /> Report Lost Item
          </Button>
          <Button variant="outline" onClick={() => setShowFoundForm(true)} className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200">
            <Plus className="h-4 w-4 mr-2" /> Report Found Item
          </Button>
        </div>
      </div>

      {isComparing && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">Analyzing potential matches between lost and found items...</p>
        </div>
      )}

      <Tabs defaultValue="browse" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="browse">Browse All</TabsTrigger>
          <TabsTrigger value="lost">Lost Items</TabsTrigger>
          <TabsTrigger value="found">Found Items</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8">Loading items...</div>
            ) : lostItems.length === 0 && foundItems.length === 0 ? (
              <div className="col-span-full text-center py-8">No lost or found items available.</div>
            ) : (
              <>
                {lostItems.map((item) => (
                  <ItemCard key={`lost-${item.id}`} item={item} onContactClick={handleContactClick} onViewDetails={handleViewDetails} hasMatches={item.matches.length > 0} />
                ))}
                {foundItems.map((item) => (
                  <ItemCard key={`found-${item.id}`} item={item} onContactClick={handleContactClick} onViewDetails={handleViewDetails} hasMatches={item.matches.length > 0} />
                ))}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="lost" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8">Loading lost items...</div>
            ) : lostItems.length === 0 ? (
              <div className="col-span-full text-center py-8">No lost items available.</div>
            ) : (
              lostItems.map((item) => (
                <ItemCard key={`lost-${item.id}`} item={item} onContactClick={handleContactClick} onViewDetails={handleViewDetails} hasMatches={item.matches.length > 0} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="found" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8">Loading found items...</div>
            ) : foundItems.length === 0 ? (
              <div className="col-span-full text-center py-8">No found items available.</div>
            ) : (
              foundItems.map((item) => (
                <ItemCard key={`found-${item.id}`} item={item} onContactClick={handleContactClick} onViewDetails={handleViewDetails} hasMatches={item.matches.length > 0} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {showLostForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Report Lost Item</h2>
              <Button variant="ghost" onClick={() => setShowLostForm(false)}>×</Button>
            </div>
            <LostItemForm onSubmitComplete={handleLostItemSubmit} />
          </div>
        </div>
      )}

      {showFoundForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Report Found Item</h2>
              <Button variant="ghost" onClick={() => setShowFoundForm(false)}>×</Button>
            </div>
            <FoundItemForm onSubmitComplete={handleFoundItemSubmit} />
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Item Details</h2>
              <Button variant="ghost" onClick={() => setSelectedItem(null)}>×</Button>
            </div>
            <ItemDetails item={selectedItem} onContactClick={() => { setSelectedItem(null); setShowContactDialog(true); }} />
            {selectedItem.matches.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Potential Matches</h3>
                <div className="grid grid-cols-1 gap-4">
                  {getPotentialMatches(selectedItem).map((match) => (
                    <div key={match.id} className="border rounded-md p-3 flex items-center gap-3">
                      <div className="w-16 h-16 overflow-hidden rounded-md">
                        <img src={match.imageUrl} alt={match.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{match.title}</h4>
                        <p className="text-sm text-gray-500">{match.status === 'lost' ? 'Lost' : 'Found'} on {match.date}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedItem(null);
                        if (selectedItem.status === 'lost') handleCompareImages(selectedItem, match);
                        else handleCompareImages(match, selectedItem);
                      }}>
                        Compare
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedItem && (
        <ContactDialog isOpen={showContactDialog} onClose={() => setShowContactDialog(false)} item={selectedItem} />
      )}

      <ImageCompare isOpen={showImageCompare} onClose={() => setShowImageCompare(false)} lostItem={lostItems[0] || null} foundItem={foundItems[0] || null} />
    </div>
  );
};

export default LostAndFound;