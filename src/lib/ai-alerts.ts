import { supabase } from "@/integrations/supabase/client";
import { groq } from "@/integrations/groqClient";
// Interfaces for transformed alert data
interface AlertRegisteredEvent {
  event_name: string;
  datetime: string;
}

interface AlertBookmarkedEvent {
  event_name: string;
  registration_deadline: string;
}

interface AlertNewsletter {
  heading: string;
  content: string;
}

interface AlertNotification {
  title: string;
  content: string;
}

interface RegisteredEvent {
  event_id: string;
  events: {
    name: string;
    datetime: string;
  };
}

interface BookmarkedEvent {
  event_id: string;
  events: {
    name: string;
    registration_deadline: string;
  };
}

/**
 * Fetches and processes user alerts for registered events, bookmarked events,
 * newsletters, and notifications.
 * @param userId - The ID of the user.
 * @param timestamp - The timestamp for logging purposes.
 * @returns An object containing arrays of transformed alert data.
 */
async function processAndInsertAIAlerts(userId, aiResponseJson) {
    try {
      // Step 1: Parse the AI-generated JSON string
      let alerts;
      try {
        alerts = JSON.parse(aiResponseJson);
        if (!Array.isArray(alerts)) {
          throw new Error("AI response is not an array");
        }
      } catch (error) {
        console.error("Failed to parse AI response:", error);
        throw new Error("Invalid AI response format");
      }
  
      // Step 2: Validate each alert object
      for (const alert of alerts) {
        if (!alert.heading || !alert.content || !alert.time) {
          console.error("Invalid alert format:", alert);
          throw new Error("AI-generated alert missing required fields");
        }
      }
  
      // Step 3: Prepare data for insertion by adding user_id
      const alertsToInsert = alerts.map(alert => ({
        user_id: userId,         // Add the user UUID
        heading: alert.heading,  // From AI data
        content: alert.content,  // From AI data
        time: alert.time         // From AI data
      }));
  
      // Step 4: Insert the alerts into the 'alerts' table
      const { error } = await supabase
        .from('alerts')
        .insert(alertsToInsert);
  
      if (error) {
        console.error("Failed to insert alerts:", error);
        throw error;
      }
  
      console.log(`Successfully inserted ${alerts.length} alerts for user ${userId}`);
    } catch (error) {
      console.error("Error processing AI alerts:", error);
      throw error;
    }
  }
  
