import { supabase } from '@/integrations/supabase/client';

/**
 * Get club data from sessionStorage.
 * Assumes that the club_id and club_name have been saved to sessionStorage.
 */
export const getClubData = () => {
  const club_id = sessionStorage.getItem('club_id');
  const club_name = sessionStorage.getItem('club_name');
  return { club_id, club_name };
};

/**
 * Fetch events for a club – sorted by the nearest event from current time.
 */
export const fetchClubEvents = async (clubId: string) => {
  const { data, error } = await supabase
    .from('events')
    .select('event_id, name, datetime')
    .eq('club_id', clubId)
    .gte('datetime', new Date().toISOString()) // Only get future events
    .order('datetime', { ascending: true }); // Sort by nearest event first

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return data || [];
};

/**
 * Check if a registration is valid.
 */
export const checkRegistrationValidity = async (eventId: number, userId: string) => {
  console.log("reached here");
  const { data, error } = await supabase
    .from('event_registrations')
    .select('is_valid')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();
    console.log("Completed query");
  console.log(data);
  if (error) {
    console.error('Error checking registration validity:', error);
    return false;
  }

  if(data?.is_valid === "true"){
    return true;
  }else{
    return false;
  }
};

/**
 * Mark a registration as used.
 */
export const markRegistrationAsUsed = async (eventId: number, userId: string) => {
  const { data, error } = await supabase
    .from('event_registrations')
    .update({ is_valid: "false" })
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error marking registration as used:', error);
    return false;
  }

  return true;
};

/**
 * Record attendance.
 */
export const recordAttendance = async (eventId: number, userId: string) => {
  const { data, error } = await supabase
    .from('event_attendance')
    .insert([{
      event_id: eventId,
      user_id: userId,
      created_at: new Date().toISOString() // Add timestamp
    }]);

  if (error) {
    console.error('Error recording attendance:', error);
    return false;
  }

  return true;
};
