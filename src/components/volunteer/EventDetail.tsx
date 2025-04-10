import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Heart, ArrowUpRight, Share2, AlertTriangle } from "lucide-react";
import { VolunteerEvent } from "@/types/event";
import { formatEventDate } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";

interface EventDetailProps {
  event: VolunteerEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

const EventDetail = ({ event, isOpen, onClose }: EventDetailProps) => {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-xl shadow-xl">
        <div className="relative">
          <div className="h-64 overflow-hidden">
            <img 
              src={event.thumbnail} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full p-6 text-white">
            <DialogHeader className="items-start text-left">
              <div className="flex items-center justify-between w-full">
                <DialogTitle className="text-2xl sm:text-3xl font-bold mr-2 drop-shadow-md">
                  {event.title}
                </DialogTitle>
                {event.emergency_flag && (
                  <Badge className="bg-volunteer-emergency text-white animate-pulse-subtle shadow-md border border-white/30 flex items-center gap-1 px-3 py-1">
                    <AlertTriangle size={14} />
                    <span>Urgent Need</span>
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-white/90">
                Posted {new Date(event.created_at).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={cn(
              "flex items-center p-3 rounded-lg transition-transform hover:scale-105 duration-200 shadow-sm",
              event.emergency_flag ? "bg-volunteer-emergency/10" : "bg-volunteer-light/30"
            )}>
              <Calendar className={cn(
                "h-5 w-5 mr-2",
                event.emergency_flag ? "text-volunteer-emergency" : "text-volunteer-DEFAULT"
              )} />
              <div>
                <p className="text-xs text-volunteer-text-light">Date</p>
                <p className="text-sm font-medium text-volunteer-text">
                  {new Date(event.event_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className={cn(
              "flex items-center p-3 rounded-lg transition-transform hover:scale-105 duration-200 shadow-sm",
              event.emergency_flag ? "bg-volunteer-emergency/10" : "bg-volunteer-light/30"
            )}>
              <Clock className={cn(
                "h-5 w-5 mr-2",
                event.emergency_flag ? "text-volunteer-emergency" : "text-volunteer-DEFAULT"
              )} />
              <div>
                <p className="text-xs text-volunteer-text-light">Time</p>
                <p className="text-sm font-medium text-volunteer-text">
                  {new Date(event.event_date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            
            <div className={cn(
              "flex items-center p-3 rounded-lg transition-transform hover:scale-105 duration-200 shadow-sm",
              event.emergency_flag ? "bg-volunteer-emergency/10" : "bg-volunteer-light/30"
            )}>
              <MapPin className={cn(
                "h-5 w-5 mr-2",
                event.emergency_flag ? "text-volunteer-emergency" : "text-volunteer-DEFAULT"
              )} />
              <div>
                <p className="text-xs text-volunteer-text-light">Location</p>
                <p className="text-sm font-medium text-volunteer-text">{event.location}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className={cn(
              "text-lg font-semibold mb-2 flex items-center gap-2",
              event.emergency_flag ? "text-volunteer-emergency" : "text-volunteer-text"
            )}>
              <Heart className={cn(
                "h-5 w-5",
                event.emergency_flag ? "text-volunteer-emergency" : "text-volunteer-DEFAULT"
              )} />
              About This Event
            </h3>
            <p className="text-volunteer-text-light whitespace-pre-line">{event.description}</p>
          </div>

          {event.organizer_name && (
            <div className="mb-6 p-4 border rounded-lg bg-volunteer-light/10 transition-all hover:bg-volunteer-light/20 duration-200 shadow-sm" 
              style={{
                borderColor: event.emergency_flag ? 'rgba(237, 85, 59, 0.3)' : 'var(--volunteer-light)'
              }}
            >
              <div className="flex items-center">
                <Users className={cn(
                  "h-5 w-5 mr-2",
                  event.emergency_flag ? "text-volunteer-emergency" : "text-volunteer-DEFAULT"
                )} />
                <h3 className="text-md font-medium text-volunteer-text">Organized by {event.organizer_name}</h3>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button className={cn(
              "flex-1 group transition-all",
              event.emergency_flag 
                ? "bg-volunteer-emergency hover:bg-volunteer-emergency/90"
                : "bg-volunteer-DEFAULT hover:bg-volunteer-dark"
            )}>
              <Heart className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Sign Up Now
            </Button>
            <Button variant="outline" className={cn(
              "group transition-all",
              event.emergency_flag 
                ? "border-volunteer-emergency text-volunteer-emergency hover:bg-volunteer-emergency/10"
                : "border-volunteer-DEFAULT text-volunteer-DEFAULT hover:bg-volunteer-light/50"
            )}>
              <Calendar className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
              Save to Calendar
            </Button>
            <Button variant="outline" className={cn(
              "group transition-all",
              event.emergency_flag 
                ? "border-volunteer-emergency text-volunteer-emergency hover:bg-volunteer-emergency/10"
                : "border-volunteer-DEFAULT text-volunteer-DEFAULT hover:bg-volunteer-light/50"
            )}>
              <Share2 className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
              Share
            </Button>
          </div>

          {event.emergency_flag && (
            <div className="mt-6 p-4 bg-volunteer-emergency/10 border border-volunteer-emergency/30 rounded-lg urgent-pulse">
              <div className="flex items-start gap-3">
                <div className="bg-volunteer-emergency rounded-full p-1.5 mt-0.5">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-volunteer-emergency">Urgent Need!</h4>
                  <p className="text-sm text-volunteer-text-light">This opportunity requires immediate support. Please consider signing up as soon as possible.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetail;