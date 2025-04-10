import { useState } from "react";
import { Bell, Search, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Navbar = ({ children }) => {
  const [notifications] = useState(3);

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Function to handle marking all notifications as read
  const markAllAsRead = () => {
    // SUPABASE INTEGRATION COMMENT:
    // Remove the toast and uncomment below for actual notification marking
    // NOTE: Keep this section when migrating to production
    
    
    
    async function updateNotifications() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', session.user.id)
            .eq('read', false);
            
          if (error) throw error;
        }
      } catch (error) {
        console.error('Error updating notifications:', error);
        toast({
          title: "Error updating notifications",
          description: error.message,
          variant: "destructive",
        });
      }
    }
    
    updateNotifications();
    
  };

  return (
    <div className="admin-glass-navbar">
      <div className="flex h-16 items-center px-6">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <form className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-admin-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="rounded-md border border-admin-input bg-admin-background/60 pl-8 h-9 w-[200px] lg:w-[280px] focus-visible:ring-1 focus-visible:ring-admin-ring backdrop-blur-sm"
                />
              </div>
            </form>
          </div>
          <div className="flex items-center gap-4">
            {/* System alerts dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500 admin-pulse" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[380px] admin-glass-dropdown">
                <DropdownMenuLabel>System Alerts</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="flex flex-col gap-2 py-2 max-h-[300px] overflow-y-auto">
                  <DropdownMenuItem className="cursor-pointer bg-amber-50/70 dark:bg-amber-950/20 backdrop-blur-sm">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                        Low disk space warning
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-500">
                        Server storage is at 85% capacity
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        10 minutes ago
                      </p>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Notifications dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {notifications > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600 admin-pulse" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[380px] admin-glass-dropdown">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-7"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="flex flex-col gap-2 py-2 max-h-[300px] overflow-y-auto">
                  <DropdownMenuItem className="cursor-pointer hover:bg-admin-muted/30">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">
                        New club awaiting approval
                      </p>
                      <p className="text-xs text-admin-muted-foreground">
                        Technical club "Code Crafters" needs approval
                      </p>
                      <p className="text-xs text-admin-muted-foreground mt-1">
                        2 minutes ago
                      </p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-admin-muted/30">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Event capacity reached</p>
                      <p className="text-xs text-admin-muted-foreground">
                        "Annual Hackathon" is now at capacity
                      </p>
                      <p className="text-xs text-admin-muted-foreground mt-1">
                        1 hour ago
                      </p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-admin-muted/30">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">
                        New user registrations spike
                      </p>
                      <p className="text-xs text-admin-muted-foreground">
                        25 new users registered in the last hour
                      </p>
                      <p className="text-xs text-admin-muted-foreground mt-1">
                        3 hours ago
                      </p>
                    </div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-center text-sm text-admin-primary">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 transition-all duration-200"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="Admin" />
                    <AvatarFallback className="bg-admin-primary text-admin-primary-foreground">
                      A
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="admin-glass-dropdown">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-500 focus:text-red-500"
                  onClick={handleLogout}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Theme toggle and other controls passed as children */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;