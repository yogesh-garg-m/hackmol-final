import React from 'react';
import { cn } from '@/lib/utils';

interface EventTagProps {
  name: string;
  className?: string;
}

const colorMap: Record<string, string> = {
  workshop: 'bg-blue-100 text-blue-800 border-blue-200',
  conference: 'bg-purple-100 text-purple-800 border-purple-200',
  seminar: 'bg-amber-100 text-amber-800 border-amber-200',
  hackathon: 'bg-green-100 text-green-800 border-green-200',
  social: 'bg-pink-100 text-pink-800 border-pink-200',
  competition: 'bg-orange-100 text-orange-800 border-orange-200',
  tech: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  career: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  culture: 'bg-rose-100 text-rose-800 border-rose-200',
  sports: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  arts: 'bg-violet-100 text-violet-800 border-violet-200',
  webinar: 'bg-sky-100 text-sky-800 border-sky-200',
};

const EventTag: React.FC<EventTagProps> = ({ name, className }) => {
  // Generate a consistent color for tags that aren't in the colorMap
  const getTagColor = (tagName: string) => {
    if (colorMap[tagName.toLowerCase()]) {
      return colorMap[tagName.toLowerCase()];
    }
    
    // Create a simple hash from the tag name to pick a color
    const hash = tagName.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    const colors = Object.values(colorMap);
    return colors[hash % colors.length];
  };

  return (
    <span className={cn(
      'tag-item border',
      getTagColor(name),
      className
    )}>
      {name}
    </span>
  );
};

export default EventTag;
