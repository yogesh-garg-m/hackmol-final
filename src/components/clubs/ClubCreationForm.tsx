import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase, SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/client";

const formSchema = z.object({
  club_name: z.string().min(3, {
    message: "Club name must be at least 3 characters.",
  }).max(100, {
    message: "Club name must be at most 100 characters."
  }),
  description: z.string().optional(),
  category: z.enum(["Academic", "Cultural", "Technical", "Sports", "Service"]),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const ClubCreationForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [clubCode, setClubCode] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      club_name: "",
      description: "",
      category: "Academic",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("User is not authenticated");
      }

      // Check if club name is unique
      const { data: existingClub, error: nameCheckError } = await supabase
        .from("clubs")
        .select("club_id")
        .eq("name", values.club_name)
        .single();

      if (nameCheckError && nameCheckError.code !== "PGRST116") {
        throw new Error("Error checking club name: " + nameCheckError.message);
      }

      if (existingClub) {
        form.setError("club_name", {
          type: "manual",
          message: "Club name already exists. Please choose a different name."
        });
        setIsLoading(false);
        return;
      }

      // Insert club data
      const { data: clubData, error: clubError } = await supabase
        .from("clubs")
        .insert({
          name: values.club_name,
          description: values.description || null,
          admin_id: user.id,
          category: values.category,
        })
        .select()
        .single();

      if (clubError) {
        throw new Error("Error creating club: " + clubError.message);
      }

      // Generate a unique club code using the new database function
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/generate_unique_club_code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
          'Prefer': 'return=representation'
        }
      });
      
      if (!response.ok) {
        throw new Error("Error generating club code: " + await response.text());
      }
      
      const generatedCode = await response.json();

      // Insert club auth data using the newly created table
      const authResponse = await fetch(`${SUPABASE_URL}/rest/v1/club_auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          club_id: clubData.club_id,
          club_code: generatedCode,
          password: values.password,
          status: 'Approved'
        })
      });
      
      if (!authResponse.ok) {
        const errorJson = await authResponse.json();
        throw new Error(errorJson.message || 'Error creating club authentication');
      }

      setClubCode(generatedCode);
      
      toast({
        title: "Club Created Successfully",
        description: `Your club '${values.club_name}' has been created!`,
      });
      
    } catch (error) {
      console.error("Error creating club:", error);
      toast({
        title: "Error Creating Club",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-1 bg-primary/5 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">Create New Club</CardTitle>
          <CardDescription className="text-center">
            Fill out the form below to create your campus organization
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="club_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Club Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter club name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be the official name of your club.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your club's purpose and activities" 
                        {...field} 
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormDescription>
                      A brief overview of your club's mission and activities.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Cultural">Cultural</SelectItem>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The primary focus area of your club.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Club Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Set a secure password" {...field} />
                    </FormControl>
                    <FormDescription>
                      This password will be used by club admins to login to the dashboard.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {clubCode && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="font-semibold text-green-800 mb-2">Club Created Successfully!</h3>
                  <p className="text-green-700 mb-2">Your unique club code is:</p>
                  <div className="bg-white p-3 rounded border border-green-300 text-center">
                    <span className="text-xl font-mono font-bold tracking-wider">{clubCode}</span>
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    Save this code! You'll need it to login to your club dashboard.
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Club"}
                </Button>
                {!clubCode && (
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => navigate('/homepage')}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                )}
                {clubCode && (
                  <Button
                    type="button"
                    onClick={() => navigate('/club/login')}
                    className="w-full"
                  >
                    Go to Club Login
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between bg-muted/50 rounded-b-lg">
          <p className="text-xs text-muted-foreground">
            By creating a club, you agree to follow all campus guidelines for student organizations.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ClubCreationForm;
