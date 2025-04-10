import React from 'react';
import { motion } from 'framer-motion';
import { Opening } from '@/types/openingTypes';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  Clock,
  Users,
  ArrowRight,
  Tag,
  User,
  Mail,
  Timer,
  Sparkles
} from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from "react-router-dom"; // Import useNavigate



interface OpeningCardProps {
  opening: Opening;
}

const OpeningCard = ({ opening }: OpeningCardProps) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const navigate = useNavigate(); 
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'internship':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'project':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'research':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'competition':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'workshop':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hackathon':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'conference':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'job':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'volunteer':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <motion.div
      className="relative overflow-hidden"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md rounded-xl" />
      
      {/* Card Content */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Category Badge */}
        <div className="absolute top-4 right-4 z-10">
          <Badge 
            className={`${getCategoryColor(opening.category)} font-medium px-2.5 py-1`}
          >
            {opening.category}
          </Badge>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Header */}
          <div className="mb-4">
            <motion.h3 
              className="text-xl font-semibold mb-2 pr-24"
              initial={{ y: 0 }}
              animate={{ y: isHovered ? -2 : 0 }}
            >
              {opening.title}
            </motion.h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Posted by {opening.creator?.username}</span>
              <span className="text-gray-400">•</span>
              <time dateTime={opening.created_at}>
                {formatDistanceToNow(new Date(opening.created_at), { addSuffix: true })}
              </time>
            </div>
          </div>

          {/* Description */}
          <motion.p 
            className="text-gray-600 mb-4 line-clamp-2"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: isHovered ? 1 : 0.8 }}
          >
            {opening.short_description}
          </motion.p>

          {/* Skills */}
          {opening.skills_required && opening.skills_required.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                <Tag className="h-4 w-4" />
                <span>Required Skills</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {opening.skills_required.slice(0, 3).map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 1 }}
                    animate={{ scale: isHovered ? 1.05 : 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Badge 
                      variant="outline" 
                      className="bg-white/50 backdrop-blur-sm"
                    >
                      {skill.trim()}
                    </Badge>
                  </motion.div>
                ))}
                {opening.skills_required.length > 3 && (
                  <Badge variant="outline" className="bg-white/50">
                    +{opening.skills_required.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Meta Information */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {opening.start_time && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{format(new Date(opening.start_time), 'MMM d, yyyy')}</span>
              </div>
            )}
            {opening.duration && (
              <div className="flex items-center gap-2 text-sm">
                <Timer className="h-4 w-4 text-primary" />
                <span>{opening.duration}</span>
              </div>
            )}
            {opening.max_people && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span>{opening.max_people} people needed</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary group"
              onClick={() => navigate(`/project/${opening.opening_id}`)}
            >
              <span>View Details</span>
              <motion.div
                animate={{ x: isHovered ? 4 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <ArrowRight className="h-4 w-4 ml-2" />
              </motion.div>
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="relative overflow-hidden"
            >
              <Mail className="h-4 w-4" />
              <motion.div
                className="absolute inset-0 bg-primary/10"
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            </Button>
          </div>
        </div>

        {/* Animated Border */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <div className="absolute inset-0 border-2 border-primary/20 rounded-xl" />
          <Sparkles className="absolute top-2 right-2 h-4 w-4 text-primary/40" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OpeningCard;