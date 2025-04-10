import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProjectDetails from "@/components/ProjectDetails";
import { supabase } from "@/integrations/supabase/client";
import { ProjectData } from "@/types/project";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Project = () => {
  const { opening_id } = useParams<{ opening_id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinStatus, setJoinStatus] = useState<'Owner' | 'Already Joined' | 'Active' | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (!opening_id) {
          throw new Error("Project ID is required");
        }

        setLoading(true);
        console.log("Fetching opening with ID:", opening_id);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Fetch project details with all related data in a single query
        const { data: opening, error: openingError } = await supabase
          .from("openings")
          .select(`
            *,
            profiles:created_by (
              id,
              full_name,
              username,
              branch,
              year_of_study,
              profile_optional (
                profile_picture_url
              )
            ),
            opening_records (
              duration,
              start_time,
              end_time,
              max_people,
              skills_required
            ),
            opening_optional_details (
              heading,
              subheading,
              content
            ),
            opening_media (
              media_type,
              media_url
            ),
            opening_links (
              link_type,
              url
            )
          `)
          .eq("opening_id", opening_id)
          .single();

        console.log("Opening fetch result:", { opening, openingError });

        if (openingError) {
          console.error("Opening fetch error:", openingError);
          throw openingError;
        }
        if (!opening) {
          console.log("No opening found for ID:", opening_id);
          throw new Error("Project not found");
        }

        // Check if user is the owner
        if (opening.created_by === user.id) {
          setJoinStatus('Owner');
        } else {
          // Check if user has already joined
          const { data: existingMember } = await supabase
            .from('opening_members')
            .select('*')
            .eq('opening_id', opening_id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (existingMember) {
            setJoinStatus('Already Joined');
          } else {
            setJoinStatus('Active');
          }
        }

        // Format the data
        const formattedProjectData: ProjectData = {
          opening: {
            opening_id: opening.opening_id,
            created_by: opening.created_by,
            title: opening.title,
            short_description: opening.short_description,
            category: opening.category,
            long_description: opening.long_description,
            eligibility: opening.eligibility,
            contact: opening.contact,
            creator: {
              id: opening.profiles.id,
              full_name: opening.profiles.full_name,
              username: opening.profiles.username,
              branch: opening.profiles.branch,
              year_of_study: opening.profiles.year_of_study,
              profile_optional: opening.profiles.profile_optional
            }
          },
          records: opening.opening_records || undefined,
          optionalDetails: opening.opening_optional_details || undefined,
          media: opening.opening_media || undefined,
          links: opening.opening_links || undefined,
          participantStatus: joinStatus === 'Already Joined' ? 'Accepted' : null
        };

        console.log("Formatted project data:", formattedProjectData);
        setProjectData(formattedProjectData);
      } catch (err: any) {
        console.error("Error fetching project data:", err);
        setError(err.message || "Failed to load project data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [opening_id]);

  const handleJoinProject = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Insert into opening_members table without status field
      const { error: joinError } = await supabase
        .from('opening_members')
        .insert({
          opening_id: opening_id,
          user_id: user.id
        });

      if (joinError) {
        throw joinError;
      }

      setJoinStatus('Already Joined');
      toast({
        title: "Successfully joined project",
        description: "You have joined this project successfully.",
      });
    } catch (error: any) {
      console.error("Error joining project:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to join project. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent mx-auto animate-spin"></div>
          <p className="text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md p-6 text-center space-y-4">
          <h2 className="text-2xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md p-6 text-center space-y-4">
          <h2 className="text-2xl font-semibold">Project not found</h2>
          <p className="text-muted-foreground">
            The project you are looking for doesn't exist or has been removed.
          </p>
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ProjectDetails 
        projectData={projectData} 
        joinStatus={joinStatus}
        onJoin={handleJoinProject}
      />
    </div>
  );
};

export default Project;
