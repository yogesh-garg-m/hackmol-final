import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Search } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { FilterOptions_1 } from '@/lib/supabase-types';
import { motion } from 'framer-motion';

interface EventsFilterProps {
  onFilterChange: (filters: FilterOptions_1) => void;
  uniqueLocations: string[];
  uniqueTags: string[];
  filters: FilterOptions_1;
}

const EventsFilter: React.FC<EventsFilterProps> = ({ 
  onFilterChange, 
  uniqueLocations, 
  uniqueTags,
  filters 
}) => {
  // Local state to track current filter values
  const [search, setSearch] = useState(filters.search);
  const [location, setLocation] = useState(filters.location);
  const [tag, setTag] = useState(filters.tag);
  const [dateRange, setDateRange] = useState({
    from: filters.dateRange.from,
    to: filters.dateRange.to
  });

  // Update local state when filters prop changes
  useEffect(() => {
    setSearch(filters.search);
    setLocation(filters.location);
    setTag(filters.tag);
    setDateRange({
      from: filters.dateRange.from,
      to: filters.dateRange.to
    });
  }, [filters]);

  // Apply filters when any filter value changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onFilterChange({
        search,
        location,
        tag,
        dateRange
      });
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [search, location, tag, dateRange, onFilterChange]);

  // Format date as a readable string
  const formatDate = (date: Date | undefined) => {
    return date && isValid(date) ? format(date, 'PPP') : '';
  };

  return (
    <motion.div 
      className="rounded-xl p-5 bg-white/80 dark:bg-slate-900/80 border border-border shadow-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="pl-9 hover:border-primary/40 focus:border-primary transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {/* Location Filter */}
        <div>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger 
              className="hover:border-secondary/40 transition-colors"
            >
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border shadow-lg">
              <SelectItem value="all-locations">All Locations</SelectItem>
              {uniqueLocations.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Tag Filter */}
        <div>
          <Select value={tag} onValueChange={setTag}>
            <SelectTrigger 
              className="hover:border-primary/40 transition-colors"
            >
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border shadow-lg">
              <SelectItem value="all-types">All Types</SelectItem>
              {uniqueTags.map(tagName => (
                <SelectItem key={tagName} value={tagName}>{tagName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Date Range Filter */}
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-full hover:border-secondary/40 transition-colors",
                  !dateRange.from && !dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from || dateRange.to ? (
                  dateRange.to ? (
                    <>
                      {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                    </>
                  ) : (
                    format(dateRange.from!, 'PPP')
                  )
                ) : (
                  "Date Range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0 bg-background border-border shadow-lg"
              align="start"
            >
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange as { from: Date; to: Date | undefined }}
                onSelect={(range) => setDateRange(range as { from: Date | undefined, to: Date | undefined })}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </motion.div>
  );
};

export default EventsFilter;