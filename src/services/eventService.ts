import { supabase } from "@/integrations/supabase/client";
import { VolunteerEvent } from "@/types/event";
import { toast } from "@/hooks/use-toast";

export const fetchEvents = async (): Promise<VolunteerEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('volunteering_events')
      .select(`
        *,
        profiles:organized_by (
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(event => ({
      ...event,
      organizer_name: event.profiles?.full_name || null
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    toast({
      title: "Error",
      description: "Could not load volunteering events",
      variant: "destructive"
    });
    return [];
  }
};

export const createEvent = async (event: Omit<VolunteerEvent, 'id' | 'created_at' | 'organizer_name'>): Promise<VolunteerEvent | null> => {
  try {
    const { data, error } = await supabase
      .from('volunteering_events')
      .insert([event])
      .select(`
        *,
        profiles:organized_by (
          full_name
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    toast({
      title: "Success!",
      description: "Volunteering event has been created",
      variant: "default"
    });

    return {
      ...data,
      organizer_name: data.profiles?.full_name || null
    };
  } catch (error) {
    console.error("Error creating event:", error);
    toast({
      title: "Error",
      description: "Could not create volunteering event",
      variant: "destructive"
    });
    return null;
  }
};
