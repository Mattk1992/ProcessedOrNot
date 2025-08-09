// Consent Management System for Google Publisher Policies 2025
// Supports EU/UK/Switzerland GDPR + US State Privacy Laws

export interface ConsentData {
  analytics: boolean;
  advertising: boolean;
  personalization: boolean;
  functional: boolean;
  timestamp: number;
  version: string;
  gppString?: string; // IAB Global Privacy Platform
  uspString?: string; // US Privacy String (CCPA)
  tcString?: string;  // Transparency & Consent String (GDPR)
  region: 'EU' | 'US' | 'OTHER';
  state?: string; // For US state-specific compliance
}

export interface ConsentSettings {
  showBanner: boolean;
  forceConsent: boolean;
  enableRDP: boolean; // Restricted Data Processing
  gppEnabled: boolean; // Global Privacy Platform
  region: 'EU' | 'US' | 'OTHER';
  detectedState?: string;
}

// US States requiring privacy compliance (2025)
const US_PRIVACY_STATES = [
  'CA', 'VA', 'CO', 'CT', 'UT', 'TX', 'OR', 'MT', 'IA', 
  'DE', 'NJ', 'NE', 'NH', 'FL', 'IN', 'TN', 'MD'
];

// EU/EEA countries requiring GDPR compliance
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO',
  'GB', 'CH' // UK and Switzerland
];

class ConsentManager {
  private static instance: ConsentManager;
  private consent: ConsentData | null = null;
  private settings: ConsentSettings;
  private listeners: Array<(consent: ConsentData | null) => void> = [];
  private gppApi: any = null;
  private tcfApi: any = null;

  constructor() {
    this.settings = {
      showBanner: true,
      forceConsent: false,
      enableRDP: false,
      gppEnabled: true,
      region: 'OTHER'
    };
    this.initializeAPIs();
    this.detectRegion();
    this.loadStoredConsent();
  }

  static getInstance(): ConsentManager {
    if (!ConsentManager.instance) {
      ConsentManager.instance = new ConsentManager();
    }
    return ConsentManager.instance;
  }

  private async initializeAPIs() {
    // Initialize IAB Global Privacy Platform (GPP)
    if (this.settings.gppEnabled) {
      this.initializeGPP();
    }

    // Initialize TCF API for GDPR
    if (this.settings.region === 'EU') {
      this.initializeTCF();
    }
  }

  private initializeGPP() {
    // GPP API implementation - Ensure it doesn't block authentication
    if (!(window as any).__gpp) {
      (window as any).__gpp = (command: string, parameter?: any, callback?: Function) => {
        try {
          if (command === 'addEventListener') {
            // Handle event listeners - non-blocking
            setTimeout(() => {
              if (callback) callback({ eventName: 'signalStatus', data: 'ready' });
            }, 0);
          } else if (command === 'getGPPData') {
            const gppData = {
              gppString: this.consent?.gppString || '',
              applicableSections: this.getApplicableSections(),
              gppVersion: 1,
              sectionList: this.getSectionList()
            };
            if (callback) {
              setTimeout(() => callback(gppData, true), 0);
            }
            return gppData;
          } else if (command === 'ping') {
            const pingData = {
              gppVersion: 1,
              cmpStatus: 'loaded',
              cmpDisplayStatus: this.settings.showBanner ? 'visible' : 'hidden',
              applicableSections: this.getApplicableSections(),
              supportedAPIs: ['2:tcfeuv2', '5:tcfcav1', '6:uspv1', '7:usnatv1']
            };
            if (callback) {
              setTimeout(() => callback(pingData, true), 0);
            }
            return pingData;
          }
        } catch (error) {
          console.warn('GPP API error (non-blocking):', error);
          if (callback) callback(null, false);
        }
      };

      // Make GPP API available
      (window as any).__gpp.queue = [];
      (window as any).__gpp.events = {};
    }
  }

