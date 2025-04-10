import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { HelpCircle, Heart, Mail, Phone, ExternalLink } from "lucide-react";

interface HelpButtonProps {
  eventTitle: string;
}

const HelpButton = ({ eventTitle }: HelpButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        variant="outline" 
        className="border-volunteer-DEFAULT text-volunteer-DEFAULT hover:bg-volunteer-light/50 group transition-all"
      >
        <HelpCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
        Help Out
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-lg overflow-hidden p-0">
          <div className="bg-gradient-to-r from-volunteer-DEFAULT to-volunteer-purple p-6">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center gap-2">
                <Heart className="h-5 w-5 text-white animate-pulse" /> 
                Thank You for Volunteering!
              </DialogTitle>
              <DialogDescription className="text-white/90">
                You're about to support: <span className="font-medium">{eventTitle}</span>
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <p className="text-volunteer-text">
                We appreciate your willingness to help! You can get involved in several ways:
              </p>
              
              <div className="space-y-3 mt-4">
                <div className="flex items-start gap-3 bg-volunteer-light/30 p-3 rounded-lg">
                  <Mail className="h-5 w-5 text-volunteer-DEFAULT mt-0.5" />
                  <div>
                    <h4 className="font-medium text-volunteer-text">Email the Organizer</h4>
                    <p className="text-sm text-volunteer-text-light">Send your details and availability to volunteer@example.org</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 bg-volunteer-light/30 p-3 rounded-lg">
                  <Phone className="h-5 w-5 text-volunteer-DEFAULT mt-0.5" />
                  <div>
                    <h4 className="font-medium text-volunteer-text">Call the Volunteer Hotline</h4>
                    <p className="text-sm text-volunteer-text-light">Speak directly with a coordinator: (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 bg-volunteer-light/30 p-3 rounded-lg">
                  <ExternalLink className="h-5 w-5 text-volunteer-DEFAULT mt-0.5" />
                  <div>
                    <h4 className="font-medium text-volunteer-text">Register Online</h4>
                    <p className="text-sm text-volunteer-text-light">Complete your volunteer registration on our website</p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                className="w-full bg-volunteer-DEFAULT hover:bg-volunteer-dark" 
                onClick={() => setOpen(false)}
              >
                Got It
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HelpButton;