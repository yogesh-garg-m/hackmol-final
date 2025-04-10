import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected' | null;

interface Connection {
  connection_id: number;
  user1_id: string;
  user2_id: string;
  status: ConnectionStatus;
  created_at: string;
}

interface UseConnectionsReturn {
  connections: Connection[];
  pendingSent: Connection[];
  pendingReceived: Connection[];
  connectedUsers: Connection[];
  isLoading: boolean;
  error: Error | null;
  sendConnectionRequest: (userId: string) => Promise<void>;
  acceptConnection: (connectionId: number) => Promise<void>;
  rejectConnection: (connectionId: number) => Promise<void>;
  getConnectionStatus: (userId: string) => ConnectionStatus;
}

export const useConnections = (): UseConnectionsReturn => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Fetch all connections for the current user
  const fetchConnections = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_connections')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (error) throw error;
      setConnections(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch connections'));
    } finally {
      setIsLoading(false);
    }
  };

  // Send a connection request
  const sendConnectionRequest = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_connections')
        .insert({
          user1_id: user.id,
          user2_id: userId,
          status: 'pending'
        });

      if (error) throw error;
      await fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send connection request'));
      throw err;
    }
  };

  // Accept a connection request
  const acceptConnection = async (connectionId: number) => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .update({ status: 'accepted' })
        .eq('connection_id', connectionId);

      if (error) throw error;
      await fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to accept connection'));
      throw err;
    }
  };

  // Reject a connection request
  const rejectConnection = async (connectionId: number) => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('connection_id', connectionId);

      if (error) throw error;
      await fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to reject connection'));
      throw err;
    }
  };

  // Get connection status with another user
  const getConnectionStatus = (userId: string): ConnectionStatus => {
    if (!user) return null;

    const connection = connections.find(
      conn => 
        (conn.user1_id === user.id && conn.user2_id === userId) ||
        (conn.user1_id === userId && conn.user2_id === user.id)
    );

    return connection?.status || null;
  };

  // Filter connections based on status
  const pendingSent = connections.filter(
    conn => conn.user1_id === user?.id && conn.status === 'pending'
  );

  const pendingReceived = connections.filter(
    conn => conn.user2_id === user?.id && conn.status === 'pending'
  );

  const connectedUsers = connections.filter(
    conn => conn.status === 'accepted'
  );

  // Fetch connections on mount and when user changes
  useEffect(() => {
    fetchConnections();
  }, [user]);

  return {
    connections,
    pendingSent,
    pendingReceived,
    connectedUsers,
    isLoading,
    error,
    sendConnectionRequest,
    acceptConnection,
    rejectConnection,
    getConnectionStatus
  };
}; 