import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Connection {
  user1_id: string;
  user2_id: string;
  status: string;
}

interface Profile {
  id: string;
  full_name: string;
  username: string;
  year_of_study: number;
  branch: string;
  profile_picture_url?: string;
}

interface PendingUser {
  id: string;
  full_name: string;
  username: string;
  year_of_study: number;
  branch: string;
  profile_picture_url?: string;
  isSentRequest: boolean;
}

const PendingConnections: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPendingConnections = async () => {
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // Get both received and sent pending connections
      const { data: connections, error: connectionsError } = await supabase
        .from('user_connections' as any)
        .select('user1_id, user2_id, status')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'pending');

      if (connectionsError) throw connectionsError;

      if (!connections || connections.length === 0) {
        setPendingUsers([]);
        setLoading(false);
        return;
      }

      // Get user IDs from connections (excluding current user)
      const userIds = ((connections as unknown) as Connection[]).map(conn => 
        conn.user1_id === user.id ? conn.user2_id : conn.user1_id
      );

      // Fetch user profiles for these IDs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Transform profiles into PendingUser format with connection type
      const pendingUsersList = (profiles as Profile[]).map(profile => {
        const connection = ((connections as unknown) as Connection[]).find(conn => 
          conn.user1_id === profile.id || conn.user2_id === profile.id
        );
        return {
          id: profile.id,
          full_name: profile.full_name,
          username: profile.username,
          year_of_study: profile.year_of_study,
          branch: profile.branch,
          profile_picture_url: profile.profile_picture_url,
          isSentRequest: connection?.user1_id === user.id
        };
      });

      setPendingUsers(pendingUsersList);
    } catch (error) {
      console.error('Error fetching pending connections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending connections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingConnections();
  }, [user?.id]);

  const handleAccept = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_connections' as any)
        .update({ status: 'accepted' })
        .eq('user1_id', userId)
        .eq('user2_id', user?.id)
        .eq('status', 'pending');

      if (error) throw error;

      // Remove user from pending list
      setPendingUsers(prev => prev.filter(u => u.id !== userId));

      toast({
        title: "Connection accepted",
        description: "You are now connected with this user",
      });
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast({
        title: "Error",
        description: "Failed to accept connection",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_connections' as any)
        .update({ status: 'rejected' })
        .eq('user1_id', userId)
        .eq('user2_id', user?.id)
        .eq('status', 'pending');

      if (error) throw error;

      // Remove user from pending list
      setPendingUsers(prev => prev.filter(u => u.id !== userId));

      toast({
        title: "Connection rejected",
        description: "Connection request has been rejected",
      });
    } catch (error) {
      console.error('Error rejecting connection:', error);
      toast({
        title: "Error",
        description: "Failed to reject connection",
        variant: "destructive",
      });
    } finally {
      setRejectDialogOpen(false);
      setSelectedUser(null);
    }
  };

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
        Please sign in to view pending connections
      </div>
    );
  }

  if (pendingUsers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No pending connection requests
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingUsers.map((pendingUser) => (
        <Card key={pendingUser.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  {pendingUser.profile_picture_url ? (
                    <AvatarImage src={pendingUser.profile_picture_url} alt={pendingUser.full_name} />
                  ) : (
                    <AvatarFallback>{getInitials(pendingUser.full_name)}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-semibold">{pendingUser.full_name}</h3>
                  <p className="text-sm text-gray-500">
                    Year {pendingUser.year_of_study} • {pendingUser.branch}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/profile/${pendingUser.username}`)}
                >
                  View Profile
                </Button>
                {pendingUser.isSentRequest ? (
                  <Button variant="secondary" disabled>
                    Waiting
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="default"
                      onClick={() => handleAccept(pendingUser.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setSelectedUser(pendingUser);
                        setRejectDialogOpen(true);
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Connection Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject the connection request from {selectedUser?.full_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleReject(selectedUser.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PendingConnections; 