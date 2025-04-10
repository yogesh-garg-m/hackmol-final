export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin: {
        Row: {
          admin_code: string
          created_at: string | null
          id: string
          password: string
        }
        Insert: {
          admin_code: string
          created_at?: string | null
          id?: string
          password: string
        }
        Update: {
          admin_code?: string
          created_at?: string | null
          id?: string
          password?: string
        }
        Relationships: []
      }
      alert_newsletters: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          heading: string
          id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          heading: string
          id?: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          heading?: string
          id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          content: string
          created_at: string | null
          heading: string
          id: number
          time: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          heading: string
          id?: number
          time: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          heading?: string
          id?: number
          time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarked_events: {
        Row: {
          event_id: number
          id: number
          user_id: string
        }
        Insert: {
          event_id: number
          id?: number
          user_id: string
        }
        Update: {
          event_id?: number
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarked_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "bookmarked_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      club_auth: {
        Row: {
          club_code: string
          club_id: number
          created_at: string | null
          id: number
          password: string
          status: string
        }
        Insert: {
          club_code: string
          club_id: number
          created_at?: string | null
          id?: number
          password: string
          status?: string
        }
        Update: {
          club_code?: string
          club_id?: number
          created_at?: string | null
          id?: number
          password?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_auth_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["club_id"]
          },
        ]
      }
      club_members: {
        Row: {
          club_id: number
          joined_at: string | null
          member_id: number
          role: string
          user_id: string
        }
        Insert: {
          club_id: number
          joined_at?: string | null
          member_id?: number
          role: string
          user_id: string
        }
        Update: {
          club_id?: number
          joined_at?: string | null
          member_id?: number
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["club_id"]
          },
        ]
      }
      clubs: {
        Row: {
          admin_id: string
          category: string
          club_id: number
          created_at: string | null
          description: string | null
          name: string
        }
        Insert: {
          admin_id: string
          category: string
          club_id?: number
          created_at?: string | null
          description?: string | null
          name: string
        }
        Update: {
          admin_id?: string
          category?: string
          club_id?: number
          created_at?: string | null
          description?: string | null
          name?: string
        }
        Relationships: []
      }
      event_agenda: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number
          end_time: string | null
          event_id: number
          id: string
          location: string | null
          start_time: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          end_time?: string | null
          event_id: number
          id?: string
          location?: string | null
          start_time?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          end_time?: string | null
          event_id?: number
          id?: string
          location?: string | null
          start_time?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_agenda_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      event_attendance: {
        Row: {
          created_at: string | null
          event_id: number
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: number
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: number
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_contacts: {
        Row: {
          created_at: string | null
          display_order: number
          email: string | null
          event_id: number
          id: string
          name: string | null
          phone: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          email?: string | null
          event_id: number
          id?: string
          name?: string | null
          phone?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          email?: string | null
          event_id?: number
          id?: string
          name?: string | null
          phone?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_contacts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      event_faqs: {
        Row: {
          answer: string
          created_at: string | null
          display_order: number
          event_id: number
          id: string
          question: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          display_order?: number
          event_id: number
          id?: string
          question: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          display_order?: number
          event_id?: number
          id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_faqs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      event_links: {
        Row: {
          created_at: string | null
          display_order: number
          event_id: number
          id: string
          label: string | null
          link_type: string
          url: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          event_id: number
          id?: string
          label?: string | null
          link_type: string
          url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          event_id?: number
          id?: string
          label?: string | null
          link_type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_links_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      event_media: {
        Row: {
          caption: string | null
          created_at: string | null
          display_order: number
          event_id: number
          id: string
          media_type: string
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          display_order?: number
          event_id: number
          id?: string
          media_type: string
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          display_order?: number
          event_id?: number
          id?: string
          media_type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_media_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      event_optional_details: {
        Row: {
          content: string
          created_at: string | null
          display_order: number
          event_id: number
          heading: string
          id: string
          subheading: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          display_order?: number
          event_id: number
          heading: string
          id?: string
          subheading?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          display_order?: number
          event_id?: number
          heading?: string
          id?: string
          subheading?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_optional_details_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      event_prizes: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number
          event_id: number
          id: string
          position: string | null
          title: string
          value: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          event_id: number
          id?: string
          position?: string | null
          title: string
          value?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          event_id?: number
          id?: string
          position?: string | null
          title?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_prizes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      event_questions: {
        Row: {
          event_id: number
          question: string
          question_id: number
        }
        Insert: {
          event_id: number
          question: string
          question_id?: number
        }
        Update: {
          event_id?: number
          question?: string
          question_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_questions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          event_id: number
          event_type: string
          is_valid: string | null
          payment_proof: string | null
          qr_code: string | null
          registration_id: number
          status: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          event_id: number
          event_type: string
          is_valid?: string | null
          payment_proof?: string | null
          qr_code?: string | null
          registration_id?: number
          status?: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          event_id?: number
          event_type?: string
          is_valid?: string | null
          payment_proof?: string | null
          qr_code?: string | null
          registration_id?: number
          status?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_resources: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number
          event_id: number
          id: string
          resource_type: string | null
          title: string
          url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          event_id: number
          id?: string
          resource_type?: string | null
          title: string
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          event_id?: number
          id?: string
          resource_type?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_resources_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      event_social_links: {
        Row: {
          created_at: string | null
          display_order: number
          event_id: number
          id: string
          platform: Database["public"]["Enums"]["social_media_platform"]
          url: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          event_id: number
          id?: string
          platform: Database["public"]["Enums"]["social_media_platform"]
          url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          event_id?: number
          id?: string
          platform?: Database["public"]["Enums"]["social_media_platform"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_social_links_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      event_speakers: {
        Row: {
          bio: string | null
          created_at: string | null
          display_order: number
          event_id: number
          id: string
          name: string
          role: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          display_order?: number
          event_id: number
          id?: string
          name: string
          role?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          display_order?: number
          event_id?: number
          id?: string
          name?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_speakers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      event_sponsors: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number
          event_id: number
          id: string
          logo_url: string | null
          name: string
          sponsorship_level: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          event_id: number
          id?: string
          logo_url?: string | null
          name: string
          sponsorship_level?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          event_id?: number
          id?: string
          logo_url?: string | null
          name?: string
          sponsorship_level?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_sponsors_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      event_student_responses: {
        Row: {
          question_id: number
          response: string
          response_id: number
          user_id: string
        }
        Insert: {
          question_id: number
          response: string
          response_id?: number
          user_id: string
        }
        Update: {
          question_id?: number
          response?: string
          response_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_student_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "event_questions"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "event_student_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tags: {
        Row: {
          event_id: number
          tag: string
          tag_id: number
        }
        Insert: {
          event_id: number
          tag: string
          tag_id?: number
        }
        Update: {
          event_id?: number
          tag?: string
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_tags_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      events: {
        Row: {
          club_id: number
          created_at: string | null
          current_attendees: number
          datetime: string
          eligibility: string
          event_id: number
          event_thumbnail: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          is_deleted: boolean
          is_valid: string | null
          location: string
          max_attendees: number | null
          name: string
          payment_link: string | null
          registration_deadline: string
          short_description: string
          status: Database["public"]["Enums"]["event_status"]
        }
        Insert: {
          club_id: number
          created_at?: string | null
          current_attendees?: number
          datetime: string
          eligibility: string
          event_id?: number
          event_thumbnail?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          is_deleted?: boolean
          is_valid?: string | null
          location: string
          max_attendees?: number | null
          name: string
          payment_link?: string | null
          registration_deadline: string
          short_description: string
          status?: Database["public"]["Enums"]["event_status"]
        }
        Update: {
          club_id?: number
          created_at?: string | null
          current_attendees?: number
          datetime?: string
          eligibility?: string
          event_id?: number
          event_thumbnail?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          is_deleted?: boolean
          is_valid?: string | null
          location?: string
          max_attendees?: number | null
          name?: string
          payment_link?: string | null
          registration_deadline?: string
          short_description?: string
          status?: Database["public"]["Enums"]["event_status"]
        }
        Relationships: [
          {
            foreignKeyName: "events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["club_id"]
          },
        ]
      }
      opening_links: {
        Row: {
          created_at: string | null
          id: number
          link_type: string
          opening_id: number
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          link_type: string
          opening_id: number
          url: string
        }
        Update: {
          created_at?: string | null
          id?: number
          link_type?: string
          opening_id?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "opening_links_opening_id_fkey"
            columns: ["opening_id"]
            isOneToOne: false
            referencedRelation: "openings"
            referencedColumns: ["opening_id"]
          },
        ]
      }
      opening_media: {
        Row: {
          id: number
          media_type: string
          media_url: string
          opening_id: number
          uploaded_at: string | null
        }
        Insert: {
          id?: number
          media_type: string
          media_url: string
          opening_id: number
          uploaded_at?: string | null
        }
        Update: {
          id?: number
          media_type?: string
          media_url?: string
          opening_id?: number
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opening_media_opening_id_fkey"
            columns: ["opening_id"]
            isOneToOne: false
            referencedRelation: "openings"
            referencedColumns: ["opening_id"]
          },
        ]
      }
      opening_members: {
        Row: {
          created_at: string | null
          lead_id: string | null
          opening_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          lead_id?: string | null
          opening_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          lead_id?: string | null
          opening_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opening_members_opening_id_fkey"
            columns: ["opening_id"]
            isOneToOne: false
            referencedRelation: "openings"
            referencedColumns: ["opening_id"]
          },
          {
            foreignKeyName: "opening_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opening_optional_details: {
        Row: {
          content: string
          display_order: number
          heading: string
          id: number
          opening_id: number
          subheading: string | null
        }
        Insert: {
          content: string
          display_order?: number
          heading: string
          id?: number
          opening_id: number
          subheading?: string | null
        }
        Update: {
          content?: string
          display_order?: number
          heading?: string
          id?: number
          opening_id?: number
          subheading?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opening_optional_details_opening_id_fkey"
            columns: ["opening_id"]
            isOneToOne: false
            referencedRelation: "openings"
            referencedColumns: ["opening_id"]
          },
        ]
      }
      opening_records: {
        Row: {
          duration: string | null
          end_time: string | null
          max_people: number | null
          opening_id: number
          skills_required: string | null
          start_time: string | null
        }
        Insert: {
          duration?: string | null
          end_time?: string | null
          max_people?: number | null
          opening_id: number
          skills_required?: string | null
          start_time?: string | null
        }
        Update: {
          duration?: string | null
          end_time?: string | null
          max_people?: number | null
          opening_id?: number
          skills_required?: string | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opening_records_opening_id_fkey"
            columns: ["opening_id"]
            isOneToOne: true
            referencedRelation: "openings"
            referencedColumns: ["opening_id"]
          },
        ]
      }
      openings: {
        Row: {
          category: string
          contact: string
          created_at: string | null
          created_by: string
          eligibility: string
          long_description: string
          opening_id: number
          short_description: string
          title: string
        }
        Insert: {
          category: string
          contact: string
          created_at?: string | null
          created_by: string
          eligibility: string
          long_description: string
          opening_id?: number
          short_description: string
          title: string
        }
        Update: {
          category?: string
          contact?: string
          created_at?: string | null
          created_by?: string
          eligibility?: string
          long_description?: string
          opening_id?: number
          short_description?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "openings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_optional: {
        Row: {
          bio: string | null
          contact_info: string | null
          optional_id: number
          profile_id: number
          profile_picture_url: string | null
          projects: string | null
          skills: string | null
          social_media_links: string | null
          volunteering_exp: string | null
        }
        Insert: {
          bio?: string | null
          contact_info?: string | null
          optional_id?: number
          profile_id: number
          profile_picture_url?: string | null
          projects?: string | null
          skills?: string | null
          social_media_links?: string | null
          volunteering_exp?: string | null
        }
        Update: {
          bio?: string | null
          contact_info?: string | null
          optional_id?: number
          profile_id?: number
          profile_picture_url?: string | null
          projects?: string | null
          skills?: string | null
          social_media_links?: string | null
          volunteering_exp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_optional_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profiles: {
        Row: {
          blood_group: string
          branch: string
          created_at: string | null
          full_name: string
          id: string
          is_deleted: boolean
          profile_id: number
          roll_number: string
          username: string
          year_of_study: number
        }
        Insert: {
          blood_group: string
          branch: string
          created_at?: string | null
          full_name: string
          id: string
          is_deleted?: boolean
          profile_id?: number
          roll_number: string
          username: string
          year_of_study: number
        }
        Update: {
          blood_group?: string
          branch?: string
          created_at?: string | null
          full_name?: string
          id?: string
          is_deleted?: boolean
          profile_id?: number
          roll_number?: string
          username?: string
          year_of_study?: number
        }
        Relationships: []
      }
      profiles_backup: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          link: string
          posted_by_admin: string | null
          posted_by_type: string
          posted_by_user: string | null
          tags: string
          title: string
          type: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          link?: string
          posted_by_admin?: string | null
          posted_by_type: string
          posted_by_user?: string | null
          tags: string
          title: string
          type: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          link?: string
          posted_by_admin?: string | null
          posted_by_type?: string
          posted_by_user?: string | null
          tags?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_posted_by_admin"
            columns: ["posted_by_admin"]
            isOneToOne: false
            referencedRelation: "admin"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_posted_by_user"
            columns: ["posted_by_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_connections: {
        Row: {
          connection_id: number
          created_at: string | null
          status: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          connection_id?: number
          created_at?: string | null
          status: string
          user1_id: string
          user2_id: string
        }
        Update: {
          connection_id?: number
          created_at?: string | null
          status?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_connections_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_connections_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_contacts: {
        Row: {
          contact_id: number
          contact_type: string
          contact_value: string
          user_id: string
        }
        Insert: {
          contact_id?: number
          contact_type: string
          contact_value: string
          user_id: string
        }
        Update: {
          contact_id?: number
          contact_type?: string
          contact_value?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          content: string
          created_at: string | null
          id: number
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: number
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: number
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          id: number
          preference: string
          user_id: string
        }
        Insert: {
          id?: number
          preference: string
          user_id: string
        }
        Update: {
          id?: number
          preference?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reminders: {
        Row: {
          event_id: number
          id: number
          reminder_time: string
          user_id: string
        }
        Insert: {
          event_id: number
          id?: number
          reminder_time: string
          user_id: string
        }
        Update: {
          event_id?: number
          id?: number
          reminder_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "user_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteering_events: {
        Row: {
          created_at: string | null
          description: string
          emergency_flag: boolean | null
          event_date: string
          id: string
          location: string
          organized_by: string | null
          thumbnail: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          emergency_flag?: boolean | null
          event_date: string
          id?: string
          location: string
          organized_by?: string | null
          thumbnail?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          emergency_flag?: boolean | null
          event_date?: string
          id?: string
          location?: string
          organized_by?: string | null
          thumbnail?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteering_events_organized_by_fkey"
            columns: ["organized_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unique_club_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_event_organizer_v2: {
        Args: { v_event_id: number }
        Returns: boolean
      }
    }
    Enums: {
      event_status:
        | "Open"
        | "Closing Soon"
        | "Waitlist"
        | "Closed"
        | "Cancelled"
      event_type: "open" | "selective" | "paid"
      social_media_platform:
        | "facebook"
        | "twitter"
        | "instagram"
        | "linkedin"
        | "youtube"
        | "tiktok"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_status: ["Open", "Closing Soon", "Waitlist", "Closed", "Cancelled"],
      event_type: ["open", "selective", "paid"],
      social_media_platform: [
        "facebook",
        "twitter",
        "instagram",
        "linkedin",
        "youtube",
        "tiktok",
        "other",
      ],
    },
  },
} as const
