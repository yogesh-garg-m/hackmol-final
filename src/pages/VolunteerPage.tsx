import { useState, useEffect } from "react";
import { CalendarIcon, MapPin, Award, Plus, Filter, ChevronLeft } from "lucide-react";
import { VolunteerEvent, EventFilter } from "@/types/event";
import Hero from "@/components/volunteer/Hero";
import EventCard from "@/components/volunteer/EventCard";
import EventDetail from "@/components/volunteer/EventDetail";
import EventFilters from "@/components/volunteer/EventFilters";
import CreateEventDialog from "@/components/volunteer/CreateEventDialog";
import { Button } from "@/components/ui/button";
import { fetchEvents } from "@/services/eventService";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/homepage/Sidebar";

const VolunteerPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<VolunteerEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<EventFilter>({
    searchQuery: "",
    showEmergencyOnly: false
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      setIsSidebarExpanded(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { 
    data: events = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents
  });

  const handleEventClick = (event: VolunteerEvent) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const handleEventCreated = (event: VolunteerEvent) => {
    refetch();
    toast({
      title: "Success!",
      description: "Your event has been created successfully.",
      variant: "default"
    });
  };

  const filteredEvents = Array.isArray(events) ? events.filter(event => {
    if (filters.showEmergencyOnly && !event.emergency_flag) {
      return false;
    }
    
    if (filters.searchQuery.trim() !== "") {
      const searchLower = filters.searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower) ||
        (event.organizer_name && event.organizer_name.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  }) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        setIsSidebarExpanded={setIsSidebarExpanded}
        isMobileView={isMobileView}
        handleLogout={signOut}
      />
      
      <div className="max-w-[1200px] mx-auto z-10 transition-property-none">
        <Hero />
        
        <div id="events-section" className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-6 border-[#2c7c74] text-[#2c7c74] hover:bg-[#2c7c74]/10 animate-fade-in shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]"
            style={{ animationDelay: "0.4s" }}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Opportunities</h2>
              <p className="text-gray-600">
                Discover ways to make an impact in your community
              </p>
            </div>
            
            <div className="flex items-center mt-4 md:mt-0 space-x-2">
              <div className="bg-gray-100 p-2 rounded-lg animate-fade-in shadow-sm" style={{ animationDelay: "0.3s" }}>
                <Award className="h-5 w-5 text-[#2c7c74] inline mr-2" />
                <span className="text-sm text-gray-600">
                  <span className="font-medium">{filteredEvents.length}</span> opportunities available
                </span>
              </div>
              
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-[#2c7c74] hover:bg-[#236a63] text-white animate-fade-in shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]"
                style={{ animationDelay: "0.4s" }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Opportunity
              </Button>
            </div>
          </div>
          
          <EventFilters filters={filters} setFilters={setFilters} />
          
          {isLoading ? (
            <div className="text-center py-16">
              <div className="bg-volunteer-light/30 inline-flex items-center justify-center p-6 rounded-full mb-4 animate-pulse">
                <CalendarIcon className="h-8 w-8 text-volunteer-DEFAULT" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading events...</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Please wait while we fetch the latest volunteer opportunities.
              </p>
            </div>
          ) : isError ? (
            <div className="text-center py-16">
              <div className="bg-red-100 inline-flex items-center justify-center p-6 rounded-full mb-4">
                <Filter className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Could not load events</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                There was an error loading the volunteer opportunities. Please try again later.
              </p>
              <Button 
                onClick={() => refetch()} 
                className="mt-4 bg-[#2c7c74] hover:bg-[#236a63] text-white"
              >
                Try Again
              </Button>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <div 
                  key={event.id} 
                  className="animate-fade-in" 
                  style={{ animationDelay: `${0.1 * (index % 6) + 0.2}s` }}
                >
                  <EventCard 
                    event={event} 
                    onClick={handleEventClick} 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-volunteer-light/30 inline-flex items-center justify-center p-6 rounded-full mb-4">
                <Filter className="h-8 w-8 text-volunteer-DEFAULT" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Try adjusting your filters or search criteria to find volunteer opportunities.
              </p>
            </div>
          )}
        </div>
        
        <EventDetail 
          event={selectedEvent} 
          isOpen={isDetailOpen} 
          onClose={handleCloseDetail} 
        />

        <CreateEventDialog 
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onEventCreated={handleEventCreated}
        />

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            opacity: 0;
            animation: fadeIn 0.5s ease-out forwards;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .urgent-pulse {
            animation: pulse 2s infinite;
          }
        `}} />
      </div>
    </div>
  );
};

export default VolunteerPage;
