import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, ExternalLink, ChevronDown, ChevronUp, Ticket } from 'lucide-react';
import { formatEventDate, isEventOngoing, isEventPast } from '@/lib/utils';
import { EventWithRegistration_1, FilterOptions_1 } from '@/lib/supabase-types';
import EventTag from './EventTag';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import TicketDialog from './TicketDialog';

interface UpcomingEventsTimelineProps {
  events: EventWithRegistration_1[];
  filters: FilterOptions_1;
}

const UpcomingEventsTimeline: React.FC<UpcomingEventsTimelineProps> = ({ events, filters }) => {
  const [filteredEvents, setFilteredEvents] = useState<EventWithRegistration_1[]>(events);
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [selectedEvent, setSelectedEvent] = useState<EventWithRegistration_1 | null>(null);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);

  useEffect(() => {
    // Apply filters
    let result = [...events];
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(event => 
        event.name.toLowerCase().includes(searchTerm) || 
        event.short_description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.location) {
      result = result.filter(event => event.location === filters.location);
    }
    
    if (filters.tag) {
      result = result.filter(event => event.tags.includes(filters.tag));
    }
    
    if (filters.dateRange.from) {
      const fromDate = new Date(filters.dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      result = result.filter(event => {
        const eventDate = new Date(event.datetime);
        return eventDate >= fromDate;
      });
    }
    
    if (filters.dateRange.to) {
      const toDate = new Date(filters.dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      
      result = result.filter(event => {
        const eventDate = new Date(event.datetime);
        return eventDate <= toDate;
      });
    }
    
    setFilteredEvents(result);
  }, [events, filters]);

  const toggleEventExpand = (eventId: string) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const handleViewTicket = (event: EventWithRegistration_1) => {
    setSelectedEvent(event);
    setIsTicketDialogOpen(true);
  };

  if (filteredEvents.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center h-64 bg-gradient-to-r from-white/20 via-white/40 to-white/20 dark:from-slate-800/20 dark:via-slate-800/40 dark:to-slate-800/20 backdrop-blur-lg border border-white/20 dark:border-slate-700/30 rounded-xl p-8 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Calendar className="w-16 h-16 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-6" />
        <h3 className="text-xl font-medium mb-3">No upcoming events found</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {filters.search || filters.location || filters.tag || filters.dateRange.from ? 
            "Try adjusting your filters to see more events." : 
            "Check back later for new events or try exploring the pending tab."}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="relative pb-12">
      {/* Timeline connector */}
      <div className="absolute left-[16px] top-[30px] w-[3px] h-[calc(100%-60px)] bg-gradient-to-b from-primary via-secondary to-primary/20 dark:from-primary dark:via-secondary dark:to-purple-500/20 rounded-full" />
      
      {/* Timeline events */}
      {filteredEvents.map((event, index) => {
        const isOngoing = isEventOngoing(event.datetime);
        const isPast = isEventPast(event.datetime);
        const isExpanded = expandedEvents[event.event_id];
        
        return (
          <motion.div
            key={event.event_id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={cn(
              "relative pl-12 py-6 mb-4 rounded-xl overflow-hidden transition-all duration-300",
              "hover:bg-gradient-to-r hover:from-white/40 hover:to-white/10 dark:hover:from-slate-800/40 dark:hover:to-slate-800/10",
              "hover:shadow-lg hover:border-l hover:border-primary/50 hover:translate-x-1",
              isOngoing ? "bg-gradient-to-r from-primary/10 to-secondary/5 dark:from-primary/20 dark:to-secondary/10 border-l-2 border-primary" : "",
              isPast ? "opacity-60" : ""
            )}
          >
            {/* Dot with pulse effect */}
            <div className="absolute left-[9px] top-[24px] w-[16px] h-[16px] bg-gradient-to-r from-primary to-secondary dark:from-primary dark:to-secondary rounded-full shadow-lg z-10 ring-4 ring-white/50 dark:ring-slate-900/50" />
            
            {isOngoing && (
              <div className="absolute left-[9px] top-[24px] w-[16px] h-[16px] rounded-full z-[5]">
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-secondary/30 dark:from-primary/30 dark:to-secondary/30"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            )}
            
            <div className="ml-2">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-xl font-bold leading-tight text-primary hover:text-secondary transition-colors">{event.name}</h3>
                
                {isOngoing && (
                  <motion.span 
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-green-100 to-green-200 px-2.5 py-0.5 text-xs font-medium text-green-800 border border-green-200 shadow-sm"
                    animate={{ 
                      opacity: [0.8, 1, 0.8],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Happening Now
                  </motion.span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center text-sm text-muted-foreground mb-3 gap-y-1">
                <div className="flex items-center mr-4 hover:text-primary transition-colors">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>{formatEventDate(event.datetime)}</span>
                </div>
                
                <div className="flex items-center mr-4 hover:text-primary transition-colors">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{event.location}</span>
                </div>
                
                <div className="flex items-center hover:text-primary transition-colors">
                  <User className="h-3.5 w-3.5 mr-1" />
                  <span>{event.club_name}</span>
                </div>
              </div>
              
              <motion.div
                initial={false}
                animate={{ height: isExpanded ? "auto" : "2.5rem" }}
                className="overflow-hidden text-sm mb-3 bg-white/30 dark:bg-slate-900/30 p-3 rounded-lg backdrop-blur-sm"
              >
                <p className={isExpanded ? "" : "line-clamp-2"}>{event.short_description}</p>
              </motion.div>
              
              {event.short_description.length > 120 && (
                <motion.button 
                  onClick={() => toggleEventExpand(event.event_id)}
                  className="flex items-center text-xs text-primary hover:text-secondary mb-3 hover:underline transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Read more
                    </>
                  )}
                </motion.button>
              )}
              
              <div className="flex flex-wrap gap-1.5 mb-4">
                {event.tags.map(tag => (
                  <EventTag key={`${event.event_id}-${tag}`} name={tag} />
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }} 
                  whileTap={{ scale: 0.97 }}
                  className="relative"
                >
                  <Link to={`/event/${event.event_id}`}>
                    <Button
                      variant="default"
                      className="relative overflow-hidden rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      {/* Animated overlay */}
                      <span className="absolute inset-0 overflow-hidden">
                        <span className="absolute inset-0 bg-white/20 transform -translate-x-full hover:translate-x-full transition-transform duration-500" />
                      </span>
                      <span className="relative z-10">View Details</span>
                    </Button>
                  </Link>
                </motion.div>
                
                {event.payment_link && (
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }} 
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button 
                      variant="outline"
                      className="flex items-center gap-1.5 rounded-full border border-primary/30 hover:border-primary/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300"
                      onClick={() => window.open(event.payment_link, '_blank')}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Payment Link
                    </Button>
                  </motion.div>
                )}

                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }} 
                  whileTap={{ scale: 0.97 }}
                >
                  <Button 
                    variant="outline"
                    className="flex items-center gap-1.5 rounded-full border border-primary/30 hover:border-primary/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300"
                    onClick={() => handleViewTicket(event)}
                  >
                    <Ticket className="h-3.5 w-3.5" />
                    View Ticket
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Ticket Dialog */}
      {selectedEvent && (
        <TicketDialog
          isOpen={isTicketDialogOpen}
          onClose={() => setIsTicketDialogOpen(false)}
          qrCode={selectedEvent.qr_code}
          eventName={selectedEvent.name}
          eventDate={formatEventDate(selectedEvent.datetime)}
          eventLocation={selectedEvent.location}
        />
      )}
    </div>
  );
};

export default UpcomingEventsTimeline;
