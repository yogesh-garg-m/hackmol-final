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
import PublicProfilePage from "./pages/PublicProfilePage";
import PeoplePage from "./pages/PeoplePage";
import EventDetailsPage from "./pages/EventDetailsPage";
import ClubCreate from "./pages/ClubCreate";
import ClubLogin from "./pages/ClubLogin";
import ClubDashboardPage from "./pages/ClubDashboardPage";
import CreateEventPage from "@/pages/CreateEventPage";
import EventPreviewPage from "@/pages/EventPreviewPage";
import EventsPage from './pages/EventsPage';
import ProjectsPage from './pages/ProjectsPage';
import ResourcesPage from './pages/ResourcesPage';
import CreateTemporaryOpening from './pages/CreateTemporaryOpening';
import EventAttendees from "./pages/EventAttendees";
import Dashboard from "./pages/dashboard/Dashboard";
import CalendarPage from "./pages/dashboard/Calender";
import Clubs from "./pages/dashboard/Clubs";
import Events from "./pages/dashboard/Events";
import Newsletters from "./pages/dashboard/Newsletters";
import Users from "./pages/dashboard/Users";
import Volunteering from "./pages/dashboard/Volunteering";
import VolunteerPage from "./pages/VolunteerPage";
import VerifyAttendeesPage from "./pages/verify-attendees/VerifyAttendeesPage";
import LostAndFound from "./pages/LostAndFound";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HomepageProvider } from '@/contexts/HomepageContext';
import RecentOpeningsPage from "./pages/RecentOpeningsPage";
import Project from "./pages/Project";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useConnectionListener } from './hooks/useConnectionListeners';
import { useEventRegistrationListener } from './hooks/useEventRegistrationListener';
import AllClubsPage from "./pages/AllClubsPage";

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
  useEventRegistrationListener();
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
              <Route
                path="/volunteering"
                element={
                  <ProtectedRoute>
                    <VolunteerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lost-and-found"
                element={
                  <LostAndFound />
                }
              />
              <Route
                path="/clubs"
                element={
                  <AllClubsPage />
                }
              />
              <Route
                path="/club/create"
                element={
                  <ProtectedRoute>
                    <ClubCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/club/login"
                element={
                  <ProtectedRoute>
                    <ClubLogin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/club/dashboard"
                element={
                  <ProtectedClubRoute>
                    <ClubDashboardPage />
                  </ProtectedClubRoute>
                }
              />
              <Route
                path="/club/create-event"
                element={
                  <ProtectedClubRoute>
                    <CreateEventPage />
                  </ProtectedClubRoute>
                }
              />
              <Route
                path="/club/event/:eventId/preview"
                element={
                  <ProtectedClubRoute>
                    <EventPreviewPage />
                  </ProtectedClubRoute>
                }
              />
              <Route path="/events-registered" element={
                <ProtectedRoute>
                  <EventsPage />
                </ProtectedRoute>
              } />
              <Route path="/collaborations" element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              } />
              <Route path="/resources" element={
                <ProtectedRoute>
                  <ResourcesPage />
                </ProtectedRoute>
              } />
              <Route path="/create-temporary-opening" element={
                <ProtectedRoute>
                  <CreateTemporaryOpening />
                </ProtectedRoute>
              } />
              <Route path="/club/event-attendees/:event_id" element={
              <ProtectedClubRoute>
                <EventAttendees />
              </ProtectedClubRoute>
                } />
              <Route path="/openings" element={
                <ProtectedRoute>
                  <RecentOpeningsPage />
                </ProtectedRoute>
                } />
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
                <Route path="/dashboard/clubs" element={
                  <ProtectedAdminRoute>
                    <DashboardLayout>
                      <Clubs />
                    </DashboardLayout>
                  </ProtectedAdminRoute>
                } />
                  <Route path="/dashboard/events" element={
                    <ProtectedAdminRoute>
                      <DashboardLayout>
                        <Events />
                      </DashboardLayout>
                    </ProtectedAdminRoute>
                  } />
                  <Route path="/dashboard/calendar" element={
                    <ProtectedAdminRoute>
                      <DashboardLayout>
                        <CalendarPage />
                      </DashboardLayout>
                    </ProtectedAdminRoute>
                  } />
                  <Route path="/dashboard/newsletters" element={
                    <ProtectedAdminRoute>
                      <DashboardLayout>
                        <Newsletters />
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