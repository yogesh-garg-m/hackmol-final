export interface Event_1 {
    event_id: string;
    name: string;
    datetime: string;
    location: string;
    club_id: string;
    club_name: string;
    short_description: string;
    payment_link: string | null;
    created_at: string;
  }
  
  export interface EventRegistration_1 {
    registration_id: string;
    event_id: string;
    user_id: string;
    status: "accepted" | "pending" | "rejected";
    created_at: string;
  }
  
  export interface EventTag_1 {
    event_id: string;
    tag_name: string;
  }
  
  export interface EventWithRegistration_1 extends Event_1 {
    registration_id: string;
    registration_status: "accepted" | "pending" | "rejected";
    submitted_at: string;
    tags: string[];
    qr_code: string;
    isOngoing?: boolean;
  }
  
  export type TabType = "upcoming" | "pending";
  
  export interface FilterOptions_1 {
    search: string;
    location: string;
    tag: string;
    dateRange: {
      from: Date | undefined;
      to: Date | undefined;
    };
  }