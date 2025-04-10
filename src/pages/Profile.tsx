import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProfileCard from "@/components/profile/ProfileCard";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { Profile } from "@/types/profileTypes";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Event, sortEventsByPreference } from "@/utils/eventSorter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Calendar, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [optionalData, setOptionalData] = useState<any>(null);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth error:", error);
        navigate("/signin");
        return;
      }
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view your profile",
          variant: "destructive"
        });
        navigate("/signin");
        return;
      }
      
      setAuthChecked(true);
    };

    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    if (!authChecked) return;

    async function getProfile() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/signin");
          return;
        }

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            toast({
              title: "Profile not found",
              description: "We couldn't find your profile. Please contact support.",
              variant: "destructive"
            });
          } else {
            throw profileError;
          }
          return;
        }
        
        // Fetch optional profile data
        const { data: optionalData, error: optionalError } = await supabase
          .from("profile_optional")
          .select("*")
          .eq("profile_id", profileData.profile_id)
          .maybeSingle();
            
        // Fetch user preferences
        const { data: preferencesData, error: preferencesError } = await supabase
          .from("user_preferences")
          .select("preference")
          .eq("user_id", session.user.id);
        
        // Set profile data
        setProfile(profileData);
        setOptionalData(optionalData || {});
        setPreferences(preferencesData?.map(p => p.preference) || []);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error loading profile",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [authChecked, navigate, toast]);

  useEffect(() => {
    async function fetchEvents() {
      if (!authChecked) return;
      
      try {
        setEventsLoading(true);
        
        // Fetch events with tags
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select(`
            *,
            event_type,
            event_tags(tag)
          `)
          .eq("is_deleted", false)
          .gte("registration_deadline", new Date().toISOString())
          .order("datetime", { ascending: true });
          
        if (eventsError) throw eventsError;
        
        // Sort events based on user preferences
        const sortedEvents = sortEventsByPreference(eventsData, preferences);
        setEvents(sortedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Error loading events",
          description: "Unable to load recommended events",
          variant: "destructive"
        });
      } finally {
        setEventsLoading(false);
      }
    }

    if (preferences.length > 0 || !loading) {
      fetchEvents();
    }
  }, [preferences, loading, authChecked, toast]);

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "technical":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cultural":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "career":
        return "bg-green-100 text-green-800 border-green-200";
      case "sports":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "academic":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-xl text-primary">Loading profile...</div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row">
          <ProfileSidebar profile={profile} />
          
          <main className="flex-1 p-4 md:p-8">
            <ProfileHeader 
              profile={profile} 
              optionalData={optionalData}
              isEditing={isEditing} 
              setIsEditing={setIsEditing} 
              completionPercentage={calculateCompletion(profile, optionalData)}
            />
            
            <Separator className="my-6" />
            
            {isEditing ? (
              <ProfileEditForm 
                profile={profile} 
                optionalData={optionalData} 
                preferences={preferences}
                onCancel={() => setIsEditing(false)} 
                onSave={(updatedProfile, updatedOptional, updatedPreferences) => {
                  setProfile(updatedProfile);
                  setOptionalData(updatedOptional);
                  setPreferences(updatedPreferences);
                  setIsEditing(false);
                }} 
              />
            ) : (
              <>
                <ProfileCard 
                  profile={profile}
                  optionalData={optionalData}
                  preferences={preferences}
                />
                
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Recommended Events</h2>
                  <p className="text-muted-foreground mb-4">Based on your preferences and upcoming dates</p>
                  
                  {eventsLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-pulse text-primary">Loading events...</div>
                    </div>
                  ) : events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {events.slice(0, 6).map((event) => (
                        <Card key={event.event_id} className="overflow-hidden h-full flex flex-col group hover:shadow-md transition-all duration-300">
                          <div className="relative h-40 overflow-hidden bg-gray-100 flex items-center justify-center">
                            <Calendar className="h-16 w-16 text-gray-300" />
                            {event.category && (
                              <div className="absolute top-2 right-2">
                                <Badge className={`font-semibold ${getCategoryColor(event.category)}`}>
                                  {event.category}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {event.name}
                            </CardTitle>
                            <CardDescription className="flex flex-col">
                              <span>
                                {new Date(event.datetime).toLocaleDateString()} | {new Date(event.datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              <span>{event.location}</span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2 flex-grow">
                            <p className="text-sm line-clamp-2">{event.short_description}</p>
                            <div className="flex justify-end mt-2">
                              <span className="text-xs text-gray-500">
                                {event.eligibility}
                              </span>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRegisterEvent(event.event_id)}
                              className="bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all duration-300"
                            >
                              Register
                            </Button>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveEvent(event.event_id)}
                                className="hover:text-primary transition-colors"
                              >
                                <Bookmark className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShareEvent(event.event_id)}
                                className="hover:text-primary transition-colors"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-6 text-center">
                      <p className="mb-2">No events found based on your preferences.</p>
                      <p className="text-muted-foreground text-sm">Try updating your preferences to see more relevant events.</p>
                    </Card>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

const calculateCompletion = (profile: Profile | null, optionalData: any): number => {
  if (!profile) return 0;
  
  let completed = 5;
  let total = 5 + 6;
  
  if (optionalData?.bio) completed++;
  if (optionalData?.profile_picture_url) completed++;
  if (optionalData?.contact_info) completed++;
  if (optionalData?.social_media_links) completed++;
  if (optionalData?.skills) completed++;
  if (optionalData?.projects || optionalData?.volunteering_exp) completed++;
  
  return Math.round((completed / total) * 100);
};

export default ProfilePage;
