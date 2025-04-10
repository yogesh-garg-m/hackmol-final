import { useState } from "react";
import { CalendarIcon, HeartHandshake } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface VolunteeringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, description: string, eventDate: Date, location: string, emergencyFlag: boolean) => void;
}

const VolunteeringDialog = ({ open, onOpenChange, onSubmit }: VolunteeringDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState("");
  const [emergencyFlag, setEmergencyFlag] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !eventDate || !location.trim()) return;
    
    setIsSubmitting(true);
    
    // Submit the form
    onSubmit(title, description, eventDate, location, emergencyFlag);
    
    // Reset the form
    setTitle("");
    setDescription("");
    setEventDate(undefined);
    setLocation("");
    setEmergencyFlag(false);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setEventDate(undefined);
    setLocation("");
    setEmergencyFlag(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Volunteering Event</DialogTitle>
            <DialogDescription>
              Create a new volunteering opportunity for students. Fill in all mandatory fields.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title*</Label>
              <Input
                id="title"
                placeholder="Enter event title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description*</Label>
              <Textarea
                id="description"
                placeholder="Enter event description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="glass-input min-h-[100px]"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-date">Event Date*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="event-date"
                    variant="outline"
                    className={cn(
                      "glass-input w-full justify-start text-left font-normal",
                      !eventDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventDate ? format(eventDate, "PPP") : <span>Select a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={eventDate}
                    onSelect={setEventDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location*</Label>
              <Input
                id="location"
                placeholder="Enter event location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="glass-input"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="emergency-flag"
                checked={emergencyFlag}
                onCheckedChange={setEmergencyFlag}
              />
              <Label htmlFor="emergency-flag">Emergency (High Priority)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
              className="glass-button"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !title.trim() || !description.trim() || !eventDate || !location.trim()}
              className="glass-button"
            >
              <HeartHandshake className="mr-2 h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VolunteeringDialog;