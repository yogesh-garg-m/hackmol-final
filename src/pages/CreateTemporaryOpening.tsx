import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Upload, Link as LinkIcon, Users, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Form schema
const formSchema = z.object({
  // Basic Info (Step 1)
  title: z.string().min(1, "Title is required").max(255),
  short_description: z.string().min(1, "Short description is required"),
  category: z.string().min(1, "Category is required"),

  // Details (Step 2)
  long_description: z.string().min(1, "Long description is required"),
  eligibility: z.string().min(1, "Eligibility is required"),
  contact: z.string().min(1, "Contact information is required"),

  // Other Details (Step 3)
  duration: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  max_people: z.number().min(1).optional(),
  skills_required: z.string().optional(),

  // Custom Fields (Step 4)
  custom_fields: z.array(z.object({
    heading: z.string().min(1, "Heading is required").max(200),
    subheading: z.string().max(300).optional(),
    content: z.string().min(1, "Content is required")
  })).max(5),

  // Media (Step 5)
  media: z.array(z.object({
    type: z.enum(["image", "video"]),
    url: z.string().url("Please enter a valid URL")
  })).optional(),

  // Links (Step 6)
  links: z.array(z.object({
    type: z.enum(["GitHub", "LinkedIn", "Website", "Registration", "Other"]),
    url: z.string().url("Please enter a valid URL")
  })).optional()
});

type FormValues = z.infer<typeof formSchema>;

const categories = [
  "Internship", "Project", "Research", "Competition", "Workshop",
  "Hackathon", "Conference", "Job", "Volunteer", "Other"
];

const CreateTemporaryOpening: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAddingField, setIsAddingField] = useState(false);
  const [isAddingMedia, setIsAddingMedia] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      short_description: "",
      category: "",
      long_description: "",
      eligibility: "",
      contact: "",
      skills_required: "",
      custom_fields: [],
      media: [],
      links: []
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);

      // Insert into openings table
      const { data: opening, error: openingError } = await supabase
        .from('openings')
        .insert({
          created_by: user?.id,
          title: data.title,
          short_description: data.short_description,
          category: data.category,
          long_description: data.long_description,
          eligibility: data.eligibility,
          contact: data.contact
        })
        .select()
        .single();

      if (openingError) throw openingError;

      // Insert optional details
      if (data.custom_fields.length > 0) {
        const { error: optionalError } = await supabase
          .from('opening_optional_details')
          .insert(
            data.custom_fields.map(field => ({
              opening_id: opening.opening_id,
              heading: field.heading,
              subheading: field.subheading,
              content: field.content
            }))
          );

        if (optionalError) throw optionalError;
      }

      // Insert records
      if (data.duration || data.start_time || data.end_time || data.max_people) {
        const { error: recordsError } = await supabase
          .from('opening_records')
          .insert({
            opening_id: opening.opening_id,
            duration: data.duration,
            start_time: data.start_time,
            end_time: data.end_time,
            max_people: data.max_people,
            skills_required: data.skills_required
          });

        if (recordsError) throw recordsError;
      }

      // Insert media
      if (data.media && data.media.length > 0) {
        const { error: mediaError } = await supabase
          .from('opening_media')
          .insert(
            data.media.map(media => ({
              opening_id: opening.opening_id,
              media_type: media.type,
              media_url: media.url
            }))
          );

        if (mediaError) throw mediaError;
      }

      // Insert links
      if (data.links && data.links.length > 0) {
        const { error: linksError } = await supabase
          .from('opening_links')
          .insert(
            data.links.map(link => ({
              opening_id: opening.opening_id,
              link_type: link.type,
              url: link.url
            }))
          );

        if (linksError) throw linksError;
      }

      toast({
        title: "Success!",
        description: "Temporary opening created successfully.",
      });

      navigate(`/homepage`);
    } catch (error) {
      console.error('Error creating opening:', error);
      toast({
        title: "Error",
        description: "Failed to create temporary opening",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = (newStep: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(newStep);
      setIsTransitioning(false);
    }, 300); // Match this with the animation duration
  };

  const addCustomField = async () => {
    try {
      setIsAddingField(true);
      const currentFields = form.getValues('custom_fields');
      if (currentFields.length < 5) {
        await form.setValue('custom_fields', [
          ...currentFields,
          { heading: '', subheading: '', content: '' }
        ], { shouldValidate: true });
      }
    } finally {
      setIsAddingField(false);
    }
  };

  const removeCustomField = (index: number) => {
    const currentFields = form.getValues('custom_fields');
    form.setValue('custom_fields', currentFields.filter((_, i) => i !== index));
  };

  const addMedia = async () => {
    try {
      setIsAddingMedia(true);
      const currentMedia = form.getValues('media') || [];
      await form.setValue('media', [...currentMedia, { type: 'image', url: '' }], { shouldValidate: true });
    } finally {
      setIsAddingMedia(false);
    }
  };

  const removeMedia = (index: number) => {
    const currentMedia = form.getValues('media') || [];
    form.setValue('media', currentMedia.filter((_, i) => i !== index));
  };

  const addLink = async () => {
    try {
      setIsAddingLink(true);
      const currentLinks = form.getValues('links') || [];
      await form.setValue('links', [...currentLinks, { type: 'Other', url: '' }], { shouldValidate: true });
    } finally {
      setIsAddingLink(false);
    }
  };

  const removeLink = (index: number) => {
    const currentLinks = form.getValues('links') || [];
    form.setValue('links', currentLinks.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                className={cn("flex items-center", s < 7 && "flex-1")}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300",
                    s <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-200 dark:bg-gray-700"
                  )}
                >
                  {s}
                </div>
                {s < 7 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2 transition-colors duration-300",
                      s < step ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Basic Info</span>
            <span>Details</span>
            <span>Other Details</span>
            <span>Custom Fields</span>
            <span>Media</span>
            <span>Links</span>
            <span>Review</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Basic Information */}
                {step === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Title <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter opening title"
                                {...field}
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
                            <FormLabel>
                              Short Description{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief description of the opening"
                                className="h-24"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Category <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Detailed Information */}
                {step === 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="long_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Long Description{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Detailed description of the opening"
                                className="h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="eligibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Eligibility{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Required qualifications and skills"
                                className="h-24"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Contact Information{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="How to contact for this opening"
                                className="h-24"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Other Details */}
                {step === 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Other Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="e.g., 2 weeks, 3 months"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter the duration in a human-readable format
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="skills_required"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills Required</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="skills you're looking for..."
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter in , separated fommat, for eg: python,
                              frontend, angular etc..
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="start_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="end_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="max_people"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum People</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="Enter maximum number of people"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Step 4: Custom Fields */}
                {step === 4 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Custom Fields</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">
                            Custom Fields
                          </h3>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addCustomField}
                            disabled={
                              form.getValues("custom_fields").length >= 5 ||
                              isAddingField
                            }
                            className="transition-all duration-200 hover:scale-105"
                          >
                            {isAddingField ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4 mr-2" />
                            )}
                            Add Field
                          </Button>
                        </div>
                        <AnimatePresence>
                          {form.getValues("custom_fields").map((_, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-4 mb-4 p-4 border rounded-lg"
                            >
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">
                                  Field {index + 1}
                                </h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCustomField(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <FormField
                                control={form.control}
                                name={`custom_fields.${index}.heading`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Heading{" "}
                                      <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input {...field} maxLength={200} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`custom_fields.${index}.subheading`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Subheading</FormLabel>
                                    <FormControl>
                                      <Input {...field} maxLength={300} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`custom_fields.${index}.content`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Content{" "}
                                      <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 5: Media Upload */}
                {step === 5 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Media Upload</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Media</h3>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addMedia}
                            disabled={isAddingMedia}
                            className="transition-all duration-200 hover:scale-105"
                          >
                            {isAddingMedia ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4 mr-2" />
                            )}
                            Add Media
                          </Button>
                        </div>
                        <AnimatePresence>
                          {form.getValues("media")?.map((_, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-4 mb-4 p-4 border rounded-lg"
                            >
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">
                                  Media {index + 1}
                                </h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMedia(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <FormField
                                control={form.control}
                                name={`media.${index}.type`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Media Type</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select media type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="image">
                                          Image
                                        </SelectItem>
                                        <SelectItem value="video">
                                          Video
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`media.${index}.url`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Media URL</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="Enter media URL"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 6: Important Links */}
                {step === 6 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Important Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Links</h3>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addLink}
                            disabled={isAddingLink}
                            className="transition-all duration-200 hover:scale-105"
                          >
                            {isAddingLink ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <LinkIcon className="h-4 w-4 mr-2" />
                            )}
                            Add Link
                          </Button>
                        </div>
                        <AnimatePresence>
                          {form.getValues("links")?.map((_, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-4 mb-4 p-4 border rounded-lg"
                            >
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">
                                  Link {index + 1}
                                </h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeLink(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <FormField
                                control={form.control}
                                name={`links.${index}.type`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Link Type</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select link type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="GitHub">
                                          GitHub
                                        </SelectItem>
                                        <SelectItem value="LinkedIn">
                                          LinkedIn
                                        </SelectItem>
                                        <SelectItem value="Website">
                                          Website
                                        </SelectItem>
                                        <SelectItem value="Registration">
                                          Registration
                                        </SelectItem>
                                        <SelectItem value="Other">
                                          Other
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`links.${index}.url`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>URL</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="Enter URL"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 7: Review */}
                {step === 7 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Review Your Opening</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Basic Info */}
                      <div>
                        <h3 className="font-semibold mb-4">
                          Basic Information
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">Title:</span>
                            <p>{form.getValues("title")}</p>
                          </div>
                          <div>
                            <span className="font-medium">Category:</span>
                            <Badge>{form.getValues("category")}</Badge>
                          </div>
                          <div>
                            <span className="font-medium">
                              Short Description:
                            </span>
                            <p>{form.getValues("short_description")}</p>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div>
                        <h3 className="font-semibold mb-4">Details</h3>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">
                              Long Description:
                            </span>
                            <p>{form.getValues("long_description")}</p>
                          </div>
                          <div>
                            <span className="font-medium">Eligibility:</span>
                            <p>{form.getValues("eligibility")}</p>
                          </div>
                          <div>
                            <span className="font-medium">
                              Contact Information:
                            </span>
                            <p>{form.getValues("contact")}</p>
                          </div>
                        </div>
                      </div>

                      {/* Other Details */}
                      <div>
                        <h3 className="font-semibold mb-4">Other Details</h3>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">Duration:</span>
                            <p>
                              {form.getValues("duration") || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Skils Required:</span>
                            <p>
                              {form.getValues("skills_required") || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Start Time:</span>
                            <p>
                              {form.getValues("start_time") || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">End Time:</span>
                            <p>
                              {form.getValues("end_time") || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Maximum People:</span>
                            <p>
                              {form.getValues("max_people") || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Custom Fields */}
                      {form.getValues("custom_fields").length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-4">Custom Fields</h3>
                          {form
                            .getValues("custom_fields")
                            .map((field, index) => (
                              <div key={index} className="mb-4">
                                <h4 className="font-medium">{field.heading}</h4>
                                {field.subheading && (
                                  <p className="text-sm text-gray-500">
                                    {field.subheading}
                                  </p>
                                )}
                                <p>{field.content}</p>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Media */}
                      {form.getValues("media")?.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-4">Media</h3>
                          {form.getValues("media")?.map((media, index) => (
                            <div key={index} className="mb-2">
                              <Badge variant="outline" className="mr-2">
                                {media.type}
                              </Badge>
                              <a
                                href={media.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {media.url}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Links */}
                      {form.getValues("links")?.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-4">
                            Important Links
                          </h3>
                          {form.getValues("links")?.map((link, index) => (
                            <div key={index} className="mb-2">
                              <Badge variant="outline" className="mr-2">
                                {link.type}
                              </Badge>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {link.url}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleStepChange(step - 1)}
                  disabled={isTransitioning}
                  className="transition-all duration-200 hover:scale-105"
                >
                  Previous
                </Button>
              )}
              {step < 7 ? (
                <Button
                  type="button"
                  onClick={() => handleStepChange(step + 1)}
                  className="ml-auto transition-all duration-200 hover:scale-105"
                  disabled={isTransitioning}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="ml-auto transition-all duration-200 hover:scale-105"
                  disabled={loading || isTransitioning}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Opening
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateTemporaryOpening; 