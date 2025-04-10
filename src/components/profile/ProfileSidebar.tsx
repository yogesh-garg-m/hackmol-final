
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Home, LogOut, ChevronLeft, ChevronRight, Calendar, Users, 
  BookOpen, Settings, User
} from "lucide-react";
import { Profile } from "@/types/profileTypes";

interface ProfileSidebarProps {
  profile: Profile | null;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ profile }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  if (!profile) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div
      className={`bg-white border-r min-h-screen transition-all duration-300 flex flex-col ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className={`flex items-center ${collapsed ? "hidden" : "block"}`}>
          <Avatar className="h-8 w-8">
            {/* We removed avatar_url as it doesn't exist on the Profile type */}
            <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <p className="text-sm font-medium truncate w-36">{profile.full_name}</p>
            <p className="text-xs text-muted-foreground truncate w-36">
              @{profile.username}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      <Separator />

      <nav className="mt-4 flex-1">
        <ul className="space-y-1 px-2">
          {[
            { icon: Home, label: "Home", path: "/homepage" },
            { icon: User, label: "Profile", path: "/profile", active: true },
            { icon: Calendar, label: "Events", path: "/events" },
            { icon: Users, label: "Clubs", path: "/clubs" },
            { icon: BookOpen, label: "Resources", path: "/resources" },
          ].map((item) => (
            <li key={item.label}>
              <Button
                variant={item.active ? "secondary" : "ghost"}
                className={`w-full justify-start ${collapsed ? "px-2" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className={`h-5 w-5 ${!collapsed ? "mr-2" : ""}`} />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-2 mt-auto">
        <Button
          variant="ghost"
          className={`w-full justify-start ${collapsed ? "px-2" : ""}`}
          onClick={() => navigate("/settings")}
        >
          <Settings className={`h-5 w-5 ${!collapsed ? "mr-2" : ""}`} />
          {!collapsed && <span>Settings</span>}
        </Button>

        <Button
          variant="ghost"
          className={`w-full justify-start ${collapsed ? "px-2" : ""}`}
          onClick={handleSignOut}
        >
          <LogOut className={`h-5 w-5 ${!collapsed ? "mr-2" : ""}`} />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSidebar;
