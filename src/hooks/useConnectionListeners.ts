import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserDetails } from '../utils/supabaseUtils';

export function useConnectionListener() {
  useEffect(() => {
    const subscription = supabase
      .channel('user_connections_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_connections',
        },
        async (payload) => {
          const updatedConnection = payload.new;

          if (updatedConnection.status === 'accepted') {
            const { user1_id, user2_id } = updatedConnection;

            try {
              // Fetch user1's full_name from profiles
              const user2Details = await fetchUserDetails(user2_id);

              // Send data to backend
              await fetch('http://localhost:3000/send-connection-email', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  user2_id,
                  user2_full_name: user2Details.full_name,
                  user1_id,
                }),
              });

              console.log('Connection email triggered for', user1_id);
            } catch (error) {
              console.error('Error handling connection update:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
}