export interface Profile {
    id: string;
    user_id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    created_at: string;
    updated_at: string;
    year?: string;
    year_of_branch: string;
    blood_group: string;
    email: string;
    year_of_study: number;
    branch: string;
    last_login: string;
  }
  
  export interface Club {
    club_id: string;
    name: string;
    description: string | null;
    category: string;
    status: 'Pending' | 'Approved';
    admin_id: string;
    created_at: string;
    updated_at: string;
    club_code?: string;
  }
  
  export interface Event {
    event_id: string;
    name: string;
    description: string | null;
    datetime: string;
    location: string;
    capacity: number;
    participants_count: number;
    status: "Open" | "Closed" | "Cancelled";
    category: string;
    club_id: string;
    club_name: string;
    created_at: string;
    updated_at: string;
  }
  
  // Generate random dates within a range
  import { supabase } from "@/integrations/supabase/client";
  
    
  
  // Generate statistical data for charts
  
    
  // Helper function for Supabase transition
 

const getSupabaseQuery = (table: string) => {
    switch (table) {
      case 'profiles':
        return async () => {
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .range(0, 9);
          if (error) throw error;
          return profiles;
        };
  
      case 'clubs':
        return async () => {
          const { data: clubs, error } = await supabase
            .from('clubs')
            .select('*')
            .order('created_at', { ascending: false });
          if (error) throw error;
          return clubs;
        };
  
      case 'events':
        return async () => {
          const { data: events, error } = await supabase
            .from('events')
            .select('*, clubs(name, category)')
            .order('datetime', { ascending: true });
          if (error) throw error;
          return events;
        };
  
      case 'pending_clubs':
        return async () => {
          const { data: pendingClubs, error } = await supabase
            .from('clubs')
            .select('*')
            .eq('status', 'Pending')
            .order('created_at', { ascending: false });
          if (error) throw error;
          return pendingClubs;
        };
  
      case 'approve_club':
        return async (clubId: string) => {
          const { data, error } = await supabase
            .from('clubs')
            .update({ status: 'Active' })
            .eq('club_id', clubId);
          if (error) throw error;
          return data;
        };
  
      case 'user_insights':
        return async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('created_at')
            .order('created_at', { ascending: true });
          if (error) throw error;
  
          const monthlyData = data.reduce((acc, item) => {
            const date = new Date(item.created_at);
            const month = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();
            const key = `${month} ${year}`;
            if (!acc[key]) acc[key] = 0;
            acc[key]++;
            return acc;
          }, {});
  
          const chartData = Object.keys(monthlyData).map(key => ({
            name: key,
            count: monthlyData[key],
          }));
  
          return chartData;
        };
  
      case 'event_insights':
        return async () => {
          const { data, error } = await supabase
            .from('events')
            .select('status')
            .order('status', { ascending: true });
          if (error) throw error;
  
          const statusCounts = data.reduce((acc, item) => {
            if (!acc[item.status]) acc[item.status] = 0;
            acc[item.status]++;
            return acc;
          }, {});
  
          const chartData = Object.keys(statusCounts).map(key => ({
            name: key,
            value: statusCounts[key],
          }));
  
          return chartData;
        };
  
      default:
        return async () => {
          throw new Error(`No query defined for table: ${table}`);
        };
    }
  };

  export default getSupabaseQuery;