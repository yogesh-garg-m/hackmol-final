import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Tag,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  MessageSquare,
  Phone,
  Mail,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  FileText,
  Trophy,
  BookOpen,
  Share2,
  Briefcase,
  ArrowRight,
  Info,
  Camera,
  Mic,
  User,
  PhoneCall,
  Mail as MailIcon,
  HelpCircle,
  ExternalLink,
  Image as ImageIcon2,
  File,
  Award,
  Book,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Trash2,
  Edit2,
} from "lucide-react";

interface EventData {
  event_id: number;
  name: string;
  datetime: string;
  location: string;
  short_description: string;
  eligibility: string;
  registration_deadline: string;
  status: string;
  max_attendees: number;
  current_attendees: number;
  event_thumbnail: string;
  event_type:string;
  payment_link:string|null;
  event_tags: { tag: string }[];
  agenda: {
    id: string;
    title: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    display_order: number;
  }[];
  speakers: {
    id: string;
    name: string;
    bio?: string;
    role?: string;
    display_order: number;
  }[];
  contacts: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  }[];
  faqs: {
    id: string;
    question: string;
    answer: string;
    display_order: number;
  }[];
  links: {
    id: string;
    link_type: string;
    url: string;
    label?: string;
  }[];
  media: {
    id: string;
    media_type: string;
    url: string;
    caption?: string;
    display_order: number;
  }[];
  custom_fields: {
    id: string;
    heading: string;
    content: string;
    subheading?: string;
    display_order: number;
  }[];
  prizes: {
    id: string;
    title: string;
    description?: string;
    value?: string;
    position?: string;
  }[];
  resources: {
    id: string;
    title: string;
    description?: string;
    resource_type?: string;
    url: string;
  }[];
  social_links: {
    id: string;
    platform: string;
    url: string;
  }[];
  sponsors: {
    id: string;
    name: string;
    description?: string;
    logo_url?: string;
    website_url?: string;
    sponsorship_level?: string;
  }[];
}

const EventPreviewPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("basic");

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch basic event data with optional fields
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select(`
            *,
            event_tags (tag),
            event_agenda (*),
            event_speakers (*),
            event_contacts (*),
            event_faqs (*),
            event_links (*),
            event_media (*),
            event_prizes (*),
            event_resources (*),
            event_social_links (*),
            event_sponsors (*)
          `)
          .eq('event_id', eventId)
          .single();

        if (eventError) throw eventError;

        // Initialize optional fields with empty arrays if they don't exist
        console.log("Fetched Event Data:", eventData); // Log the fetched event data
        const formattedEventData = {
          ...eventData,
          event_tags: eventData.event_tags || [],
          event_agenda: eventData.event_agenda || [],
          event_speakers: eventData.event_speakers || [],
          event_contacts: eventData.event_contacts || [],
          event_faqs: eventData.event_faqs || [],
          event_links: eventData.event_links || [],
          event_media: eventData.event_media || [],
          event_prizes: eventData.event_prizes || [],
          event_resources: eventData.event_resources || [],
          event_social_links: eventData.event_social_links || [],
          event_sponsors: eventData.event_sponsors || []
        };

        setEventData(formattedEventData);
      } catch (error) {
        console.error("Error fetching event data:", error);
        toast({
          title: "Error",
          description: "Failed to load event data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
            Loading Event Preview...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-500 mb-4">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/club/dashboard')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-green-500";
      case "Closing Soon":
        return "bg-amber-500";
      case "Waitlist":
        return "bg-purple-500";
      case "Closed":
        return "bg-gray-500";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <motion.header 
        className="bg-white shadow-sm sticky top-0 z-20"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/club/dashboard')}
              className="mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Event Preview</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Event
            </Button>
            <Button>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main 
        className="container mx-auto px-4 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Event Card Preview */}
          <motion.div
            variants={itemVariants}
            className="lg:sticky lg:top-24"
          >
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/10">
                {eventData.event_thumbnail ? (
                  <img 
                    src={eventData.event_thumbnail} 
                    alt={eventData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="h-12 w-12 text-primary/50" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <Badge className={`${getStatusColor(eventData.status)} text-white`}>
                    {eventData.status}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">{eventData.name}</h2>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{new Date(eventData.datetime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{eventData.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{eventData.current_attendees} / {eventData.max_attendees} attendees</span>
                  </div>
                  {eventData.event_tags && eventData.event_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {eventData.event_tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag.tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Registration Progress</span>
                    <span className="text-primary font-medium">
                      {Math.round((eventData.current_attendees / eventData.max_attendees) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(eventData.current_attendees / eventData.max_attendees) * 100} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Detailed Sections */}
          <motion.div
            variants={itemVariants}
            className="space-y-6"
          >
            {/* Basic Details Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="h-5 w-5 mr-2 text-primary" />
                    Basic Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                      <p className="text-gray-900">{eventData.short_description}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Eligibility</h4>
                      <p className="text-gray-900">{eventData.eligibility}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Registration Deadline</h4>
                      <p className="text-gray-900">
                        {new Date(eventData.registration_deadline).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Agenda Section */}
            {eventData.agenda && eventData.agenda.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      Event Agenda
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {eventData.agenda.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.title}</h4>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              {item.start_time && (
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {item.start_time}
                                </span>
                              )}
                              {item.location && (
                                <span className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {item.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* Speakers Section */}
            {eventData.speakers && eventData.speakers.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mic className="h-5 w-5 mr-2 text-primary" />
                      Speakers & Guests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {eventData.speakers.map((speaker, index) => (
                        <motion.div
                          key={speaker.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{speaker.name}</h4>
                            {speaker.role && (
                              <p className="text-sm text-gray-600">{speaker.role}</p>
                            )}
                            {speaker.bio && (
                              <p className="text-sm text-gray-500 mt-1">{speaker.bio}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* Contact Information Section */}
            {eventData.contacts && eventData.contacts.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-primary" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {eventData.contacts.map((contact, index) => (
                        <motion.div
                          key={contact.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            {contact.email ? (
                              <Mail className="h-6 w-6 text-primary" />
                            ) : (
                              <PhoneCall className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div>
                            {contact.name && (
                              <h4 className="font-medium">{contact.name}</h4>
                            )}
                            {contact.role && (
                              <p className="text-sm text-gray-600">{contact.role}</p>
                            )}
                            {contact.email && (
                              <a 
                                href={`mailto:${contact.email}`}
                                className="text-sm text-primary hover:underline flex items-center mt-1"
                              >
                                <MailIcon className="h-4 w-4 mr-1" />
                                {contact.email}
                              </a>
                            )}
                            {contact.phone && (
                              <a 
                                href={`tel:${contact.phone}`}
                                className="text-sm text-primary hover:underline flex items-center mt-1"
                              >
                                <Phone className="h-4 w-4 mr-1" />
                                {contact.phone}
                              </a>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* FAQs Section */}
            {eventData.faqs && eventData.faqs.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                      Frequently Asked Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {eventData.faqs.map((faq, index) => (
                        <motion.div
                          key={faq.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-gray-50 rounded-lg"
                        >
                          <h4 className="font-medium mb-2">{faq.question}</h4>
                          <p className="text-gray-600">{faq.answer}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* Important Links Section */}
            {eventData.links && eventData.links.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LinkIcon className="h-5 w-5 mr-2 text-primary" />
                      Important Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {eventData.links.map((link, index) => (
                        <motion.a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center">
                            <ExternalLink className="h-5 w-5 mr-2 text-primary" />
                            <span>{link.label || link.url}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </motion.a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* Media Gallery Section */}
            {eventData.media && eventData.media.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ImageIcon className="h-5 w-5 mr-2 text-primary" />
                      Media Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {eventData.media.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative aspect-square rounded-lg overflow-hidden group"
                        >
                          {item.media_type === "image" ? (
                            <img 
                              src={item.url} 
                              alt={item.caption || "Media item"} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <Video className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          {item.caption && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                              <p className="text-white text-sm text-center">{item.caption}</p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* Custom Fields Section */}
            {eventData.custom_fields && eventData.custom_fields.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {eventData.custom_fields.map((field, index) => (
                        <motion.div
                          key={field.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-gray-50 rounded-lg"
                        >
                          <h4 className="font-medium">{field.heading}</h4>
                          {field.subheading && (
                            <p className="text-sm text-gray-600 mt-1">{field.subheading}</p>
                          )}
                          <p className="text-gray-900 mt-2">{field.content}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* Prizes Section */}
            {eventData.prizes && eventData.prizes.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-primary" />
                      Prizes & Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {eventData.prizes.map((prize, index) => (
                        <motion.div
                          key={prize.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Award className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{prize.title}</h4>
                            {prize.position && (
                              <Badge className="mt-1">{prize.position}</Badge>
                            )}
                            {prize.description && (
                              <p className="text-sm text-gray-600 mt-1">{prize.description}</p>
                            )}
                            {prize.value && (
                              <p className="text-sm text-primary mt-1">Value: {prize.value}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* Resources Section */}
            {eventData.resources && eventData.resources.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-primary" />
                      Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {eventData.resources.map((resource, index) => (
                        <motion.div
                          key={resource.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <File className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{resource.title}</h4>
                            {resource.description && (
                              <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                            )}
                            <a 
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center mt-2"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Resource
                            </a>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* Social Media Links Section */}
            {eventData.social_links && eventData.social_links.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Share2 className="h-5 w-5 mr-2 text-primary" />
                      Social Media
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      {eventData.social_links.map((link, index) => (
                        <motion.a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {link.platform === "facebook" && <Facebook className="h-5 w-5 text-blue-600" />}
                          {link.platform === "twitter" && <Twitter className="h-5 w-5 text-blue-400" />}
                          {link.platform === "instagram" && <Instagram className="h-5 w-5 text-pink-600" />}
                          {link.platform === "linkedin" && <Linkedin className="h-5 w-5 text-blue-700" />}
                          {link.platform === "youtube" && <Youtube className="h-5 w-5 text-red-600" />}
                          <span className="capitalize">{link.platform}</span>
                        </motion.a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* Sponsors Section */}
            {eventData.sponsors && eventData.sponsors.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-primary" />
                      Sponsors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {eventData.sponsors.map((sponsor, index) => (
                        <motion.div
                          key={sponsor.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          {sponsor.logo_url ? (
                            <img 
                              src={sponsor.logo_url} 
                              alt={sponsor.name}
                              className="w-16 h-16 object-contain"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Briefcase className="h-8 w-8 text-primary" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium">{sponsor.name}</h4>
                            {sponsor.sponsorship_level && (
                              <Badge className="mt-1">{sponsor.sponsorship_level}</Badge>
                            )}
                            {sponsor.description && (
                              <p className="text-sm text-gray-600 mt-1">{sponsor.description}</p>
                            )}
                            {sponsor.website_url && (
                              <a 
                                href={sponsor.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center mt-2"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Visit Website
                              </a>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
};

export default EventPreviewPage;
