import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, AlertTriangle } from "lucide-react";
import { VolunteerEvent } from "@/types/event";
import { formatEventDate, formatRelativeDate } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";
import HelpButton from "./HelpButton";

interface EventCardProps {
  event: VolunteerEvent;
  onClick: (event: VolunteerEvent) => void;
}

const EventCard = ({ event, onClick }: EventCardProps) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer h-full flex flex-col",
        event.emergency_flag 
          ? "border-red-500 border-2 bg-gradient-to-br from-white to-red-50 shadow-md hover:shadow-red-500/20" 
          : "hover:border-[#2c7c74] bg-white hover:translate-y-[-4px]"
      )}
    >
      <div className="relative" onClick={() => onClick(event)}>
        <div className="h-48 overflow-hidden">
          <img 
            src={event.thumbnail} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        {event.emergency_flag && (
          <div className="absolute top-2 right-2 urgent-pulse">
            <Badge className="bg-red-500 text-white shadow-lg border border-white/30 flex items-center gap-1 px-3 py-1">
              <AlertTriangle size={14} className="animate-pulse" />
              <span>Urgent Need</span>
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2" onClick={() => onClick(event)}>
        <h3 className={cn(
          "text-lg font-semibold line-clamp-1",
          event.emergency_flag ? "text-red-500" : "text-gray-900"
        )}>
          {event.title}
        </h3>
        <p className="text-sm text-gray-600">
          {formatRelativeDate(event.event_date)}
        </p>
      </CardHeader>
      
      <CardContent className="pb-2 flex-1" onClick={() => onClick(event)}>
        <p className="text-sm line-clamp-3 text-gray-600 mb-4">
          {event.description}
        </p>
      </CardContent>
      
      <CardFooter className="pt-2 flex flex-col gap-3">
        <div className="w-full" onClick={(e) => e.stopPropagation()}>
          <HelpButton eventTitle={event.title} />
        </div>
        
        <div className="grid grid-cols-1 gap-2 w-full" onClick={() => onClick(event)}>
          <div className="flex items-center gap-2 text-xs">
            <Calendar size={14} className={cn(
              event.emergency_flag ? "text-red-500" : "text-[#2c7c74]"
            )} />
            <span className="text-gray-600">{formatEventDate(event.event_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <MapPin size={14} className={cn(
              event.emergency_flag ? "text-red-500" : "text-[#2c7c74]"
            )} />
            <span className="text-gray-600">{event.location}</span>
          </div>
          {event.organizer_name && (
            <div className="flex items-center gap-2 text-xs">
              <Users size={14} className={cn(
                event.emergency_flag ? "text-red-500" : "text-[#2c7c74]"
              )} />
              <span className="text-gray-600">Organized by {event.organizer_name}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
