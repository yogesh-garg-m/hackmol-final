import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

// Simplified Form Schema
const eventFormSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  datetime: z.string().min(1, "Event date and time is required"),
  location: z.string().min(1, "Event location is required"),
  short_description: z.string().min(1, "Event description is required"),
  max_attendees: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .pipe(z.number().min(1, "Maximum attendees must be at least 1")),
  agenda: z
    .array(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
      })
    )
    .optional(),
  speakers: z
    .array(
      z.object({
        name: z.string().min(1, "Name is required"),
        bio: z.string().optional(),
      })
    )
    .optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

// Helper to format datetime for input
const formatDateTimeForInput = (date: Date | string | null) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

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
      max_attendees: 1,
      agenda: [],
      speakers: [],
    },
  });

  const agendaFields = useFieldArray({
    control: form.control,
    name: "agenda",
  });

  const speakersFields = useFieldArray({
    control: form.control,
    name: "speakers",
  });

  const onSubmit = async (data: EventFormValues) => {
    try {
      setIsSubmitting(true);
      const clubId = sessionStorage.getItem("club_id");
      if (!clubId) throw new Error("Club not authenticated");

      const eventCode = Math.floor(10000 + Math.random() * 90000);

      // Insert into events table
      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert({
          club_id: parseInt(clubId),
          event_id: eventCode,
          name: data.name,
          datetime: data.datetime,
          location: data.location,
          short_description: data.short_description,
          max_attendees: data.max_attendees,
          current_attendees: 0,
          is_deleted: false,
        })
        .select("event_id")
        .single();

      if (eventError) throw eventError;

      // Insert agenda
      if (data.agenda && data.agenda.length > 0) {
        const { error: agendaError } = await supabase
          .from("event_agenda")
          .insert(
            data.agenda.map((item, index) => ({
              event_id: event.event_id,
              title: item.title,
              description: item.description || null,
              display_order: index + 1,
            }))
          );
        if (agendaError) throw agendaError;
      }

      // Insert speakers
      if (data.speakers && data.speakers.length > 0) {
        const { error: speakersError } = await supabase
          .from("event_speakers")
          .insert(
            data.speakers.map((speaker, index) => ({
              event_id: event.event_id,
              name: speaker.name,
              bio: speaker.bio || null,
              display_order: index + 1,
            }))
          );
        if (speakersError) throw speakersError;
      }

      toast({
        title: "Success!",
        description: "Event created successfully",
      });
      navigate("/club/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Create New Event</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Event Details */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold">Event Details</h2>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter event name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="datetime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Date & Time *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={formatDateTimeForInput(field.value)}
                      onChange={(e) => field.onChange(new Date(e.target.value).toISOString())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter event location" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_attendees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Attendees *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                      placeholder="Enter maximum attendees"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter event description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Agenda */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold">Agenda</h2>
            {agendaFields.fields.map((field, index) => (
              <div key={field.id} className="space-y-2 border p-4 rounded">
                <div className="flex justify-between items-center">
                  <span>Agenda Item {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => agendaFields.remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name={`agenda.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter agenda title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`agenda.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter description (optional)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                agendaFields.append({
                  title: "",
                  description: "",
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Agenda Item
            </Button>
          </div>

          {/* Speakers */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold">Speakers</h2>
            {speakersFields.fields.map((field, index) => (
              <div key={field.id} className="space-y-2 border p-4 rounded">
                <div className="flex justify-between items-center">
                  <span>Speaker {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => speakersFields.remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name={`speakers.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter speaker name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`speakers.${index}.bio`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter bio (optional)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                speakersFields.append({
                  name: "",
                  bio: "",
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Speaker
            </Button>
          </div>

          {/* Submit/Cancel Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/club/dashboard")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateEventForm;