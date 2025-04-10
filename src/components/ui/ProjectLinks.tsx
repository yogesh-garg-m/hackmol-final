import React from "react";
import { OpeningLink } from "@/types/project";
import { ExternalLink } from "lucide-react";

interface ProjectLinksProps {
  links?: OpeningLink[];
}

const ProjectLinks: React.FC<ProjectLinksProps> = ({ links }) => {
  if (!links || links.length === 0) return null;
  
  return (
    <div className="glass-panel p-5 space-y-4 animate-slide-up">
      <h3 className="text-lg font-semibold">Important Links</h3>
      
      <div className="space-y-3">
        {links.map((link, index) => (
          <a 
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-secondary/50 transition-colors duration-300 group"
          >
            <div className="font-medium text-sm">{link.link_type}</div>
            <ExternalLink 
              size={16} 
              className="text-muted-foreground group-hover:text-primary transition-colors duration-300" 
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export default ProjectLinks;