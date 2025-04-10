
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Profile } from "@/types/profileTypes";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Briefcase,
  Calendar,
  Droplet,
  FileText,
  GraduationCap,
  Heart,
  Link2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ProfileCardProps {
  profile: Profile | null;
  optionalData: any;
  preferences: string[];
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  optionalData,
  preferences,
}) => {
  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Required Fields Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Required Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p>{profile.full_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Roll Number</p>
              <p>{profile.roll_number}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Branch</p>
              <p>{profile.branch}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Year of Study</p>
              <p>{profile.year_of_study}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
              <div className="flex items-center">
                <Droplet className="h-4 w-4 mr-1 text-red-500" />
                <span>{profile.blood_group}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Username</p>
              <p>@{profile.username}</p>
            </div>
          </div>
          
          {preferences.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {preferences.map((pref) => (
                    <Badge key={pref} variant="secondary" className="capitalize">
                      {pref}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Optional Fields Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Optional Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {optionalData?.bio && (
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-1">About Me</p>
              <p className="whitespace-pre-wrap">{optionalData.bio}</p>
            </div>
          )}

          {(!optionalData?.bio && !optionalData?.contact_info && 
            !optionalData?.social_media_links && !optionalData?.skills && 
            !optionalData?.projects && !optionalData?.volunteering_exp) && (
            <p className="text-muted-foreground italic">
              No optional information provided yet. Click 'Edit Profile' to add more details.
            </p>
          )}

          {(optionalData?.contact_info || optionalData?.social_media_links) && (
            <>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {optionalData?.contact_info && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Contact</p>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-primary" />
                      <span>{optionalData.contact_info}</span>
                    </div>
                  </div>
                )}

                {optionalData?.social_media_links && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Social Media
                    </p>
                    <div className="flex items-center">
                      <Link2 className="h-4 w-4 mr-2 text-primary" />
                      <span>{optionalData.social_media_links}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {optionalData?.skills && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {optionalData.skills.split(",").map((skill: string) => (
                    <Badge key={skill.trim()} variant="outline" className="capitalize">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {(optionalData?.projects || optionalData?.volunteering_exp) && (
            <>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {optionalData?.projects && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Projects
                    </p>
                    <div className="flex">
                      <Briefcase className="h-4 w-4 mr-2 text-primary flex-shrink-0 mt-1" />
                      <span className="whitespace-pre-wrap">{optionalData.projects}</span>
                    </div>
                  </div>
                )}

                {optionalData?.volunteering_exp && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Volunteering
                    </p>
                    <div className="flex">
                      <Heart className="h-4 w-4 mr-2 text-primary flex-shrink-0 mt-1" />
                      <span className="whitespace-pre-wrap">
                        {optionalData.volunteering_exp}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCard;
