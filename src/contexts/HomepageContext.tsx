import React, { createContext, useContext, useState } from 'react';

interface HomepageContextType {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
}

const HomepageContext = createContext<HomepageContextType | undefined>(undefined);

export const HomepageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  return (
    <HomepageContext.Provider value={{ selectedCategories, setSelectedCategories }}>
      {children}
    </HomepageContext.Provider>
  );
};

export const useHomepage = () => {
  const context = useContext(HomepageContext);
  if (!context) {
    throw new Error('useHomepage must be used within a HomepageProvider');
  }
  return context;
}; 