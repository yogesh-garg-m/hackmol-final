import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/pages/PeoplePage";
import {
  GraduationCap,
  BookOpen,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConnections, ConnectionStatus } from "@/hooks/useConnections";
import { useToast } from "@/components/ui/use-toast";

interface UserCardProps {
  user: UserProfile;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [showSkills, setShowSkills] = useState(false);
  const {
    getConnectionStatus,
    sendConnectionRequest,
    acceptConnection,
    rejectConnection,
  } = useConnections();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const connectionStatus = getConnectionStatus(user.id);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getSkillColor = (skill: string) => {
    const techSkills = [
      "javascript",
      "python",
      "java",
      "react",
      "node",
      "typescript",
      "html",
      "css",
    ];
    const designSkills = [
      "ui",
      "ux",
      "figma",
      "adobe",
      "design",
      "photoshop",
      "illustrator",
    ];
    const softSkills = [
      "leadership",
      "communication",
      "teamwork",
      "problem solving",
      "management",
    ];

    const skillLower = skill.toLowerCase();
    if (techSkills.some((tech) => skillLower.includes(tech))) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
    if (designSkills.some((design) => skillLower.includes(design))) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    if (softSkills.some((soft) => skillLower.includes(soft))) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
  };

  const skills = user.optional?.skills 
    ? user.optional.skills.split(",").map(s => s.trim()).filter(s => s.length > 0)
    : [];
  const displayedSkills = skills.slice(0, 3);
  const hasMoreSkills = skills.length > 3;

  const handleConnectionAction = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      if (connectionStatus === null) {
        await sendConnectionRequest(user.id);
        toast({
          title: "Connection request sent",
          description: `A connection request has been sent to ${user.full_name}`,
        });
      } else if (connectionStatus === "pending") {
        // Handle accept/reject based on who sent the request
        // This will be handled in the Pending tab
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process connection request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderConnectionButton = () => {
    if (isLoading) {
      return (
        <Button variant="outline" disabled>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </Button>
      );
    }

    switch (connectionStatus) {
      case "pending":
        return (
          <Button variant="outline" disabled>
            Pending
          </Button>
        );
      case "accepted":
        return null; // No button needed for connected users
      default:
        return <Button onClick={handleConnectionAction}>Connect</Button>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        <CardContent className="p-6 flex flex-col h-full">
          {/* Profile Section */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-sm" />
              <Avatar className="relative h-20 w-20 border-4 border-white dark:border-gray-800 shadow-lg">
                {user.optional?.profile_picture_url ? (
                  <AvatarImage
                    src={user.optional.profile_picture_url}
                    alt={user.full_name}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="text-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="text-xl font-bold dark:text-white truncate">
                      {user.full_name}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.full_name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                @{user.username}
              </p>
            </div>
          </div>

          {/* Department & Year Section */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <GraduationCap className="h-4 w-4" />
              <span>Year {user.year_of_study}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <BookOpen className="h-4 w-4" />
              <span>{user.branch}</span>
            </div>
          </div>

          {/* Skills Section */}
          {skills.length > 0 && (
            <div className="mb-4">
              {/* Header Section */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Skills
                </h3>
                {hasMoreSkills && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary hover:text-primary/80"
                    onClick={() => setShowSkills(true)}
                  >
                    View All
                  </Button>
                )}
              </div>

              {/* Skills Display */}
              <div className="flex flex-wrap gap-2">
                {displayedSkills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={getSkillColor(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
                {hasMoreSkills && (
                  <Badge variant="outline" className="text-gray-500">
                    +{skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons - Always at bottom */}
          <div className="mt-auto pt-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(`/profile/${user.username}`)}
            >
              View Profile
            </Button>
            {renderConnectionButton()}
          </div>
        </CardContent>
      </Card>

      {/* Skills Dialog */}
      <Dialog open={showSkills} onOpenChange={setShowSkills}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Skills</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 mt-4">
            {skills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className={getSkillColor(skill)}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

const styles = `
  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  .animate-scroll {
    animation: scroll 20s linear infinite;
  }

  .animate-scroll:hover {
    animation-play-state: paused;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default UserCard;
