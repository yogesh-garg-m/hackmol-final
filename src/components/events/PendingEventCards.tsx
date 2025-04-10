import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ExternalLink, X, ChevronRight, CheckCircle } from 'lucide-react';
import { formatShortDate } from '@/lib/utils';
import { EventWithRegistration_1, FilterOptions_1 } from '@/lib/supabase-types';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface PendingEventCardsProps {
  events: EventWithRegistration_1[];
  filters: FilterOptions_1;
}

const PendingEventCards: React.FC<PendingEventCardsProps> = ({ events, filters }) => {
  const [filteredEvents, setFilteredEvents] = useState<EventWithRegistration_1[]>(events);
  const [removingEventId, setRemovingEventId] = useState<string | null>(null);

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

  const handleCancelRegistration = async (eventId: string, eventName: string) => {
    // Set removing state for animation
    setRemovingEventId(eventId);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // This would normally call an API to cancel registration
    toast({
      title: "Registration Cancelled",
      description: `Your registration for "${eventName}" has been cancelled.`,
    });
    
    // Remove the event from the list client-side
    setFilteredEvents(prev => prev.filter(event => event.event_id !== eventId));
    setRemovingEventId(null);
  };

  if (filteredEvents.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center h-64 bg-gradient-to-r from-white/20 via-white/40 to-white/20 dark:from-slate-800/20 dark:via-slate-800/40 dark:to-slate-800/20 backdrop-blur-lg border border-white/20 dark:border-slate-700/30 rounded-xl p-8 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Clock className="w-16 h-16 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-6" />
        <h3 className="text-xl font-medium mb-3">No pending registrations</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {filters.search || filters.location || filters.tag || filters.dateRange.from ? 
            "Try adjusting your filters to see more events." : 
            "All your registrations have been processed or you haven't registered for any events yet."}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-6">
      {filteredEvents.map((event, index) => (
        <motion.div
          key={event.event_id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={removingEventId === event.event_id 
            ? { opacity: 0, x: -100, height: 0, marginBottom: 0 }
            : { opacity: 1, scale: 1, y: 0 }
          }
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          whileHover={{ 
            scale: 1.03, 
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", 
            borderImage: "linear-gradient(45deg, var(--primary), var(--secondary)) 1",
            borderImageSlice: 1
          }}
          className={cn(
            "relative backdrop-blur-xl bg-gradient-to-br from-white/30 to-white/10 dark:from-slate-900/30 dark:to-slate-900/10",
            "border border-white/30 dark:border-slate-700/30 hover:border-primary/30 dark:hover:border-primary/30",
            "shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl p-5 group overflow-hidden"
          )}
        >
          {/* Background decorative elements */}
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-xl z-0" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-gradient-to-tr from-secondary/10 to-primary/10 blur-xl z-0" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <h3 className="text-lg font-bold leading-tight cursor-pointer text-primary hover:text-secondary transition-colors">
                    {event.name}
                    <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-gradient-to-r from-primary to-secondary" />
                  </h3>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-white/20 dark:border-slate-700/30 shadow-xl rounded-lg">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">{event.name}</h4>
                    <p className="text-sm">{event.short_description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatShortDate(event.datetime)}</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
              
              <motion.span 
                className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-100 to-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-800 border border-amber-200 shadow-sm"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
              >
                Pending
              </motion.span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              <span>Registered on {event.submitted_at ? formatShortDate(event.submitted_at) : 'Unknown date'}</span>
            </div>
            
            <motion.div 
              className="flex flex-wrap gap-2"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Link to={`/event/${event.event_id}`}>
                <Button
                  variant="default"
                  size="sm"
                  className="relative overflow-hidden rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <motion.span 
                    className="absolute inset-0 bg-white/20 z-0"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  />
                  <span className="relative z-10 flex items-center gap-1">
                    View Details <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </Button>
              </Link>
              
              <div className="flex gap-2">
                {event.payment_link && (
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 rounded-full glass-card bg-gradient-to-r from-white/30 to-white/10 dark:from-slate-800/30 dark:to-slate-800/10 border border-secondary/30 hover:border-secondary/60"
                      onClick={() => window.open(event.payment_link, '_blank')}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Pay
                    </Button>
                  </motion.div>
                )}
                
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-red-500 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 rounded-full border border-red-200 hover:border-red-400"
                    onClick={() => handleCancelRegistration(event.event_id, event.name)}
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Background decorative dot with animation */}
            <motion.div 
              className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-primary/50 to-secondary/50 dark:from-primary/50 dark:to-secondary/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0, 0.8, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PendingEventCards;