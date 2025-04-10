import { supabase } from '@/integrations/supabase/client';

export async function fetchUserDetails(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data; // Returns { full_name, email }
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    throw error;
  }
}