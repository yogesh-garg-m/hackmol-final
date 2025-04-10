export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      openings: {
        Row: {
          id: number
          created_by: string
          title: string
          short_description: string
          category: string
          long_description: string
          eligibility: string
          contact: string
          created_at: string
        }
        Insert: {
          id?: number
          created_by: string
          title: string
          short_description: string
          category: string
          long_description: string
          eligibility: string
          contact: string
          created_at?: string
        }
        Update: {
          id?: number
          created_by?: string
          title?: string
          short_description?: string
          category?: string
          long_description?: string
          eligibility?: string
          contact?: string
          created_at?: string
        }
      }
      opening_records: {
        Row: {
          id: number
          opening_id: number
          duration: string | null
          start_time: string | null
          end_time: string | null
          max_people: number | null
        }
        Insert: {
          id?: number
          opening_id: number
          duration?: string | null
          start_time?: string | null
          end_time?: string | null
          max_people?: number | null
        }
        Update: {
          id?: number
          opening_id?: number
          duration?: string | null
          start_time?: string | null
          end_time?: string | null
          max_people?: number | null
        }
      }
      opening_optional_details: {
        Row: {
          id: number
          opening_id: number
          heading: string
          subheading: string | null
          content: string
        }
        Insert: {
          id?: number
          opening_id: number
          heading: string
          subheading?: string | null
          content: string
        }
        Update: {
          id?: number
          opening_id?: number
          heading?: string
          subheading?: string | null
          content?: string
        }
      }
      opening_media: {
        Row: {
          id: number
          opening_id: number
          media_type: 'image' | 'video'
          media_url: string
        }
        Insert: {
          id?: number
          opening_id: number
          media_type: 'image' | 'video'
          media_url: string
        }
        Update: {
          id?: number
          opening_id?: number
          media_type?: 'image' | 'video'
          media_url?: string
        }
      }
      opening_links: {
        Row: {
          id: number
          opening_id: number
          link_type: 'GitHub' | 'LinkedIn' | 'Website' | 'Registration' | 'Other'
          url: string
        }
        Insert: {
          id?: number
          opening_id: number
          link_type: 'GitHub' | 'LinkedIn' | 'Website' | 'Registration' | 'Other'
          url: string
        }
        Update: {
          id?: number
          opening_id?: number
          link_type?: 'GitHub' | 'LinkedIn' | 'Website' | 'Registration' | 'Other'
          url?: string
        }
      }
    }
  }
} 