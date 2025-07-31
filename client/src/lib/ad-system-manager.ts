// Centralized Ad System Manager
// Prevents conflicts between AdSense and GPT ad systems

declare global {
  interface Window {
    __adSystemManager?: AdSystemManager;
    __adSystemInitialized?: boolean;
    __activeAdSystem?: 'adsense' | 'gpt' | null;
  }
}

class AdSystemManager {
  private static instance: AdSystemManager;
  private activeSystem: 'adsense' | 'gpt' | null = null;
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.__adSystemManager = this;
    }
  }

  static getInstance(): AdSystemManager {
    if (!AdSystemManager.instance) {
      AdSystemManager.instance = new AdSystemManager();
    }
    return AdSystemManager.instance;
  }

  canInitializeAdSense(): boolean {
    if (this.activeSystem === 'gpt') {
      console.log('AdSense blocked: GPT system is active');
      return false;
    }
    
    const alreadyInitialized = 
      (window as any).__adSenseInitialized ||
      (window as any).__adSenseConfigured ||
      (window as any).__adSensePageLevelEnabled;
      
    if (alreadyInitialized) {
      console.log('AdSense blocked: Already initialized');
      return false;
    }
    
    return true;
  }

  canInitializeGPT(): boolean {
    if (this.activeSystem === 'adsense') {
      console.log('GPT blocked: AdSense system is active');
      return false;
    }
    
    const alreadyInitialized = 
      window.__gptInitialized ||
      (window as any).__gptConfigured ||
      window.googletag;
      
    if (alreadyInitialized) {
      console.log('GPT blocked: Already initialized');
      return false;
    }
    
    return true;
  }

  setActiveSystem(system: 'adsense' | 'gpt'): void {
    if (this.activeSystem && this.activeSystem !== system) {
      console.warn(`Switching ad system from ${this.activeSystem} to ${system}`);
    }
    
    this.activeSystem = system;
    window.__activeAdSystem = system;
    console.log(`Active ad system set to: ${system}`);
  }

  getActiveSystem(): 'adsense' | 'gpt' | null {
    return this.activeSystem;
  }

  reset(): void {
    this.activeSystem = null;
    this.initialized = false;
    window.__activeAdSystem = null;
    console.log('Ad system manager reset');
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  markInitialized(): void {
    this.initialized = true;
    window.__adSystemInitialized = true;
  }
}

export const adSystemManager = AdSystemManager.getInstance();