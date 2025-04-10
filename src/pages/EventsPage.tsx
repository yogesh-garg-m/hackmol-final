import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EventWithRegistration_1 } from '@/lib/supabase-types';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EventsData {
  acceptedEvents: EventWithRegistration_1[];
  pendingEvents: EventWithRegistration_1[];
}

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileView, setIsMobileView] = useState(false);

  // Simplified resize handler
  useEffect(() => {
    setIsMobileView(window.innerWidth < 768);
  }, []);

  // Reduced functionality fetch with minimal error handling
  const { data, isLoading } = useQuery<EventsData>({
    queryKey: ['events'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { acceptedEvents: [], pendingEvents: [] };

      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', user.id);

      const eventIds = registrations?.map(reg => reg.event_id) || [];

      const { data: eventsData } = await supabase
        .from('events')
        .select('*, event_tags(tag)')
        .in('event_id', eventIds);

      const transformedEvents: EventWithRegistration_1[] = eventsData?.map(event => {
        const registration = registrations.find(reg => reg.event_id === event.event_id);
        return {
          event_id: event.event_id,
          name: event.name,
          datetime: event.datetime,
          location: event.location,
          short_description: event.short_description,
          registration_status: registration?.status,
          tags: event.event_tags.map(tag => tag.tag),
        };
      }) || [];

      return {
        acceptedEvents: transformedEvents.filter(event => event.registration_status === 'accepted'),
        pendingEvents: transformedEvents.filter(event => event.registration_status === 'pending')
      };
    }
  });

  // Basic loading state with minimal UI
  if (isLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Loading Events...</h2>
        <div style={{ marginTop: '20px' }}>
          <div style={{ width: '300px', height: '20px', background: '#ccc', marginBottom: '10px' }}></div>
          <div style={{ width: '200px', height: '20px', background: '#ccc', marginBottom: '10px' }}></div>
          <div style={{ width: '400px', height: '100px', background: '#ccc' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#eee' }}>
      {/* Ugly back button */}
      <Button 
        onClick={() => navigate(-1)}
        style={{ 
          background: '#999', 
          color: '#fff', 
          padding: '5px', 
          border: '2px solid #666',
          marginBottom: '20px'
        }}
      >
        <ChevronLeft style={{ display: 'inline', verticalAlign: 'middle' }} />
        BACK
      </Button>

      {/* Basic header */}
      <h1 style={{ fontSize: '30px', color: '#333', marginBottom: '20px' }}>
        Events
      </h1>

      {/* Simple event lists */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', color: '#555' }}>Accepted Events</h2>
        {data?.acceptedEvents.length ? (
          <ul style={{ listStyle: 'square', paddingLeft: '20px' }}>
            {data.acceptedEvents.map(event => (
              <li key={event.event_id} style={{ margin: '10px 0', color: '#444' }}>
                <div style={{ fontWeight: 'bold' }}>{event.name}</div>
                <div>Date: {new Date(event.datetime).toLocaleDateString()}</div>
                <div>Location: {event.location}</div>
                <div>{event.short_description}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#777' }}>No accepted events</p>
        )}
      </div>

      <div>
        <h2 style={{ fontSize: '24px', color: '#555' }}>Pending Events</h2>
        {data?.pendingEvents.length ? (
          <ul style={{ listStyle: 'square', paddingLeft: '20px' }}>
            {data.pendingEvents.map(event => (
              <li key={event.event_id} style={{ margin: '10px 0', color: '#444' }}>
                <div style={{ fontWeight: 'bold' }}>{event.name}</div>
                <div>Date: {new Date(event.datetime).toLocaleDateString()}</div>
                <div>Location: {event.location}</div>
                <div>{event.short_description}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#777' }}>No pending events</p>
        )}
      </div>
    </div>
  );
};

export default EventsPage;