
import React from "react";
import { motion } from "framer-motion";
import { Grid, List } from "lucide-react";
import EventFilters from "@/components/filters/EventFilters";
import EventCardSkeleton from "@/components/events/EventCardSkeleton";
import EventCard from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";

// Inline type definition to avoid conflicts
interface Category {
  id: string;
  label: string;
  isPreference?: boolean;
}

import { Event } from 'src/types/event'; // Import the Event type from the types file

interface MainContentProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  isMobileView: boolean;
  filteredEvents: Event[]; // Use the imported Event type
  isLoading: boolean;
  categories: Category[];
  onFilterChange: (filters: { 
    categories: string[]; 
    timeRange: number | null; 
    showPreferencesFirst: boolean; 
  }) => void;
  handleRegisterEvent: (eventId: number) => void;
  handleSaveEvent: (eventId: number) => void;
  handleShareEvent: (eventId: number) => void;
  hasUserPreferences: boolean;
}

const MainContent: React.FC<MainContentProps> = ({
  viewMode,
  setViewMode,
  isMobileView,
  filteredEvents,
  isLoading,
  categories,
  onFilterChange,
  handleRegisterEvent,
  handleSaveEvent,
  handleShareEvent,
  hasUserPreferences,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-6">
        <EventFilters
          categories={categories as any} // Type cast to avoid conflicts
          onFilterChange={onFilterChange}
          isMobileView={isMobileView}
          hasUserPreferences={hasUserPreferences}
        />

        {!isMobileView && (
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="transition-colors"
            >
              <Grid className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="transition-colors"
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={
          viewMode === "grid" && !isMobileView
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-4"
        }
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                variants={itemVariants}
              >
                <EventCardSkeleton
                  viewMode={viewMode}
                  isMobileView={isMobileView}
                />
              </motion.div>
            ))
          : filteredEvents.map((event) => (
              <motion.div key={event.event_id} variants={itemVariants}>
                <EventCard
                  event={event}
                  viewMode={viewMode}
                  isMobileView={isMobileView}
                  onRegister={handleRegisterEvent}
                  onSave={handleSaveEvent}
                  onShare={handleShareEvent}
                />
              </motion.div>
            ))}
      </motion.div>
    </div>
  );
};

export default MainContent;
