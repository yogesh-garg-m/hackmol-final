import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ConnectedUser {
  id: string;
  full_name: string;
  username: string;
  year_of_study: number;
  branch: string;
  profile_picture_url?: string;
}

const ConnectedUsers: React.FC = () => {
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchConnectedUsers = async () => {
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // Get all accepted connections where user is either user1_id or user2_id
      const { data: connections, error: connectionsError } = await supabase
        .from('user_connections' as any)
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (connectionsError) throw connectionsError;

      if (!connections || connections.length === 0) {
        setConnectedUsers([]);
        setLoading(false);
        return;
      }

      // Get user IDs from connections (excluding current user)
      const userIds = connections.map(conn => 
        conn.user1_id === user.id ? conn.user2_id : conn.user1_id
      );

      // Fetch user profiles for these IDs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Transform profiles into ConnectedUser format
      const connectedUsersList = profiles.map(profile => ({
        id: profile.id,
        full_name: profile.full_name,
        username: profile.username,
        year_of_study: profile.year_of_study,
        branch: profile.branch,
        profile_picture_url: profile.profile_picture_url
      }));

      setConnectedUsers(connectedUsersList);
    } catch (error) {
      console.error('Error fetching connected users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch connected users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectedUsers();
  }, [user?.id]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please sign in to view connected users
      </div>
    );
  }

  if (connectedUsers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No connected users yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {connectedUsers.map((connectedUser) => (
        <Card key={connectedUser.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  {connectedUser.profile_picture_url ? (
                    <AvatarImage src={connectedUser.profile_picture_url} alt={connectedUser.full_name} />
                  ) : (
                    <AvatarFallback>{getInitials(connectedUser.full_name)}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-semibold">{connectedUser.full_name}</h3>
                  <p className="text-sm text-gray-500">
                    Year {connectedUser.year_of_study} • {connectedUser.branch}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/profile/${connectedUser.username}`)}
                >
                  View Profile
                </Button>
                <Button
                  variant="default"
                  onClick={() => navigate(`/messages/${connectedUser.id}`)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ConnectedUsers; 