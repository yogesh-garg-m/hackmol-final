import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { EVENT_STATUS, EVENT_TAGS } from "@/lib/events";
import { Plus, Trash2, X, ChevronDown, ChevronUp, Calendar, Clock, MapPin, Users, Tag, Facebook, Twitter, Instagram, Linkedin, Youtube, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "@/components/ui/sortable-item";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

const cardHoverVariants = {
  hover: {
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.2
    }
  }
};

// Form sections
const FORM_SECTIONS = [
  { id: "basic", label: "Event Details" },
  { id: "agenda", label: "Event Agenda" },
  { id: "speakers", label: "Speakers" },
  { id: "sponsors", label: "Sponsors" }
];

// Constants
const LINK_TYPES = [
  "Website", "Registration", "Livestream", "Resources", "Social Media",
  "Documentation", "Support", "Other"
];

const MEDIA_TYPES = ["Image", "Video"];

const PRIZE_POSITIONS = [
  "First", "Second", "Third", "Fourth", "Fifth", "Runner Up", "Special Mention"
];

const RESOURCE_TYPES = [
  "Document", "Presentation", "Video", "Code", "Dataset", "Other"
];

const SOCIAL_PLATFORMS = [
  "facebook", "twitter", "instagram", "linkedin", "youtube", "other"
];

const SPONSORSHIP_LEVELS = ["Gold", "Silver", "Bronze", "Platinum", "Other"];

// Form Schema
const eventFormSchema = z.object({
  // Basic Event Details
  name: z.string().min(1, "Event name is required"),
  datetime: z.string().min(1, "Event date and time is required"),
  location: z.string().min(1, "Event location is required"),
  short_description: z.string().min(1, "Event description is required"),
  eligibility: z.string().min(1, "Eligibility criteria is required"),
  registration_deadline: z.string().min(1, "Registration deadline is required"),
  status: z.enum(["Open", "Closing Soon", "Waitlist", "Closed"]).default("Open"),
  max_attendees: z.union([z.string(), z.number()]).transform((val) => {
    const num = typeof val === 'string' ? parseInt(val, 10) : val;
    return num;
  }).pipe(z.number().min(1, "Maximum attendees must be at least 1")),
  event_thumbnail: z.string().optional(),
  tags: z.array(z.string()).optional(),
  event_type: z.enum(["open", "selective", "paid"]).default("open"),
  payment_link: z.string().optional(),
  questions: z.array(z.object({
    question: z.string().min(1, "Question is required"),
    is_payment: z.boolean().default(false),
    display_order: z.number()
  })).optional(),

  // Event Agenda
  agenda: z.array(z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    location: z.string().optional(),
    display_order: z.number()
  })).max(6, "Maximum 6 agenda items allowed").optional(),

  // Event Speakers
  speakers: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    bio: z.string().optional(),
    role: z.string().optional(),
    display_order: z.number()
  })).optional(),

  // Event Sponsors
  sponsors: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    logo_url: z.string().url("Invalid URL format").optional(),
    website_url: z.string().url("Invalid URL format").optional(),
    sponsorship_level: z.string().optional(),
    display_order: z.number()
  })).optional(),

  // Event Optional Details
  optional_details: z.array(z.object({
    heading: z.string().min(1, "Heading is required"),
    content: z.string().min(1, "Content is required"),
    subheading: z.string().optional(),
    display_order: z.number()
  })).max(5, "Maximum 5 custom fields allowed").optional(),

  // Event FAQs
  faqs: z.array(z.object({
    question: z.string().min(1, "Question is required"),
    answer: z.string().min(1, "Answer is required"),
    display_order: z.number()
  })).max(5, "Maximum 5 FAQs allowed").optional(),

  // Event Prizes
  prizes: z.array(z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    value: z.string().optional(),
    position: z.string().optional(),
    display_order: z.number()
  })).optional(),

  // Event Resources
  resources: z.array(z.object({
    title: z.string().min(1, "Title is required"),
    url: z.string().url("Invalid URL format").min(1, "URL is required"),
    description: z.string().optional(),
    type: z.string().optional(),
    display_order: z.number()
  })).optional(),

  // Event Media
  media: z.array(z.object({
    type: z.enum(["Image", "Video"]),
    url: z.string().url("Invalid URL format").min(1, "URL is required"),
    caption: z.string().optional(),
    display_order: z.number()
  })).optional(),

  // Event Links
  links: z.array(z.object({
    link_type: z.string().min(1, "Link type is required"),
    url: z.string().url("Invalid URL format").min(1, "URL is required"),
    label: z.string().optional(),
    display_order: z.number()
  })).optional(),

  // Event Contacts
  contacts: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format").optional(),
    phone: z.string().optional(),
    role: z.string().optional(),
    display_order: z.number()
  })).optional(),

  // Event Social Links
  social_links: z.array(z.object({
    platform: z.enum(["facebook", "twitter", "instagram", "linkedin", "youtube", "other"]),
    url: z.string().url("Invalid URL format").min(1, "URL is required"),
    display_order: z.number()
  })).optional()
});

type EventFormValues = z.infer<typeof eventFormSchema>;

