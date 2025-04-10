import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import Homepage from "./pages/Homepage";
import Profile from "./pages/Profile";

import LostAndFound from "./pages/LostAndFound";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HomepageProvider } from '@/contexts/HomepageContext';
import RecentOpeningsPage from "./pages/RecentOpeningsPage";
import Project from "./pages/Project";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useConnectionListener } from './hooks/useConnectionListeners';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedClubRoute = ({ children }) => {
  const clubLoggedIn = sessionStorage.getItem('club_logged_in') === 'true';

  return clubLoggedIn ? children : <Navigate to="/club/login" />;
};

const ProtectedAdminRoute = ({ children }) => {
  const adminLogin = sessionStorage.getItem('admin_logged_in') === 'true';

  return adminLogin ? children : <Navigate to="/signin" />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setAuthenticated(false);
          return;
        }
        setAuthenticated(true);
      } catch (error) {
        console.error("Error checking auth status:", error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        setAuthenticated(true);
      } else if (event === "SIGNED_OUT") {
        setAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-xl text-primary">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

const AuthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-xl text-primary">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/homepage" replace /> : children;
};

function App() {
  useConnectionListener(); 
  return (
    
    <HomepageProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <Routes>
              <Route
                path="/"
                element={
                  <AuthenticatedRoute>
                    <Index />
                  </AuthenticatedRoute>
                }
              />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/homepage" element={
                <ProtectedRoute>
                  <Homepage />
                  </ProtectedRoute>} />
              <Route path="/event/:eventId" element={<EventDetailsPage />} />
              <Route path="/profile/:username" element={
                  <PublicProfilePage />
              } />
              <Route
                path="/people"
                element={
                  <ProtectedRoute>
                    <PeoplePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              
                <Route path="/project/:opening_id" element={
                  <ProtectedRoute>
                    <Project />
                  </ProtectedRoute>} />
                <Route path="/dashboard" element={
                  <ProtectedAdminRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedAdminRoute>
                } />
                
                    <Route path="/dashboard/volunteering" element={
                      <ProtectedAdminRoute>
                        <DashboardLayout>
                          <Volunteering />
                        </DashboardLayout>
                      </ProtectedAdminRoute>
                    } />
                    <Route path="/dashboard/users" element={
                      <ProtectedAdminRoute>
                        <DashboardLayout>
                          <Users />
                        </DashboardLayout>
                      </ProtectedAdminRoute>
                    } />
              <Route
                path="/verify-attendees"
                element={
                  <ProtectedClubRoute>
                    <VerifyAttendeesPage />
                  </ProtectedClubRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </QueryClientProvider>
    </HomepageProvider>
  );
}

export default App;