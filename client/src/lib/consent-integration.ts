// Google Analytics and Ad Consent Integration
// Ensures compliance with Google Publisher Policies 2025

import { consentManager, type ConsentData } from './consent-manager';
import { adSystemManager } from './ad-system-manager';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    googletag: any;
  }
}

class ConsentIntegration {
  private static instance: ConsentIntegration;
  private initialized = false;

  constructor() {
    this.initializeGoogleConsent();
    this.setupConsentListener();
  }

  static getInstance(): ConsentIntegration {
    if (!ConsentIntegration.instance) {
      ConsentIntegration.instance = new ConsentIntegration();
    }
    return ConsentIntegration.instance;
  }

  private initializeGoogleConsent() {
    // Initialize Google Consent Mode v2
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer?.push(arguments);
      };

      // Set default consent state (before user interaction)
      window.gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'granted',
        personalization_storage: 'denied',
        security_storage: 'granted',
        // New 2025 consent types
        wait_for_update: 500 // Wait for CMP
      });

      // Enhanced measurement for better analytics
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        anonymize_ip: true,
        allow_ad_personalization_signals: false,
        restricted_data_processing: true
      });

      this.initialized = true;
    }
  }

  private setupConsentListener() {
    consentManager.addConsentListener((consent: ConsentData | null) => {
      if (consent && this.initialized) {
        this.updateGoogleConsent(consent);
        this.updateGoogleAds(consent);
        this.updateAnalytics(consent);
      }
    });
  }

  private updateGoogleConsent(consent: ConsentData) {
    if (!window.gtag) return;

    const settings = consentManager.getSettings();
    
    // Update consent based on user preferences
    window.gtag('consent', 'update', {
      ad_storage: consent.advertising ? 'granted' : 'denied',
      ad_user_data: consent.personalization ? 'granted' : 'denied',
      ad_personalization: consent.personalization ? 'granted' : 'denied',
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      functionality_storage: 'granted', // Always required
      personalization_storage: consent.personalization ? 'granted' : 'denied',
      security_storage: 'granted', // Always required
      
      // Regional compliance settings
      ...(settings.region === 'EU' && {
        ad_storage: consent.advertising ? 'granted' : 'denied',
        ad_user_data: consent.advertising && consent.personalization ? 'granted' : 'denied'
      }),
      
      // US state privacy compliance
      ...(settings.enableRDP && {
        restricted_data_processing: !consent.advertising
      })
    });

    // Log consent event for audit trail
    window.gtag('event', 'consent_update', {
      consent_version: consent.version,
      consent_region: consent.region,
      consent_state: consent.state,
      ad_storage: consent.advertising,
      analytics_storage: consent.analytics,
      personalization: consent.personalization
    });
  }

  private updateGoogleAds(consent: ConsentData) {
    // Update Google Ads consent
    if (window.googletag) {
      const pubads = window.googletag.pubads();
      
      if (pubads) {
        // Set privacy settings for Google Ads
        pubads.setPrivacySettings({
          restrictDataProcessing: !consent.advertising,
          childDirectedTreatment: false,
          underAgeOfConsent: false,
          limitedAds: !consent.personalization
        });

        // Configure targeting based on consent
        if (!consent.personalization) {
          pubads.clearTargeting();
        }

        // Set publisher-provided signals
        pubads.setPublisherProvidedId(consent.region);
        
        // Refresh ads with new consent settings
        window.googletag.pubads().refresh();
      }
    }
  }

  private updateAnalytics(consent: ConsentData) {
    if (!window.gtag) return;

    // Configure Google Analytics based on consent
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      anonymize_ip: !consent.analytics,
      allow_ad_personalization_signals: consent.personalization,
      allow_google_signals: consent.analytics && consent.personalization,
      restricted_data_processing: !consent.advertising,
      
      // Enhanced measurement controls
      enhanced_measurement: {
        scrolls: consent.analytics,
        outbound_clicks: consent.analytics,
        site_search: consent.analytics,
        video_engagement: consent.analytics,
        file_downloads: consent.analytics
      }
    });

    // Set user properties for segmentation
    if (consent.analytics) {
      window.gtag('set', {
        user_properties: {
          consent_version: consent.version,
          consent_region: consent.region,
          privacy_mode: consentManager.getSettings().enableRDP ? 'enhanced' : 'standard'
        }
      });
    }
  }

  // Initialize Google Ads with consent
  public initializeGoogleAds(publisherId: string) {
    // Use centralized ad system manager to prevent conflicts
    if (!adSystemManager.canInitializeAdSense()) {
      return;
    }

    // Prevent multiple initializations
    if (!this.initialized || (window as any).__adSenseInitialized || (window as any).__adSenseConfigured) {
      return;
    }

    const consent = consentManager.getConsent();
    
    // Load Google Ads only if consent is granted
    if (consent?.advertising) {
      // Check if script already exists
      const existingScript = document.querySelector(`script[src*="pagead2.googlesyndication.com"]`);
      
      if (!existingScript) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${publisherId}`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }

      // Initialize adsbygoogle array only once
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      
      // Configure AdSense only once with proper error handling
      try {
        // Only push enable_page_level_ads once per page load
        if (!(window as any).__adSenseConfigured && !(window as any).__adSensePageLevelEnabled) {
          (window as any).adsbygoogle.push({
            google_ad_client: `ca-pub-${publisherId}`,
            enable_page_level_ads: true,
            privacy_compliance: {
              gdpr: consentManager.getSettings().region === 'EU',
              ccpa: consentManager.getSettings().enableRDP,
              restricted_data_processing: !consent.personalization
            }
          });
          
          (window as any).__adSenseConfigured = true;
          (window as any).__adSenseInitialized = true;
          (window as any).__adSensePageLevelEnabled = true;
          adSystemManager.setActiveSystem('adsense');
          adSystemManager.markInitialized();
          console.log('AdSense initialized successfully');
        } else {
          console.log('AdSense initialization skipped: Already configured');
        }
      } catch (error) {
        console.error('AdSense initialization error:', error);
        // Reset configuration flags on error to allow retry
        (window as any).__adSenseConfigured = false;
        (window as any).__adSenseInitialized = false;
        // Don't reset __adSensePageLevelEnabled to prevent duplicate page-level ads
      }
    }
  }

  // Get consent for external services
  public getConsentForService(service: 'analytics' | 'advertising' | 'personalization'): boolean {
    const consent = consentManager.getConsent();
    if (!consent) return false;

    switch (service) {
      case 'analytics':
        return consent.analytics;
      case 'advertising':
        return consent.advertising;
      case 'personalization':
        return consent.personalization;
      default:
        return false;
    }
  }

  // Check if consent is required for region
  public isConsentRequired(): boolean {
    return consentManager.requiresConsent();
  }

  // Get compliance strings for external APIs
  public getComplianceStrings() {
    const consent = consentManager.getConsent();
    if (!consent) return null;

    return {
      tcString: consent.tcString,
      uspString: consent.uspString,
      gppString: consent.gppString,
      region: consent.region,
      version: consent.version
    };
  }

  // Manual consent check for third-party integrations
  public checkConsentBeforeAction(action: string, requiredConsent: 'analytics' | 'advertising' | 'personalization'): boolean {
    const hasConsent = this.getConsentForService(requiredConsent);
    
    if (!hasConsent && consentManager.requiresConsent()) {
      console.warn(`Action '${action}' blocked: Missing consent for ${requiredConsent}`);
      return false;
    }
    
    return true;
  }
}

// Export singleton instance
export const consentIntegration = ConsentIntegration.getInstance();
export default ConsentIntegration;