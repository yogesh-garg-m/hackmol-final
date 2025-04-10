
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EventDetails } from "@/types/event";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { getCategoryColor } from "@/utils/styles";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Phone,
  Mail,
  Globe,
  Award,
  FileText,
  Image,
  Link2,
  ChevronLeft,
  MessageSquare,
  Share2,
  Bookmark,
} from "lucide-react";
import { RegistrationModal } from "@/components/events/RegistrationModal";

// Add the missing getStatusColor function
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "accepted":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "waitlisted":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationQuestions, setRegistrationQuestions] = useState<any[]>([]);
  const [registrationStatus, setRegistrationStatus] = useState<{
    exists: boolean;
    status: string;
  } | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);

        // Convert eventId from string to number
        const eventIdNumber = eventId ? parseInt(eventId, 10) : 0;

        if (isNaN(eventIdNumber)) {
          toast({
            title: "Invalid event ID",
            description: "The event ID provided is not valid.",
            variant: "destructive",
          });
          return;
        }

        // Fetch basic event data
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select(
            `
            *,
            event_type,
            clubs:club_id (name),
            event_tags (tag)
          `
          )
          .eq("event_id", eventIdNumber)
          .eq("is_deleted", false)
          .single();

        if (eventError) throw eventError;
        if (!eventData) {
          toast({
            title: "Event not found",
            description: "The event you're looking for doesn't exist or has been removed.",
            variant: "destructive",
          });
          return;
        }

        // Format the basic event data
        const formattedEvent: EventDetails = {
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

        // Fetch optional details
        const [
          { data: speakers },
          { data: contacts },
          { data: links },
          { data: sponsors },
          { data: prizes },
          { data: agenda },
          { data: resources },
          { data: media },
          { data: faqs },
          { data: optionalDetails },
          { data: socialLinks },
        ] = await Promise.all([
          supabase.from("event_speakers").select("*").eq("event_id", eventIdNumber).order("display_order"),
          supabase.from("event_contacts").select("*").eq("event_id", eventIdNumber),
          supabase.from("event_links").select("*").eq("event_id", eventIdNumber),
          supabase.from("event_sponsors").select("*").eq("event_id", eventIdNumber),
          supabase.from("event_prizes").select("*").eq("event_id", eventIdNumber),
          supabase.from("event_agenda").select("*").eq("event_id", eventIdNumber).order("display_order"),
          supabase.from("event_resources").select("*").eq("event_id", eventIdNumber),
          supabase.from("event_media").select("*").eq("event_id", eventIdNumber).order("display_order"),
          supabase.from("event_faqs").select("*").eq("event_id", eventIdNumber).order("display_order"),
          supabase.from("event_optional_details").select("*").eq("event_id", eventIdNumber).order("display_order"),
          supabase.from("event_social_links").select("*").eq("event_id", eventIdNumber),
        ]);

        // Add optional details to the event object
        setEvent({
          ...formattedEvent,
          speakers: speakers || [],
          contacts: contacts || [],
          links: links || [],
          sponsors: sponsors || [],
          prizes: prizes || [],
          agenda: agenda || [],
          resources: resources || [],
          media: media || [],
          faqs: faqs || [],
          optionalDetails: optionalDetails || [],
          socialLinks: socialLinks || [],
        });
      } catch (error) {
        console.error("Error fetching event details:", error);
        toast({
          title: "Error",
          description: "Failed to load event details. Please try again later.",
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

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking registration status:', error);
        return;
      }

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
      // Fetch questions for this event
      const { data: questionsData, error: questionsError } = await supabase
        .from('event_questions')
        .select('*')
        .eq('event_id', eventId)
        .order('display_order', { ascending: true });

      if (questionsError) {
        throw questionsError;
      }

      setRegistrationQuestions(questionsData || []);
      setIsRegistrationModalOpen(true);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleSave = () => {
    toast({
      title: "Event Saved",
      description: "Event has been added to your bookmarks",
    });
  };

  const handleShare = () => {
    toast({
      title: "Share Link Generated",
      description: "Event link has been copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl font-medium text-gray-600 animate-pulse">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <div className="text-2xl font-medium text-gray-600">Event not found</div>
        <Link to="/homepage">
          <Button>Return to Homepage</Button>
        </Link>
      </div>
    );
  }

  const eventDate = new Date(event.datetime);
  const deadlineDate = new Date(event.registration_deadline);
  const hasRegistrationClosed = deadlineDate < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center h-16">
          <Link to="/homepage" className="flex items-center text-primary hover:text-primary/80 transition-colors">
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Events</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Hero Section */}
        <div className="relative rounded-xl overflow-hidden h-64 md:h-80 lg:h-96 mb-8 shadow-md">
          <img
            src={event.event_thumbnail}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {event.tags.map((tag, index) => (
                <Badge
                  key={index}
                  className={`font-medium text-xs px-2 py-1 ${getCategoryColor(tag)}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">{event.name}</h1>
            <p className="text-white/90 mt-2">Organized by {event.club_name}</p>
          </div>
        </div>

        {/* Main Content & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Date</h3>
                    <p>{eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Time</h3>
                    <p>{eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p>{event.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
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

            {/* Tabbed Content */}
            <Tabs defaultValue="agenda" className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
                {event.agenda && event.agenda.length > 0 && (
                  <TabsTrigger value="agenda">Agenda</TabsTrigger>
                )}
                {event.speakers && event.speakers.length > 0 && (
                  <TabsTrigger value="speakers">Speakers</TabsTrigger>
                )}
                {event.prizes && event.prizes.length > 0 && (
                  <TabsTrigger value="prizes">Prizes</TabsTrigger>
                )}
                {event.faqs && event.faqs.length > 0 && (
                  <TabsTrigger value="faqs">FAQs</TabsTrigger>
                )}
                {event.sponsors && event.sponsors.length > 0 && (
                  <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
                )}
              </TabsList>
              
              {event.agenda && event.agenda.length > 0 && (
                <TabsContent value="agenda" className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Event Schedule</h2>
                  <div className="space-y-6">
                    {event.agenda.map((item) => (
                      <div key={item.id} className="border-l-2 border-primary pl-4 relative py-2">
                        <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-3"></div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        {(item.start_time || item.end_time) && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                            <Clock className="h-4 w-4" />
                            {item.start_time && (
                              <time dateTime={item.start_time}>
                                {new Date(item.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </time>
                            )}
                            {item.start_time && item.end_time && " - "}
                            {item.end_time && (
                              <time dateTime={item.end_time}>
                                {new Date(item.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </time>
                            )}
                          </p>
                        )}
                        {item.location && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                            <MapPin className="h-4 w-4" />
                            {item.location}
                          </p>
                        )}
                        {item.description && <p className="text-gray-700">{item.description}</p>}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}
              
              {event.speakers && event.speakers.length > 0 && (
                <TabsContent value="speakers" className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Speakers & Guests</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {event.speakers.map((speaker) => (
                      <Card key={speaker.id} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="rounded-full bg-gray-200 text-primary p-2">
                              <User className="h-8 w-8" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{speaker.name}</h3>
                              {speaker.role && <p className="text-primary">{speaker.role}</p>}
                              {speaker.bio && <p className="mt-2 text-gray-700">{speaker.bio}</p>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              )}
              
              {event.prizes && event.prizes.length > 0 && (
                <TabsContent value="prizes" className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Prizes & Rewards</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {event.prizes.map((prize, index) => (
                      <Card key={prize.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center">
                            <div className="rounded-full bg-primary/10 text-primary p-4 mb-4">
                              <Award className="h-10 w-10" />
                            </div>
                            <h3 className="font-semibold text-lg mb-1">{prize.title}</h3>
                            {prize.position && <Badge className="mb-2">{prize.position}</Badge>}
                            {prize.value && <p className="text-lg font-bold text-primary mb-2">{prize.value}</p>}
                            {prize.description && <p className="text-gray-600">{prize.description}</p>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              )}
              
              {event.faqs && event.faqs.length > 0 && (
                <TabsContent value="faqs" className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    {event.faqs.map((faq, index) => (
                      <div key={faq.id} className="border-b border-gray-200 pb-4 last:border-0">
                        <h3 className="font-semibold text-lg mb-2 flex items-start gap-2">
                          <MessageSquare className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                          <span>{faq.question}</span>
                        </h3>
                        <p className="text-gray-700 ml-7">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}
              
              {event.sponsors && event.sponsors.length > 0 && (
                <TabsContent value="sponsors" className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Sponsors & Partners</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {event.sponsors.map((sponsor) => (
                      <Card key={sponsor.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center">
                            {sponsor.logo_url ? (
                              <img 
                                src={sponsor.logo_url} 
                                alt={sponsor.name} 
                                className="h-20 object-contain mb-4" 
                              />
                            ) : (
                              <div className="h-20 w-full flex items-center justify-center bg-gray-100 rounded-md mb-4">
                                <span className="text-gray-500 font-medium">{sponsor.name}</span>
                              </div>
                            )}
                            <h3 className="font-semibold text-lg">{sponsor.name}</h3>
                            {sponsor.sponsorship_level && (
                              <Badge className="mt-2 mb-2">{sponsor.sponsorship_level}</Badge>
                            )}
                            {sponsor.description && (
                              <p className="text-gray-600 mt-2">{sponsor.description}</p>
                            )}
                            {sponsor.website_url && (
                              <a 
                                href={sponsor.website_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="mt-4 flex items-center gap-1 text-primary hover:underline"
                              >
                                <Globe className="h-4 w-4" />
                                Visit Website
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>

            {/* Custom Content Sections */}
            {event.optionalDetails && event.optionalDetails.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                {event.optionalDetails.map((detail) => (
                  <div key={detail.id} className="mb-8 last:mb-0">
                    <h2 className="text-xl font-semibold mb-2">{detail.heading}</h2>
                    {detail.subheading && (
                      <p className="text-primary mb-3">{detail.subheading}</p>
                    )}
                    <div className="prose max-w-none">{detail.content}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Media Gallery */}
            {event.media && event.media.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Media Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {event.media.map((item) => (
                    <div key={item.id} className="aspect-square relative rounded-md overflow-hidden group">
                      {item.media_type === 'image' ? (
                        <img 
                          src={item.url} 
                          alt={item.caption || "Event media"} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex flex-col items-center text-primary hover:text-primary/80"
                          >
                            <FileText className="h-10 w-10 mb-2" />
                            <span className="text-sm font-medium">View File</span>
                          </a>
                        </div>
                      )}
                      {item.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Section */}
            {event.resources && event.resources.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.resources.map((resource) => (
                    <a 
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-4 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-primary">{resource.title}</h3>
                        {resource.description && <p className="text-sm text-gray-600 mt-1">{resource.description}</p>}
                        {resource.resource_type && <Badge className="mt-2">{resource.resource_type}</Badge>}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className={`rounded-md p-4 mb-4 ${
                hasRegistrationClosed 
                  ? "bg-red-50 text-red-800 border border-red-200" 
                  : "bg-green-50 text-green-800 border border-green-200"
              }`}>
                <h3 className="font-medium">
                  {hasRegistrationClosed 
                    ? "Registration Closed" 
                    : "Registration Open"}
                </h3>
                <p className="text-sm mt-1">
                  {hasRegistrationClosed 
                    ? "The registration deadline has passed" 
                    : `Register by ${deadlineDate.toLocaleDateString()}`}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className={`
                    ${event.status === "Open" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                    ${event.status === "Closing Soon" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : ""}
                    ${event.status === "Waitlist" ? "bg-purple-100 text-purple-800 hover:bg-purple-100" : ""}
                    ${event.status === "Closed" ? "bg-gray-100 text-gray-800 hover:bg-gray-100" : ""}
                    ${event.status === "Cancelled" ? "bg-red-100 text-red-800 hover:bg-red-100" : ""}
                  `}>
                    {event.status}
                  </Badge>
                </div>
                
                {event.max_attendees && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Spots:</span>
                    <span className="font-medium">{event.max_attendees - event.current_attendees} of {event.max_attendees}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Attendees:</span>
                  <span className="font-medium">{event.current_attendees}</span>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                {registrationStatus?.exists ? (
                  <Badge className={getStatusColor(registrationStatus.status)}>
                    {registrationStatus.status.charAt(0).toUpperCase() + registrationStatus.status.slice(1)}
                  </Badge>
                ) : (
                  <Button
                    onClick={handleRegisterClick}
                    disabled={event?.current_attendees >= event?.max_attendees}
                    className="px-8 py-6 text-lg"
                  >
                    Register Now
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={handleSave}
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Contact Info */}
            {event.contacts && event.contacts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  {event.contacts.map((contact) => (
                    <div key={contact.id} className="border-b border-gray-100 pb-4 last:border-0">
                      {contact.name && (
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">{contact.name}</span>
                          {contact.role && <span className="text-gray-500 text-sm">({contact.role})</span>}
                        </div>
                      )}
                      
                      {contact.email && (
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <Mail className="h-4 w-4 text-primary" />
                          <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                            {contact.email}
                          </a>
                        </div>
                      )}
                      
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-primary" />
                          <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Links */}
            {event.links && event.links.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Important Links</h2>
                <div className="space-y-3">
                  {event.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Link2 className="h-4 w-4" />
                      <span>{link.label || link.link_type}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {event.socialLinks && event.socialLinks.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Social Media</h2>
                <div className="flex flex-wrap gap-3">
                  {event.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-full w-10 h-10 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add the registration modal */}
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