  private initializeTCF() {
    // TCF API for GDPR compliance - Non-blocking
    if (!(window as any).__tcfapi) {
      (window as any).__tcfapi = (command: string, version: number, callback: Function, parameter?: any) => {
        try {
          if (command === 'addEventListener') {
            // Handle TCF event listeners - non-blocking
            setTimeout(() => {
              callback({ eventStatus: 'tcloaded', cmpStatus: 'loaded' }, true);
            }, 0);
          } else if (command === 'getTCData') {
            const tcData = {
              tcString: this.consent?.tcString || '',
              gdprApplies: this.settings.region === 'EU',
              cmpId: 1,
              cmpVersion: 1,
              cmpStatus: 'loaded',
              eventStatus: 'tcloaded',
              isServiceSpecific: true,
              useNonStandardStacks: false,
              purposeOneTreatment: false,
              publisherCC: this.getPublisherCountryCode(),
              outOfBand: {
                allowedVendors: {},
                disclosedVendors: {}
              }
            };
            setTimeout(() => callback(tcData, true), 0);
          } else if (command === 'ping') {
            const pingData = {
              gdprApplies: this.settings.region === 'EU',
              cmpLoaded: true,
              cmpStatus: 'loaded',
              displayStatus: this.settings.showBanner ? 'visible' : 'hidden',
              apiVersion: '2.2',
              cmpVersion: 1,
              cmpId: 1,
              gvlVersion: 2,
              tcfPolicyVersion: 4
            };
            setTimeout(() => callback(pingData, true), 0);
          }
        } catch (error) {
          console.warn('TCF API error (non-blocking):', error);
          if (callback) callback(null, false);
        }
      };

      (window as any).__tcfapi.queue = [];
    }

    (window as any).__tcfapi.queue = [];
  }

  private async detectRegion() {
    try {
      // Detect user location for compliance
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (EU_COUNTRIES.includes(data.country_code)) {
        this.settings.region = 'EU';
        this.settings.forceConsent = true;
      } else if (data.country_code === 'US') {
        this.settings.region = 'US';
        this.settings.detectedState = data.region_code;
        this.settings.enableRDP = US_PRIVACY_STATES.includes(data.region_code);
      } else {
        this.settings.region = 'OTHER';
      }
    } catch (error) {
      console.warn('Could not detect region:', error);
      // Default to showing consent for safety
      this.settings.forceConsent = true;
    }
  }

  private loadStoredConsent() {
    try {
      const stored = localStorage.getItem('user-consent-2025');
      if (stored) {
        this.consent = JSON.parse(stored);
        // Check if consent is still valid (180 days max)
        if (this.consent && Date.now() - this.consent.timestamp > 180 * 24 * 60 * 60 * 1000) {
          this.consent = null;
          localStorage.removeItem('user-consent-2025');
        }
      }
    } catch (error) {
      console.warn('Could not load stored consent:', error);
    }
  }

