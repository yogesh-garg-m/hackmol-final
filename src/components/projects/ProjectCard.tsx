import React from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ProjectCardProps {
  project: {
    opening_id: string;
    title: string;
    short_description: string;
    category: string;
    memberCount: number;
    role: "Owner" | "Member";
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewDetails = () => {
    navigate(`/project/${project.opening_id}`);
  };

  return (
    <div
      style={{
        border: "2px solid black",
        padding: "10px",
        margin: "5px",
        backgroundColor: "#e0e0e0", // Dull gray
        fontFamily: "Times New Roman", // Unappealing font
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "14px", backgroundColor: "yellow", padding: "2px 5px" }}>
          {project.category}
        </span>
        <span
          style={{
            fontSize: "14px",
            backgroundColor: project.role === "Owner" ? "green" : "gray",
            color: "white",
            padding: "2px 5px",
          }}
        >
          {project.role}
        </span>
      </div>

      <h3 style={{ fontSize: "16px", margin: "5px 0" }}>{project.title}</h3>
      <p style={{ fontSize: "14px", color: "#333" }}>{project.short_description}</p>

      <p style={{ fontSize: "12px", margin: "5px 0" }}>
        Members: {project.memberCount}
      </p>

      <button
        onClick={handleViewDetails}
        style={{
          backgroundColor: "red", // Garish color
          color: "white",
          padding: "5px 10px",
          border: "1px solid black",
          cursor: "pointer",
          width: "100%",
        }}
      >
        SEE DETAILS
      </button>
    </div>
  );
};

export default ProjectCard;