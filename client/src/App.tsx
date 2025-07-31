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
import Home from "@/pages/home";
import ProductLookup from "@/pages/product-lookup";
import About from "@/pages/about";
import Features from "@/pages/features";
import Help from "@/pages/help";
import Auth from "@/pages/auth";
import Settings from "@/pages/settings";
import Admin from "@/pages/admin";
import AdminSearchHistory from "@/pages/admin-search-history";
import AdminProductDatabase from "@/pages/admin-product-database";
import Blog from "@/pages/blog";
import BlogNew from "@/pages/blog-new";
import BlogPost from "@/pages/blog-post";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import SocialMedia from "@/pages/social-media";
import NotFound from "@/pages/not-found";
import NutriDashboard from "@/pages/nutri-dashboard";
import NutriDiary from "@/pages/nutri-diary";
import NutriProgress from "@/pages/nutri-progress";
import NutriProfile from "@/pages/nutri-profile";
import { AdManagerProvider, AdConsentBanner } from "@/components/ads";
import AdSettings from "@/pages/ad-settings";
import SiteInfo from "@/pages/site-info";
import ConsentSettings from "@/pages/consent-settings";
import ConsentBanner from "@/components/consent-banner";
import { consentIntegration } from "@/lib/consent-integration";

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  const [onStartTutorial, setOnStartTutorial] = useState<(() => void) | undefined>(undefined);

  // Tutorial functionality - can be passed from specific pages
  const handleStartTutorial = () => {
    // This will be implemented by individual pages that support tutorials
    console.log('Tutorial started');
  };

  return (
    <Layout onStartTutorial={handleStartTutorial}>
      <ConsentBanner />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/product-lookup" component={ProductLookup} />
        <Route path="/scan" component={ProductLookup} />
        <Route path="/about" component={About} />
        <Route path="/features" component={Features} />
        <Route path="/help" component={Help} />
        <Route path="/login" component={Auth} />
        <Route path="/register" component={Auth} />
        <Route path="/auth" component={Auth} />
        <Route path="/nutri-dashboard/settings" component={Settings} />
        <Route path="/nutri-dashboard/site-info" component={SiteInfo} />
        <Route path="/consent-settings" component={ConsentSettings} />
        <Route path="/privacy-settings" component={ConsentSettings} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin-search-history" component={AdminSearchHistory} />
        <Route path="/admin-product-database" component={AdminProductDatabase} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/new" component={BlogNew} />
        <Route path="/blog/:id" component={BlogPost} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/social-media" component={SocialMedia} />
        
        {/* Nutrition Tracking Pages */}
        <Route path="/nutri-dashboard" component={NutriDashboard} />
        <Route path="/nutri-dashboard/diary" component={NutriDiary} />
        <Route path="/nutri-dashboard/progress" component={NutriProgress} />
        <Route path="/nutri-dashboard/profile" component={NutriProfile} />
        
        {/* Ad Configuration - Sub-page of Settings */}
        <Route path="/nutri-dashboard/settings/ad-settings" component={AdSettings} />
        
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
    // Initialize consent integration for Google services
    consentIntegration.initializeGoogleAds('1163701043339821');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AdManagerProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              <ThemeToggle />
              <AdConsentBanner />
            </TooltipProvider>
          </AdManagerProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
