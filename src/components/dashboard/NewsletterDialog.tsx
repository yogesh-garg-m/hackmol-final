import { useState } from "react";
import { Send } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NewsletterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (heading: string, content: string) => void;
}

const NewsletterDialog = ({ open, onOpenChange, onSubmit }: NewsletterDialogProps) => {
  const [heading, setHeading] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!heading.trim() || !content.trim()) return;
    
    setIsSubmitting(true);
    
    // Submit the form
    onSubmit(heading, content);
    
    // Reset the form
    setHeading("");
    setContent("");
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setHeading("");
    setContent("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Send Newsletter</DialogTitle>
            <DialogDescription>
              Create a new newsletter or alert to send to all users. Click send when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="heading">Heading</Label>
              <Input
                id="heading"
                placeholder="Enter newsletter heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="glass-input"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Enter newsletter content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="glass-input min-h-[150px]"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !heading.trim() || !content.trim()}
              className="glass-button"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? "Sending..." : "Send Newsletter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterDialog;