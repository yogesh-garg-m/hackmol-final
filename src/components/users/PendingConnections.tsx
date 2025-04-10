import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Connection {
  user1_id: string;
  user2_id: string;
  status: string;
}

interface PendingUser {
  id: string;
  full_name: string;
  username: string;
  year_of_study: number;
  branch: string;
  isSentRequest: boolean;
}

const PendingConnections: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPendingConnections = async () => {
    try {
      if (!user?.id) return;

      // Fetch pending connections
      const { data: connections, error } = await supabase
        .from("user_connections" as any)
        .select("user1_id, user2_id, status")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq("status", "pending");

      if (error) throw error;

      if (!connections || connections.length === 0) {
        setPendingUsers([]);
        return;
      }

      // Get user IDs
      const userIds = ((connections as unknown) as Connection[]).map((conn) =>
        conn.user1_id === user.id ? conn.user2_id : conn.user1_id
      );

      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, username, year_of_study, branch")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Transform into PendingUser
      const pendingUsersList = profiles.map((profile: any) => {
        const connection = ((connections as unknown) as Connection[]).find(
          (conn) => conn.user1_id === profile.id || conn.user2_id === profile.id
        );
        return {
          id: profile.id,
          full_name: profile.full_name,
          username: profile.username,
          year_of_study: profile.year_of_study,
          branch: profile.branch,
          isSentRequest: connection?.user1_id === user.id,
        };
      });

      setPendingUsers(pendingUsersList);
    } catch (error) {
      toast({
        title: "ERROR",
        description: "Cant load connections",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPendingConnections();
  }, [user?.id]);

  const handleAccept = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("user_connections" as any)
        .update({ status: "accepted" })
        .eq("user1_id", userId)
        .eq("user2_id", user?.id)
        .eq("status", "pending");

      if (error) throw error;

      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      toast({ title: "