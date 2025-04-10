import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProjectMembersPopup from './ProjectMembersPopup';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: {
    opening_id: string;
    title: string;
    short_description: string;
    category: string;
    memberCount: number;
    role: 'Owner' | 'Member';
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMembersPopupOpen, setIsMembersPopupOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  useEffect(() => {
    console.log('✅ ProjectCard mounted with project:', project);
  }, [project]);

  const fetchMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const { data: openingData, error: openingError } = await supabase
        .from('openings')
        .select('created_by')
        .eq('opening_id', project.opening_id)
        .single();

      if (openingError) throw openingError;

      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('full_name, username, year_of_study, branch')
        .eq('id', openingData.created_by)
        .single();

      if (ownerError) throw ownerError;

      const { data: memberData, error: memberError } = await supabase
        .from('opening_members')
        .select(`
          user_id,
          profiles (
            full_name,
            username,
            year_of_study,
            branch
          )
        `)
        .eq('opening_id', project.opening_id);

      if (memberError) throw memberError;

      const formattedMembers = [
        { ...ownerData, isOwner: true },
        ...memberData.map(member => ({ ...member.profiles, isOwner: false })),
      ];

      setMembers(formattedMembers);
    } catch (error: any) {
      console.error('❌ Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to load project members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleViewDetails = () => {
    console.log('🔹 View Details clicked for project:', project.opening_id);
    navigate(`/project/${project.opening_id}`);
  };

  const handleViewMembers = async () => {
    console.log('🔹 View Members clicked for project:', project.opening_id);
    setIsLoadingMembers(true);
    await fetchMembers();
    setIsMembersPopupOpen(true);
    setIsLoadingMembers(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
        style={{ pointerEvents: "auto" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className="px-3 py-1">
            {project.category}
          </Badge>
          <Badge 
            variant={project.role === 'Owner' ? 'default' : 'outline'} 
            className="px-3 py-1"
          >
            {project.role}
          </Badge>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-semibold line-clamp-1">{project.title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-3">{project.short_description}</p>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-4">
          <Users className="h-4 w-4" />
          <span>{project.memberCount} {project.memberCount === 1 ? 'member' : 'members'}</span>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={handleViewDetails}
            className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white rounded-md px-4 py-2 text-center"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={handleViewMembers}
            className="flex-1 border rounded-md px-4 py-2 hover:bg-gray-50 text-center"
          >
            View Members
          </button>
        </div>
      </motion.div>

      <ProjectMembersPopup
        isOpen={isMembersPopupOpen}
        onClose={() => setIsMembersPopupOpen(false)}
        members={members}
        projectTitle={project.title}
      />
    </>
  );
};

export default ProjectCard;