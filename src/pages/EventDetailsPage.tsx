import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EventDetails } from "@/types/event";

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const eventIdNumber = eventId ? parseInt(eventId, 10) : 0;

        const { data: eventData, error } = await supabase
          .from("events")
          .select("*")
          .eq("event_id", eventIdNumber)
          .single();

        if (error) throw error;
        setEvent({
          event_id: eventData.event_id,
          name: eventData.name,
          datetime: eventData.datetime,
          location: eventData.location,
          short_description: eventData.short_description,
          registration_deadline: eventData.registration_deadline,
          event_thumbnail: eventData.event_thumbnail,
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchEventDetails();
  }, [eventId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return (
      <div>
        Event not found
        <Link to="/homepage">Go back</Link>
      </div>
    );
  }

  const eventDate = new Date(event.datetime);
  const deadlineDate = new Date(event.registration_deadline);
  const hasRegistrationClosed = deadlineDate < new Date();

  return (
    <div style={{ backgroundColor: "#cccccc", padding: "10px" }}>
      <div style={{ backgroundColor: "white" }}>
        <Link to="/homepage">Back</Link>
      </div>

      <div style={{ marginTop: "20px" }}>
        <img
          src={event.event_thumbnail}
          alt={event.name}
          style={{ width: "100%", height: "200px" }}
        />
        <h1 style={{ fontSize: "24px", color: "purple" }}>{event.name}</h1>
        <p style={{ color: "red" }}>{event.short_description}</p>

        <div style={{ backgroundColor: "yellow", padding: "10px", margin: "10px 0" }}>
          <p>Date: {eventDate.toLocaleDateString()}</p>
          <p>Time: {eventDate.toLocaleTimeString()}</p>
          <p>Location: {event.location}</p>
        </div>

        <div style={{ backgroundColor: "lime", padding: "10px" }}>
          <p style={{ color: "blue" }}>
            Registration: {hasRegistrationClosed ? "Closed" : "Open"}
          </p>
          <button 
            style={{ 
              backgroundColor: hasRegistrationClosed ? "gray" : "orange",
              color: "black",
              padding: "5px",
              border: "2px solid black"
            }}
            disabled={hasRegistrationClosed}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;