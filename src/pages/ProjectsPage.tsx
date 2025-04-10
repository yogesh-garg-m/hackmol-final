import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Project {
  opening_id: string;
  title: string;
  short_description: string;
  category: string;
  memberCount: number;
  role: "Owner" | "Member";
}

const ProjectsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Fetch owned projects
        const { data: ownedProjects, error: ownedError } = await supabase
          .from("openings")
          .select("opening_id, title, short_description, category")
          .eq("created_by", user?.id);

        if (ownedError) throw ownedError;

        // Fetch member projects
        const { data: memberProjects, error: memberError } = await supabase
          .from("opening_members")
          .select("opening_id, openings(title, short_description, category)")
          .eq("user_id", user?.id);

        if (memberError) throw memberError;

        // Combine projects (no member count for simplicity)
        const formattedOwnedProjects =
          ownedProjects?.map((project) => ({
            opening_id: project.opening_id,
            title: project.title,
            short_description: project.short_description,
            category: project.category,
            memberCount: 1, // Default value, no counting
            role: "Owner" as const,
          })) || [];

        const formattedMemberProjects =
          memberProjects?.map((project) => {
            const openings = project.openings as any;
            return {
              opening_id: project.opening_id,
              title: openings.title,
              short_description: openings.short_description,
              category: openings.category,
              memberCount: 1,
              role: "Member" as const,
            };
          }) || [];

        const allProjects = [...formattedOwnedProjects, ...formattedMemberProjects];
        const uniqueProjects = Array.from(
          new Map(allProjects.map((project) => [project.opening_id, project])).values()
        );

        setProjects(uniqueProjects);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load projects.",
          variant: "destructive",
        });
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user]);

  // Simple search filter
  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        backgroundColor: "#d3d3d3", // Dull light gray
        padding: "10px",
        fontFamily: "Times New Roman", // Unappealing font
      }}
    >
      <h1 style={{ fontSize: "20px", color: "black" }}>PROJECTS</h1>

      {/* Search Bar */}
      <Input
        placeholder="SEARCH"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          border: "2px solid black",
          padding: "5px",
          backgroundColor: "white",
          width: "200px",
          margin: "10px 0",
        }}
      />

      {/* Create Project Button */}
      <Button
        onClick={() => navigate("/create-project")}
        style={{
          backgroundColor: "purple", // Clashing color
          color: "white",
          padding: "5px 10px",
          border: "1px solid black",
          marginBottom: "10px",
        }}
      >
        NEW PROJECT
      </Button>

      {/* Projects List */}
      <div>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div
              key={project.opening_id}
              style={{
                border: "1px solid black",
                padding: "10px",
                marginBottom: "10px",
                backgroundColor: "#e0e0e0", // Slightly darker gray
              }}
            >
              <h2 style={{ fontSize: "16px", margin: "0 0 5px 0" }}>{project.title}</h2>
              <p style={{ fontSize: "14px", color: "#333" }}>{project.short_description}</p>
              <p style={{ fontSize: "12px" }}>Category: {project.category}</p>
              <p style={{ fontSize: "12px" }}>Role: {project.role}</p>
              <Button
                onClick={() => navigate(`/project/${project.opening_id}`)}
                style={{
                  backgroundColor: "green", // Another clashing color
                  color: "white",
                  padding: "5px 10px",
                  marginTop: "5px",
                  border: "1px solid black",
                }}
              >
                SEE MORE
              </Button>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", color: "red", fontSize: "16px" }}>
            NO PROJECTS HERE
          </div>
        )}
      </div>

      {/* Back Button */}
      <Button
        onClick={() => navigate(-1)}
        style={{
          backgroundColor: "orange", // Garish color
          color: "black",
          padding: "5px 10px",
          marginTop: "10px",
          border: "1px solid black",
        }}
      >
        GO BACK
      </Button>
    </div>
  );
};

export default ProjectsPage;