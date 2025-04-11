import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Search, 
  Filter, 
  ChevronLeft, 
  X,
  Users,
  Calendar,
  BookOpen,
  Code,
  Heart,
  Briefcase,
  ExternalLink,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

// Define the club interface
interface Club {
  club_id: number;
  name: string;
  description: string;
  category: string;
  thumbnail_url?: string;
  is_member?: boolean;
  admin_id?: string;
}

// Define event interface
interface ClubEvent {
  event_id: number;
  name: string;
  datetime: string;
}

// Define member interface
interface ClubMember {
  user_id: string;
  role: string;
  full_name: string;
  username: string;
  is_admin: boolean;
}

// Category colors mapping
const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "academic":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "cultural":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "technical":
      return "bg-green-100 text-green-800 border-green-200";
    case "sports":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "service":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Role badge color
const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "bg-red-100 text-red-800 border-red-200";
    case "moderator":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "member":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Category icon mapping
const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "academic":
      return <BookOpen className="h-4 w-4 mr-1" />;
    case "cultural":
      return <Calendar className="h-4 w-4 mr-1" />;
    case "technical":
      return <Code className="h-4 w-4 mr-1" />;
    case "sports":
      return <Users className="h-4 w-4 mr-1" />;
    case "service":
      return <Heart className="h-4 w-4 mr-1" />;
    default:
      return <Briefcase className="h-4 w-4 mr-1" />;
  }
};

const AllClubsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  
  // Dialog states
  const [eventsDialogOpen, setEventsDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [clubEvents, setClubEvents] = useState<ClubEvent[]>([]);
  const [clubMembers, setClubMembers] = useState<ClubMember[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    // Filter clubs based on search query and selected categories
    let result = [...clubs];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        club => 
          club.name.toLowerCase().includes(query) || 
          club.description.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter(club => 
        selectedCategories.includes(club.category.toLowerCase())
      );
    }
    
    setFilteredClubs(result);
  }, [clubs, searchQuery, selectedCategories]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      
      // Fetch all clubs
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .order("name");

      if (error) throw error;

      // Extract unique categories
      const categories = [...new Set(data.map(club => club.category.toLowerCase()))];
      setAllCategories(categories);

      // If user is logged in, check which clubs they're members of
      if (user) {
        const { data: membershipData, error: membershipError } = await supabase
          .from("club_members")
          .select("club_id")
          .eq("user_id", user.id);

        if (membershipError) throw membershipError;

        // Create a set of club IDs the user is a member of
        const memberClubIds = new Set(
          membershipData?.map((item) => item.club_id) || []
        );

        // Add is_member flag to each club
        const clubsWithMembership = data.map((club) => ({
          ...club,
          is_member: memberClubIds.has(club.club_id),
          // Generate a random image for each club
          thumbnail_url: `https://picsum.photos/seed/${club.club_id}/400/200`,
        }));

        setClubs(clubsWithMembership);
        setFilteredClubs(clubsWithMembership);
      } else {
        // If no user, just add random images
        const clubsWithImages = data.map((club) => ({
          ...club,
          thumbnail_url: `https://picsum.photos/seed/${club.club_id}/400/200`,
        }));

        setClubs(clubsWithImages);
        setFilteredClubs(clubsWithImages);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
      toast({
        title: "Error",
        description: "Failed to load clubs. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyForMembership = async (clubId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for club membership",
        variant: "destructive",
      });
      return;
    }

    try {
      setApplying(clubId);

      // Check if already a member
      const { data: existingMembership, error: checkError } = await supabase
        .from("club_members")
        .select("club_id")
        .eq("club_id", clubId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingMembership) {
        toast({
          title: "Already Applied",
          description: "You have already applied for this club",
        });
        return;
      }

      // Insert new membership
      const { error: insertError } = await supabase
        .from("club_members")
        .insert({
          club_id: clubId,
          user_id: user.id,
          role: "member",
          joined_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      // Update local state
      setClubs((prevClubs) =>
        prevClubs.map((club) =>
          club.club_id === clubId ? { ...club, is_member: true } : club
        )
      );

      toast({
        title: "Application Submitted",
        description: "You have successfully applied for the club",
      });
    } catch (error) {
      console.error("Error applying for membership:", error);
      toast({
        title: "Error",
        description: "Failed to apply for membership. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplying(null);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
  };

  const openEventsDialog = async (club: Club) => {
    setSelectedClub(club);
    setEventsDialogOpen(true);
    await fetchClubEvents(club.club_id);
  };

  const openMembersDialog = async (club: Club) => {
    setSelectedClub(club);
    setMembersDialogOpen(true);
    await fetchClubMembers(club.club_id);
  };

  const fetchClubEvents = async (clubId: number) => {
    try {
      setLoadingEvents(true);
      
      const { data, error } = await supabase
        .from("events")
        .select("event_id, name, datetime")
        .eq("club_id", clubId)
        .order("datetime", { ascending: true });

      if (error) throw error;
      
      setClubEvents(data || []);
    } catch (error) {
      console.error("Error fetching club events:", error);
      toast({
        title: "Error",
        description: "Failed to load club events. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchClubMembers = async (clubId: number) => {
    try {
      setLoadingMembers(true);
      
      // First, get the club to find the admin_id
      const { data: clubData, error: clubError } = await supabase
        .from("clubs")
        .select("admin_id")
        .eq("club_id", clubId)
        .single();
        
      if (clubError) throw clubError;
      
      const adminId = clubData?.admin_id;
      
      // Get admin profile if admin_id exists
      let adminProfile = null;
      if (adminId) {
        const { data: adminData, error: adminError } = await supabase
          .from("profiles")
          .select("id, full_name, username")
          .eq("id", adminId)
          .single();
          
        if (!adminError && adminData) {
          adminProfile = {
            user_id: adminId,
            full_name: adminData.full_name || "Unknown User",
            username: adminData.username || "",
            role: "admin",
            is_admin: true
          };
        }
      }
      
      // Get all approved members
      const { data, error } = await supabase
        .from("club_members")
        .select("user_id, role")
        .eq("club_id", clubId)
        .eq("is_approved", true);
        
      if (error) throw error;
      
      // Get user profiles for all members
      const userIds = data?.map(member => member.user_id) || [];
      
      let membersWithProfiles = [];
      
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, username")
          .in("id", userIds);
          
        if (profilesError) throw profilesError;
        
        // Combine member data with profile data
        membersWithProfiles = data?.map(member => {
          const profile = profiles?.find(p => p.id === member.user_id);
          return {
            user_id: member.user_id,
            role: member.role,
            full_name: profile?.full_name || "Unknown User",
            username: profile?.username || "",
            is_admin: member.user_id === adminId
          };
        }) || [];
      }
      
      // Add admin to the list if not already included
      if (adminProfile && !membersWithProfiles.some(m => m.user_id === adminId)) {
        membersWithProfiles.unshift(adminProfile);
      }
      
      // Sort to put admin at the top
      const sortedMembers = membersWithProfiles.sort((a, b) => {
        if (a.is_admin) return -1;
        if (b.is_admin) return 1;
        return 0;
      });
      
      setClubMembers(sortedMembers);
    } catch (error) {
      console.error("Error fetching club members:", error);
      toast({
        title: "Error",
        description: "Failed to load club members. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  const viewEventDetails = (eventId: number) => {
    navigate(`/event/${eventId}`);
    setEventsDialogOpen(false);
  };

  const viewMemberProfile = (username: string) => {
    navigate(`/profile/${username}`);
    setMembersDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-4 hover:bg-gray-100"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">All Clubs</h1>
          </div>
          
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by club name or description..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedCategories.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <h3 className="font-medium mb-2">Categories</h3>
                  {allCategories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                      className="flex items-center"
                    >
                      {getCategoryIcon(category)}
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <div className="p-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={clearFilters}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredClubs.length} of {clubs.length} clubs
          </p>
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredClubs.length > 0 ? (
            filteredClubs.map((club) => (
              <Card 
                key={club.club_id} 
                className="overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-200 hover:border-primary/30 rounded-xl"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 h-48 md:h-auto relative group rounded-l-xl overflow-hidden">
                    <img
                      src={club.thumbnail_url}
                      alt={club.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <Badge className={getCategoryColor(club.category)}>
                        {getCategoryIcon(club.category)}
                        {club.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6 md:w-2/3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-semibold hover:text-primary transition-colors">{club.name}</h2>
                        <Badge className={getCategoryColor(club.category)}>
                          {club.category}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{club.description}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => openEventsDialog(club)}
                        className="transition-all duration-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        View Events
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => openMembersDialog(club)}
                        className="transition-all duration-300 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        View Members
                      </Button>
                      {club.is_member ? (
                        <Button 
                          variant="outline" 
                          disabled
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        >
                          Already Applied
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleApplyForMembership(club.club_id)}
                          disabled={applying === club.club_id}
                          className="transition-all duration-300 hover:scale-105"
                        >
                          {applying === club.club_id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Applying...
                            </>
                          ) : (
                            "Apply to be Member"
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No Clubs Found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedCategories.length > 0 
                  ? "No clubs match your search criteria. Try adjusting your filters."
                  : "There are no clubs available at the moment."}
              </p>
              {(searchQuery || selectedCategories.length > 0) && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Events Dialog */}
      <Dialog open={eventsDialogOpen} onOpenChange={setEventsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {selectedClub?.name} Events
            </DialogTitle>
          </DialogHeader>
          
          {loadingEvents ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : clubEvents.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {clubEvents.map((event) => (
                  <div 
                    key={event.event_id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{event.name}</h3>
                        <p className="text-gray-600 text-sm">
                          {format(new Date(event.datetime), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewEventDetails(event.event_id)}
                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No events found for this club.</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Members Dialog */}
      <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {selectedClub?.name} Members
            </DialogTitle>
          </DialogHeader>
          
          {loadingMembers ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : clubMembers.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {clubMembers.map((member) => (
                  <div 
                    key={member.user_id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{member.full_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRoleColor(member.role)}>
                              {member.is_admin ? "Admin" : member.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewMemberProfile(member.username)}
                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No members found for this club.</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setMembersDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllClubsPage; 