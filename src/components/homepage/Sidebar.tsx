import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  BookOpen,
  Heart,
  Users,
  FileText,
  MessageSquare,
  LogOut,
  User,
  ChevronLeft,
  Menu,
  Search
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import MenuItemLink from "./MenuItemLink";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (value: boolean) => void;
  isMobileView: boolean;
  handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarExpanded,
  setIsSidebarExpanded,
  isMobileView,
  handleLogout,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const userProfile = user?.user_metadata || {};

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const sidebarVariants = {
    expanded: {
      width: "256px",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    collapsed: {
      width: "64px",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const navigationItems = [
    { icon: Calendar, label: "Events", to: "/events-registered", id: "events-registered" },
    { icon: BookOpen, label: "Resources", to: "/resources", id: "resources" },
    { icon: Heart, label: "Volunteering", to: "/volunteering", id: "volunteering" },
    { icon: Users, label: "Collaborations", to: "/collaborations", id: "collaborations" },
    { icon: FileText, label: "Personal Space", to: "/personal-space", id: "personal-space" },
    { icon: Search, label: "Lost & Found", to: "/lost-and-found", id: "lost-and-found" },
  ];

  const footerItems = [
    { 
      icon: MessageSquare, 
      label: "Contact Admin", 
      to: "/contact-admin",
      id: "contact-admin"
    },
    { 
      icon: LogOut, 
      label: "Sign Out", 
      onClick: handleLogout,
      className: "text-red-500 hover:text-red-600",
      id: "logout"
    },
  ];

  const isActiveRoute = (itemPath: string) => {
    return location.pathname === itemPath;
  };

  const handleMobileOutsideClick = () => {
    if (isMobileView && isSidebarExpanded) {
      setIsSidebarExpanded(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <>
      {isMobileView && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-40 bg-white rounded-md p-2 shadow-md"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      )}
      
      {isMobileView && isSidebarExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-20"
          onClick={handleMobileOutsideClick}
          aria-hidden="true"
        />
      )}
    
      <motion.aside
        ref={sidebarRef}
        initial={false}
        animate={isSidebarExpanded ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        className={`
          fixed left-0 top-16 z-30 bg-white shadow-lg md:shadow-sm rounded-r-lg md:rounded-lg
          transition-transform duration-300 ease-in-out h-[calc(100vh-4rem)]
          ${
            isMobileView
              ? isSidebarExpanded
                ? "translate-x-0"
                : "-translate-x-full"
              : "translate-x-0"
          }
        `}
        onMouseEnter={() => !isMobileView && setIsSidebarExpanded(true)}
        onMouseLeave={() => !isMobileView && setIsSidebarExpanded(false)}
      >
        <button
          onClick={toggleSidebar}
          className={`
            absolute -right-3 top-4 bg-white rounded-full p-1.5 shadow-md
            hover:bg-gray-50 transition-colors duration-200
            ${isMobileView ? "hidden" : "block"}
          `}
          aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <ChevronLeft
            className={`h-4 w-4 text-gray-600 transition-transform duration-300 ${
              !isSidebarExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        <motion.div
          className="p-4 h-full flex flex-col"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            variants={itemVariants}
            className={`flex flex-col items-center gap-3 mb-6 transition-opacity duration-300 ${
              !isSidebarExpanded && !isMobileView
                ? "opacity-0 pointer-events-none"
                : "opacity-100 pointer-events-auto"
            }`}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              {userProfile.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt="User profile" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-primary" />
              )}
            </div>
            {(isSidebarExpanded || isMobileView) && (
              <div className="text-center">
                <h3 className="font-medium">
                  {userProfile.full_name || userProfile.name || user?.email?.split('@')[0] || 'User'}
                </h3>
                <p className="text-xs text-gray-500">
                  {userProfile.department || userProfile.branch || userProfile.role || 'Member'}
                </p>
                <div className="mt-1 h-1.5 w-32 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
            )}
          </motion.div>

          <nav className="flex-grow overflow-y-auto custom-scrollbar">
            <motion.ul className="space-y-1" variants={containerVariants}>
              <motion.li variants={itemVariants}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <MenuItemLink
                        to="/homepage"
                        icon={Calendar}
                        label="Homepage"
                        showLabel={isSidebarExpanded || isMobileView}
                        isCenter={!isSidebarExpanded && !isMobileView}
                        isActive={isActiveRoute("/homepage")}
                      />
                    </TooltipTrigger>
                    {!isSidebarExpanded && !isMobileView && (
                      <TooltipContent side="right" align="center">
                        Homepage
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </motion.li>
              {navigationItems.map((item, index) => (
                <motion.li key={index} variants={itemVariants}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <MenuItemLink
                          to={item.to}
                          icon={item.icon}
                          label={item.label}
                          showLabel={isSidebarExpanded || isMobileView}
                          isCenter={!isSidebarExpanded && !isMobileView}
                          isActive={isActiveRoute(item.to)}
                        />
                      </TooltipTrigger>
                      {!isSidebarExpanded && !isMobileView && (
                        <TooltipContent side="right" align="center">
                          {item.label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </motion.li>
              ))}
            </motion.ul>
          </nav>

          <div className="mt-auto pt-4 border-t">
            <motion.ul className="space-y-1" variants={containerVariants}>
              {footerItems.map((item, index) => (
                <motion.li key={index} variants={itemVariants}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <MenuItemLink
                          to={item.to}
                          onClick={item.onClick}
                          icon={item.icon}
                          label={item.label}
                          showLabel={isSidebarExpanded || isMobileView}
                          isCenter={!isSidebarExpanded && !isMobileView}
                          className={item.className}
                        />
                      </TooltipTrigger>
                      {!isSidebarExpanded && !isMobileView && (
                        <TooltipContent side="right" align="center">
                          {item.label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </motion.div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
