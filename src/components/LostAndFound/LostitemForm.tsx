import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form,
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast"; 
import { Camera, Image, Upload } from "lucide-react";
import { addLostItem } from "@/services/lostFoundService";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Please provide a detailed description" }),
  category: z.string().min(1, { message: "Category is required" }),
  location: z.string().min(3, { message: "Location is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  contactEmail: z.string().email({ message: "Invalid email address" }),
  contactPhone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LostItemFormProps {
  onSubmitComplete: (imageUrl: string) => void;
}

const LostItemForm: React.FC<LostItemFormProps> = ({ onSubmitComplete }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const session = useSession();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      date: new Date().toISOString().split('T')[0],
      contactEmail: "",
      contactPhone: "",
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!imagePreview) {
      toast({
        title: "Image Required",
        description: "Please upload an image of the lost item",
        variant: "destructive",
      });
      return;
    }

    if (!user.id) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to report a lost item",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add the lost item to the database
      const newItem = await addLostItem({
        user_id: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        date_lost: data.date,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone || null,
        image_base64: imagePreview,
      });
      
      toast({
        title: "Report Submitted",
        description: "Your lost item report has been submitted successfully.",
      });
      
      // Pass the image URL to the parent component
      onSubmitComplete(newItem.imageUrl);
      
      // Reset the form
      form.reset();
      setImagePreview(null);
    } catch (error) {
      console.error("Error submitting lost item:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Item Image</h3>
              <p className="text-sm text-gray-500 mb-4">
                Upload a clear image of your lost item to help others identify it
              </p>
              
              {imagePreview ? (
                <div className="relative mt-2 rounded-lg overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-64 object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute bottom-2 right-2 bg-white hover:bg-gray-100"
                    onClick={() => setImagePreview(null)}
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="upload-zone">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 rounded-full bg-lostfound-light text-lostfound-primary">
                      <Image className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="font-medium">Click to upload an image</p>
                      <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => document.getElementById('imageUpload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Lost iPhone 13" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide details about your lost item (color, size, distinguishing features, etc.)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Electronics, Jewelry, Clothing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Lost</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Library, Room 301" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Lost</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (123) 456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-lostfound-primary hover:bg-lostfound-secondary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Lost Item Report"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LostItemForm;
