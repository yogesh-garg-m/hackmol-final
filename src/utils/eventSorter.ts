import { Profile } from "@/types/profileTypes";

export interface Event {
  event_id: number;
  name: string;
  short_description: string;
  datetime: string;
  location: string;
  club_id: number;
  category?: string;
  eligibility: string;
  current_attendees: number;
  max_attendees?: number;
  registration_deadline: string;
  status: string;
  created_at: string;
  tags?: { tag: string }[];
  event_type: string;
  payment_link?: string;
}

/**
 * Sorts events based on user preferences, event date, and popularity
 * 
 * @param events Array of events to sort
 * @param preferences User preferences
 * @param profile Optional user profile for more personalized sorting
 * @returns Sorted array of events
 */
export const sortEventsByPreference = (
  events: Event[],
  preferences: string[],
  profile?: Profile
): Event[] => {
  if (!events || events.length === 0) return [];
  
  const now = new Date();
  const lowercasePreferences = preferences?.map(p => p.toLowerCase()) || [];
  
  // Create a copy to avoid mutating the original array
  return [...events].sort((a, b) => {
    // First priority: Don't show past events at the top
    const aDate = new Date(a.datetime);
    const bDate = new Date(b.datetime);
    const aIsPast = aDate < now;
    const bIsPast = bDate < now;
    
    if (aIsPast && !bIsPast) return 1;
    if (!aIsPast && bIsPast) return -1;
    
    // Second priority: Preference matching score
    const aScore = getPreferenceScore(a, lowercasePreferences, profile);
    const bScore = getPreferenceScore(b, lowercasePreferences, profile);
    
    if (aScore !== bScore) {
      return bScore - aScore; // Higher score first
    }
    
    // Third priority: Date (upcoming events first for future events)
    if (!aIsPast && !bIsPast) {
      return aDate.getTime() - bDate.getTime();
    }
    
    // For past events, most recent first
    if (aIsPast && bIsPast) {
      return bDate.getTime() - aDate.getTime();
    }
    
    // Fallback to event name for consistent sorting
    return a.name.localeCompare(b.name);
  });
};

/**
 * Calculate a preference score for an event based on how well it matches user preferences
 * 
 * @param event The event to score
 * @param preferences User's preferences (lowercase)
 * @param profile Optional user profile for more personalized scoring
 * @returns A numeric score (higher is better match)
 */
const getPreferenceScore = (
  event: Event, 
  preferences: string[],
  profile?: Profile
): number => {
  let score = 0;
  
  // If no preferences, all events get base score
  if (!preferences || preferences.length === 0) {
    return 0;
  }
  
  // Check category match - highest priority
  if (event.category && preferences.includes(event.category.toLowerCase())) {
    score += 20; // Higher weight for exact category match
  }
  
  // Check tag matches - high priority
  if (event.tags && event.tags.length > 0) {
    event.tags.forEach(tagObj => {
      if (preferences.includes(tagObj.tag.toLowerCase())) {
        score += 10; // Substantial points for each matching tag
      }
    });
  }
  
  // Check if name contains any preference keywords - medium priority
  if (event.name) {
    preferences.forEach(pref => {
      if (event.name.toLowerCase().includes(pref)) {
        score += 5; // Additional points for keyword in title
      }
    });
  }
  
  // Check if description contains any preference keywords - lower priority
  if (event.short_description) {
    preferences.forEach(pref => {
      if (event.short_description.toLowerCase().includes(pref)) {
        score += 2; // Small bonus for keyword matches in description
      }
    });
  }
  
  // Adjust score based on event popularity (higher attendance = more popular)
  if (event.max_attendees && event.current_attendees) {
    const attendanceRatio = event.current_attendees / event.max_attendees;
    if (attendanceRatio > 0.8) {
      score += 3; // Popular events get a small boost
    }
  }
  
  // If we have profile data, we could do more personalized scoring
  if (profile) {
    // Example: boost events in student's department/branch
    if (profile.branch && event.short_description?.toLowerCase().includes(profile.branch.toLowerCase())) {
      score += 5;
    }
    
    // Example: adjust based on year of study
    if (profile.year_of_study && event.eligibility) {
      if (event.eligibility.includes(`Year ${profile.year_of_study}`)) {
        score += 5;
      }
    }
  }
  
  return score;
};

/**
 * Filter events based on multiple criteria
 * 
 * @param events Array of events to filter
 * @param options Filter options
 * @returns Filtered array of events
 */
export const filterEvents = (
  events: Event[],
  options: {
    categories?: string[];
    upcoming?: boolean;
    searchQuery?: string;
    eligibility?: string;
    dateRange?: { start?: Date; end?: Date };
  } = {}
): Event[] => {
  if (!events || events.length === 0) return [];
  
  return events.filter(event => {
    // Filter by categories if specified
    if (options.categories && options.categories.length > 0) {
      if (!event.category || !options.categories.includes(event.category)) {
        return false;
      }
    }
    
    // Filter for upcoming events if specified
    if (options.upcoming) {
      const eventDate = new Date(event.datetime);
      if (eventDate < new Date()) {
        return false;
      }
    }
    
    // Filter by date range if specified
    if (options.dateRange) {
      const eventDate = new Date(event.datetime);
      if (options.dateRange.start && eventDate < options.dateRange.start) {
        return false;
      }
      if (options.dateRange.end && eventDate > options.dateRange.end) {
        return false;
      }
    }
    
    // Filter by eligibility if specified
    if (options.eligibility && !event.eligibility.includes(options.eligibility)) {
      return false;
    }
    
    // Filter by search query if specified
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      const matchesName = event.name.toLowerCase().includes(query);
      const matchesDescription = event.short_description.toLowerCase().includes(query);
      const matchesLocation = event.location.toLowerCase().includes(query);
      const matchesCategory = event.category?.toLowerCase().includes(query);
      
      // Check tags if they exist
      const matchesTags = event.tags?.some(tagObj => 
        tagObj.tag.toLowerCase().includes(query)
      );
      
      if (!(matchesName || matchesDescription || matchesLocation || matchesCategory || matchesTags)) {
        return false;
      }
    }
    
    return true;
  });
};