// Add this helper function at the top of the file, after imports
const formatDateTimeForInput = (date: Date | string | null) => {
  if (!date) return "";
  const d = new Date(date);
  // Format to YYYY-MM-DDThh:mm
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const CreateEventForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");
  const [previewData, setPreviewData] = useState<Partial<EventFormValues>>({});

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      datetime: "",
      location: "",
      short_description: "",
      eligibility: "",
      registration_deadline: "",
      status: "Open",
      max_attendees: 1,
      event_thumbnail: "",
      tags: [],
      event_type: "open",
      payment_link: "",
      questions: [],
      agenda: [],
      speakers: [],
      sponsors: [],
      optional_details: [],
      faqs: [],
      prizes: [],
      resources: [],
      media: [],
      links: [],
      contacts: [],
      social_links: []
    }
  });

  // Field arrays for dynamic form sections
  const agendaFields = useFieldArray({
    control: form.control,
    name: "agenda"
  });

  const contactsFields = useFieldArray({
    control: form.control,
    name: "contacts"
  });

  const faqsFields = useFieldArray({
    control: form.control,
    name: "faqs"
  });

  const linksFields = useFieldArray({
    control: form.control,
    name: "links"
  });

  const mediaFields = useFieldArray({
    control: form.control,
    name: "media"
  });

  const optionalDetailsFields = useFieldArray({
    control: form.control,
    name: "optional_details"
  });

  const prizesFields = useFieldArray({
    control: form.control,
    name: "prizes"
  });

  const resourcesFields = useFieldArray({
    control: form.control,
    name: "resources"
  });

  const socialLinksFields = useFieldArray({
    control: form.control,
    name: "social_links"
  });

  const speakersFields = useFieldArray({
    control: form.control,
    name: "speakers"
  });

  const sponsorsFields = useFieldArray({
    control: form.control,
    name: "sponsors"
  });

  const questionsFields = useFieldArray({
    control: form.control,
    name: "questions"
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle form submission
  const onSubmit = async (data: EventFormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Form submission started with data:", data);
      console.log("Optional details data:", data.optional_details);
      
      const clubId = sessionStorage.getItem('club_id');
      console.log("Club ID from session:", clubId);
      
      if (!clubId) {
        throw new Error("Club not authenticated");
      }

      // Generate a unique 5-digit event code once
      const eventCode = parseInt(Math.floor(10000 + Math.random() * 90000).toString());
      console.log("Generated event code:", eventCode);

      const eventJson = {
        event_id: eventCode,
        club_id: parseInt(clubId),
        name: data.name || "",
        datetime: data.datetime || "",
        location: data.location || "",
        short_description: data.short_description || "",
        eligibility: data.eligibility || "",
        registration_deadline: data.registration_deadline || "",
        status: data.status || "Open",
        max_attendees: data.max_attendees || 1,
        current_attendees: 0,
        event_thumbnail: data.event_thumbnail || 'https://picsum.photos/800/400',
        is_deleted: false,
        event_type: data.event_type || "open",
        payment_link: data.event_type === "paid" ? data.payment_link : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        
        // Tags
        tags: data.tags || [],
        
        // Agenda
        agenda: (data.agenda || []).map(item => ({
          title: item.title || "",
          description: item.description || "",
          start_time: item.start_time || "",
          end_time: item.end_time || "",
          location: item.location || "",
          display_order: item.display_order || 0
        })),
        
        // Speakers
        speakers: (data.speakers || []).map(speaker => ({
          name: speaker.name || "",
          bio: speaker.bio || "",
          role: speaker.role || "",
          display_order: speaker.display_order || 0
        })),
        
        // Sponsors
        sponsors: (data.sponsors || []).map(sponsor => ({
          name: sponsor.name || "",
          description: sponsor.description || "",
          logo_url: sponsor.logo_url || "",
          website_url: sponsor.website_url || "",
          sponsorship_level: sponsor.sponsorship_level || "",
          display_order: sponsor.display_order || 0
        })),
        
        // Optional Details
        optional_details: (data.optional_details || []).map(detail => ({
          heading: detail.heading || "",
          content: detail.content || "",
          subheading: detail.subheading || "",
          display_order: detail.display_order || 0
        })),
        
        // FAQs
        faqs: (data.faqs || []).map(faq => ({
          question: faq.question || "",
          answer: faq.answer || "",
          display_order: faq.display_order || 0
        })),
        
        // Prizes
        prizes: (data.prizes || []).map(prize => ({
          title: prize.title || "",
          description: prize.description || "",
          value: prize.value || "",
          position: prize.position || "",
          display_order: prize.display_order || 0
        })),
        
        // Resources
        resources: (data.resources || []).map(resource => ({
          title: resource.title || "",
          url: resource.url || "",
          description: resource.description || "",
          type: resource.type || "",
          display_order: resource.display_order || 0
        })),
        
        // Media
        media: (data.media || []).map(media => ({
          type: media.type || "Image",
          url: media.url || "",
          caption: media.caption || "",
          display_order: media.display_order || 0
        })),
        
        // Links
        links: (data.links || []).map(link => ({
          link_type: link.link_type || "",
          url: link.url || "",
          label: link.label || "",
          display_order: link.display_order || 0
        })),
        
        // Contacts
        contacts: (data.contacts || []).map(contact => ({
          name: contact.name || "",
          email: contact.email || "",
          phone: contact.phone || "",
          role: contact.role || "",
          display_order: contact.display_order || 0
        })),
        
        // Social Links
        social_links: (data.social_links || []).map(link => ({
          platform: link.platform || "",
          url: link.url || "",
          display_order: link.display_order || 0
        })),
        
        // Registration Questions
        questions: (data.questions || []).map(q => ({
          question: q.question || "",
          is_payment: q.is_payment || false,
          display_order: q.display_order || 0
        })),
        
        // Metadata
        metadata: {
          created_by: clubId,
          created_from: "web",
          browser_info: navigator.userAgent,
          ip_address: "",
          device_type: "desktop",
          platform: "web",
          last_activity: new Date().toISOString()
        }
      };

      // Log the complete JSON object
      console.log("Complete Event JSON:", JSON.stringify(eventJson, null, 2));
      
      // Insert into events table
      console.log("Attempting to insert into events table...");
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          club_id: parseInt(clubId),
          event_id: eventCode,
          name: data.name,
          datetime: data.datetime,
          location: data.location,
          short_description: data.short_description,
          eligibility: data.eligibility,
          registration_deadline: data.registration_deadline,
          status: data.status,
          max_attendees: data.max_attendees,
          event_thumbnail: data.event_thumbnail || 'https://picsum.photos/800/400',
          current_attendees: 0,
          is_deleted: false,
          event_type: data.event_type,
          payment_link: data.event_type === "paid" ? data.payment_link : null
        })
        .select('event_id, name, datetime, location, short_description, eligibility, registration_deadline, status, max_attendees, event_thumbnail, current_attendees, is_deleted, event_type, payment_link')
        .single();

      if (eventError) {
        console.error("Error inserting event:", eventError);
        throw eventError;
      }
      console.log("Event inserted successfully:", event);
      console.log("**********Inserted event ID**********:", event?.event_id);

      // Send event data to backend for storage (non-blocking)
      // if (event?.event_id) {
      //   // Fire and forget - don't await this
      //   fetch('http://localhost:3000/api/save-event', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify(eventJson),
      //   })
      //   .then(response => {
      //     if (!response.ok) {
      //       console.error('Failed to save event data to backend:', response.statusText);
      //     } else {
      //       console.log('Event data saved to backend successfully');
      //     }
      //   })
      //   .catch(error => {
      //     console.error('Error saving event data to backend:', error);
      //     // Don't throw the error - we want this to be non-blocking
      //   });
      // }

      // Insert event tags
      if (data.tags && data.tags.length > 0) {
        console.log("Inserting event tags...");
        const { error: tagsError } = await supabase
          .from('event_tags')
          .insert(
            data.tags.map(tag => ({
              event_id: event?.event_id,
              tag: tag
            }))
          )
          .select('event_id, tag');

        if (tagsError) {
          console.error("Error inserting tags:", tagsError);
          throw tagsError;
        }
      }

      // Insert event agenda
      if (data.agenda && data.agenda.length > 0) {
        console.log("Inserting event agenda...");
        console.log("Agenda data being inserted:", JSON.stringify(data.agenda, null, 2));
        if (!event?.event_id) {
          throw new Error("event_id is undefined or null. Ensure event is created first.");
        }
        else {
          console.log("Event ID is:", event?.event_id);
        };
        const { error: agendaError } = await supabase
          .from('event_agenda')
          .insert(
            data.agenda.map(item => ({
              event_id: event?.event_id,
              title: item.title,
              description: item.description || null,
              start_time: item.start_time || null,
              end_time: item.end_time || null,
              location: item.location || null,
              display_order: item.display_order
            }))
          )
          .select('event_id, title, description, start_time, end_time, location, display_order');

        if (agendaError) {
          console.error("Error inserting agenda:", agendaError);
          throw agendaError;
        }
      }

      // Insert event speakers
      if (data.speakers && data.speakers.length > 0) {
        console.log("Inserting event speakers...");
        const { error: speakersError } = await supabase
          .from('event_speakers')
          .insert(
            data.speakers.map(speaker => ({
              event_id: event?.event_id,
              name: speaker.name,
              bio: speaker.bio || null,
              role: speaker.role || null,
              display_order: speaker.display_order
            }))
          )
          .select('event_id, name, bio, role, display_order');

        if (speakersError) {
          console.error("Error inserting speakers:", speakersError);
          throw speakersError;
        }
      }

      // Insert event sponsors
      if (data.sponsors && data.sponsors.length > 0) {
        console.log("Inserting event sponsors...");
        const { error: sponsorsError } = await supabase
          .from('event_sponsors')
          .insert(
            data.sponsors.map(sponsor => ({
              event_id: event?.event_id,
              name: sponsor.name,
              description: sponsor.description || null,
              logo_url: sponsor.logo_url || null,
              website_url: sponsor.website_url || null,
              sponsorship_level: sponsor.sponsorship_level || null,
              display_order: sponsor.display_order
            }))
          )
          .select('event_id, name, description, logo_url, website_url, sponsorship_level, display_order');

        if (sponsorsError) {
          console.error("Error inserting sponsors:", sponsorsError);
          throw sponsorsError;
        }
      }

      // Insert event optional details
      if (data.optional_details && data.optional_details.length > 0) {
        console.log("Inserting event optional details...");
        console.log("Optional details to insert:", data.optional_details);
        const { error: optionalDetailsError } = await supabase
          .from('event_optional_details')
          .insert(
            data.optional_details.map(detail => ({
              event_id: event?.event_id,
              heading: detail.heading,
              content: detail.content,
              subheading: detail.subheading || null,
              display_order: detail.display_order,
              created_at: new Date().toISOString()
            }))
          );

        if (optionalDetailsError) {
          console.error("Error inserting optional details:", optionalDetailsError);
          throw optionalDetailsError;
        }
        console.log("Optional details inserted successfully");
      } else {
        console.log("No optional details to insert");
      }

      // Insert event FAQs
      if (data.faqs && data.faqs.length > 0) {
        console.log("Inserting event FAQs...");
        const { error: faqsError } = await supabase
          .from('event_faqs')
          .insert(
            data.faqs.map(faq => ({
              event_id: event?.event_id,
              question: faq.question,
              answer: faq.answer,
              display_order: faq.display_order
            }))
          )
          .select('event_id, question, answer, display_order');

        if (faqsError) {
          console.error("Error inserting FAQs:", faqsError);
          throw faqsError;
        }
      }

      // Insert event prizes
      if (data.prizes && data.prizes.length > 0) {
        console.log("Inserting event prizes...");
        const { error: prizesError } = await supabase
          .from('event_prizes')
          .insert(
            data.prizes.map(prize => ({
              event_id: event?.event_id,
              title: prize.title,
              description: prize.description || null,
              value: prize.value || null,
              position: prize.position || null,
              display_order: prize.display_order
            }))
          )
          .select('event_id, title, description, value, position, display_order');

        if (prizesError) {
          console.error("Error inserting prizes:", prizesError);
          throw prizesError;
        }
      }

      // Insert event resources
      if (data.resources && data.resources.length > 0) {
        console.log("Inserting event resources...");
        const { error: resourcesError } = await supabase
          .from('event_resources')
          .insert(
            data.resources.map(resource => ({
              event_id: event?.event_id,
              title: resource.title,
              url: resource.url,
              description: resource.description || null,
              type: resource.type || null,
              display_order: resource.display_order
            }))
          )
          .select('event_id, title, url, description, type, display_order');

        if (resourcesError) {
          console.error("Error inserting resources:", resourcesError);
          throw resourcesError;
        }
      }

      // Insert event media
      if (data.media && data.media.length > 0) {
        console.log("Inserting event media...");
        const { error: mediaError } = await supabase
          .from('event_media')
          .insert(
            data.media.map(media => ({
              event_id: event?.event_id,
              media_type: media.type,
              url: media.url,
              caption: media.caption || null,
              display_order: media.display_order
            }))
          )
          .select('event_id, media_type, url, caption, display_order');

        if (mediaError) {
          console.error("Error inserting media:", mediaError);
          throw mediaError;
        }
      }

      // Insert event links
      if (data.links && data.links.length > 0) {
        console.log("Inserting event links...");
        const { error: linksError } = await supabase
          .from('event_links')
          .insert(
            data.links.map(link => ({
              event_id: event?.event_id,
              link_type: link.link_type,
              url: link.url,
              label: link.label || null,
              display_order: link.display_order
            }))
          )
          .select('event_id, link_type, url, label, display_order');

        if (linksError) {
          console.error("Error inserting links:", linksError);
          throw linksError;
        }
      }

      // Insert event contacts
      if (data.contacts && data.contacts.length > 0) {
        console.log("Inserting event contacts...");
        const { error: contactsError } = await supabase
          .from('event_contacts')
          .insert(
            data.contacts.map(contact => ({
              event_id: event?.event_id,
              name: contact.name,
              email: contact.email || null,
              phone: contact.phone || null,
              role: contact.role || null,
              display_order: contact.display_order
            }))
          )
          .select('event_id, name, email, phone, role, display_order');

        if (contactsError) {
          console.error("Error inserting contacts:", contactsError);
          throw contactsError;
        }
      }

      // Insert event social links
      if (data.social_links && data.social_links.length > 0) {
        console.log("Inserting event social links...");
        const { error: socialLinksError } = await supabase
          .from('event_social_links')
          .insert(
            data.social_links.map(link => ({
              event_id: event?.event_id,
              platform: link.platform,
              url: link.url,
              display_order: link.display_order
            }))
          )
          .select('event_id, platform, url, display_order');

        if (socialLinksError) {
          console.error("Error inserting social links:", socialLinksError);
          throw socialLinksError;
        }
      }

      // Insert event questions
      if (data.questions && data.questions.length > 0) {
        console.log("Inserting event questions...");
        const { error: questionsError } = await supabase
          .from('event_questions')
          .insert(
            data.questions.map((q, index) => ({
              event_id: event?.event_id,
              question: q.question
            }))
          );

        if (questionsError) {
          console.error("Error inserting questions:", questionsError);
          throw questionsError;
        }
      }

      toast({
        title: "Success!",
        description: "Event created successfully",
      });

      navigate('/club/dashboard');
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle section navigation
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  // Handle drag and drop reordering
  const handleDragEnd = (event: any, fieldArray: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = fieldArray.fields.findIndex((item: any) => item.id === active.id);
      const newIndex = fieldArray.fields.findIndex((item: any) => item.id === over.id);
      
      // Get the current field name from the fieldArray
      const fieldName = fieldArray.name;
      
      // Get the current form values for this field
      const currentValues = form.getValues(fieldName) || [];
      
      // Create a new array with reordered values
      const newValues = arrayMove(currentValues, oldIndex, newIndex);
      
      // Update display_order for all items
      const updatedValues = newValues.map((item: any, index: number) => ({
        ...item,
        display_order: index + 1
      }));
      
      // Update the form values first
      form.setValue(fieldName, updatedValues, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
      
      // Then update the field array
      fieldArray.replace(updatedValues);
    }
  };

  // Live preview component
  const EventPreview = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Event Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {previewData.event_thumbnail && (
          <div className="relative h-48 rounded-lg overflow-hidden">
            <img
              src={previewData.event_thumbnail}
              alt="Event thumbnail"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{previewData.name || "Event Name"}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{previewData.datetime ? format(new Date(previewData.datetime), "PPP") : "Date"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>{previewData.location || "Location"}</span>
          </div>
          {previewData.max_attendees && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>Max {previewData.max_attendees} attendees</span>
            </div>
          )}
          {previewData.tags && previewData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {previewData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create New Event</h1>
        </div>

        <Form {...form}>
          {/* Main Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid grid-cols-7 gap-2 p-2 bg-gray-100 rounded-lg">
              <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Event Details
              </TabsTrigger>
              <TabsTrigger value="agenda" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Event Agenda
              </TabsTrigger>
              <TabsTrigger value="speakers" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Speakers
              </TabsTrigger>
              <TabsTrigger value="sponsors" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Sponsors
              </TabsTrigger>
              <TabsTrigger value="optional" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Optional Details
              </TabsTrigger>
              <TabsTrigger value="faqs" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                FAQs
              </TabsTrigger>
              <TabsTrigger value="registration" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Registration
              </TabsTrigger>
            </TabsList>

            <AnimatePresence>
              {/* Event Details Tab */}
              <TabsContent value="details" key="details">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <Card>
                    <CardHeader className="text-center">
                      <CardTitle>Event Information</CardTitle>
                      <CardDescription>
                        Fill in the essential information for your event
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="event_thumbnail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Thumbnail</FormLabel>
                            <FormControl>
                              <div className="space-y-4">
                                <Input
                                  {...field}
                                  placeholder="Enter event thumbnail URL"
                                  value={field.value || ""}
                                />
                                {field.value && (
                                  <div className="relative h-48 rounded-lg overflow-hidden border">
                                    <img
                                      src={field.value}
                                      alt="Event thumbnail preview"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormDescription>
                              Enter a URL for your event thumbnail image. Recommended size: 800x400 pixels.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Name *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter event name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="datetime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Date & Time *</FormLabel>
                              <FormControl>
                                <Input
                                  type="datetime-local"
                                  {...field}
                                  value={formatDateTimeForInput(field.value)}
                                  onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    field.onChange(date.toISOString());
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Location *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter event location" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="max_attendees"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Attendees *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value);
                                  }}
                                  placeholder="Enter maximum number of attendees"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="registration_deadline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Registration Deadline *</FormLabel>
                              <FormControl>
                                <Input
                                  type="datetime-local"
                                  {...field}
                                  value={formatDateTimeForInput(field.value)}
                                  onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    field.onChange(date.toISOString());
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Status *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select event status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {EVENT_STATUS.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="short_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Description *</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Enter a brief description of your event"
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="eligibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Eligibility Criteria *</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Enter eligibility criteria for participants"
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Tag</FormLabel>
                            <Select onValueChange={(value) => field.onChange([value])} value={field.value?.[0]}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select event tag" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {EVENT_TAGS.map((tag) => (
                                  <SelectItem key={tag} value={tag}>
                                    {tag}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Event Agenda Tab */}
              <TabsContent value="agenda" key="agenda">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 w-full"
                >
                  <Card className="w-full">
                    <CardHeader className="text-center">
                      <CardTitle>Event Schedule</CardTitle>
                      <CardDescription>
                        Add and organize your event schedule items (up to 6)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="w-full">
                      <div className="flex justify-end mb-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (agendaFields.fields.length < 6) {
                              agendaFields.append({
                                title: "",
                                description: "",
                                start_time: "",
                                end_time: "",
                                location: "",
                                display_order: agendaFields.fields.length + 1
                              });
                            } else {
                              toast({
                                title: "Maximum Items Reached",
                                description: "You can add up to 6 agenda items.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Schedule Item
                        </Button>
                      </div>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, agendaFields)}
                      >
                        <SortableContext
                          items={agendaFields.fields.map(field => field.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-4 w-full">
                            {agendaFields.fields.map((field, index) => (
                              <SortableItem key={field.id} id={field.id}>
                                <Card className="p-4 w-full">
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">Schedule Item {index + 1}</h4>
                                      <Badge variant="secondary">Order: {index + 1}</Badge>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        agendaFields.remove(index);
                                        const updatedFields = agendaFields.fields
                                          .filter((_, i) => i !== index)
                                          .map((field, i) => ({
                                            ...field,
                                            display_order: i + 1
                                          }));
                                        form.setValue("agenda", updatedFields);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="space-y-4">
                                    <FormField
                                      control={form.control}
                                      name={`agenda.${index}.title`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Title *</FormLabel>
                                          <FormControl>
                                            <Input {...field} placeholder="Enter schedule item title" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <FormField
                                        control={form.control}
                                        name={`agenda.${index}.start_time`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Start Time</FormLabel>
                                            <FormControl>
                                              <Input
                                                type="datetime-local"
                                                {...field}
                                                value={formatDateTimeForInput(field.value)}
                                                onChange={(e) => {
                                                  const date = new Date(e.target.value);
                                                  field.onChange(date.toISOString());
                                                }}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`agenda.${index}.end_time`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>End Time</FormLabel>
                                            <FormControl>
                                              <Input
                                                type="datetime-local"
                                                {...field}
                                                value={formatDateTimeForInput(field.value)}
                                                onChange={(e) => {
                                                  const date = new Date(e.target.value);
                                                  field.onChange(date.toISOString());
                                                }}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    <FormField
                                      control={form.control}
                                      name={`agenda.${index}.location`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Location</FormLabel>
                                          <FormControl>
                                            <Input {...field} placeholder="Enter location (optional)" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`agenda.${index}.description`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Description</FormLabel>
                                          <FormControl>
                                            <Textarea {...field} placeholder="Enter schedule item description (optional)" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </Card>
                              </SortableItem>
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Speakers Tab */}
              <TabsContent value="speakers" key="speakers">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 w-full"
                >
                  <Card className="w-full">
                    <CardHeader className="text-center">
                      <CardTitle>Event Speakers</CardTitle>
                      <CardDescription>
                        Add speakers and their details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="w-full">
                      <div className="flex justify-end mb-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => speakersFields.append({
                            name: "",
                            bio: "",
                            role: "",
                            display_order: speakersFields.fields.length + 1
                          })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Speaker
                        </Button>
                      </div>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, speakersFields)}
                      >
                        <SortableContext
                          items={speakersFields.fields.map(field => field.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-4 w-full">
                            {speakersFields.fields.map((field, index) => (
                              <SortableItem key={field.id} id={field.id}>
                                <Card className="p-4 w-full">
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">Speaker {index + 1}</h4>
                                      <Badge variant="secondary">Order: {index + 1}</Badge>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        speakersFields.remove(index);
                                        const updatedFields = speakersFields.fields
                                          .filter((_, i) => i !== index)
                                          .map((field, i) => ({
                                            ...field,
                                            display_order: i + 1
                                          }));
                                        form.setValue("speakers", updatedFields);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="space-y-4">
                                    <FormField
                                      control={form.control}
                                      name={`speakers.${index}.name`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Name *</FormLabel>
                                          <FormControl>
                                            <Input {...field} placeholder="Enter speaker name" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`speakers.${index}.role`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Role</FormLabel>
                                          <FormControl>
                                            <Input {...field} placeholder="Enter speaker role (optional)" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`speakers.${index}.bio`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Bio</FormLabel>
                                          <FormControl>
                                            <Textarea {...field} placeholder="Enter speaker bio (optional)" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </Card>
                              </SortableItem>
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Sponsors Tab */}
              <TabsContent value="sponsors" key="sponsors">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 w-full"
                >
                  <Card className="w-full">
                    <CardHeader className="text-center">
                      <CardTitle>Event Sponsors</CardTitle>
                      <CardDescription>
                        Add sponsor details and their information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="w-full">
                      <div className="flex justify-end mb-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => sponsorsFields.append({
                            name: "",
                            description: "",
                            logo_url: "",
                            website_url: "",
                            sponsorship_level: "",
                            display_order: sponsorsFields.fields.length + 1
                          })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Sponsor
                        </Button>
                      </div>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, sponsorsFields)}
                      >
                        <SortableContext
                          items={sponsorsFields.fields.map(field => field.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-4 w-full">
                            {sponsorsFields.fields.map((field, index) => (
                              <SortableItem key={field.id} id={field.id}>
                                <Card className="p-4 w-full">
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">Sponsor {index + 1}</h4>
                                      <Badge variant="secondary">Order: {index + 1}</Badge>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        sponsorsFields.remove(index);
                                        const updatedFields = sponsorsFields.fields
                                          .filter((_, i) => i !== index)
                                          .map((field, i) => ({
                                            ...field,
                                            display_order: i + 1
                                          }));
                                        form.setValue("sponsors", updatedFields);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="space-y-4">
                                    <FormField
                                      control={form.control}
                                      name={`sponsors.${index}.name`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Name *</FormLabel>
                                          <FormControl>
                                            <Input {...field} placeholder="Enter sponsor name" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`sponsors.${index}.sponsorship_level`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Sponsorship Level</FormLabel>
                                          <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select sponsorship level (optional)" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {SPONSORSHIP_LEVELS.map((level) => (
                                                <SelectItem key={level} value={level}>
                                                  {level}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`sponsors.${index}.logo_url`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Logo URL</FormLabel>
                                          <FormControl>
                                            <Input {...field} placeholder="Enter logo URL (optional)" />
                                          </FormControl>
                                          {field.value && (
                                            <div className="relative h-24 rounded-lg overflow-hidden border mt-2">
                                              <img
                                                src={field.value}
                                                alt="Sponsor logo"
                                                className="w-full h-full object-contain"
                                              />
                                            </div>
                                          )}
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`sponsors.${index}.website_url`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Website URL</FormLabel>
                                          <FormControl>
                                            <Input {...field} placeholder="Enter website URL (optional)" />
                                          </FormControl>
                                          {field.value && (
                                            <a
                                              href={field.value}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-sm text-blue-600 hover:underline mt-2 block"
                                            >
                                              {field.value}
                                            </a>
                                          )}
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`sponsors.${index}.description`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Description</FormLabel>
                                          <FormControl>
                                            <Textarea {...field} placeholder="Enter sponsor description (optional)" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </Card>
                              </SortableItem>
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Optional Details Tab */}
              <TabsContent value="optional" key="optional">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 w-full"
                >
                  <Card className="w-full">
                    <CardHeader className="text-center">
                      <CardTitle>Custom Extra Fields</CardTitle>
                      <CardDescription>
                        Add custom fields for additional information (up to 5)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="w-full">
                      <div className="flex justify-end mb-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (optionalDetailsFields.fields.length < 5) {
                              console.log("Adding new optional detail field");
                              optionalDetailsFields.append({
                                heading: "",
                                content: "",
                                subheading: "",
                                display_order: optionalDetailsFields.fields.length + 1
                              });
                              console.log("Current optional details:", form.getValues("optional_details"));
                            } else {
                              toast({
                                title: "Maximum Items Reached",
                                description: "You can add up to 5 custom fields.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Custom Field
                        </Button>
                      </div>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, optionalDetailsFields)}
                      >
                        <SortableContext
                          items={optionalDetailsFields.fields.map(field => field.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-4 w-full">
                            {optionalDetailsFields.fields.map((field, index) => (
                              <SortableItem key={field.id} id={field.id}>
                                <Card className="p-4 w-full">
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">Custom Field {index + 1}</h4>
                                      <Badge variant="secondary">Order: {index + 1}</Badge>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        console.log("Removing optional detail at index:", index);
                                        optionalDetailsFields.remove(index);
                                        const updatedFields = optionalDetailsFields.fields
                                          .filter((_, i) => i !== index)
                                          .map((field, i) => ({
                                            ...field,
                                            display_order: i + 1
                                          }));
                                        console.log("Updated optional details:", updatedFields);
                                        form.setValue("optional_details", updatedFields);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="space-y-4">
                                    <FormField
                                      control={form.control}
                                      name={`optional_details.${index}.heading`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Heading *</FormLabel>
                                          <FormControl>
                                            <Input {...field} placeholder="Enter field heading" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`optional_details.${index}.subheading`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Subheading</FormLabel>
                                          <FormControl>
                                            <Input {...field} placeholder="Enter subheading (optional)" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`optional_details.${index}.content`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Content *</FormLabel>
                                          <FormControl>
                                            <Textarea {...field} placeholder="Enter field content" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </Card>
                              </SortableItem>
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* FAQs Tab */}
              <TabsContent value="faqs" key="faqs">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 w-full"
                >
                  <Card className="w-full">
                    <CardHeader className="text-center">
                      <CardTitle>Frequently Asked Questions</CardTitle>
                      <CardDescription>
                        Add common questions and answers about your event (up to 5)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="w-full">
                      <div className="flex justify-end mb-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (faqsFields.fields.length < 5) {
                              faqsFields.append({
                                question: "",
                                answer: "",
                                display_order: faqsFields.fields.length + 1
                              });
                            } else {
                              toast({
                                title: "Maximum Items Reached",
                                description: "You can add up to 5 FAQs.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add FAQ
                        </Button>
                      </div>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, faqsFields)}
                      >
                        <SortableContext
                          items={faqsFields.fields.map(field => field.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-4 w-full">
                            {faqsFields.fields.map((field, index) => (
                              <SortableItem key={field.id} id={field.id}>
                                <Card className="p-4 w-full">
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">FAQ {index + 1}</h4>
                                      <Badge variant="secondary">Order: {index + 1}</Badge>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        faqsFields.remove(index);
                                        const updatedFields = faqsFields.fields
                                          .filter((_, i) => i !== index)
                                          .map((field, i) => ({
                                            ...field,
                                            display_order: i + 1
                                          }));
                                        form.setValue("faqs", updatedFields);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="space-y-4">
                                    <FormField
                                      control={form.control}
                                      name={`faqs.${index}.question`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Question *</FormLabel>
                                          <FormControl>
                                            <Input {...field} placeholder="Enter your question" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`faqs.${index}.answer`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Answer *</FormLabel>
                                          <FormControl>
                                            <Textarea 
                                              {...field} 
                                              placeholder="Enter the answer"
                                              className="min-h-[100px]"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </Card>
                              </SortableItem>
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="registration" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Registration Settings</CardTitle>
                    <CardDescription>
                      Configure how participants can register for your event
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="event_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select registration type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="open">Open Registration</SelectItem>
                              <SelectItem value="selective">Select Participants Manually</SelectItem>
                              <SelectItem value="paid">Paid Registration</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("event_type") === "paid" && (
                      <FormField
                        control={form.control}
                        name="payment_link"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Link</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter payment link" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Questions For Users</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentQuestions = form.getValues("questions") || [];
                            questionsFields.append({
                              question: "",
                              is_payment: false,
                              display_order: currentQuestions.length
                            });
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Question
                        </Button>
                      </div>

                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, questionsFields)}
                      >
                        <SortableContext
                          items={questionsFields.fields.map((field) => field.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-4">
                            {questionsFields.fields.map((field, index) => (
                              <motion.div
                                key={field.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                              >
                                <SortableItem id={field.id}>
                                  <Card className="w-full">
                                    <CardContent className="pt-6">
                                      <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="cursor-move"
                                          >
                                            <ChevronUp className="h-4 w-4" />
                                          </Button>
                                          <span className="text-sm font-medium">
                                            Question {index + 1}
                                          </span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => questionsFields.remove(index)}
                                          className="text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>

                                      <FormField
                                        control={form.control}
                                        name={`questions.${index}.question`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormControl>
                                              <Input 
                                                {...field} 
                                                placeholder="Enter your question"
                                                className="w-full"
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </CardContent>
                                  </Card>
                                </SortableItem>
                              </motion.div>
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          {/* Second set of tabs */}
          <div className="mt-12">
            <Tabs defaultValue="prizes" className="w-full">
              <TabsList className="grid grid-cols-4 gap-2 p-2 bg-gray-100 rounded-lg">
                <TabsTrigger value="prizes" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Prizes
                </TabsTrigger>
                <TabsTrigger value="resources" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Resources
                </TabsTrigger>
                <TabsTrigger value="media" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Media
                </TabsTrigger>
                <TabsTrigger value="links" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Important Links
                </TabsTrigger>
              </TabsList>

              <AnimatePresence>
                {/* Prizes Tab */}
                <TabsContent value="prizes" key="prizes">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4 w-full"
                  >
                    <Card className="w-full">
                      <CardHeader className="text-center">
                        <CardTitle>Event Prizes</CardTitle>
                        <CardDescription>
                          Add prize details and rewards for participants
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="w-full">
                        <div className="flex justify-end mb-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => prizesFields.append({
                              title: "",
                              description: "",
                              value: "",
                              position: "",
                              display_order: prizesFields.fields.length + 1
                            })}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Prize
                          </Button>
                        </div>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleDragEnd(event, prizesFields)}
                        >
                          <SortableContext
                            items={prizesFields.fields.map(field => field.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-4 w-full">
                              {prizesFields.fields.map((field, index) => (
                                <SortableItem key={field.id} id={field.id}>
                                  <Card className="p-4 w-full">
                                    <div className="flex justify-between items-start mb-4">
                                      <h4 className="font-medium">Prize {index + 1}</h4>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          prizesFields.remove(index);
                                          const updatedFields = prizesFields.fields
                                            .filter((_, i) => i !== index)
                                            .map((field, i) => ({
                                              ...field,
                                              display_order: i + 1
                                            }));
                                          form.setValue("prizes", updatedFields);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="space-y-4">
                                      <FormField
                                        control={form.control}
                                        name={`prizes.${index}.title`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Title *</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Enter prize title" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`prizes.${index}.description`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                              <Textarea {...field} placeholder="Enter prize description (optional)" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`prizes.${index}.value`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Value</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Enter prize value (optional)" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`prizes.${index}.position`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Position</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select prize position (optional)" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                {PRIZE_POSITIONS.map((position) => (
                                                  <SelectItem key={position} value={position}>
                                                    {position}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </Card>
                                </SortableItem>
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" key="resources">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4 w-full"
                  >
                    <Card className="w-full">
                      <CardHeader className="text-center">
                        <CardTitle>Event Resources</CardTitle>
                        <CardDescription>
                          Add resources and materials for participants
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="w-full">
                        <div className="flex justify-end mb-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => resourcesFields.append({
                              title: "",
                              url: "",
                              description: "",
                              type: "",
                              display_order: resourcesFields.fields.length + 1
                            })}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Resource
                          </Button>
                        </div>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleDragEnd(event, resourcesFields)}
                        >
                          <SortableContext
                            items={resourcesFields.fields.map(field => field.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-4 w-full">
                              {resourcesFields.fields.map((field, index) => (
                                <SortableItem key={field.id} id={field.id}>
                                  <Card className="p-4 w-full">
                                    <div className="flex justify-between items-start mb-4">
                                      <h4 className="font-medium">Resource {index + 1}</h4>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          resourcesFields.remove(index);
                                          const updatedFields = resourcesFields.fields
                                            .filter((_, i) => i !== index)
                                            .map((field, i) => ({
                                              ...field,
                                              display_order: i + 1
                                            }));
                                          form.setValue("resources", updatedFields);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="space-y-4">
                                      <FormField
                                        control={form.control}
                                        name={`resources.${index}.title`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Title *</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Enter resource title" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`resources.${index}.url`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>URL *</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Enter resource URL" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`resources.${index}.description`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                              <Textarea {...field} placeholder="Enter resource description (optional)" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`resources.${index}.type`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Resource Type</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select resource type (optional)" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                {RESOURCE_TYPES.map((type) => (
                                                  <SelectItem key={type} value={type}>
                                                    {type}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </Card>
                                </SortableItem>
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Media Tab */}
                <TabsContent value="media" key="media">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4 w-full"
                  >
                    <Card className="w-full">
                      <CardHeader className="text-center">
                        <CardTitle>Event Media</CardTitle>
                        <CardDescription>
                          Add media content and promotional materials
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="w-full">
                        <div className="flex justify-end mb-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => mediaFields.append({
                              type: "Image", // Set a default value
                              url: "",
                              caption: "",
                              display_order: mediaFields.fields.length + 1
                            })}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Media
                          </Button>
                        </div>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleDragEnd(event, mediaFields)}
                        >
                          <SortableContext
                            items={mediaFields.fields.map(field => field.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {mediaFields.fields.map((field, index) => (
                                <SortableItem key={field.id} id={field.id}>
                                  <Card className="p-4 w-full">
                                    <div className="flex justify-between items-start mb-4">
                                      <h4 className="font-medium">Media {index + 1}</h4>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          mediaFields.remove(index);
                                          const updatedFields = mediaFields.fields
                                            .filter((_, i) => i !== index)
                                            .map((field, i) => ({
                                              ...field,
                                              display_order: i + 1
                                            }));
                                          form.setValue("media", updatedFields);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="space-y-4">
                                      <FormField
                                        control={form.control}
                                        name={`media.${index}.type`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Media Type *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select media type" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                {MEDIA_TYPES.map((type) => (
                                                  <SelectItem key={type} value={type}>
                                                    {type}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`media.${index}.url`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>URL *</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Enter media URL" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`media.${index}.caption`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Caption</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Enter media caption (optional)" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      {field.type === "Image" && field.url && (
                                        <div className="relative h-48 rounded-lg overflow-hidden border">
                                          <img
                                            src={field.url}
                                            alt={field.caption || "Media preview"}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                </SortableItem>
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Important Links Tab */}
                <TabsContent value="links" key="links">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4 w-full"
                  >
                    <Card className="w-full">
                      <CardHeader className="text-center">
                        <CardTitle>Important Links</CardTitle>
                        <CardDescription>
                          Add important links and references for participants
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="w-full">
                        <div className="flex justify-end mb-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => linksFields.append({
                              link_type: "Website", // Set a default value
                              url: "",
                              label: "",
                              display_order: linksFields.fields.length + 1
                            })}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Link
                          </Button>
                        </div>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleDragEnd(event, linksFields)}
                        >
                          <SortableContext
                            items={linksFields.fields.map(field => field.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-4 w-full">
                              {linksFields.fields.map((field, index) => (
                                <SortableItem key={field.id} id={field.id}>
                                  <Card className="p-4 w-full">
                                    <div className="flex justify-between items-start mb-4">
                                      <h4 className="font-medium">Link {index + 1}</h4>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          linksFields.remove(index);
                                          const updatedFields = linksFields.fields
                                            .filter((_, i) => i !== index)
                                            .map((field, i) => ({
                                              ...field,
                                              display_order: i + 1
                                            }));
                                          form.setValue("links", updatedFields);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="space-y-4">
                                      <FormField
                                        control={form.control}
                                        name={`links.${index}.link_type`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Link Type *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select link type" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                {LINK_TYPES.map((type) => (
                                                  <SelectItem key={type} value={type}>
                                                    {type}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`links.${index}.url`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>URL *</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Enter link URL" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`links.${index}.label`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Label</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Enter link label (optional)" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </Card>
                                </SortableItem>
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>

          {/* Third set of tabs */}
          <div className="mt-12">
            <Tabs defaultValue="contacts" className="w-full">
              <TabsList className="grid grid-cols-2 gap-2 p-2 bg-gray-100 rounded-lg">
                <TabsTrigger value="contacts" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Contacts
                </TabsTrigger>
                <TabsTrigger value="social" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Social Links
                </TabsTrigger>
              </TabsList>

              <AnimatePresence>
                {/* Contacts Tab */}
                <TabsContent value="contacts" key="contacts">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4 w-full"
                  >
                    <Card className="w-full">
                      <CardHeader className="text-center">
                        <CardTitle>Event Contacts</CardTitle>
                        <CardDescription>
                          Add contact information for event organizers and support
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="w-full">
                        <div className="flex justify-end mb-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => contactsFields.append({
                              name: "",
                              email: "",
                              phone: "",
                              role: "",
                              display_order: contactsFields.fields.length + 1
                            })}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Contact
                          </Button>
                        </div>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleDragEnd(event, contactsFields)}
                        >
                          <SortableContext
                            items={contactsFields.fields.map(field => field.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-4 w-full">
                              {contactsFields.fields.map((field, index) => (
                                <SortableItem key={field.id} id={field.id}>
                                  <Card className="p-4 w-full">
                                    <div className="flex justify-between items-start mb-4">
                                      <h4 className="font-medium">Contact {index + 1}</h4>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          contactsFields.remove(index);
                                          const updatedFields = contactsFields.fields
                                            .filter((_, i) => i !== index)
                                            .map((field, i) => ({
                                              ...field,
                                              display_order: i + 1
                                            }));
                                          form.setValue("contacts", updatedFields);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="space-y-4">
                                      <FormField
                                        control={form.control}
                                        name={`contacts.${index}.name`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Enter contact name" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`contacts.${index}.email`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                              <Input {...field} type="email" placeholder="Enter email address" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`contacts.${index}.phone`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Enter phone number" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`contacts.${index}.role`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Role</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Enter contact role" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </Card>
                                </SortableItem>
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Social Links Tab */}
                <TabsContent value="social" key="social">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4 w-full"
                  >
                    <Card className="w-full">
                      <CardHeader className="text-center">
                        <CardTitle>Social Media Links</CardTitle>
                        <CardDescription>
                          Add social media links for your event
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="w-full">
                        <div className="flex justify-end mb-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => socialLinksFields.append({
                              platform: "facebook", // Set a default value
                              url: "",
                              display_order: socialLinksFields.fields.length + 1
                            })}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Social Link
                          </Button>
                        </div>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleDragEnd(event, socialLinksFields)}
                        >
                          <SortableContext
                            items={socialLinksFields.fields.map(field => field.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-4 w-full">
                              {socialLinksFields.fields.map((field, index) => (
                                <SortableItem key={field.id} id={field.id}>
                                  <Card className="p-4 w-full">
                                    <div className="flex justify-between items-start mb-4">
                                      <h4 className="font-medium">Social Link {index + 1}</h4>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          socialLinksFields.remove(index);
                                          const updatedFields = socialLinksFields.fields
                                            .filter((_, i) => i !== index)
                                            .map((field, i) => ({
                                              ...field,
                                              display_order: i + 1
                                            }));
                                          form.setValue("social_links", updatedFields);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="space-y-4">
                                      <FormField
                                        control={form.control}
                                        name={`social_links.${index}.platform`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Platform *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || "facebook"}>
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select social platform" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                <SelectItem value="facebook">Facebook</SelectItem>
                                                <SelectItem value="twitter">Twitter</SelectItem>
                                                <SelectItem value="instagram">Instagram</SelectItem>
                                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                                                <SelectItem value="youtube">YouTube</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`social_links.${index}.url`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>URL *</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder="Enter social media URL" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      {field.platform && field.url && (
                                        <div className="flex items-center gap-2 mt-2">
                                          {field.platform === "facebook" && <Facebook className="h-5 w-5 text-blue-600" />}
                                          {field.platform === "twitter" && <Twitter className="h-5 w-5 text-blue-400" />}
                                          {field.platform === "instagram" && <Instagram className="h-5 w-5 text-pink-600" />}
                                          {field.platform === "linkedin" && <Linkedin className="h-5 w-5 text-blue-700" />}
                                          {field.platform === "youtube" && <Youtube className="h-5 w-5 text-red-600" />}
                                          {field.platform === "other" && <Globe className="h-5 w-5 text-gray-600" />}
                                          <a
                                            href={field.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline"
                                          >
                                            {field.url}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                </SortableItem>
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => navigate('/club/dashboard')}
              className="min-w-[120px]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log("Form validation state:", form.formState);
                console.log("Form errors:", form.formState.errors);
                form.handleSubmit(onSubmit)();
              }}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Creating Event..." : "Create Event"}
            </Button>
          </div>
        </Form>
      </motion.div>
    </div>
  );
};

export default CreateEventForm; 