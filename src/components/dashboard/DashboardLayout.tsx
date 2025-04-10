import { Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "./Navbar";
import { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("admin-theme-mode");
    if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
    
    // SUPABASE INTEGRATION COMMENT:
    // Uncomment below to fetch user preferences from Supabase
    // NOTE: Keep this section when migrating to production
    /*
    async function fetchUserPreferences() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: preferences } = await supabase
            .from('user_preferences')
            .select('theme_mode')
            .eq('user_id', session.user.id)
            .single();
            
          if (preferences?.theme_mode) {
            setIsDarkMode(preferences.theme_mode === 'dark');
            document.documentElement.classList.toggle('dark', preferences.theme_mode === 'dark');
            document.documentElement.classList.toggle('light', preferences.theme_mode === 'light');
          }
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    }
    
    fetchUserPreferences();
    */
  }, []);

  const toggleTheme = () => {
    const newThemeValue = !isDarkMode;
    setIsDarkMode(newThemeValue);
    
    // Save theme preference
    localStorage.setItem("admin-theme-mode", newThemeValue ? "dark" : "light");
    
    // Apply theme class to document
    if (newThemeValue) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
    
    // Show toast notification
    toast({
      title: `${newThemeValue ? "Dark" : "Light"} mode activated`,
      description: `Dashboard theme has been switched to ${newThemeValue ? "dark" : "light"} mode`,
    });
    
    // SUPABASE INTEGRATION COMMENT:
    // Uncomment below to save user preferences to Supabase
    // NOTE: Keep this section when migrating to production
    /*
    async function saveUserPreferences() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase
            .from('user_preferences')
            .upsert({ 
              user_id: session.user.id, 
              theme_mode: newThemeValue ? 'dark' : 'light',
              updated_at: new Date()
            });
        }
      } catch (error) {
        console.error('Error saving user preferences:', error);
      }
    }
    
    saveUserPreferences();
    */
  };

  if (!isMounted) {
    return null;
  }

  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className={`flex min-h-screen w-full bg-admin-background ${isDarkMode ? 'dark' : 'light'}`}>
          <DashboardSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Navbar>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="ml-auto glass-button"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5 text-yellow-400" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-slate-700" />
                )}
              </Button>
            </Navbar>
            <main className="flex-1 overflow-auto p-6">
              <div className="mx-auto max-w-7xl">
                {children || <Outlet />}
              </div>
            </main>
            <footer className="glass-footer border-t border-admin-border p-4 text-center text-sm text-admin-muted-foreground">
              <p>© {new Date().getFullYear()} Admin Dashboard • All rights reserved</p>
            </footer>
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
};

export default DashboardLayout;