import React from "react";
import { OpeningRecord } from "@/types/project";
import { Calendar, Clock, Users } from "lucide-react";

interface ProjectTimelineProps {
  records?: OpeningRecord;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ records }) => {
  console.log("ProjectTimeline received records:", records);
  
  if (!records) {
    console.log("No records provided to ProjectTimeline");
    return null;
  }
  
  const { duration, start_time, end_time, max_people, skills_required } = records;
  
  // If no relevant data, don't show the component
  if (!duration && !start_time && !end_time && !max_people && !skills_required) {
    console.log("No relevant data in records");
    return null;
  }
  
  // Format dates if they exist
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Split skills into array
  const skills = skills_required?.split(',').map(skill => skill.trim()) || [];
  console.log("Formatted skills:", skills);

  return (
    <div className="glass-panel p-5 space-y-4 animate-slide-up">
      <h3 className="text-lg font-semibold">Project Timeline</h3>
      
      <div className="space-y-3">
        {duration && (
          <div className="flex items-start gap-3">
            <Clock size={18} className="text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Duration</p>
              <p className="text-sm text-muted-foreground">{duration}</p>
            </div>
          </div>
        )}
        
        {(start_time || end_time) && (
          <div className="flex items-start gap-3">
            <Calendar size={18} className="text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Timeline</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(start_time)} 
                {start_time && end_time && " - "} 
                {formatDate(end_time)}
              </p>
            </div>
          </div>
        )}
        
        {max_people && (
          <div className="flex items-start gap-3">
            <Users size={18} className="text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Team Size</p>
              <p className="text-sm text-muted-foreground">
                Maximum {max_people} participants
              </p>
            </div>
          </div>
        )}
      </div>
      
      {skills.length > 0 && (
        <div className="pt-3 border-t">
          <p className="text-sm font-medium mb-2">Required Skills</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <div 
                key={index}
                className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium transition-colors hover:bg-secondary/80"
              >
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTimeline;