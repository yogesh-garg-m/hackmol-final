export interface Profile {
    id: string;
    full_name: string;
    username: string;
    branch: string;
    year_of_study: number;
    profile_optional?: {
      profile_picture_url?: string;
    };
  }
  
  
  
  export interface Opening {
    opening_id: number;
    created_by: string;
    title: string;
    short_description: string;
    category: string;
    long_description: string;
    eligibility: string;
    contact: string;
    creator?: Profile; // Join with profile
  }
  
  export interface OpeningRecord {
    opening_id: number;
    duration?: string;
    start_time?: string;
    end_time?: string;
    max_people?: number;
    skills_required?: string;
  }
  
  export interface OpeningOptionalDetail {
    opening_id: number;
    heading: string;
    subheading?: string;
    content: string;
  }
  
  export interface OpeningMedia {
    opening_id: number;
    media_type: 'Image' | 'Video';
    media_url: string;
  }
  
  export interface OpeningLink {
    opening_id: number;
    link_type: string;
    url: string;
  }
  
  export interface OpeningParticipant {
    opening_id: number;
    user_id: string;
    status: 'Pending' | 'Accepted';
  }
  
  export interface ProjectData {
    opening: Opening;
    records?: OpeningRecord;
    optionalDetails?: OpeningOptionalDetail[];
    media?: OpeningMedia[];
    links?: OpeningLink[];
    participantStatus?: 'Pending' | 'Accepted' | null;
  }
  
  export type JoinStatus = 'Not Joined' | 'Pending' | 'Accepted';