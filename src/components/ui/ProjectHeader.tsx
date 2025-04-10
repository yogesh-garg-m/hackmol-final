import React from "react";
import { Profile } from "@/types/project";
import { CalendarIcon } from "lucide-react";

interface ProjectHeaderProps {
  creator: Profile;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ creator }) => {
    const { full_name, username, branch, year_of_study, profile_optional } = creator;
    const profilePicture = profile_optional?.profile_picture_url;
    

  // Extract initials (First two letters from name)
  const initials = full_name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-slide-up">
      {/* Profile Picture / Initials */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-lg flex items-center justify-center text-lg font-semibold uppercase text-white bg-primary">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={full_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span>{initials}</span> // Show initials if no image
          )}
        </div>
      </div>

      {/* User Information */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          {full_name}
        </h2>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon size={14} />
          <span>
            {branch}, Year {year_of_study}
          </span>
        </div>

        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
          @{username}
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
