
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import EventsTabs from '@/components/events/EventsTabs';
import EventsPageBackground from '@/components/events/EventsPageBackground';
import { supabase } from '@/integrations/supabase/client';
import { EventWithRegistration_1 } from '@/lib/supabase-types';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/homepage/Sidebar';
import { useAuth } from '@/hooks/use-auth';

interface EventsData {
  acceptedEvents: EventWithRegistration_1[];
  pendingEvents: EventWithRegistration_1[];
}

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Handle window resize for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      setIsSidebarExpanded(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch events data using React Query
  const { data, isLoading, error } = useQuery<EventsData>({
    queryKey: ['events'],
    queryFn: async () => {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // First, get all registrations for the current user
      const { data: registrations, error: registrationsError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', user.id);

      if (registrationsError) throw registrationsError;

      // Get all event IDs from registrations
      const eventIds = registrations.map(reg => reg.event_id);

      // Then fetch the events with their tags
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          event_tags(tag)
        `)
        .in('event_id', eventIds)
        .eq('is_deleted', false)
        .order('datetime', { ascending: true });

      if (eventsError) throw eventsError;

      // Transform the data to match EventWithRegistration_1 type
      const transformedEvents: EventWithRegistration_1[] = eventsData.map(event => {
        const registration = registrations.find(reg => reg.event_id === event.event_id);
        return {
          event_id: event.event_id,
          name: event.name,
          datetime: event.datetime,
          location: event.location,
          club_id: event.club_id,
          club_name: event.club_name,
          short_description: event.short_description,
          payment_link: event.payment_link,
          created_at: event.created_at,
          registration_id: registration?.registration_id,
          registration_status: registration?.status,
          submitted_at: registration?.submitted_at,
          tags: event.event_tags.map(tag => tag.tag),
          qr_code: registration?.qr_code
          
        };
      });

      // Separate events into accepted and pending
      return {
        acceptedEvents: transformedEvents.filter(event => event.registration_status === 'accepted'),
        pendingEvents: transformedEvents.filter(event => event.registration_status === 'pending')
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Loading state with skeleton UI
  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <EventsPageBackground />
        <div className="relative container mx-auto px-4 py-8 max-w-5xl">
          <div className="space-y-6">
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-12 w-[350px]" />
              <Skeleton className="h-6 w-[250px] mb-8" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 w-[400px] mb-8">
              <Skeleton className="h-11 rounded-full" />
              <Skeleton className="h-11 rounded-full" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
            
            <div className="space-y-8">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="relative pl-12">
                  <Skeleton className="absolute left-0 top-0 h-8 w-8 rounded-full" />
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-3/4" />
                    <div className="flex space-x-4">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                    <Skeleton className="h-20 w-full" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-24 rounded-full" />
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative min-h-screen">
        <EventsPageBackground />
        <div className="relative container mx-auto px-4 py-8 max-w-5xl">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Error loading events. Please try again later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <EventsPageBackground />
      
      {/* Sidebar */}
      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        setIsSidebarExpanded={setIsSidebarExpanded}
        isMobileView={isMobileView}
        handleLogout={signOut}
      />
      
      <motion.div 
        className={`relative py-8 transition-all duration-300 ${
          isSidebarExpanded ? 'md:ml-[272px]' : 'md:ml-[64px]'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6 flex items-center gap-2 hover:bg-transparent"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-primary">
              Your Events
            </h1>
            <p className="text-muted-foreground text-lg">
              View and manage all your upcoming and pending event registrations
            </p>
          </motion.div>
          
          <EventsTabs 
            acceptedEvents={data?.acceptedEvents || []} 
            pendingEvents={data?.pendingEvents || []} 
          />
        </div>
      </motion.div>
    </div>
  );
};

export default EventsPage;
