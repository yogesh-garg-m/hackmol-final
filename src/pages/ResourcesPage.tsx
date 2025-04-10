import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Book, FileText, Video, Link as LinkIcon, ArrowLeft, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/homepage/Sidebar";
import PostResourceDialog from "@/components/resources/PostResourceDialog";
import { cn } from "@/lib/utils";

interface Resource {
  id: string;
  title: string;
  category: "Study Material" | "News" | "Internship" | "Event" | "Other";
  description: string;
  posted_by_type: "admin" | "user";
  posted_by_user?: string;
  posted_by_name?: string;
  tags: string;
  processedTags?: string[];
  link: string;
  created_at: string;
}

const ResourcesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      // Fetch resources with user information
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (resourcesError) throw resourcesError;

      // Fetch user information for resources posted by users
      const userPostedResources = resourcesData.filter(r => r.posted_by_type === 'user');
      const userIds = [...new Set(userPostedResources.map(r => r.posted_by_user))];

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Map user information to resources and convert tags string to array
      const resourcesWithUserInfo = resourcesData.map(resource => {
        const processedResource = {
          ...resource,
          processedTags: resource.tags ? resource.tags.split(',').map(tag => tag.trim()) : []
        };

        if (resource.posted_by_type === 'user' && resource.posted_by_user) {
          const userProfile = profilesData.find(p => p.id === resource.posted_by_user);
          return {
            ...processedResource,
            posted_by_name: userProfile?.full_name
          };
        }
        return processedResource;
      });

      setResources(resourcesWithUserInfo);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Study Material':
        return 'bg-blue-100 text-blue-800';
      case 'News':
        return 'bg-green-100 text-green-800';
      case 'Internship':
        return 'bg-purple-100 text-purple-800';
      case 'Event':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handlePostSuccess = () => {
    fetchResources(); // Refresh the resources list
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        setIsSidebarExpanded={setIsSidebarExpanded}
        isMobileView={isMobileView}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold dark:text-white">Resources</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Access learning materials and study resources
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </Button>
                {["Study Material", "News", "Internship", "Event", "Other"].map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <div className="flex gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <Button onClick={() => setIsPostDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Resource
                </Button>
              </div>
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredResources.length > 0 ? (
              filteredResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col flex-1">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Book className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                            {resource.title}
                          </h3>
                          <Badge className={cn("mt-1", getCategoryColor(resource.category))}>
                            {resource.category}
                          </Badge>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-3 flex-1">
                        {resource.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {resource.processedTags && resource.processedTags.length > 0 ? (
                          resource.processedTags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            No tags
                          </Badge>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          {resource.posted_by_type === 'admin' ? (
                            <span className="text-purple-600 dark:text-purple-400">
                              Posted by Admin
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>
                                  {resource.posted_by_name?.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="line-clamp-1">{resource.posted_by_name}</span>
                            </div>
                          )}
                        </div>
                        <time className="text-xs">
                          {new Date(resource.created_at).toLocaleDateString()}
                        </time>
                      </div>

                      <div className="mt-4">
                        <Button
                          className="w-full group-hover:bg-primary/90 transition-colors"
                          onClick={() => window.open(resource.link, '_blank')}
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Get Resource
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  No resources found matching your criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Resource Dialog */}
      <PostResourceDialog
        isOpen={isPostDialogOpen}
        onClose={() => setIsPostDialogOpen(false)}
        onSuccess={handlePostSuccess}
      />
    </div>
  );
};

export default ResourcesPage; 