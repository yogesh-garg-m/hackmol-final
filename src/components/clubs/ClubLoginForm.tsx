import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ClubData {
  name: string;
  category: string;
  admin_id: string;
}

interface ClubAuthData {
  club_id: number;
  password: string;
  status: string;
  clubs: ClubData;
}

const formSchema = z.object({
  club_code: z.string().length(5, {
    message: "Club code must be exactly 5 characters",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const ClubLoginForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      club_code: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Clean up the club code by trimming whitespace and converting to uppercase
      const trimmedClubCode = values.club_code.trim().toUpperCase();
      
      console.log("Club login attempt with code:", trimmedClubCode);
      
      // First, let's debug by getting all club codes to see what's in the database
      const { data: allClubs, error: listError } = await supabase
        .from('club_auth')
        .select('club_code')
        .limit(10);
      
      console.log("Available club codes in database:", allClubs);
      
      if (listError) {
        console.error("Error listing club codes:", listError);
      }
      
      // Get club auth data using the club code
      const { data, error: authError } = await supabase
        .from('club_auth')
        .select(`
          club_id,
          password,
          status,
          clubs (
            name,
            category,
            admin_id
          )
        `)
        .eq('club_code', trimmedClubCode)
        .returns<ClubAuthData[]>();
      
      console.log("Auth response data:", JSON.stringify(data, null, 2));
      console.log("Auth response error:", authError);
      
      if (authError) {
        toast({
          title: "Error",
          description: "Failed to verify club credentials. Please try again.",
          variant: "destructive",
        });
        setError(`Database error: ${authError.message}`);
        console.error("Club auth query error:", authError);
        return;
      }
      
      // Check if any matching club was found
      if (!data || data.length === 0) {
        console.log("No club found with code:", trimmedClubCode);
        form.setError("club_code", {
          type: "manual",
          message: "Invalid club code. Please check and try again."
        });
        setError(`No club found with code: ${trimmedClubCode}. Please verify your club code is correct.`);
        return;
      }

      const authData = data[0]; // Use the first result

      // Check if the club is approved
      if (authData.status !== 'Approved') {
        form.setError("club_code", {
          type: "manual",
          message: `This club is currently ${authData.status?.toLowerCase() || 'not available'}. Please contact the administrator.`
        });
        setError(`Club status is ${authData.status}. Only approved clubs can sign in.`);
        return;
      }

      // Verify password
      if (authData.password !== values.password) {
        form.setError("password", {
          type: "manual",
          message: "Incorrect password. Please try again."
        });
        setError("Incorrect password.");
        return;
      }

      // Store club information in session storage
      if (!authData.clubs) {
        throw new Error("Club data not found");
      }

      sessionStorage.setItem('club_id', authData.club_id.toString());
      sessionStorage.setItem('club_name', authData.clubs.name);
      sessionStorage.setItem('club_category', authData.clubs.category);
      sessionStorage.setItem('club_admin_id', authData.clubs.admin_id);
      sessionStorage.setItem('club_logged_in', 'true');

      toast({
        title: "Login Successful",
        description: `Welcome to ${authData.clubs.name} dashboard!`,
      });

      // Navigate to the club dashboard
      navigate('/club/dashboard');
    } catch (error) {
      console.error("Club login error:", error);
      toast({
        title: "Login Failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
      setError("An unexpected error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-md">
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-1 bg-primary/5 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">Club Login</CardTitle>
          <CardDescription className="text-center">
            Access your club's management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="club_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Club Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter 5-digit club code" 
                        {...field} 
                        maxLength={5}
                        className="font-mono tracking-wider text-center uppercase"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground mt-1">
                      Enter the 5-character club code (letters and numbers)
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter club password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => navigate('/homepage')}
                  className="w-full"
                >
                  Back to Homepage
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <Button 
            variant="link" 
            onClick={() => navigate('/club/create')}
            className="text-sm"
          >
            Don't have a club yet? Create one
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ClubLoginForm;
