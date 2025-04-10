import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  FilePlus,
  PlusCircle,
  Clock,
  UserPlus,
  Check,
  X,
  MessageSquare,
  Menu,
  Home,
  FileText,
  Shield,
  Search,
  TrendingUp,
  Award,
  BookOpen,
  BellRing,
  Activity,
  User,
  Eye,
  Edit2,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
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

// Custom BarChart component
const BarChart = ({ data, className }: { data: any[], className?: string }) => {
  return (
    <div className={`${className} flex items-end justify-between h-full`}>
      {data.map((item, index) => (
        <motion.div 
          key={index} 
          className="flex flex-col items-center w-full px-1"
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: "auto", 
            opacity: 1,
            transition: { delay: index * 0.1, duration: 0.5 }
          }}
        >
          <motion.div 
            className="bg-gradient-to-t from-primary/90 to-primary/60 rounded-t-lg w-full transition-all"
            style={{ height: `${(item.events / 10) * 100}%`, minHeight: '20px' }}
            whileHover={{ scale: 1.05 }}
            initial={{ height: 0 }}
            animate={{ 
              height: `${(item.events / 10) * 100}%`, 
              transition: { delay: 0.3 + index * 0.1, duration: 0.5, type: "spring" }
            }}
          ></motion.div>
          <motion.span 
            className="text-xs mt-2 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.6 + index * 0.05 } }}
          >
            {item.name}
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
};

interface Club {
  id: number;
  name: string;
  category: string;
  memberCount: number;
  eventsCount: number;
}

interface Event {
  id: number;
  title: string;
  date: string;
  registrations: number;
  capacity: number;
  status: "Open" | "Closing Soon" | "Waitlist" | "Closed" | "Cancelled";
}

// Update the EVENT_STATUS type to include "Cancelled"
const EVENT_STATUS = {
  OPEN: "Open",
  CLOSING_SOON: "Closing Soon",
  WAITLIST: "Waitlist",
  CLOSED: "Closed",
  CANCELLED: "Cancelled"
} as const;

const ClubDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(window.innerWidth >= 1024);
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState("events");
  const [searchQuery, setSearchQuery] = useState("");
  const [eventToCancel, setEventToCancel] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Verify authentication and fetch club data
    const clubId = sessionStorage.getItem('club_id');
    const clubName = sessionStorage.getItem('club_name');
    const clubCategory = sessionStorage.getItem('club_category');

    if (!clubId || !clubName || !clubCategory) {
      toast({
        title: "Access Denied",
        description: "Please login to access the club dashboard",
        variant: "destructive",
      });
      navigate('/club/login');
      return;
    }

    const fetchClubData = async () => {
      try {
        setIsLoading(true);
        
        // Get member count
        const { count: memberCount, error: memberError } = await supabase
          .from('club_members')
          .select('*', { count: 'exact', head: true })
          .eq('club_id', parseInt(clubId));

        if (memberError) throw memberError;

        // Get events count
        const { count: eventsCount, error: eventsError } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('club_id', parseInt(clubId))
          .eq('is_deleted', false);

        if (eventsError) throw eventsError;

        // Get recent events
        const { data: eventsData, error: recentEventsError } = await supabase
          .from('events')
          .select('*')
          .eq('club_id', parseInt(clubId))
          .eq('is_deleted', false)
          .order('datetime', { ascending: true })
          .limit(5);

        if (recentEventsError) throw recentEventsError;

        // Format events data
       

        setClub({
          id: parseInt(clubId),
          name: clubName,
          category: clubCategory,
          memberCount: memberCount || 0,
          eventsCount: eventsCount || 0
        });

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching club data:", error);
        toast({
          title: "Error",
          description: "Failed to load club data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubData();
  }, [navigate, toast]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only handle click outside on mobile screens
      if (window.innerWidth < 1024) {
        if (
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target as Node) && 
          isMenuOpen
        ) {
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      // Only update menu state on mobile screens
      if (window.innerWidth < 1024) {
        setIsMenuOpen(false);
      } else {
        setIsMenuOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = () => {
    // Clear club session data
    sessionStorage.removeItem('club_id');
    sessionStorage.removeItem('club_name');
    sessionStorage.removeItem('club_category');
    
    toast({
      title: "Logged Out",
      description: "You have been logged out from the club dashboard",
    });
    
    navigate('/homepage');
  };

const handleCreateEvent = () => {
  navigate('/club/create-event');
};

  const handleVerifyAttendees = () => {
    navigate('/verify-attendees');
  };

  if (isLoading) {
    return (
      
          <motion.div 
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="mt-4 text-xl text-primary font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Loading Club Dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const chartData = [
    { name: "Jan", events: 4 },
    { name: "Feb", events: 3 },
    { name: "Mar", events: 5 },
    { name: "Apr", events: 7 },
    { name: "May", events: 2 },
    { name: "Jun", events: 6 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const cardHoverVariants = {
    hover: { 
      y: -5, 
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 }
    }
  };

  const handleCancelEvent = async (eventId: number) => {
    try {
      setIsCancelling(true);
      
      // Get the club ID from session storage
      const clubId = sessionStorage.getItem('club_id');
      if (!clubId) {
        throw new Error("Club ID not found");
      }
      
      // Update the event status to "Closed" and set is_deleted to true
      const { error } = await supabase
        .from('events')
        .update({ 
          status: "Closed",
          is_deleted: true 
        })
        .eq('event_id', eventId)
        .eq('club_id', parseInt(clubId));

      if (error) {
        console.error("Error cancelling event:", error);
        throw new Error(error.message || "Failed to cancel event");
      }

      // Remove the event from the local state
      setEvents(events.filter(event => event.id !== eventId));

      toast({
        title: "Event Cancelled",
        description: "The event has been successfully cancelled.",
      });

      setEventToCancel(null);
    } catch (error: any) {
      console.error("Error cancelling event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel the event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleEditEvent = (eventId: number) => {
    navigate(`/club/event/${eventId}/edit`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      
        {/* Overlay for mobile */}
        {isMenuOpen && window.innerWidth < 1024 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/10 z-[55] lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        <div className="flex flex-col h-full relative z-[65] bg-white">
          <motion.div 
            className="p-6 border-b flex flex-col items-center text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Avatar className="h-20 w-20 mb-3 ring-4 ring-primary/20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-2xl font-bold">
                {club?.name?.charAt(0) || "C"}
              </AvatarFallback>
            </Avatar>
            
            <Badge className="bg-gradient-to-r from-primary/90 to-primary/70 hover:from-primary hover:to-primary/80 transition-all">
              {club?.category}
            </Badge>
            <div className="flex items-center justify-center space-x-3 mt-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Members</p>
                <p className="font-bold text-primary">{club?.memberCount}</p>
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
              
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4 gap-2 border-primary/20 text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              <User size={16} />
              <span>Admin Profile</span>
            </Button>
          </motion.div>
            
          
            <div className="space-y-1">
              <Button 
                variant={activeNavItem === "events" ? "default" : "ghost"} 
                className="w-full justify-start text-sm lg:text-base"
                onClick={() => {
                  setActiveNavItem("events");
                  setIsMenuOpen(false);
                }}
              >
                <Calendar className="mr-2 h-5 w-5" />
                <span>Events</span>
              </Button>
              <Button 
                variant={activeNavItem === "members" ? "default" : "ghost"} 
                className="w-full justify-start text-sm lg:text-base"
                onClick={() => {
                  setActiveNavItem("members");
                  setIsMenuOpen(false);
                }}
              >
                <Users className="mr-2 h-5 w-5" />
                <span>Members</span>
              </Button>
              <Button 
                variant={activeNavItem === "analytics" ? "default" : "ghost"} 
                className="w-full justify-start text-sm lg:text-base"
                onClick={() => {
                  setActiveNavItem("analytics");
                  setIsMenuOpen(false);
                }}
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                <span>Analytics</span>
              </Button>
              <Button 
                variant={activeNavItem === "announcements" ? "default" : "ghost"} 
                className="w-full justify-start text-sm lg:text-base"
                onClick={() => {
                  setActiveNavItem("announcements");
                  setIsMenuOpen(false);
                }}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                <span>Announcements</span>
              </Button>
              <Button 
                variant={activeNavItem === "resources" ? "default" : "ghost"} 
                className="w-full justify-start text-sm lg:text-base"
                onClick={() => {
                  setActiveNavItem("resources");
                  setIsMenuOpen(false);
                }}
              >
                <FileText className="mr-2 h-5 w-5" />
                <span>Resources</span>
              </Button>
              <Button 
                variant={activeNavItem === "settings" ? "default" : "ghost"} 
                className="w-full justify-start text-sm lg:text-base"
                onClick={() => {
                  setActiveNavItem("settings");
                  setIsMenuOpen(false);
                }}
              >
                <Settings className="mr-2 h-5 w-5" />
                <span>Settings</span>
              </Button>
            </div>
            
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-500 px-3 mb-2">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex flex-col h-auto py-3 border-primary/20 text-xs lg:text-sm"
                  onClick={() => {
                    handleCreateEvent();
                    setIsMenuOpen(false);
                  }}
                >
                  <FilePlus className="h-4 w-4 mb-1 text-primary" />
                  <span>New Event</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex flex-col h-auto py-3 border-primary/20 text-xs lg:text-sm"
                  onClick={() => {
                    setIsMenuOpen(false);
                  }}
                >
                  <UserPlus className="h-4 w-4 mb-1 text-primary" />
                  <span>Add Member</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex flex-col h-auto py-3 border-primary/20 text-xs lg:text-sm"
                  onClick={() => {
                    setIsMenuOpen(false);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mb-1 text-primary" />
                  <span>Announce</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex flex-col h-auto py-3 border-primary/20 text-xs lg:text-sm"
                  onClick={() => {
                    setIsMenuOpen(false);
                  }}
                >
                  <BookOpen className="h-4 w-4 mb-1 text-primary" />
                  <span>Tutorials</span>
                </Button>
              </div>
            </div>
          </motion.nav>
            
          <motion.div 
            className="p-4 border-t"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50 text-sm lg:text-base" 
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
            >
              <LogOut className="mr-2 h-5 w-5" />
              <span>Logout</span>
            </Button>
          </motion.div>
        </div>
      </motion.aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-72">
        {/* Header */}
        <motion.header 
          className="bg-white shadow-sm sticky top-0 z-50"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="ml-4 flex items-center space-x-1">
                <Button variant="ghost" size="sm" asChild>
                  <a href="/homepage">
                    <Home className="h-4 w-4 mr-1" />
                    <span>Home</span>
                  </a>
                </Button>
                <span>/</span>
                <Button variant="ghost" size="sm" className="font-medium">
                  Dashboard
                </Button>
              </div>
            </div>
            
            <div className="hidden md:flex relative max-w-md w-full mx-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Search events, members..." 
                className="pl-9 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 text-white text-xs flex items-center justify-center">3</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10">
                    {club?.name?.charAt(0) || "C"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm hidden md:inline-block">Admin</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </motion.header>
        
        {/* Dashboard Content */}
        <motion.main 
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            className="mb-6 flex items-center justify-between"
            variants={itemVariants}
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome to {club?.name} Dashboard</h1>
              <p className="text-gray-500">Manage your club events, members, and resources in one place.</p>
            </div>
            <Button 
              onClick={handleVerifyAttendees}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Verify Attendees
            </Button>
          </motion.div>
          
          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} whileHover={cardHoverVariants.hover}>
              <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Members</p>
                      <h3 className="text-2xl font-bold mt-1">{club?.memberCount || 0}</h3>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <span className="flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      5% increase
                    </span>
                    <span className="text-gray-500 ml-1">since last month</span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants} whileHover={cardHoverVariants.hover}>
              <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Events</p>
                      <h3 className="text-2xl font-bold mt-1">{club?.eventsCount || 0}</h3>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-full">
                      <Calendar className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <span className="flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      2 new
                    </span>
                    <span className="text-gray-500 ml-1">in the last week</span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants} whileHover={cardHoverVariants.hover}>
              <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
                      <h3 className="text-2xl font-bold mt-1">3</h3>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 mt-2 flex items-center">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Next in 3 days
                    </span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants} whileHover={cardHoverVariants.hover}>
              <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Active Status</p>
                      <h3 className="text-2xl font-bold mt-1 text-green-600">Active</h3>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-full">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 flex items-center">
                    <span className="flex items-center">
                      <Check className="h-3 w-3 mr-1 text-green-600" />
                      Good standing
                    </span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
          
          {/* Tabs Content */}
          <motion.div
            variants={itemVariants}
            className="mb-6"
          >
            <Tabs defaultValue="overview" className="mb-6">
              <TabsList className="mb-4 bg-gray-100 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
                <TabsTrigger value="events" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Events</TabsTrigger>
                <TabsTrigger value="members" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Members</TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Analytics</TabsTrigger>
              </TabsList>
              
              <AnimatePresence mode="sync">
                <TabsContent value="overview" key="overview-tab" className="space-y-4 mt-0">
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div 
                      className="md:col-span-2"
                      variants={itemVariants}
                      whileHover={cardHoverVariants.hover}
                    >
                      <Card className="border-none shadow-md h-full bg-white">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Event Performance</CardTitle>
                            <Badge variant="outline" className="font-normal">Last 6 months</Badge>
                          </div>
                          <CardDescription>Monthly event attendance and engagement</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="pt-4 h-[300px]">
                            <BarChart 
                              data={chartData}
                              className="h-[240px]"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    
                    <motion.div
                      variants={itemVariants}
                      whileHover={cardHoverVariants.hover}
                    >
                      <Card className="border-none shadow-md h-full bg-white">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Upcoming Events</CardTitle>
                            <Button variant="ghost" size="sm" className="text-primary h-7 px-2">
                              View all
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {events.length > 0 ? (
                              events.slice(0, 3).map((event, index) => (
                                <motion.div 
                                  key={`event-${event.id}-${index}`}
                                  className="border-b pb-3 last:border-0"
                                  whileHover={{ x: 2 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{event.title}</h3>
                                        <span className="text-xs text-gray-400">#{event.id}</span>
                                      </div>
                                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center">
                                          <Calendar className="h-4 w-4 mr-1" />
                                          {event.date}
                                        </span>
                                        <span className="flex items-center">
                                          <Users className="h-4 w-4 mr-1" />
                                          {event.registrations} attendees
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/club/event/${event.id}/preview`)}
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Preview
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <div className="flex items-center justify-between text-sm">
                                      <span>{event.registrations} of {event.capacity} spots filled</span>
                                      <span className="text-primary font-medium">
                                        {Math.round((event.registrations / (event.capacity || 1)) * 100)}%
                                      </span>
                                    </div>
                                    <Progress 
                                      value={(event.registrations / (event.capacity || 1)) * 100} 
                                      className="h-2 mt-1" 
                                    />
                                  </div>
                                </motion.div>
                              ))
                            ) : (
                              <div className="text-center py-6 space-y-3">
                                <Calendar className="h-10 w-10 text-gray-300 mx-auto" />
                                <p className="text-gray-500">No upcoming events</p>
                                <Button onClick={handleCreateEvent}>
                                  <PlusCircle className="h-4 w-4 mr-2" />
                                  Create Event
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                  
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div
                      variants={itemVariants}
                      whileHover={cardHoverVariants.hover}
                    >
                      <Card className="border-none shadow-md bg-white">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Performance Metrics</CardTitle>
                          <CardDescription>Key metrics for your club</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Member Growth</p>
                                <Badge className="bg-green-500">+12%</Badge>
                              </div>
                              <Progress value={72} className="h-2" />
                              <p className="text-xs text-gray-500">72% of annual target</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Event Attendance</p>
                                <Badge className="bg-blue-500">+8%</Badge>
                              </div>
                              <Progress value={65} className="h-2" />
                              <p className="text-xs text-gray-500">65% of capacity</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Engagement Rate</p>
                                <Badge className="bg-amber-500">+5%</Badge>
                              </div>
                              <Progress value={45} className="h-2" />
                              <p className="text-xs text-gray-500">45% active members</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Social Reach</p>
                                <Badge className="bg-indigo-500">+22%</Badge>
                              </div>
                              <Progress value={88} className="h-2" />
                              <p className="text-xs text-gray-500">88% growth this term</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    
                    <motion.div
                      variants={itemVariants}
                      whileHover={cardHoverVariants.hover}
                    >
                      <Card className="border-none shadow-md bg-white">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Recent Activity</CardTitle>
                          <CardDescription>Latest updates from your club</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-2 rounded-full">
                                <Calendar className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">New event created</p>
                                <p className="text-xs text-gray-500">AI Workshop - May 15, 2024</p>
                                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="bg-gradient-to-br from-green-100 to-emerald-50 p-2 rounded-full">
                                <UserPlus className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">3 new members joined</p>
                                <p className="text-xs text-gray-500">Now at {club?.memberCount} total members</p>
                                <p className="text-xs text-gray-400 mt-1">Yesterday</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="bg-gradient-to-br from-blue-100 to-indigo-50 p-2 rounded-full">
                                <MessageSquare className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">New announcement posted</p>
                                <p className="text-xs text-gray-500">Monthly meeting schedule update</p>
                                <p className="text-xs text-gray-400 mt-1">3 days ago</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="bg-gradient-to-br from-purple-100 to-indigo-50 p-2 rounded-full">
                                <Award className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Achievement unlocked</p>
                                <p className="text-xs text-gray-500">Club reached 100+ total members</p>
                                <p className="text-xs text-gray-400 mt-1">1 week ago</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="events" key="events-tab">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card className="border-none shadow-md bg-white">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <CardTitle>Manage Events</CardTitle>
                            <CardDescription>Create, edit and manage your club events</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="relative w-full md:w-60">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input placeholder="Search events..." className="pl-9" />
                            </div>
                            <Button onClick={handleCreateEvent}>
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Create Event
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {events.length > 0 ? (
                          <div className="space-y-4">
                            {events.map((event, index) => (
                              <motion.div 
                                key={`event-${event.id}-${index}`}
                                className="border rounded-lg p-4 hover:shadow-md transition-all bg-white"
                                whileHover={{ y: -2 }}
                              >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-lg">{event.title}</h3>
                                      <span className="text-xs text-gray-400">#{event.id}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                      <span className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {event.date}
                                      </span>
                                      <span className="flex items-center">
                                        <Users className="h-4 w-4 mr-1" />
                                        {event.registrations} attendees
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <Badge variant={
                                      event.status === "Open" ? "default" : 
                                      event.status === "Waitlist" ? "secondary" : 
                                      event.status === "Closed" ? "destructive" : 
                                      "outline"
                                    }>
                                      {event.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>{event.registrations} of {event.capacity} spots filled</span>
                                    <span className="text-primary font-medium">
                                      {Math.round((event.registrations / (event.capacity || 1)) * 100)}%
                                    </span>
                                  </div>
                                  <Progress 
                                    value={(event.registrations / (event.capacity || 1)) * 100} 
                                    className="h-2 mt-1" 
                                  />
                                </div>
                                <div className="flex flex-wrap gap-2 mt-4">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="bg-white"
                                    onClick={() => navigate(`/club/event/${event.id}/preview`)}
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                    Preview
                                  </Button>
                                  <Button variant="outline" size="sm" className="bg-white"
                                  >
                                    <Calendar className="h-3.5 w-3.5 mr-1" />
                                    Edit
                                  </Button>
                                  <Button variant="outline" size="sm" className="bg-white"
                                  onClick={() => navigate(`/club/event-attendees/${event.id}`)}>
                                    <Users className="h-3.5 w-3.5 mr-1" />
                                    Attendees
                                  </Button>
                                  <Button variant="outline" size="sm" className="bg-white">
                                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                    Send Reminder
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 bg-white"
                                    onClick={() => setEventToCancel(event.id)}
                                  >
                                    <X className="h-3.5 w-3.5 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-16">
                            <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-medium mb-2">No Events Yet</h3>
                            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                              Create your first event to start organizing activities for your club members
                            </p>
                            <Button onClick={handleCreateEvent}>
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Create Event
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="members" key="members-tab">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card className="border-none shadow-md bg-white">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <CardTitle>Club Members</CardTitle>
                            <CardDescription>Manage your club membership</CardDescription>
                          </div>
                          <Button variant="outline">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Member
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Users className="h-16 w-16 text-gray-300 mb-4" />
                          <h3 className="text-xl font-medium mb-2">Member Management</h3>
                          <p className="text-gray-500 text-sm mb-6 max-w-md">
                            Member management will be available in the next update. You'll be able to invite, approve, and manage all club members from here.
                          </p>
                          <Button variant="outline">
                            <BellRing className="h-4 w-4 mr-2" />
                            Get Notified When Available
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="analytics" key="analytics-tab">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card className="border-none shadow-md bg-white">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <CardTitle>Performance Analytics</CardTitle>
                            <CardDescription>Insights and trends for your club activities</CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Generate Report
                            </Button>
                            <Button variant="outline" size="sm">
                              <Activity className="h-4 w-4 mr-2" />
                              Real-time View
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <BarChart3 className="h-16 w-16 text-gray-300 mb-4" />
                          <h3 className="text-xl font-medium mb-2">Advanced Analytics</h3>
                          <p className="text-gray-500 text-sm mb-6 max-w-md">
                            Detailed club analytics will be available in the next update. You'll be able to track member growth, event attendance, and engagement metrics.
                          </p>
                          <Button variant="outline">
                            <BellRing className="h-4 w-4 mr-2" />
                            Get Notified When Available
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </motion.main>
      </div>
      
      <AlertDialog open={!!eventToCancel} onOpenChange={() => setEventToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => eventToCancel && handleCancelEvent(eventToCancel)}
              className="bg-red-500 hover:bg-red-600"
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Yes, cancel event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClubDashboard;