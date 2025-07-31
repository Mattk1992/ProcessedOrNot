// Google Publisher Tag (GPT) Ad Manager
// Handles reward ads and interstitial ad display

declare global {
  interface Window {
    googletag: any;
    __gptInitialized?: boolean;
    __rewardAdSlot?: any;
  }
}

interface GPTAdConfig {
  publisherId: string;
  rewardAdUnitId: string;
  testMode: boolean;
}

class GPTAdManager {
  private static instance: GPTAdManager;
  private config: GPTAdConfig;
  private initialized = false;
  private rewardAdSlot: any = null;

  constructor() {
    this.config = {
      publisherId: import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID?.replace('ca-pub-', '') || '1163701043339821',
      rewardAdUnitId: '/1163701043339821/reward_interstitial', // Use proper publisher ID format
      testMode: import.meta.env.DEV || false
    };
  }

  static getInstance(): GPTAdManager {
    if (!GPTAdManager.instance) {
      GPTAdManager.instance = new GPTAdManager();
    }
    return GPTAdManager.instance;
  }

  async initializeGPT(): Promise<void> {
    if (this.initialized || window.__gptInitialized) {
      return;
    }

    // Check consent before initializing GPT
    const consentManager = await import('@/lib/consent-manager').then(m => m.consentManager);
    const consent = consentManager.getConsent();
    
    if (!consent?.advertising) {
      console.log('GPT initialization skipped: No advertising consent');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // Load GPT library
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
        script.onerror = () => reject(new Error('Failed to load GPT library'));
        
        script.onload = () => {
          window.googletag = window.googletag || { cmd: [] };
          
          window.googletag.cmd.push(() => {
            try {
              // Configure GPT
              window.googletag.pubads().enableSingleRequest();
              window.googletag.pubads().collapseEmptyDivs();
              window.googletag.pubads().enableLazyLoad({
                fetchMarginPercent: 500,
                renderMarginPercent: 200,
                mobileScaling: 2.0
              });

              // Set targeting for reward ads
              window.googletag.pubads().setTargeting('ad_type', 'reward');
              window.googletag.pubads().setTargeting('placement', 'interstitial');
              
              if (this.config.testMode) {
                window.googletag.pubads().setTargeting('test', 'true');
              }

              // Define reward ad slot with proper ad unit path
              const adUnitPath = this.config.rewardAdUnitId.startsWith('/') 
                ? this.config.rewardAdUnitId 
                : `/${this.config.publisherId}/${this.config.rewardAdUnitId}`;
                
              this.rewardAdSlot = window.googletag.defineOutOfPageSlot(
                adUnitPath,
                window.googletag.enums.OutOfPageFormat.INTERSTITIAL
              );
              
              console.log('Created GPT reward ad slot:', adUnitPath);

              if (this.rewardAdSlot) {
                this.rewardAdSlot.addService(window.googletag.pubads());
                window.__rewardAdSlot = this.rewardAdSlot;
              }

              window.googletag.enableServices();
              
              this.initialized = true;
              window.__gptInitialized = true;
              
              console.log('GPT initialized successfully for reward ads');
              resolve();
            } catch (error) {
              console.error('GPT initialization error:', error);
              reject(error);
            }
          });
        };

        document.head.appendChild(script);
      } catch (error) {
        reject(error);
      }
    });
  }

  async showRewardAd(): Promise<boolean> {
    if (!this.initialized) {
      try {
        await this.initializeGPT();
      } catch (error) {
        console.error('Failed to initialize GPT for reward ad:', error);
        return false;
      }
    }

    return new Promise((resolve) => {
      try {
        if (!window.googletag || !this.rewardAdSlot) {
          console.error('GPT not properly initialized for reward ads');
          resolve(false);
          return;
        }

        // Create ad container
        const adContainer = document.createElement('div');
        adContainer.id = 'reward-ad-container';
        adContainer.style.display = 'none';
        document.body.appendChild(adContainer);

        window.googletag.cmd.push(() => {
          try {
            // Display the interstitial reward ad
            window.googletag.display(this.rewardAdSlot);
            
            // Set up event listeners for ad events
            window.googletag.pubads().addEventListener('slotOnload', (event: any) => {
              if (event.slot === this.rewardAdSlot) {
                console.log('Reward ad loaded successfully');
                
                // Show ad for 5 seconds then resolve
                setTimeout(() => {
                  this.hideRewardAd();
                  resolve(true);
                }, 5000);
              }
            });

            window.googletag.pubads().addEventListener('slotRenderEnded', (event: any) => {
              if (event.slot === this.rewardAdSlot) {
                if (!event.isEmpty) {
                  console.log('Reward ad rendered successfully');
                } else {
                  console.log('No reward ad to display');
                  this.hideRewardAd();
                  resolve(false);
                }
              }
            });

            // Fallback timeout
            setTimeout(() => {
              this.hideRewardAd();
              resolve(false);
            }, 10000);

          } catch (error) {
            console.error('Error displaying reward ad:', error);
            this.hideRewardAd();
            resolve(false);
          }
        });

      } catch (error) {
        console.error('Error showing reward ad:', error);
        resolve(false);
      }
    });
  }

  private hideRewardAd(): void {
    const adContainer = document.getElementById('reward-ad-container');
    if (adContainer) {
      adContainer.remove();
    }
  }

  async checkAdAvailability(): Promise<boolean> {
    if (!this.initialized) {
      try {
        await this.initializeGPT();
      } catch (error) {
        return false;
      }
    }

    return window.googletag && this.rewardAdSlot !== null;
  }

  // Method to refresh ad slot for new requests
  refreshRewardAd(): void {
    if (window.googletag && this.rewardAdSlot) {
      window.googletag.cmd.push(() => {
        window.googletag.pubads().refresh([this.rewardAdSlot]);
      });
    }
  }
}

// Export singleton instance
export const gptAdManager = GPTAdManager.getInstance();
export default GPTAdManager;