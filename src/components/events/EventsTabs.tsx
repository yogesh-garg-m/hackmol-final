import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, X } from 'lucide-react';
import UpcomingEventsTimeline from './UpcomingEventsTimeline';
import PendingEventCards from './PendingEventCards';
import EventsFilter from './EventsFilter';
import { EventWithRegistration_1, FilterOptions_1, TabType } from '@/lib/supabase-types';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EventsTabsProps {
  acceptedEvents: EventWithRegistration_1[];
  pendingEvents: EventWithRegistration_1[];
}

const EventsTabs: React.FC<EventsTabsProps> = ({ acceptedEvents, pendingEvents }) => {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [filters, setFilters] = useState<FilterOptions_1>({
    search: '',
    location: '',
    tag: '',
    dateRange: {
      from: undefined,
      to: undefined
    }
  });

  // Extract unique locations and tags for filter dropdowns
  const allEvents = [...acceptedEvents, ...pendingEvents];
  const uniqueLocations = Array.from(new Set(allEvents.map(event => event.location)));
  
  // Flatten all tags arrays and get unique values
  const allTags = allEvents.flatMap(event => event.tags);
  const uniqueTags = Array.from(new Set(allTags));

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType);
  };

  const handleFilterChange = (newFilters: FilterOptions_1) => {
    // Convert the special "all-X" values back to empty strings for filtering logic
    const processedFilters = {
      ...newFilters,
      location: newFilters.location === 'all-locations' ? '' : newFilters.location,
      tag: newFilters.tag === 'all-types' ? '' : newFilters.tag
    };
    setFilters(processedFilters);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      tag: '',
      dateRange: {
        from: undefined,
        to: undefined
      }
    });
  };

  // Check if any filters are active
  const hasActiveFilters = 
    filters.search || 
    filters.location || 
    filters.tag || 
    filters.dateRange.from || 
    filters.dateRange.to;

  return (
    <Tabs 
      defaultValue="upcoming" 
      className="w-full"
      onValueChange={handleTabChange}
    >
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <TabsList className="grid grid-cols-2 w-full md:w-[400px] bg-card border-border rounded-full">
            <TabsTrigger 
              value="upcoming" 
              className={cn(
                "flex items-center gap-2 rounded-full transition-all duration-300",
                "data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md"
              )}
            >
              <Calendar className="h-4 w-4" />
              <span>Upcoming Events</span>
              <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                {acceptedEvents.length}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className={cn(
                "flex items-center gap-2 rounded-full transition-all duration-300",
                "data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-md"
              )}
            >
              <Clock className="h-4 w-4" />
              <span>Pending</span>
              <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                {pendingEvents.length}
              </span>
            </TabsTrigger>
          </TabsList>
          
          {hasActiveFilters && (
            <motion.button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-red-500 bg-white/50 hover:bg-white/80 hover:scale-105 shadow-sm border border-red-200 transition-all duration-300 self-end"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear filters</span>
            </motion.button>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <EventsFilter 
            onFilterChange={handleFilterChange}
            uniqueLocations={uniqueLocations}
            uniqueTags={uniqueTags}
            filters={{
              ...filters,
              location: filters.location === '' ? 'all-locations' : filters.location,
              tag: filters.tag === '' ? 'all-types' : filters.tag
            }}
          />
        </motion.div>
      </div>

      <TabsContent 
        value="upcoming" 
        className="outline-none tab-transition mt-6"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key="upcoming"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <UpcomingEventsTimeline events={acceptedEvents} filters={filters} />
          </motion.div>
        </AnimatePresence>
      </TabsContent>
      
      <TabsContent 
        value="pending" 
        className="outline-none tab-transition mt-6"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <PendingEventCards events={pendingEvents} filters={filters} />
          </motion.div>
        </AnimatePresence>
      </TabsContent>
    </Tabs>
  );
};

export default EventsTabs;