export const handleAIAlert = async (userId: string, timestamp: Date) => {
  try {
    // 1. Fetch accepted event registrations within the next 5 days
    const { data: registeredEvents, error: registeredError } = await supabase
      .from('event_registrations')
      .select('event_id, events!inner (name, datetime)')
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .gte('events.datetime', new Date().toISOString())
      .lte('events.datetime', new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()) as {
        data: RegisteredEvent[] | null;
        error: any;
      };

    if (registeredError) throw registeredError;
    console.log("Registered events fetched:", registeredEvents);

    // 2. Fetch all alert newsletters
    const { data: newsletters, error: newsletterError } = await supabase
      .from('alert_newsletters')
      .select('heading, content') as { data: AlertNewsletter[] | null; error: any };

    if (newsletterError) throw newsletterError;
    console.log("Newsletters fetched:", newsletters);

    // 3. Fetch bookmarked events with existing event data
    const { data: bookmarkedEvents, error: bookmarkedError } = await supabase
      .from('bookmarked_events')
      .select('event_id, events!inner (name, registration_deadline)')
      .eq('user_id', userId) as { data: BookmarkedEvent[] | null; error: any };

    if (bookmarkedError) throw bookmarkedError;
    console.log("Bookmarked events fetched:", bookmarkedEvents);

    // 4. Fetch user notifications from the last 2 days
    const { data: notifications, error: notificationError } = await supabase
      .from('user_notifications')
      .select('title, content')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()) as {
        data: AlertNotification[] | null;
        error: any;
      };

    if (notificationError) throw notificationError;
    console.log("Notifications fetched:", notifications);

    // Transform the data into the required interfaces
    const alertRegisteredEvents: AlertRegisteredEvent[] = registeredEvents
      ?.filter(event => event.events != null) // Filter out null events
      .map(event => ({
        event_name: event.events!.name, // Safe to use ! after filter
        datetime: event.events!.datetime,
      })) || [];

    const alertBookmarkedEvents: AlertBookmarkedEvent[] = bookmarkedEvents
      ?.filter(event => event.events != null) // Filter out null events
      .map(event => ({
        event_name: event.events!.name,
        registration_deadline: event.events!.registration_deadline,
      })) || [];

    const alertNewsletters: AlertNewsletter[] = newsletters || [];

    const alertNotifications: AlertNotification[] = notifications || [];

    // Log the transformed data
    console.log('AI Alert Data:', {
      timestamp: timestamp.toISOString(),
      userId,
      registeredEvents: alertRegisteredEvents,
      bookmarkedEvents: alertBookmarkedEvents,
      newsletters: alertNewsletters,
      notifications: alertNotifications,
    });

    
    
    // Return the transformed data
    const alertData = {
        registeredEvents: alertRegisteredEvents,
        bookmarkedEvents: alertBookmarkedEvents,
        newsletters: alertNewsletters,
        notifications: alertNotifications,
      };
      const currentTime = new Date().toISOString();
      console.log("Current time:", currentTime);

const aiPrompt = `
You are an AI assistant tasked with transforming user data into a standardized alert format. The user data includes registered events, bookmarked events, newsletters, and notifications. Your job is to create a list of alerts, each with 'heading', 'content', and 'time' fields, based on the following rules. The 'content' field must not exceed 14-15 words; summarize points and generate a concise message if necessary.

Current time: ${currentTime}

User Data:
${JSON.stringify(alertData, null, 2)}

Instructions:

**For each registered event in "registeredEvents":** 
- Set 'heading' to the event's "event_name".
- Calculate the time difference by subtracting the current time from the event's "datetime".
- Set content to saying that the event is starting in [time difference] or started [time difference] ago in a appropriate tune .
For example:
- If the "datetime" is in the future, set 'content' to "Event starting in [time difference]" (e.g., "Event starting in 2 hours"). or you can say "Gear up!, event starting in [time difference]"
- If present , set "Event started" (e.g., "Event started 3 days ago").
- Set 'time' to a human-readable time difference string, such as "2 hours", "3 days", or "45 minutes". Use the largest appropriate unit (minutes for <1 hour, hours for <1 day, days otherwise).

**For each bookmarked event in "bookmarkedEvents":**
- Set 'heading' to the event's "event_name".
- Calculate the time difference by subtracting the current time from the event's "registration_deadline".
- Set 'content' to "Registrations closing in [time difference], complete now!" (e.g., "Hurry up! registrations closing in 3 days").
- Set 'time' to a human-readable time difference string, such as "3 hours", "1 day", or "45 minutes". Use the largest appropriate unit.
- make sure content words align with datetime.
**For each newsletter in "newsletters":**
- Set 'heading' to the newsletter's "heading".
- Set 'content' to the newsletter's "content". If longer than 14 words, truncate to 14 words and append "...".
- Set 'time' accordingly mentioned in content or set it to "Now".

**For each notification in "notifications":**
- Set 'heading' to the notification's "title".
- Set 'content' to the notification's "content". If longer than 14 words, truncate to 14 words and append "...".
- Set 'time' according to the content or set it to "Now".

Combine all alerts from the four categories into a single array and output it as a JSON array. Do not include any additional text, explanations, or marks beyond the JSON array.

**Example Output Format (based on sample data and illustrative time differences):**
[
  {
    "heading": "TechBreeze",
    "content": "Event starting in 2 hours",
    "time": "2 hours"
  },
  {
    "heading": "AI Summit 2025",
    "content": "Event started 1 day ago",
    "time": "1 day"
  },
  {
    "heading": "HackaMol 6.0",
    "content": "Registrations closing in 3 days, complete now!",
    "time": "3 days"
  },
  {
    "heading": "Tennis",
    "content": "Registrations closing in 6 months, complete now!",
    "time": "6 months"
  },
  {
    "heading": "Campus Closed",
    "content": "Campus will be closing in 10 days.",
    "time": "10 days"
  },
  {
    "heading": "Request Accepted",
    "content": "Manik has accepted your friend request.",
    "time": "Now"
  }
]

**Notes:**
- Note this is just an example, you can change the content and time as per the user data. and tone, add words like Congratulations, Hurry up!, etc. For example when someone has accepted your friend request, you can say "Congratulations! Manik has accepted your friend request."
- Calculate actual time differences using the provided current time and the respective "datetime" or "registration_deadline".
- Ensure time difference strings are rounded to the nearest appropriate unit for readability.
- The example time differences are illustrative; use the real calculated values.
`;
      // Log the transformed data as JSON
      
      const aiResponse = await groq.chat.completions.create({
        model: "gemma2-9b-it",
        messages: [{ role: "user", content: aiPrompt }],
        temperature: 0.7,
      });
      const alertsJson = aiResponse.choices[0].message.content;
      console.log("AI-Generated Alerts:", alertsJson);
      processAndInsertAIAlerts(userId, alertsJson);
      // No return value needed since we're logging instead
      return;

  } catch (error) {
    console.error('Error in handleAIAlert:', error);
    throw error;
  }
};