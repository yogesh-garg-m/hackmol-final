import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EVENT_STATUS = ["Open", "Closing Soon", "Waitlist", "Closed"];

// Simplified form schema
const eventFormSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  datetime: z.string().min(1, "Event date and time is required"),
  location: z.string().min(1, "Event location is required"),
  short_description: z.string().optional(), // Made optional
  eligibility: z.string().min(1, "Eligibility criteria is required"),
  registration_deadline: z.string().min(1, "Registration deadline is required"),
  status: z.enum(["Open", "Closing Soon", "Waitlist", "Closed"]).default("Open"),
  max_attendees: z.number().min(1, "Maximum attendees must be at least 1"),
  agenda: z.array(z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    location: z.string().optional(),
  })).optional(),
  event_type: z.enum(["open", "selective", "paid"]).default("open"),
  questions: z.array(z.object({
    question: z.string().min(1, "Question is required"),
  })).optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const CreateEventForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      datetime: "",
      location: "",
      short_description: "",
      eligibility: "",
      registration_deadline: "",
      status: "Open",
      max_attendees: 1,
      agenda: [],
      event_type: "open",
      questions: [],
    },
  });

  const agendaFields = useFieldArray({
    control: form.control,
    name: "agenda",
  });

  const questionsFields = useFieldArray({
    control: form.control,
    name: "questions",
  });

  // Simplified onSubmit function
  const onSubmit = async (data: EventFormValues) => {
    try {
      setIsSubmitting(true);
      const clubId = sessionStorage.getItem("club_id");
      if (!clubId) {
        throw new Error("Club not authenticated");
      }

      const eventCode = Math.floor(10000 + Math.random() * 90000);

      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert({
          club_id: parseInt(clubId),
          event_id: eventCode,
          name: data.name,
          datetime: data.datetime,
          location: data.location,
          short_description: data.short_description || null,
          eligibility: data.eligibility,
          registration_deadline: data.registration_deadline,
          status: data.status,
          max_attendees: data.max_attendees,
          event_type: data.event_type,
          current_attendees: 0,
          is_deleted: false,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      if (data.agenda && data.agenda.length > 0) {
        const { error: agendaError } = await supabase
          .from("event_agenda")
          .insert(
            data.agenda.map((item, index) => ({
              event_id: event.event_id,
              title: item.title,
              description: item.description || null,
              start_time: item.start_time || null,
              end_time: item.end_time || null,
              location: item.location || null,
              display_order: index + 1,
            }))
          );
        if (agendaError) throw agendaError;
      }

      if (data.questions && data.questions.length > 0) {
        const { error: questionsError } = await supabase
          .from("event_questions")
          .insert(
            data.questions.map((q) => ({
              event_id: event.event_id,
              question: q.question,
            }))
          );
        if (questionsError) throw questionsError;
      }

      toast({ title: "Success!", description: "Event created successfully" });
      navigate("/club/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Create New Event</h1>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Event Details</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="registration">Registration</TabsTrigger>
          </TabsList>

          {/* Event Details Tab */}
          <TabsContent value="details">
            <div>
              <label>Event Name *</label>
              <input {...form.register("name")} placeholder="Enter event name" />
              {form.formState.errors.name && <span>{form.formState.errors.name.message}</span>}

              <label>Event Date & Time *</label>
              <input type="datetime-local" {...form.register("datetime")} />
              {form.formState.errors.datetime && <span>{form.formState.errors.datetime.message}</span>}

              <label>Event Location *</label>
              <input {...form.register("location")} placeholder="Enter event location" />
              {form.formState.errors.location && <span>{form.formState.errors.location.message}</span>}

              <label>Maximum Attendees *</label>
              <input type="number" {...form.register("max_attendees", { valueAsNumber: true })} placeholder="Enter maximum attendees" />
              {form.formState.errors.max_attendees && <span>{form.formState.errors.max_attendees.message}</span>}

              <label>Registration Deadline *</label>
              <input type="datetime-local" {...form.register("registration_deadline")} />
              {form.formState.errors.registration_deadline && <span>{form.formState.errors.registration_deadline.message}</span>}

              <label>Event Status *</label>
              <select {...form.register("status")}>
                {EVENT_STATUS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <label>Event Description</label>
              <textarea {...form.register("short_description")} placeholder="Enter a brief description" />
              {form.formState.errors.short_description && <span>{form.formState.errors.short_description.message}</span>}

              <label>Eligibility Criteria *</label>
              <textarea {...form.register("eligibility")} placeholder="Enter eligibility criteria" />
              {form.formState.errors.eligibility && <span>{form.formState.errors.eligibility.message}</span>}
            </div>
          </TabsContent>

          {/* Agenda Tab */}
          <TabsContent value="agenda">
            <div>
              <button
                type="button"
                onClick={() => agendaFields.append({ title: "", description: "", start_time: "", end_time: "", location: "" })}
              >
                Add Schedule Item
              </button>
              {agendaFields.fields.map((field, index) => (
                <div key={field.id}>
                  <label>Title *</label>
                  <input {...form.register(`agenda.${index}.title`)} placeholder="Enter title" />
                  {form.formState.errors.agenda?.[index]?.title && <span>{form.formState.errors.agenda[index].title.message}</span>}

                  <label>Description</label>
                  <textarea {...form.register(`agenda.${index}.description`)} placeholder="Enter description" />

                  <label>Start Time</label>
                  <input type="datetime-local" {...form.register(`agenda.${index}.start_time`)} />

                  <label>End Time</label>
                  <input type="datetime-local" {...form.register(`agenda.${index}.end_time`)} />

                  <label>Location</label>
                  <input {...form.register(`agenda.${index}.location`)} placeholder="Enter location" />

                  <button type="button" onClick={() => agendaFields.remove(index)}>Remove</button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Registration Tab */}
          <TabsContent value="registration">
            <div>
              <label>Registration Type</label>
              <select {...form.register("event_type")}>
                <option value="open">Open Registration</option>
                <option value="selective">Selective Registration</option>
                <option value="paid">Paid Registration</option>
              </select>

              <label>Questions For Users</label>
              <button
                type="button"
                onClick={() => questionsFields.append({ question: "" })}
              >
                Add Question
              </button>
              {questionsFields.fields.map((field, index) => (
                <div key={field.id}>
                  <input {...form.register(`questions.${index}.question`)} placeholder="Enter question" />
                  {form.formState.errors.questions?.[index]?.question && <span>{form.formState.errors.questions[index].question.message}</span>}
                  <button type="button" onClick={() => questionsFields.remove(index)}>Remove</button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div>
          <button type="button" onClick={() => navigate("/club/dashboard")}>Cancel</button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating Event..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;