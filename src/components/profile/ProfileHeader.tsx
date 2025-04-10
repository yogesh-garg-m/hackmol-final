
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Save, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "@/types/profileTypes";

interface ProfileHeaderProps {
  profile: Profile | null;
  optionalData: any;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  completionPercentage: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  optionalData,
  isEditing,
  setIsEditing,
  completionPercentage,
}) => {
  if (!profile) return null;

  const { full_name, roll_number, branch } = profile;
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-white p-6 rounded-lg shadow-sm">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-primary/20">
          {optionalData?.profile_picture_url ? (
            <AvatarImage src={optionalData.profile_picture_url} alt={full_name} />
          ) : (
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {getInitials(full_name)}
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold">{full_name}</h1>
            <p className="text-muted-foreground">
              {roll_number} • {branch}
            </p>
          </div>
          <div className="mt-2 md:mt-0">
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="mr-1 h-4 w-4" /> Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <Edit className="mr-1 h-4 w-4" /> Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Profile Completion: {completionPercentage}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2 mt-1" />
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
