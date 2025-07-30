import React, { createContext, useContext, useEffect, useState } from 'react';

interface AdConfig {
  adsenseClientId?: string;
  admobAppId?: string;
  testMode: boolean;
  platform: 'web' | 'mobile';
  consentGiven: boolean;
}

interface AdManagerContextType {
  config: AdConfig;
  updateConfig: (newConfig: Partial<AdConfig>) => void;
  showAd: (type: 'banner' | 'interstitial' | 'rewarded', position?: string) => void;
  isAdBlocked: boolean;
  canShowAds: boolean;
}

const AdManagerContext = createContext<AdManagerContextType | null>(null);

export function AdManagerProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AdConfig>({
    adsenseClientId: import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID,
    admobAppId: import.meta.env.VITE_GOOGLE_ADMOB_APP_ID,
    testMode: import.meta.env.DEV,
    platform: 'web',
    consentGiven: false
  });

  const [isAdBlocked, setIsAdBlocked] = useState(false);
  const [canShowAds, setCanShowAds] = useState(false);

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

  // Initialize ads based on platform
  useEffect(() => {
    if (config.platform === 'web' && config.adsenseClientId) {
      // Check if AdSense script already exists to prevent duplicate loading
      const existingScript = document.querySelector(`script[src*="pagead2.googlesyndication.com"]`);
      
      if (!existingScript) {
        // Initialize AdSense only if not already loaded
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.adsenseClientId}`;
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-adsense-client', config.adsenseClientId);
        
        script.onload = () => {
          console.log('AdSense initialized');
          setCanShowAds(true);
        };
        
        script.onerror = () => {
          console.error('Failed to load AdSense');
          setCanShowAds(false);
        };
        
        document.head.appendChild(script);

        return () => {
          // Cleanup - only remove if it exists and matches our client ID
          const scriptToRemove = document.querySelector(`script[data-adsense-client="${config.adsenseClientId}"]`);
          if (scriptToRemove) {
            document.head.removeChild(scriptToRemove);
          }
        };
      } else {
        // Script already exists, just enable ads
        setCanShowAds(true);
      }
    } else if (config.platform === 'mobile' && config.admobAppId) {
      // Initialize AdMob (would work in React Native)
      console.log('AdMob would be initialized here for mobile platform');
      setCanShowAds(true);
    }
  }, [config]);

  const updateConfig = (newConfig: Partial<AdConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const showAd = (type: 'banner' | 'interstitial' | 'rewarded', position?: string) => {
    if (!canShowAds || isAdBlocked || !config.consentGiven) {
      console.log('Cannot show ads:', { canShowAds, isAdBlocked, consentGiven: config.consentGiven });
      return;
    }

    console.log(`Showing ${type} ad${position ? ` at ${position}` : ''}`);
    
    if (config.platform === 'web') {
      // Trigger AdSense ad refresh
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
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
    canShowAds: canShowAds && config.consentGiven && !isAdBlocked
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
  const { config, updateConfig, canShowAds } = useAdManager();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if consent was previously given
    const consentGiven = localStorage.getItem('ad-consent') === 'true';
    updateConfig({ consentGiven });
    
    if (!consentGiven) {
      setShowBanner(true);
    }
  }, []); // Empty dependency array to run only once

  const handleAcceptConsent = () => {
    localStorage.setItem('ad-consent', 'true');
    updateConfig({ consentGiven: true });
    setShowBanner(false);
  };

  const handleDeclineConsent = () => {
    localStorage.setItem('ad-consent', 'false');
    updateConfig({ consentGiven: false });
    setShowBanner(false);
  };

  if (!showBanner || config.consentGiven) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm">
            We use ads to support our free service. By continuing to use our site, 
            you agree to our use of cookies and data collection for advertising purposes.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleDeclineConsent}
            className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-800"
          >
            Decline
          </button>
          <button
            onClick={handleAcceptConsent}
            className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary/90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
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