  private saveConsent(consent: ConsentData) {
    try {
      localStorage.setItem('user-consent-2025', JSON.stringify(consent));
      this.consent = consent;
      this.notifyListeners();
    } catch (error) {
      console.error('Could not save consent:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.consent));
  }

  private getApplicableSections(): number[] {
    const sections = [];
    if (this.settings.region === 'EU') {
      sections.push(2); // TCF EU v2.2
    }
    if (this.settings.region === 'US') {
      sections.push(6); // US Privacy (CCPA)
      sections.push(7); // US National Privacy
      if (this.settings.detectedState === 'CA') {
        sections.push(5); // TCF Canada v1.0
      }
    }
    return sections;
  }

  private getSectionList(): number[] {
    return [2, 5, 6, 7]; // All supported sections
  }

  private getPublisherCountryCode(): string {
    if (this.settings.region === 'EU') return 'EU';
    if (this.settings.region === 'US') return 'US';
    return 'XX';
  }

  public setConsent(consent: Partial<ConsentData>) {
    const fullConsent: ConsentData = {
      analytics: consent.analytics ?? false,
      advertising: consent.advertising ?? false,
      personalization: consent.personalization ?? false,
      functional: consent.functional ?? true,
      timestamp: Date.now(),
      version: '2025.1',
      region: this.settings.region,
      state: this.settings.detectedState,
      ...consent
    };

    // Generate compliance strings
    if (this.settings.region === 'EU') {
      fullConsent.tcString = this.generateTCString(fullConsent);
    }
    
    if (this.settings.region === 'US') {
      fullConsent.uspString = this.generateUSPString(fullConsent);
    }

    if (this.settings.gppEnabled) {
      fullConsent.gppString = this.generateGPPString(fullConsent);
    }

    this.saveConsent(fullConsent);
    this.settings.showBanner = false;

    // Notify Google Ads of consent changes
    if ((window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        ad_storage: fullConsent.advertising ? 'granted' : 'denied',
        ad_user_data: fullConsent.personalization ? 'granted' : 'denied',
        ad_personalization: fullConsent.personalization ? 'granted' : 'denied',
        analytics_storage: fullConsent.analytics ? 'granted' : 'denied',
        functionality_storage: fullConsent.functional ? 'granted' : 'denied',
        personalization_storage: fullConsent.personalization ? 'granted' : 'denied',
        security_storage: 'granted'
      });
    }
  }

  private generateTCString(consent: ConsentData): string {
    // Simplified TC String generation for GDPR
    // In production, use proper IAB TCF library
    const purposes = [
      consent.functional,     // Purpose 1: Store/access info
      consent.advertising,    // Purpose 2: Basic ads
      consent.personalization,// Purpose 3: Create profiles
      consent.advertising,    // Purpose 4: Select personalized ads
      consent.analytics,      // Purpose 5: Create content profiles
      consent.personalization,// Purpose 6: Select personalized content
      consent.analytics,      // Purpose 7: Measure ad performance
      consent.analytics,      // Purpose 8: Measure content performance
      consent.analytics,      // Purpose 9: Apply market research
      consent.advertising     // Purpose 10: Develop products
    ];
    
    const encoded = purposes.map(p => p ? '1' : '0').join('');
    return `CP${encoded}${Date.now().toString(36)}`;
  }

  private generateUSPString(consent: ConsentData): string {
    // US Privacy String (CCPA) format: 1YNN
    // Y = explicit yes, N = explicit no, - = not applicable
    const version = '1';
    const notice = 'Y'; // We provide notice
    const optOut = consent.advertising ? 'N' : 'Y'; // N = no opt-out, Y = opt-out
    const lspa = 'N'; // No LSPA (Limited Service Provider Agreement)
    
    return `${version}${notice}${optOut}${lspa}`;
  }

  private generateGPPString(consent: ConsentData): string {
    // Simplified GPP string generation
    // In production, use proper IAB GPP library
    const sections = this.getApplicableSections().join(',');
    const header = `DBACNYA~${sections}`;
    
    if (this.settings.region === 'EU') {
      return `${header}~${this.generateTCString(consent)}`;
    } else if (this.settings.region === 'US') {
      return `${header}~${this.generateUSPString(consent)}`;
    }
    
    return header;
  }

  public getConsent(): ConsentData | null {
    return this.consent;
  }

  public getSettings(): ConsentSettings {
    return this.settings;
  }

  public shouldShowBanner(): boolean {
    if (!this.consent) return true;
    if (this.settings.forceConsent) return this.settings.showBanner;
    return false;
  }

  public requiresConsent(): boolean {
    return this.settings.forceConsent || this.settings.enableRDP;
  }

  public addConsentListener(listener: (consent: ConsentData | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public withdrawConsent() {
    this.consent = null;
    localStorage.removeItem('user-consent-2025');
    this.settings.showBanner = true;
    this.notifyListeners();
  }

  public updateGoogleAdsConsent(enabled: boolean) {
    if ((window as any).gtag) {
      (window as any).gtag('consent', 'default', {
        ad_storage: enabled ? 'granted' : 'denied',
        ad_user_data: enabled ? 'granted' : 'denied',
        ad_personalization: enabled ? 'granted' : 'denied',
        analytics_storage: 'granted',
        functionality_storage: 'granted',
        personalization_storage: enabled ? 'granted' : 'denied',
        security_storage: 'granted'
      });
    }
  }
}

export const consentManager = ConsentManager.getInstance();
export default ConsentManager;