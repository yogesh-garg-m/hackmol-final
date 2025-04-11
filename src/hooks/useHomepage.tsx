import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type EventStatus = "Open" | "Closing Soon" | "Waitlist" | "Closed";

interface DatabaseEvent {
  event_id: number;
  club_id: number;
  name: string;
  datetime: string;
  location: string;
  short_description: string;
  eligibility: string;
  registration_deadline: string;
  status: EventStatus;
  max_attendees: number | null;
  current_attendees: number;
  is_deleted: boolean;
  created_at: string;
  event_thumbnail: string;
  clubs: { name: string } | null;
  event_tags: { tag: string }[];
  event_type: string;
  payment_link?: string;
}

interface Event {
  event_id: number;
  club_id: number;
  name: string;
  datetime: string;
  location: string;
  short_description: string;
  eligibility: string;
  registration_deadline: string;
  status: EventStatus;
  max_attendees: number | null;
  current_attendees: number;
  event_thumbnail: string;
  club_name: string;
  tags: string[];
  event_type: string;
  payment_link?: string;
}

interface UserPreferences {
  categories: string[];
  lastUpdated: string;
}

interface Alert {
  id: number;
  title: string;
  message: string;
  type: string;
  countdown: string;
}

export function useHomepage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isTabletView, setIsTabletView] = useState(false);

  const categories = [
    { id: "technical", label: "Technical", isPreference: true },
    { id: "workshop", label: "Workshop", isPreference: true },
    { id: "cultural", label: "Cultural" },
    { id: "networking", label: "Networking" },
    { id: "sports", label: "Sports" },
    { id: "academic", label: "Academic" },
    { id: "music", label: "Music" },
    { id: "dance", label: "Dance" },
    { id: "arts", label: "Arts" },
    { id: "finance", label: "Finance" },
    { id: "coding", label: "Coding", isPreference: true },
    { id: "entrepreneurship", label: "Entrepreneurship" },
    { id: "environment", label: "Environment" },
    { id: "gaming", label: "Gaming" },
    { id: "literature", label: "Literature" },
    { id: "health", label: "Health & Wellness" },
  ].map((cat) => ({
    ...cat,
    isPreference: userPreferences?.categories.includes(cat.id) || false,
  }));

  const isMobile = () => window.innerWidth < 768;
  const isTablet = () => window.innerWidth >= 768 && window.innerWidth < 1024;

  useEffect(() => {
    const handleResize = () => {
      const mobile = isMobile();
      const tablet = isTablet();
      setIsMobileView(mobile);
      setIsTabletView(tablet);

      if (mobile) {
        setViewMode("list");
        setIsSidebarExpanded(false);
      } else if (tablet) {
        setIsSidebarExpanded(false);
      } else {
        setIsSidebarExpanded(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isMobileView) {
        const sidebarWidth = isSidebarExpanded ? 272 : 64;
        const isOverSidebar = event.clientX <= sidebarWidth;

        if (isOverSidebar && !isSidebarExpanded) {
          setIsSidebarExpanded(true);
        } else if (!isOverSidebar && isSidebarExpanded) {
          setIsSidebarExpanded(false);
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isMobileView, isSidebarExpanded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        document.getElementById('search-container') &&
        !document.getElementById('search-container')?.contains(event.target as Node)
      ) {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);

      // Fetch events with club names and tags
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(
          `
          *,
          event_type,
          payment_link,
          clubs:club_id (
            name
          ),
          event_tags (
            tag
          )
        `
        )
        .eq("is_deleted", false)
        .order("datetime", { ascending: true });

      if (eventsError) throw eventsError;

      const formattedEvents: Event[] = (eventsData as DatabaseEvent[]).map(
        (event) => ({
          event_id: event.event_id,
          club_id: event.club_id,
          name: event.name,
          datetime: event.datetime,
          location: event.location,
          short_description: event.short_description,
          eligibility: event.eligibility,
          registration_deadline: event.registration_deadline,
          status: event.status,
          max_attendees: event.max_attendees,
          current_attendees: event.current_attendees,
          event_thumbnail: event.event_thumbnail,
          club_name: event.clubs?.name || "Unknown Club",
          tags: event.event_tags?.map((tag) => tag.tag) || [],
          event_type: event.event_type || "open",
          payment_link: event.payment_link
        })
      );

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to load events. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    navigate("/signin");
  };

  const handleRegisterEvent = (eventId: number) => {
    toast({
      title: "Registration Successful",
      description: "You have registered for the event",
    });
  };

  const handleSaveEvent = (eventId: number) => {
    toast({
      title: "Event Saved",
      description: "Event has been added to your bookmarks",
    });
  };

  const handleShareEvent = (eventId: number) => {
    toast({
      title: "Share Link Generated",
      description: "Event link has been copied to clipboard",
    });
  };

  const handleNavigateToBookmarks = () => {
    toast({
      title: "Coming Soon",
      description: "Bookmarks page will be available soon",
    });
  };

  const handleExploreSection = (section: string) => {
    switch (section) {
      case "Like-Minded People":
        navigate("/people");
        break;
      case "Resources":
        navigate("/resources");
        break;
      case "Recent Openings":
        navigate("/openings");
        break;
      case "Articles":
        navigate("/articles");
        break;
      case "Clubs":
        navigate("/clubs");
        break;
      default:
        break;
    }
  };

  const handleNavigateToProfile = () => {
    navigate("/profile");
  };

  const handleNavigateToClubCreate = () => {
    navigate("/club/create");
  };

  const fetchUserPreferences = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all preferences for this user
      const { data: preferences, error } = await supabase
        .from("user_preferences")
        .select("preference")
        .eq("user_id", user.id);

      if (error) throw error;

      if (preferences && preferences.length > 0) {
        // Extract all preferences
        const userPrefs = {
          categories: preferences.map((p) => p.preference.toLowerCase()),
          lastUpdated: new Date().toISOString(),
        };
        setUserPreferences(userPrefs);
      } else {
        setUserPreferences(null);
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
    }
  };

  const handleFilterChange = ({
    categories,
    timeRange,
    showPreferencesFirst,
  }: {
    categories: string[];
    timeRange: number | null;
    showPreferencesFirst: boolean;
  }) => {
    let filtered = [...events];

    // Filter by categories
    if (categories.length > 0) {
      filtered = filtered.filter((event) =>
        event.tags.some((tag) => {
          // Normalize both the event tag and category for comparison
          const normalizedTag = tag.toLowerCase().trim();
          const normalizedCategory = categories.find(cat => 
            cat.toLowerCase().trim() === normalizedTag
          );
          return normalizedCategory !== undefined;
        })
      );
    }

    // Filter by time range
    if (timeRange) {
      const now = new Date();
      const rangeEnd = new Date(now.getTime() + timeRange * 60 * 60 * 1000);
      filtered = filtered.filter(
        (event) =>
          new Date(event.datetime) >= now &&
          new Date(event.datetime) <= rangeEnd
      );
    }

    // Sort events based on user preferences
    if (userPreferences?.categories.length) {
      filtered.sort((a, b) => {
        // Count matching preferences for each event
        const aMatches = a.tags.filter((tag) =>
          userPreferences.categories.includes(tag.toLowerCase().trim())
        ).length;
        const bMatches = b.tags.filter((tag) =>
          userPreferences.categories.includes(tag.toLowerCase().trim())
        ).length;

        // If one has more matches than the other, sort by that
        if (aMatches !== bMatches) {
          return bMatches - aMatches;
        }

        // If matches are equal, sort by deadline
        const aDeadline = new Date(a.registration_deadline).getTime();
        const bDeadline = new Date(b.registration_deadline).getTime();
        return aDeadline - bDeadline;
      });
    } else {
      // If no preferences, just sort by deadline
      filtered.sort((a, b) => {
        const aDeadline = new Date(a.registration_deadline).getTime();
        const bDeadline = new Date(b.registration_deadline).getTime();
        return aDeadline - bDeadline;
      });
    }

    setFilteredEvents(filtered);
  };

  useEffect(() => {
    if (events.length > 0) {
      handleFilterChange({
        categories: categories.map((c) => c.id),
        timeRange: null,
        showPreferencesFirst: true,
      });
    }
  }, [events, userPreferences]);

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  return {
    viewMode,
    setViewMode,
    isSearchExpanded,
    setIsSearchExpanded,
    isSidebarExpanded,
    setIsSidebarExpanded,
    isRightSidebarVisible,
    setIsRightSidebarVisible,
    isMobileView,
    isTabletView,
    events,
    isLoading,
    filteredEvents,
    categories,
    userPreferences,
    handleLogout,
    handleRegisterEvent,
    handleSaveEvent,
    handleShareEvent,
    handleNavigateToBookmarks,
    handleExploreSection,
    handleNavigateToProfile,
    handleNavigateToClubCreate,
    handleFilterChange,
  };
}
