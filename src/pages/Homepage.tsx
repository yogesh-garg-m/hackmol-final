import React from "react";
import { useHomepage } from "@/hooks/useHomepage";
import Sidebar from "@/components/homepage/Sidebar";
import RightSidebar from "@/components/homepage/RightSidebar";
import Header from "@/components/homepage/Header";
import MainContent from "@/components/homepage/MainContent";

const Homepage = () => {
  const {
    viewMode,
    setViewMode,
    isSearchExpanded,
    setIsSearchExpanded,
    isSidebarExpanded,
    setIsSidebarExpanded,
    isRightSidebarVisible,
    setIsRightSidebarVisible,
    isMobileView,
    isTabletView,
    isLoading,
    filteredEvents,
    categories,
    userPreferences,
    handleLogout,
    handleRegisterEvent,
    handleSaveEvent,
    handleShareEvent,
    handleNavigateToBookmarks,
    handleExploreSection,
    handleNavigateToProfile,
    handleNavigateToClubCreate,
    handleFilterChange,
  } = useHomepage();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        isSearchExpanded={isSearchExpanded}
        setIsSearchExpanded={setIsSearchExpanded}
        isMobileView={isMobileView}
        handleLogout={handleLogout}
        handleNavigateToProfile={handleNavigateToProfile}
        handleNavigateToClubCreate={handleNavigateToClubCreate}
      />

      <div className="container mx-auto px-4 pt-24 md:pt-20 pb-10 flex flex-col md:flex-row gap-4 relative">
        <Sidebar
          isSidebarExpanded={isSidebarExpanded}
          setIsSidebarExpanded={setIsSidebarExpanded}
          isMobileView={isMobileView}
          handleLogout={handleLogout}
        />

        <main
          className={`
          flex-1 transition-all duration-300
          ${isMobileView || isTabletView ? "ml-0 mr-0" : "ml-[72px] mr-72"}
        `}
        >
          <MainContent
            viewMode={viewMode}
            setViewMode={setViewMode}
            isMobileView={isMobileView}
            filteredEvents={filteredEvents}
            isLoading={isLoading}
            categories={categories}
            onFilterChange={handleFilterChange}
            handleRegisterEvent={handleRegisterEvent}
            handleSaveEvent={handleSaveEvent}
            handleShareEvent={handleShareEvent}
            hasUserPreferences={!!userPreferences?.categories.length}
          />
        </main>

        <RightSidebar
          isRightSidebarVisible={isRightSidebarVisible}
          setIsRightSidebarVisible={setIsRightSidebarVisible}
          isMobileView={isMobileView}
          isTabletView={isTabletView}
          handleNavigateToBookmarks={handleNavigateToBookmarks}
          handleExploreSection={handleExploreSection}
        />
      </div>
    </div>
  );
};

export default Homepage;
