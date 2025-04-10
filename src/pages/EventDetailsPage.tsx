import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EventDetails } from "@/types/event";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCategoryColor } from "@/utils/styles";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  Share2,
  Bookmark,
} from "lucide-react";
import { RegistrationModal } from "@/components/events/RegistrationModal";

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "accepted": return "bg-green-100 text-green-800 border-green-200";
    case "pending": return "bg-blue-100 text-blue-800 border-blue-200";
    case "rejected": return "bg-red-100 text-red-800 border-red-200";
    case "waitlisted": return "bg-amber-100 text-amber-800 border-amber-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationQuestions, setRegistrationQuestions] = useState([]);
  const [registrationStatus, setRegistrationStatus] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const eventIdNumber = eventId ? parseInt(eventId, 10) : 0;

        if (isNaN(eventIdNumber)) {
          toast({
            title: "Invalid event ID",
            description: "The event ID provided is not valid.",
            variant: "destructive",
          });
          return;
        }

        const { data: eventData, error } = await supabase
          .from("events")
          .select("*, clubs:club_id (name), event_tags (tag)")
          .eq("event_id", eventIdNumber)
          .eq("is_deleted", false)
          .single();

        if (error) throw error;
        if (!eventData) {
          toast({
            title: "Event not found",
            variant: "destructive",
          });
          return;
        }

        const formattedEvent = {
          event_id: eventData.event_id,
          club_id: eventData.club_id,
          name: eventData.name,
          datetime: eventData.datetime,
          location: eventData.location,
          short_description: eventData.short_description,
          eligibility: eventData.eligibility,
          registration_deadline: eventData.registration_deadline,
          status: eventData.status,
          max_attendees: eventData.max_attendees,
          current_attendees: eventData.current_attendees,
          event_thumbnail: eventData.event_thumbnail,
          club_name: eventData.clubs?.name || "Unknown Club",
          tags: eventData.event_tags?.map((tag) => tag.tag) || [],
          event_type: eventData.event_type || "open",
          payment_link: eventData.payment_link,
        };

        setEvent(formattedEvent);
      } catch (error) {
        console.error("Error fetching event details:", error);
        toast({
          title: "Error",
          description: "Failed to load event details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const checkRegistrationStatus = async () => {
      const userId = sessionStorage.getItem('user_id');
      if (!userId) return;

      const { data, error } = await supabase
        .from('event_registrations')
        .select('status')
        .eq('event_id', eventId)
        .eq('user_id', parseInt(userId))
        .single();

      if (error && error.code !== 'PGRST116') return;

      setRegistrationStatus({
        exists: !!data,
        status: data?.status || '',
      });
    };

    if (eventId) {
      fetchEventDetails();
      checkRegistrationStatus();
    }
  }, [eventId, toast]);

  const handleRegisterClick = async () => {
    try {
      const { data, error } = await supabase
        .from('event_questions')
        .select('*')
        .eq('event_id', eventId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setRegistrationQuestions(data || []);
      setIsRegistrationModalOpen(true);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleSave = () => {
    toast({ title: "Event Saved", description: "Added to bookmarks" });
  };

  const handleShare = () => {
    toast({ title: "Share Link Generated", description: "Copied to clipboard" });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-2xl text-gray-600">Loading...</div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="text-2xl text-gray-600">Event not found</div>
      <Link to="/homepage"><Button>Return to Homepage</Button></Link>
    </div>
  );

  const eventDate = new Date(event.datetime);
  const deadlineDate = new Date(event.registration_deadline);
  const hasRegistrationClosed = deadlineDate < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 flex items-center h-16">
          <Link to="/homepage" className="flex items-center text-primary">
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Events</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Hero Section */}
        <div className="relative rounded-xl overflow-hidden h-64 mb-8 shadow-md">
          <img
            src={event.event_thumbnail}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {event.tags.map((tag, index) => (
                <Badge key={index} className={`${getCategoryColor(tag)}`}>
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-2xl font-bold text-white">{event.name}</h1>
            <p className="text-white/90 mt-2">Organized by {event.club_name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Date</h3>
                    <p>{eventDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Time</h3>
                    <p>{eventDate.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p>{event.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Eligibility</h3>
                    <p>{event.eligibility}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="font-medium mb-2">About this Event</h3>
                <p className="text-gray-700">{event.short_description}</p>
              </div>
            </div>
          </div>

          {/* Registration Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className={`rounded-md p-4 mb-4 ${
                hasRegistrationClosed 
                  ? "bg-red-50 text-red-800 border border-red-200" 
                  : "bg-green-50 text-green-800 border border-green-200"
              }`}>
                <h3 className="font-medium">
                  {hasRegistrationClosed ? "Registration Closed" : "Registration Open"}
                </h3>
                <p className="text-sm mt-1">
                  {hasRegistrationClosed 
                    ? "The deadline has passed" 
                    : `Register by ${deadlineDate.toLocaleDateString()}`}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge>{event.status}</Badge>
                </div>
                {event.max_attendees && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Spots:</span>
                    <span>{event.max_attendees - event.current_attendees}/{event.max_attendees}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Attendees:</span>
                  <span>{event.current_attendees}</span>
                </div>
              </div>

              <div className="flex justify-center mb-4">
                {registrationStatus?.exists ? (
                  <Badge className={getStatusColor(registrationStatus.status)}>
                    {registrationStatus.status.charAt(0).toUpperCase() + registrationStatus.status.slice(1)}
                  </Badge>
                ) : (
                  <Button
                    onClick={handleRegisterClick}
                    disabled={event.current_attendees >= event.max_attendees || hasRegistrationClosed}
                  >
                    Register Now
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleSave}>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {event && (
        <RegistrationModal
          isOpen={isRegistrationModalOpen}
          onClose={() => setIsRegistrationModalOpen(false)}
          eventId={event.event_id}
          eventName={event.name}
          eventType={event.event_type}
          questions={registrationQuestions}
          paymentLink={event.payment_link}
        />
      )}
    </div>
  );
};

export default EventDetailsPage;