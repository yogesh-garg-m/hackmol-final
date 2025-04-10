export interface Opening {
    opening_id: number;
    created_by: string;
    title: string;
    short_description: string;
    category: string;
    long_description: string;
    eligibility: string;
    contact: string;
    created_at: string;
    skills_required?: string[];
    start_time?: string;
    duration?: string;
    max_people?: number;
    creator?: {
      username: string;
      full_name: string;
    };
  }