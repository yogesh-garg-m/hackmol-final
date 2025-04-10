import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserRound, LifeBuoy, Calendar, MapPin, ImageIcon, AlertTriangle, Upload } from "lucide-react";
import { VolunteerEvent } from "@/types/event";
import { createEvent } from "@/services/eventService";
import { supabase } from "@/integrations/supabase/client";

interface CreateEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: (event: VolunteerEvent) => void;
}

const CreateEventDialog = ({ isOpen, onOpenChange, onEventCreated }: CreateEventDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [emergencyFlag, setEmergencyFlag] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert URL to base64
  useEffect(() => {
    const loadImage = async () => {
      if (thumbnailUrl && thumbnailUrl.startsWith('https://')) {
        try {
          const response = await fetch(thumbnailUrl);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setThumbnail(reader.result as string);
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error("Error loading image:", error);
        }
      }
    };

    loadImage();
  }, [thumbnailUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
        setThumbnailUrl(""); // Clear URL input when file is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id || null;

      const newEvent = {
        title,
        description,
        event_date: new Date(eventDate).toISOString(),
        location,
        organized_by: userId,
        emergency_flag: emergencyFlag,
        thumbnail: thumbnail || "https://picsum.photos/seed/" + Math.random().toString(36).substring(7) + "/800/400"
      };

      const createdEvent = await createEvent(newEvent);
      
      if (createdEvent) {
        onEventCreated(createdEvent);
        resetForm();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEventDate("");
    setLocation("");
    setEmergencyFlag(false);
    setThumbnailUrl("");
    setThumbnail("");
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 p-0 rounded-xl">
        <div className="bg-gradient-to-r from-[#2c7c74] to-[#3CAEA3] p-6 rounded-t-xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="bg-white/20 rounded-full p-2">
                <UserRound className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-white">Create Volunteering Event</DialogTitle>
            </div>
            <DialogDescription className="text-white/90">
              Fill in the details to create a new volunteering or donation opportunity
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-gray-900 font-medium flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-[#2c7c74]" />
                Event Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Community Beach Cleanup"
                className="border-gray-200 focus:border-[#2c7c74]"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-gray-900 font-medium flex items-center gap-2">
                <UserRound className="h-4 w-4 text-[#2c7c74]" />
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the volunteering opportunity in detail..."
                className="min-h-[120px] border-gray-200 focus:border-[#2c7c74]"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location" className="text-gray-900 font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#2c7c74]" />
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="E.g., Central Park, New York"
                className="border-gray-200 focus:border-[#2c7c74]"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="eventDate" className="text-gray-900 font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#2c7c74]" />
                Event Date
              </Label>
              <Input
                id="eventDate"
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="border-gray-200 focus:border-[#2c7c74]"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-gray-900 font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-[#2c7c74]" />
                Event Image
              </Label>
              
              <div className="grid gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="thumbnailUrl" className="sr-only">Image URL</Label>
                    <Input
                      id="thumbnailUrl"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="border-gray-200 focus:border-[#2c7c74]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={triggerFileInput}
                      className="border-[#2c7c74] text-[#2c7c74] hover:bg-[#2c7c74]/10 flex-shrink-0"
                    >
                      <Upload className="h-4 w-4 mr-2" /> 
                      Upload
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                
                {thumbnail && (
                  <div className="h-40 w-full overflow-hidden rounded-md bg-gray-100">
                    <img src={thumbnail} alt="Event thumbnail" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${emergencyFlag ? 'text-red-500' : 'text-gray-400'}`} />
                <div>
                  <p className="font-medium text-gray-900">Mark as Urgent Need</p>
                  <p className="text-sm text-gray-600">This will highlight the event as requiring immediate attention</p>
                </div>
              </div>
              <Switch
                checked={emergencyFlag}
                onCheckedChange={setEmergencyFlag}
                className="data-[state=checked]:bg-red-500"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto border-gray-200 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-[#2c7c74] hover:bg-[#236a63] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;