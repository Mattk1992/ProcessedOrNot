import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Search result section visibility settings
export interface SearchResultVisibilitySettings {
  showNutriBotInsight: boolean;
  showFunFacts: boolean;
  showNutritionSpotlight: boolean;
  showGlycemicImpact: boolean;
  showNutritionFacts: boolean;
  showProcessingAnalysis: boolean;
  showProductionProcess: boolean;
  showCarbonFootprint: boolean;
}

// Default settings - all enabled by default
const defaultSettings: SearchResultVisibilitySettings = {
  showNutriBotInsight: true,
  showFunFacts: true,
  showNutritionSpotlight: true,
  showGlycemicImpact: true,
  showNutritionFacts: true,
  showProcessingAnalysis: true,
  showProductionProcess: true,
  showCarbonFootprint: true,
};

interface SearchResultVisibilityContextType {
  settings: SearchResultVisibilitySettings;
  updateSetting: (key: keyof SearchResultVisibilitySettings, value: boolean) => void;
  resetToDefaults: () => void;
}

const SearchResultVisibilityContext = createContext<SearchResultVisibilityContextType | undefined>(undefined);

export const SearchResultVisibilityProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SearchResultVisibilitySettings>(() => {
    // Try to load settings from localStorage
    try {
      const saved = localStorage.getItem('search-result-visibility-settings');
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load search result visibility settings from localStorage:', error);
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('search-result-visibility-settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save search result visibility settings to localStorage:', error);
    }
  }, [settings]);

  const updateSetting = (key: keyof SearchResultVisibilitySettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  const contextValue: SearchResultVisibilityContextType = {
    settings,
    updateSetting,
    resetToDefaults,
  };

  return (
    <SearchResultVisibilityContext.Provider value={contextValue}>
      {children}
    </SearchResultVisibilityContext.Provider>
  );
};

// Custom hook to use the search result visibility context
export const useSearchResultVisibility = () => {
  const context = useContext(SearchResultVisibilityContext);
  if (context === undefined) {
    throw new Error('useSearchResultVisibility must be used within a SearchResultVisibilityProvider');
  }
  return context;
};

export default SearchResultVisibilityContext;