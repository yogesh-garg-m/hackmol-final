import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarMenuBadge,
  useSidebar
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Calendar,
  ClipboardList,
  Home,
  Users,
  LogOut,
  Settings,
  Bell,
  FileText,
  Shield,
  Mail,
  HeartHandshake,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DashboardSidebar = () => {
  const location = useLocation();
  const { open, setOpen } = useSidebar();
  const [pendingCount, setPendingCount] = useState(0);

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Redirect to login page
      window.location.href = '/signin';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Mock data - replace with real Supabase query in production
    
    
    // SUPABASE INTEGRATION COMMENT:
    
    async function fetchPendingCount() {
      try {
        const { count, error } = await supabase
          .from('club_auth')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Pending');
          
        if (error) throw error;
        setPendingCount(count || 0);
      } catch (error) {
        console.error('Error fetching pending count:', error);
        setPendingCount(0);
      }
    }
    
    fetchPendingCount();
    
    // Optional: Set up a real-time subscription for pending clubs
    const subscription = supabase
      .channel('public:clubs_auth')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'club_auth',
        filter: 'status=eq.Pending'
      }, () => {
        fetchPendingCount();
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
    
  }, []);

  // Helper function to check if a route is active
  const isRouteActive = (path: string) => {
    // For root dashboard path
    if (path === "/dashboard" && location.pathname === "/dashboard") {
      return true;
    }
    // For other paths, check if current location starts with the given path
    return path !== "/dashboard" && location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="border-r border-admin-border bg-admin-sidebar text-admin-sidebar-foreground">
      <SidebarHeader className="relative">
        <div className="flex items-center gap-2 px-2">
          <h1 className="text-xl font-semibold tracking-tight">Admin Panel</h1>
        </div>
        <SidebarTrigger className="absolute top-6 right-4" onClick={() => setOpen(!open)} />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Dashboard Overview">
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-admin-sidebar-accent text-admin-sidebar-accent-foreground"
                      : "hover:bg-admin-sidebar-accent/50 hover:text-admin-sidebar-accent-foreground"
                  }`
                }
              >
                <Home size={16} />
                <span className="admin-fade-in">Overview</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Manage Clubs">
              <NavLink
                to="/dashboard/clubs"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-admin-sidebar-accent text-admin-sidebar-accent-foreground"
                      : "hover:bg-admin-sidebar-accent/50 hover:text-admin-sidebar-accent-foreground"
                  }`
                }
              >
                <ClipboardList size={16} />
                <span className="admin-fade-in">Clubs</span>
                {pendingCount > 0 && (
                  <SidebarMenuBadge className="bg-amber-500 text-white">
                    {pendingCount}
                  </SidebarMenuBadge>
                )}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Event Management">
              <NavLink
                to="/dashboard/events"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-admin-sidebar-accent text-admin-sidebar-accent-foreground"
                      : "hover:bg-admin-sidebar-accent/50 hover:text-admin-sidebar-accent-foreground"
                  }`
                }
              >
                <BarChart3 size={16} />
                <span className="admin-fade-in">Events</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="User Management">
              <NavLink
                to="/dashboard/users"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-admin-sidebar-accent text-admin-sidebar-accent-foreground"
                      : "hover:bg-admin-sidebar-accent/50 hover:text-admin-sidebar-accent-foreground"
                  }`
                }
              >
                <Users size={16} />
                <span className="admin-fade-in">Users</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Calendar View">
              <NavLink
                to="/dashboard/calendar"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-admin-sidebar-accent text-admin-sidebar-accent-foreground"
                      : "hover:bg-admin-sidebar-accent/50 hover:text-admin-sidebar-accent-foreground"
                  }`
                }
              >
                <Calendar size={16} />
                <span className="admin-fade-in">Calendar</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Newsletters">
              <NavLink
                to="/dashboard/newsletters"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-admin-sidebar-accent text-admin-sidebar-accent-foreground"
                      : "hover:bg-admin-sidebar-accent/50 hover:text-admin-sidebar-accent-foreground"
                  }`
                }
              >
                <Mail size={16} />
                <span className="admin-fade-in">Newsletters</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Notifications">
              <button
                disabled
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors opacity-50 cursor-not-allowed"
              >
                <Bell size={16} />
                <span className="admin-fade-in">Notifications</span>
                <SidebarMenuBadge className="bg-admin-primary text-admin-primary-foreground">
                  3
                </SidebarMenuBadge>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Reports">
              <button
                disabled
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors opacity-50 cursor-not-allowed"
              >
                <FileText size={16} />
                <span className="admin-fade-in">Reports</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Volunteering">
              <NavLink
                to="/dashboard/volunteering"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-admin-sidebar-accent text-admin-sidebar-accent-foreground"
                      : "hover:bg-admin-sidebar-accent/50 hover:text-admin-sidebar-accent-foreground"
                  }`
                }
              >
                <HeartHandshake size={16} />
                <span className="admin-fade-in">Volunteering</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mt-auto p-4">
        <div className="flex flex-col gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <button
                disabled
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors opacity-50 cursor-not-allowed"
              >
                <Settings size={16} />
                <span className="admin-fade-in">Settings</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Logout">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-red-500 hover:bg-red-500/10"
              >
                <LogOut size={16} />
                <span className="admin-fade-in">Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;