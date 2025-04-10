import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ConnectedUser {
  id: string;
  full_name: string;
  username: string;
  year_of_study: number;
  branch: string;
}

const ConnectedUsers: React.FC = () => {
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchConnectedUsers = async () => {
    try {
      if (!user?.id) return;

      // Fetch accepted connections
      const { data: connections, error } = await supabase
        .from("user_connections" as any)
        .select("user1_id, user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq("status", "accepted");

      if (error) throw error;

      if (!connections || connections.length === 0) {
        setConnectedUsers([]);
        return;
      }

      // Get user IDs
      const userIds = connections.map((conn) =>
        conn.user1_id === user.id ? conn.user2_id : conn.user1_id
      );

      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, username, year_of_study, branch")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Transform into ConnectedUser
      const connectedUsersList = profiles.map((profile: any) => ({
        id: profile.id,
        full_name: profile.full_name,
        username: profile.username,
        year_of_study: profile.year_of_study,
        branch: profile.branch,
      }));

      setConnectedUsers(connectedUsersList);
    } catch (error) {
      toast({
        title: "ERROR",
        description: "Cant load users",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchConnectedUsers();
  }, [user?.id]);

  if (!user?.id) {
    return <div style={{ color: "red", textAlign: "center" }}>SIGN IN</div>;
  }

  if (connectedUsers.length === 0) {
    return <div style={{ color: "gray", textAlign: "center" }}>NO FRIENDS</div>;
  }

  return (
    <div
      style={{
        backgroundColor: "#bbbbbb", // Dull gray
        padding: "10px",
        fontFamily: "Courier New", // Unappealing font
      }}
    >
      <h1 style={{ fontSize: "18px", color: "black" }}>CONNECTED PEOPLE</h1>
      {connectedUsers.map((connectedUser) => (
        <div
          key={connectedUser.id}
          style={{
            border: "2px solid black",
            padding: "10px",
            margin: "5px 0",
            backgroundColor: "#dddddd",
          }}
        >
          <p style={{ fontSize: "16px", margin: "0" }}>{connectedUser.full_name}</p>
          <p style={{ fontSize: "14px", color: "#444" }}>
            Year {connectedUser.year_of_study} - {connectedUser.branch}
          </p>
          <Button
            onClick={() => navigate(`/profile/${connectedUser.username}`)}
            style={{
              backgroundColor: "orange", // Garish color
              color: "black",
              padding: "5px 10px",
              marginTop: "5px",
              border: "1px solid black",
            }}
          >
            PROFILE
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ConnectedUsers;