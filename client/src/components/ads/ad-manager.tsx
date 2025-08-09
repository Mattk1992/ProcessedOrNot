import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { consentManager, type ConsentData } from '@/lib/consent-manager';

interface AdConfig {
  adsenseClientId?: string;
  admobAppId?: string;
  testMode: boolean;
  platform: 'web' | 'mobile';
  consentGiven: boolean;
  globallyEnabled: boolean;
}

interface AdManagerContextType {
  config: AdConfig;
  updateConfig: (newConfig: Partial<AdConfig>) => void;
  showAd: (type: 'banner' | 'interstitial' | 'rewarded', position?: string) => void;
  isAdBlocked: boolean;
  canShowAds: boolean;
  isGloballyEnabled: boolean;
}

const AdManagerContext = createContext<AdManagerContextType | null>(null);

export function AdManagerProvider({ children }: { children: React.ReactNode }) {
  // Check if Google Ads are globally enabled via admin setting
  const { data: adsEnabledData, isLoading: adsEnabledLoading } = useQuery({
    queryKey: ["/api/settings/google-ads-enabled"],
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes instead of 30 seconds
  });

  const [config, setConfig] = useState<AdConfig>({
    adsenseClientId: import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID,
    admobAppId: import.meta.env.VITE_GOOGLE_ADMOB_APP_ID,
    testMode: import.meta.env.DEV,
    platform: 'web',
    consentGiven: false,
    globallyEnabled: true, // Default to true, will be updated from API
  });

  const [isAdBlocked, setIsAdBlocked] = useState(false);
  const [canShowAds, setCanShowAds] = useState(false);

  // Listen for CMP consent changes
  useEffect(() => {
    const unsubscribe = consentManager.addConsentListener((consent: ConsentData | null) => {
      const hasAdvertisingConsent = consent?.advertising ?? false;
      setConfig(prev => ({ ...prev, consentGiven: hasAdvertisingConsent }));
      setCanShowAds(hasAdvertisingConsent && config.globallyEnabled && !isAdBlocked);
    });
    
    // Check initial consent state
    const currentConsent = consentManager.getConsent();
    const hasAdvertisingConsent = currentConsent?.advertising ?? false;
    setConfig(prev => ({ ...prev, consentGiven: hasAdvertisingConsent }));
    
    return unsubscribe;
  }, [isAdBlocked, config.globallyEnabled]);

  // Update config when global ads setting changes
  useEffect(() => {
    if (adsEnabledData && !adsEnabledLoading) {
      setConfig(prev => ({
        ...prev,
        globallyEnabled: (adsEnabledData as any)?.enabled || false
      }));
    }
  }, [adsEnabledData, adsEnabledLoading]);

  // Check for ad blockers
  useEffect(() => {
    const checkAdBlocker = () => {
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      testAd.style.position = 'absolute';
      testAd.style.left = '-9999px';
      document.body.appendChild(testAd);

      setTimeout(() => {
        const isBlocked = testAd.offsetHeight === 0;
        setIsAdBlocked(isBlocked);
        document.body.removeChild(testAd);
        
        if (!isBlocked) {
          console.log('Ad blocker not detected');
        } else {
          console.log('Ad blocker detected');
        }
      }, 100);
    };

    checkAdBlocker();
  }, []);

  // AdSense initialization is now handled by CMP system
  // This useEffect just sets canShowAds based on consent and global settings
  useEffect(() => {
    setCanShowAds(config.consentGiven && config.globallyEnabled && !isAdBlocked);
  }, [config.consentGiven, config.globallyEnabled, isAdBlocked]);

  const updateConfig = (newConfig: Partial<AdConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const showAd = (type: 'banner' | 'interstitial' | 'rewarded', position?: string) => {
    if (!canShowAds || isAdBlocked || !config.consentGiven || !config.globallyEnabled) {
      console.log('Cannot show ads:', { 
        canShowAds, 
        isAdBlocked, 
        consentGiven: config.consentGiven, 
        globallyEnabled: config.globallyEnabled 
      });
      return;
    }

    console.log(`Showing ${type} ad${position ? ` at ${position}` : ''}`);
    
    if (config.platform === 'web') {
      // Trigger AdSense ad refresh only if AdSense is properly initialized
      try {
        if ((window as any).__adSenseInitialized && (window as any).adsbygoogle) {
          (window as any).adsbygoogle.push({});
        } else {
          console.log('AdSense not yet initialized, ad display skipped');
        }
      } catch (error) {
        console.error('Error showing ad:', error);
      }
    } else {
      // Trigger AdMob ad (would work in React Native)
      console.log('AdMob ad would be shown here');
    }
  };

  const value: AdManagerContextType = {
    config,
    updateConfig,
    showAd,
    isAdBlocked,
    canShowAds: canShowAds && config.consentGiven && !isAdBlocked && config.globallyEnabled,
    isGloballyEnabled: config.globallyEnabled
  };

  return (
    <AdManagerContext.Provider value={value}>
      {children}
    </AdManagerContext.Provider>
  );
}

export function useAdManager() {
  const context = useContext(AdManagerContext);
  if (!context) {
    throw new Error('useAdManager must be used within an AdManagerProvider');
  }
  return context;
}

// Consent Management Component
export function AdConsentBanner() {
  // This component is now replaced by the comprehensive CMP system
  // The ConsentBanner component in App.tsx handles all consent management
  return null;
}

// Ad Performance Tracking
export function useAdTracking() {
  const { config } = useAdManager();

  const trackAdView = (adType: string, adId: string) => {
    if (config.testMode) {
      console.log(`Ad view tracked: ${adType} - ${adId}`);
    }
    
    // Send tracking data to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ad_view', {
        ad_type: adType,
        ad_id: adId,
        platform: config.platform
      });
    }
  };

  const trackAdClick = (adType: string, adId: string) => {
    if (config.testMode) {
      console.log(`Ad click tracked: ${adType} - ${adId}`);
    }
    
    // Send tracking data to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ad_click', {
        ad_type: adType,
        ad_id: adId,
        platform: config.platform
      });
    }
  };

  return {
    trackAdView,
    trackAdClick
  };
}