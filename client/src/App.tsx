import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/theme-toggle";
import Layout from "@/components/layout";
import { useEffect, useState } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import OldHome from "@/pages/home";
import ProductLookup from "@/pages/product-lookup";
import Home from "@/pages/new-home";
import About from "@/pages/about";
import Features from "@/pages/features";
import Help from "@/pages/help";
import Auth from "@/pages/auth";
import Settings from "@/pages/settings";
import Admin from "@/pages/admin";
import AdminSearchHistory from "@/pages/admin-search-history";
import AdminProductDatabase from "@/pages/admin-product-database";
import AdminCameraConfig from "@/pages/admin-camera-config";
import AdminWebsiteManagement from "@/pages/admin-website-management";
import AdminAIManagement from "@/pages/admin-ai-management";
import AdminPromptHistory from "@/pages/admin-prompt-history";
import Blog from "@/pages/blog";
import BlogNew from "@/pages/blog-new";
import BlogPost from "@/pages/blog-post";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Copyright from "@/pages/copyright";
import SocialMedia from "@/pages/social-media";
import NotFound from "@/pages/not-found";
import NutriDashboard from "@/pages/nutri-dashboard";
import NutriDiary from "@/pages/nutri-diary";
import NutriProgress from "@/pages/nutri-progress";
import NutriProfile from "@/pages/nutri-profile";
import NutritionCalendar from "@/pages/nutrition-calendar";
import UserProfile from "@/pages/user-profile";

import Onboarding from "@/pages/onboarding";
import LookupHistory from "@/pages/lookup-history";
import SearchHistoryView from "@/pages/search-history-view";
import Notifications from "@/pages/notifications";

import { AdManagerProvider, AdConsentBanner } from "@/components/ads";
import { SearchResultVisibilityProvider } from "@/contexts/SearchResultVisibilityContext";
import AdSettings from "@/pages/ad-settings";
import SiteInfo from "@/pages/site-info";
import AdPlacementGuidelinesPage from "@/pages/ad-placement-guidelines";
import AdComplianceDashboard from "@/pages/ad-compliance-dashboard";
import GPTConfigPage from "@/pages/gpt-config";
import OnboardingGuard from "@/components/onboarding-guard";
import { usePaidUserNavigation } from "@/hooks/use-paid-user-navigation";
import { useLocation } from "wouter";

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  // Automatically add account type suffixes to URLs 
  const [location, setLocation] = useLocation();
  const { generatePaidUserUrl, hasAccountTypeSuffix } = usePaidUserNavigation();

  useEffect(() => {
    // Debug: Log the current state
    console.log('URL Modifier Debug:', {
      location,
      hasAccountTypeSuffix,
      userAccountType: (window as any).currentUser?.accountType
    });

    // Only modify URL if we have an account type that should modify URLs
    if (!hasAccountTypeSuffix) {
      console.log('No account type suffix needed');
      return;
    }

    // Parse current URL to check if it already has account type parameters
    const url = new URL(location, window.location.origin);
    const hasAccountParam = url.searchParams.has('paiduser') || 
                           url.searchParams.has('regularuser') || 
                           url.searchParams.has('adminuser');

    console.log('URL check:', {
      hasAccountParam,
      searchParams: Array.from(url.searchParams.entries())
    });

    // If URL doesn't have account type parameter, add it
    if (!hasAccountParam) {
      const modifiedPath = generatePaidUserUrl(location);
      
      console.log('Generated URL:', modifiedPath);
      
      // Only update if the URL actually changed
      if (modifiedPath !== location) {
        console.log('Updating URL from', location, 'to', modifiedPath);
        // Update browser URL directly to ensure it's visible
        window.history.replaceState(null, '', modifiedPath);
        // Also update wouter location
        setLocation(modifiedPath, { replace: true });
      }
    }
  }, [location, generatePaidUserUrl, hasAccountTypeSuffix, setLocation]);
  
  const [onStartTutorial, setOnStartTutorial] = useState<(() => void) | undefined>(undefined);

  // Tutorial functionality - can be passed from specific pages
  const handleStartTutorial = () => {
    // This will be implemented by individual pages that support tutorials
    console.log('Tutorial started');
  };

  return (
    <Layout onStartTutorial={handleStartTutorial}>
      <OnboardingGuard />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/old-home" component={OldHome} />
        <Route path="/product-lookup" component={ProductLookup} />
        <Route path="/scan" component={ProductLookup} />
        <Route path="/about" component={About} />
        <Route path="/features" component={Features} />
        <Route path="/help" component={Help} />
        <Route path="/login" component={Auth} />
        <Route path="/register" component={Auth} />
        <Route path="/auth" component={Auth} />
        <Route path="/profile" component={UserProfile} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/nutri-dashboard/settings" component={Settings} />
        <Route path="/nutri-dashboard/site-info" component={SiteInfo} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin-search-history" component={AdminSearchHistory} />
        <Route path="/admin-product-database" component={AdminProductDatabase} />
        <Route path="/admin-camera-config" component={AdminCameraConfig} />
        <Route path="/admin-website-management" component={AdminWebsiteManagement} />
        <Route path="/admin-ai-management" component={AdminAIManagement} />
        <Route path="/admin-prompt-history" component={AdminPromptHistory} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/new" component={BlogNew} />
        <Route path="/blog/:id" component={BlogPost} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/copyright" component={Copyright} />
        <Route path="/social-media" component={SocialMedia} />
        
        {/* Nutrition Tracking Pages */}
        <Route path="/nutri-dashboard" component={NutriDashboard} />
        <Route path="/nutri-dashboard/diary" component={NutriDiary} />
        <Route path="/nutri-dashboard/progress" component={NutriProgress} />
        <Route path="/nutri-dashboard/profile" component={UserProfile} />
        <Route path="/nutrition-calendar" component={NutritionCalendar} />
        <Route path="/notifications" component={Notifications} />
        
        {/* Lookup History Page */}
        <Route path="/lookup-history" component={LookupHistory} />
        <Route path="/search-history/view/:id" component={SearchHistoryView} />
        

        
        {/* Ad Configuration - Sub-page of Settings */}
        <Route path="/nutri-dashboard/settings/ad-settings" component={AdSettings} />
        
        {/* Ad Compliance Pages */}
        <Route path="/ad-compliance-dashboard" component={AdComplianceDashboard} />
        <Route path="/ad-placement-guidelines" component={AdPlacementGuidelinesPage} />
        <Route path="/gpt-config" component={GPTConfigPage} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <SearchResultVisibilityProvider>
            <AdManagerProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
                <ThemeToggle />
                <AdConsentBanner />
              </TooltipProvider>
            </AdManagerProvider>
          </SearchResultVisibilityProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
