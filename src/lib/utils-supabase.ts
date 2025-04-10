// This file will contain utility functions for Supabase integration
// IMPORTANT: This entire file should be uncommented when migrating to your actual project




// Initialize Supabase client - replace with your actual Supabase URL and anon key
import { supabase } from "@/integrations/supabase/client";

interface NewsletterOptions {
  page?: number;
  limit?: number;
}

interface EventOptions {
  status?: string;
  clubId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

interface EventStatsOptions {
  timeframe?: 'day' | 'week' | 'month' | 'year';
}

interface ClubOptions {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface UserOptions {
  yearOfBranch?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Club related queries
export async function fetchAllClubs(options: ClubOptions = {}) {
  const { category = null, status = null, search = null, page = 1, limit = 10 } = options;
  
  let query = supabase
    .from('clubs')
    .select(`
      *,
      club_auth (
        status
      )
    `, { count: 'exact' });
    
  if (category) {
    query = query.eq('category', category);
  }
  
  if (status) {
    query = query.eq('club_auth.status', status);
  }
  
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  
  // Add pagination
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    throw error;
  }
  
  // Transform the data to flatten the club_auth status
  const transformedData = data?.map(club => ({
    ...club,
    status: club.club_auth?.[0]?.status || 'Pending'
  }));
  
  return { data: transformedData, count, page, limit };
}

// Newsletter related queries
export async function fetchNewsletters(options: NewsletterOptions = {}) {
  const { page = 1, limit = 10 } = options;
  
  // Add pagination
  const from = (page - 1) * limit;
  
  const { data, error, count } = await supabase
    .from('alert_newsletters')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);
  
  if (error) {
    throw error;
  }
  
  return { data, count, page, limit };
}

export async function createNewsletter(heading: string, content: string) {
  const { data, error } = await supabase
    .from('alert_newsletters')
    .insert([
      { 
        heading,
        content,
        created_by: 'Admin' // Replace with actual user ID or name
      }
    ])
    .select();
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function deleteNewsletter(id: string) {
  const { error } = await supabase
    .from('alert_newsletters')
    .delete()
    .eq('id', id);
  
  if (error) {
    throw error;
  }
  
  return true;
}

export async function approveClub(clubId) {
  const { data, error } = await supabase
    .from('clubs')
    .update({ status: 'Active' })
    .eq('club_id', clubId);
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function banClub(clubId) {
  const { data, error } = await supabase
    .from('clubs')
    .update({ status: 'Banned' })
    .eq('club_id', clubId);
    
  if (error) {
    throw error;
  }
  
  return data;
}

// Event-related queries
export async function fetchEvents(options: EventOptions = {}) {
  const { status = null, clubId = null, from = null, to = null, page = 1, limit = 10 } = options;
  
  let query = supabase
    .from('events')
    .select('*, clubs(name, category)', { count: 'exact' });
    
  if (status) {
    query = query.eq('status', status);
  }
  
  if (clubId) {
    query = query.eq('club_id', clubId);
  }
  
  if (from) {
    query = query.gte('datetime', from);
  }
  
  if (to) {
    query = query.lte('datetime', to);
  }
  
  // Add pagination
  const fromRecord = (page - 1) * limit;
  query = query.range(fromRecord, fromRecord + limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    throw error;
  }
  
  return { data, count, page, limit };
}

// User related queries
export async function fetchUsers(options: UserOptions = {}) {
  const { yearOfBranch = null, search = null, page = 1, limit = 10 } = options;
  
  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' });
    
  if (yearOfBranch) {
    query = query.eq('year_of_branch', yearOfBranch);
  }
  
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  
  // Add pagination
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    throw error;
  }
  
  return { data, count, page, limit };
}

// Analytics queries
export async function fetchUserStats(timeframe = 'week') {
  let timeValue;
  const now = new Date();
  
  switch (timeframe) {
    case 'day':
      timeValue = new Date(now.setDate(now.getDate() - 1)).toISOString();
      break;
    case 'week':
      timeValue = new Date(now.setDate(now.getDate() - 7)).toISOString();
      break;
    case 'month':
      timeValue = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      break;
    case 'year':
      timeValue = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      break;
    default:
      timeValue = new Date(now.setDate(now.getDate() - 7)).toISOString();
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('created_at, year_of_branch, blood_group')
    .gte('created_at', timeValue);
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function fetchEventStats(options: EventStatsOptions = { timeframe: 'week' }) {
  const { timeframe } = options;
  let timeValue;
  const now = new Date();
  
  switch (timeframe) {
    case 'day':
      timeValue = new Date(now.setDate(now.getDate() - 1)).toISOString();
      break;
    case 'week':
      timeValue = new Date(now.setDate(now.getDate() - 7)).toISOString();
      break;
    case 'month':
      timeValue = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      break;
    case 'year':
      timeValue = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      break;
    default:
      timeValue = new Date(now.setDate(now.getDate() - 7)).toISOString();
  }
  
  const { data, error } = await supabase
    .from('events')
    .select('*, clubs(category)')
    .gte('created_at', timeValue);
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function fetchEventRegistrations() {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('event_id, user_id, events(name, datetime, status)');
    
  if (error) {
    throw error;
  }
  
  return data;
}

// Real-time subscriptions
export function subscribeToClubApprovals(callback) {
  const subscription = supabase
    .channel('public:clubs')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'clubs',
      filter: 'status=eq.Pending'
    }, callback)
    .subscribe();
    
  return subscription;
}

export function subscribeToNewEvents(callback: (payload: any) => void) {
  const subscription = supabase
    .channel('public:events')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'events'
    }, callback)
    .subscribe();
    
  return subscription;
}

export function subscribeToNewsletters(callback: (payload: any) => void) {
  const subscription = supabase
    .channel('public:alert_newsletters')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'alert_newsletters'
    }, callback)
    .subscribe();
    
  return subscription;
}

// Helper function to generate dashboard stats
export async function getDashboardStats() {
  try {
    // Get counts for various entities
    const [usersResponse, clubsResponse, eventsResponse, registrationsResponse, newslettersResponse, pendingClubsResponse] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('clubs').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('event_registrations').select('*', { count: 'exact', head: true }),
      supabase.from('alert_newsletters').select('*', { count: 'exact', head: true }),
      supabase.from('club_auth').select('*', { count: 'exact', head: true }).eq('status', 'Pending')
    ]);
    
    // Get recent users
    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    // Get pending clubs with proper join
    const { data: pendingClubs } = await supabase
      .from('clubs')
      .select(`
        *,
        club_auth (
          status
        )
      `)
      .eq('club_auth.status', 'Pending');
      
    // Transform pending clubs data
    const transformedPendingClubs = pendingClubs?.map(club => ({
      ...club,
      status: club.club_auth?.[0]?.status || 'Pending'
    }));
      
    // Get upcoming events
    const { data: upcomingEvents } = await supabase
      .from('events')
      .select('*, clubs(name)')
      .gte('datetime', new Date().toISOString())
      .order('datetime', { ascending: true })
      .limit(5);
    
    // Get recent newsletters
    const { data: recentNewsletters } = await supabase
      .from('alert_newsletters')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
      
    return {
      counts: {
        users: usersResponse.count,
        clubs: clubsResponse.count,
        events: eventsResponse.count,
        registrations: registrationsResponse.count,
        pendingClubs: pendingClubsResponse.count,
        newsletters: newslettersResponse.count
      },
      recentUsers,
      pendingClubs: transformedPendingClubs,
      upcomingEvents,
      recentNewsletters
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

