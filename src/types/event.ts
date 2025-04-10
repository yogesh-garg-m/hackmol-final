export type EventStatus = "Open" | "Closing Soon" | "Waitlist" | "Closed" | "Cancelled";

export interface Event {
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

export interface DatabaseEvent {
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
}

// New interfaces for optional event details
export interface EventSpeaker {
  id: string;
  event_id: number;
  name: string;
  bio?: string;
  role?: string;
  display_order: number;
  created_at: string;
}

export interface EventContact {
  id: string;
  event_id: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  created_at: string;
}

export interface EventLink {
  id: string;
  event_id: number;
  link_type: string;
  url: string;
  label?: string;
  created_at: string;
}

export interface EventSponsor {
  id: string;
  event_id: number;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  sponsorship_level?: string;
  created_at: string;
}

export interface EventPrize {
  id: string;
  event_id: number;
  title: string;
  description?: string;
  value?: string;
  position?: string;
  created_at: string;
}

export interface EventAgendaItem {
  id: string;
  event_id: number;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  display_order: number;
  created_at: string;
}

export interface EventResource {
  id: string;
  event_id: number;
  title: string;
  description?: string;
  resource_type?: string;
  url: string;
  created_at: string;
}

export interface EventMedia {
  id: string;
  event_id: number;
  media_type: string;
  url: string;
  caption?: string;
  display_order: number;
  created_at: string;
}

export interface EventFAQ {
  id: string;
  event_id: number;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
}

export interface EventOptionalDetail {
  id: string;
  event_id: number;
  heading: string;
  subheading?: string;
  content: string;
  display_order: number;
  created_at: string;
}

export interface EventSocialLink {
  id: string;
  event_id: number;
  platform: string;
  url: string;
  created_at: string;
}

export interface EventDetails extends Event {
  speakers?: EventSpeaker[];
  contacts?: EventContact[];
  links?: EventLink[];
  sponsors?: EventSponsor[];
  prizes?: EventPrize[];
  agenda?: EventAgendaItem[];
  resources?: EventResource[];
  media?: EventMedia[];
  faqs?: EventFAQ[];
  optionalDetails?: EventOptionalDetail[];
  socialLinks?: EventSocialLink[];
}

export interface VolunteerEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  organized_by: string | null;
  emergency_flag: boolean;
  created_at: string;
  thumbnail: string;
  organizer_name?: string;
}

export type EventFilter = {
  searchQuery: string;
  showEmergencyOnly: boolean;
}

export interface Profile {
  id: string;
  full_name: string;
}
