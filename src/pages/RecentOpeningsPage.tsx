import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ArrowLeft, 
  Calendar,
  Filter,
  Clock,
  X
} from "lucide-react";
import OpeningCard from '@/components/openings/OpeningCard';
import { Opening } from '@/types/openingTypes';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  "Internship", "Project", "Research", "Competition", "Workshop",
  "Hackathon", "Conference", "Job", "Volunteer", "Other"
];

const timeFilters = [
  { label: "Today", value: "today" },
  { label: "Last 2 Days", value: "2days" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" }
];

const RecentOpeningsPage = () => {
  const navigate = useNavigate();
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('all');
  const [filteredOpenings, setFilteredOpenings] = useState<Opening[]>([]);

  useEffect(() => {
    const fetchOpenings = async () => {
      try {
        setLoading(true);
        
        // Fetch openings with their records
        const { data: openingsData, error: openingsError } = await supabase
          .from('openings')
          .select(`
            *,
            opening_records (
              skills_required,
              start_time,
              duration,
              max_people
            ),
            profiles:created_by (
              username,
              full_name
            )
          `)
          .order('created_at', { ascending: false });

        if (openingsError) throw openingsError;

        // Format the data
        const formattedOpenings = openingsData?.map(opening => ({
          ...opening,
          skills_required: opening.opening_records?.skills_required?.split(',') || [],
          start_time: opening.opening_records?.start_time || null,
          duration: opening.opening_records?.duration || null,
          max_people: opening.opening_records?.max_people || null,
          creator: opening.profiles
        })) || [];

        setOpenings(formattedOpenings);
        setFilteredOpenings(formattedOpenings);
      } catch (error) {
        console.error('Error fetching openings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpenings();
  }, []);

  useEffect(() => {
    let filtered = [...openings];
    
    // Apply time filter
    if (selectedTimeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (selectedTimeFilter) {
        case 'today':
          filterDate.setDate(now.getDate() - 1);
          break;
        case '2days':
          filterDate.setDate(now.getDate() - 2);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(opening => 
        new Date(opening.created_at) > filterDate
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(opening => 
        opening.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(opening => 
        opening.title.toLowerCase().includes(query) ||
        opening.short_description.toLowerCase().includes(query) ||
        opening.skills_required.some(skill => 
          skill.toLowerCase().includes(query)
        )
      );
    }
    
    setFilteredOpenings(filtered);
  }, [searchQuery, selectedCategory, selectedTimeFilter, openings]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedTimeFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/homepage')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Homepage
          </Button>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Recent Openings</h1>
                <p className="text-gray-600 mt-1">
                  Discover temporary projects, collaborations, and opportunities
                </p>
              </div>

              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title, skills, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>
              
              <div className="flex flex-wrap gap-4 flex-1">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedTimeFilter}
                  onValueChange={setSelectedTimeFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Time filter" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeFilters.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(selectedCategory || selectedTimeFilter !== 'all' || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Openings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-20" />
                    <div className="h-6 bg-gray-200 rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOpenings.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            <AnimatePresence>
              {filteredOpenings.map((opening) => (
                <motion.div
                  key={opening.opening_id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <OpeningCard opening={opening} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No openings found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentOpeningsPage;