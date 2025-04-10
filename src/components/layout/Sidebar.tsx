import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useHomepage } from '@/contexts/HomepageContext';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MenuItemLink from "@/components/homepage/MenuItemLink";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
}

const categories: Category[] = [
  { id: "web", name: "Web Development", icon: "🌐" },
  { id: "mobile", name: "Mobile Development", icon: "📱" },
  { id: "ai", name: "AI/ML", icon: "🤖" },
  { id: "design", name: "UI/UX Design", icon: "🎨" },
  { id: "data", name: "Data Science", icon: "📊" },
  { id: "cloud", name: "Cloud Computing", icon: "☁️" },
  { id: "security", name: "Cybersecurity", icon: "🔒" },
  { id: "blockchain", name: "Blockchain", icon: "⛓️" },
  { id: "iot", name: "IoT", icon: "🔌" },
  { id: "game", name: "Game Development", icon: "🎮" }
];

const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { selectedCategories, setSelectedCategories } = useHomepage();
  const navigate = useNavigate();
  const location = useLocation();

  const userProfile = user?.user_metadata || {};

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsExpanded(false);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(
      selectedCategories.includes(categoryId)
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId]
    );
  };

  const toggleAllCategories = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(cat => cat.id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r transition-all duration-300 ease-in-out z-40",
        isExpanded ? "w-64" : "w-16"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        {/* Profile Section */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userProfile.avatar_url} />
              <AvatarFallback>
                {userProfile.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {userProfile.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userProfile.branch || 'Branch'} • Year {userProfile.year || 'N/A'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <Button
              variant={location.pathname === "/homepage" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                !isExpanded && "justify-center"
              )}
              onClick={() => handleNavigation("/homepage")}
            >
              <span className="mr-2">🏠</span>
              {isExpanded && "Home"}
            </Button>
            <Button
              variant={location.pathname === "/people" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                !isExpanded && "justify-center"
              )}
              onClick={() => handleNavigation("/people")}
            >
              <span className="mr-2">👥</span>
              {isExpanded && "People"}
            </Button>
            <Button
              variant={location.pathname === "/events-registered" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                !isExpanded && "justify-center"
              )}
              onClick={() => handleNavigation("/events-registered")}
            >
              <span className="mr-2">📅</span>
              {isExpanded && "Events"}
            </Button>
            <Button
              variant={location.pathname === "/collaborations" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                !isExpanded && "justify-center"
              )}
              onClick={() => handleNavigation("/collaborations")}
            >
              <span className="mr-2">🤝</span>
              {isExpanded && "Projects"}
            </Button>
            <Button
              variant={location.pathname === "/resources" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                !isExpanded && "justify-center"
              )}
              onClick={() => handleNavigation("/resources")}
            >
              <span className="mr-2">📚</span>
              {isExpanded && "Resources"}
            </Button>
          </div>

          {/* Categories Section */}
          {isExpanded && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-500">Categories</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllCategories}
                  className="text-xs"
                >
                  {selectedCategories.length === categories.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategories.includes(category.id) ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 