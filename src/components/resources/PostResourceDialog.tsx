import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { moderateResource } from "@/lib/ai-resources-moderation";
import { Loader2 } from "lucide-react";
import AICheckingOverlay from "@/components/ui/ai-checking-overlay";

interface PostResourceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const categories = ["Study Material", "News", "Internship", "Event", "Other"];
const resourceTypes = ["PDF Document", "External Link", "Image", "Video"];

const PostResourceDialog: React.FC<PostResourceDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModerating, setIsModerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    tags: '',
    type: '',
    link: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to post a resource",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setIsModerating(true);

    try {
      // First, moderate the resource
      const isApproved = await moderateResource(formData);
      
      if (!isApproved) {
        toast({
          title: "Resource Rejected",
          description: "This resource appears to be misleading or not useful. Please review and try again.",
          variant: "destructive",
        });
        return;
      }

      // If approved, proceed with insertion
      const { error } = await supabase
        .from('resources')
        .insert([
          {
            title: formData.title,
            category: formData.category,
            description: formData.description,
            tags: formData.tags,
            type: formData.type,
            link: formData.link,
            posted_by_type: "user",
            posted_by_user: user.id,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resource posted successfully",
      });
      onSuccess();
      onClose();
      setFormData({
        title: '',
        category: '',
        description: '',
        tags: '',
        type: '',
        link: '',
      });
    } catch (error) {
      console.error('Error posting resource:', error);
      toast({
        title: "Error",
        description: "Failed to post resource. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsModerating(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-none">
            <DialogTitle>Post New Resource</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter resource title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">Choose the appropriate category for your resource</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter resource description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[100px]"
                required
              />
              <p className="text-sm text-gray-500">Provide a brief description of the resource</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="CSE, ECE, 2nd Year, Computer Vision"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
              <p className="text-sm text-gray-500">Enter all tags in comma separated values</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Resource Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">Choose the type of resource you're sharing</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Resource Link</Label>
              <Input
                id="link"
                placeholder="Enter resource URL or file link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                required
              />
              <p className="text-sm text-gray-500">Provide the link to access the resource</p>
            </div>
          </form>
          <DialogFooter className="flex-none flex gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isModerating}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isModerating}
              onClick={handleSubmit}
              className="min-w-[120px]"
            >
              {isModerating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AI Checking...</span>
                </div>
              ) : isSubmitting ? (
                "Posting..."
              ) : (
                "Post Resource"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AICheckingOverlay isVisible={isModerating} />
    </>
  );
};

export default PostResourceDialog; 