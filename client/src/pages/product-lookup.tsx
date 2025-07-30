import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";
import BarcodeScanner from "@/components/barcode-scanner";
import ProductResults from "@/components/product-results";
import LanguageSwitcher from "@/components/language-switcher";
import HeaderDropdown from "@/components/header-dropdown";
import NutriBotChat from "@/components/nutribot-chat";
import TutorialOverlay from "@/components/tutorial-overlay";
import { VoiceSearchButton } from "@/components/voice-search-button";

import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent } from "@/lib/analytics";

export default function ProductLookup() {
  const [currentBarcode, setCurrentBarcode] = useState<string>("");
  const [currentFilters, setCurrentFilters] = useState<{ includeBrands?: string[], excludeBrands?: string[] } | undefined>();
  const [isScanning, setIsScanning] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const { toast } = useToast();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  // Fetch tutorial overlay setting from admin
  const { data: tutorialSetting } = useQuery<{ enabled: boolean; source: string }>({
    queryKey: ["/api/settings/tutorial-overlay"],
  });

  // Check if this is a first-time user and tutorial is enabled by admin
  useEffect(() => {
    if (tutorialSetting && tutorialSetting.enabled === false) {
      return; // Tutorial disabled by admin
    }

    const hasSeenTutorial = localStorage.getItem('processedornot-tutorial-completed');
    const tutorialDisabled = localStorage.getItem('processedornot-tutorial-disabled');
    
    if (!hasSeenTutorial && !tutorialDisabled && tutorialSetting && tutorialSetting.enabled) {
      // Show tutorial after a short delay to let the page load
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [tutorialSetting]);

  const handleTutorialComplete = () => {
    localStorage.setItem('processedornot-tutorial-completed', 'true');
    setShowTutorial(false);
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
  };

  const handleTutorialDisable = () => {
    localStorage.setItem('processedornot-tutorial-disabled', 'true');
    setShowTutorial(false);
  };

  const handleStartTutorial = () => {
    setShowTutorial(true);
  };

  const handleBarcodeDetected = (barcode: string) => {
    setCurrentBarcode(barcode);
    setIsScanning(false);
    trackEvent('barcode_detected', 'scanner', 'camera');
  };

  const handleManualSubmit = (barcode: string, filters?: { includeBrands?: string[], excludeBrands?: string[] }) => {
    setCurrentBarcode(barcode);
    setCurrentFilters(filters);
    setIsScanning(false);
    trackEvent('barcode_manual_entry', 'scanner', 'text_input');
  };

  const handleVoiceSearch = (text: string) => {
    setCurrentBarcode(text);
    setCurrentFilters(undefined);
    setIsScanning(false);
    trackEvent('voice_search', 'scanner', 'voice_input');
  };

  const handleProductFound = (productData: any) => {
    // Track successful product lookup
    trackEvent('product_found', 'search', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <header className="backdrop-blur-md bg-background/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img 
                src={logoPath} 
                alt="ProcessedOrNot Scanner" 
                className="w-10 h-10 rounded-full"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold gradient-text">ProcessedOrNot</h1>
                <p className="text-xs text-muted-foreground hidden md:block">Product Lookup & Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <HeaderDropdown onStartTutorial={handleStartTutorial} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Key Feature Highlights */}
        <div className="text-center mb-8 sm:mb-12 fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 gradient-text">
            {t('home.title')}
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
            {t('home.subtitle')}
          </p>
          
          {/* Attractive Glass-Card Badges */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 max-w-5xl mx-auto">
            {[
              { emoji: "🧠", text: t('home.badges.aiAnalysis') },
              { emoji: "📱", text: t('home.badges.instantScanning') },
              { emoji: "📊", text: t('home.badges.processingScores') },
              { emoji: "🌍", text: t('home.badges.multiLanguage') },
              { emoji: "🎤", text: t('home.badges.voiceSearch') },
              { emoji: "🧮", text: t('home.badges.glycemicCalculator') },
              { emoji: "🔒", text: t('home.badges.enterpriseSecurity') },
              { emoji: "🏆", text: t('home.badges.globalCoverage') }
            ].map((badge, index) => (
              <div 
                key={index}
                className="glass-card px-4 py-2 rounded-full glow-effect"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-2 text-sm sm:text-base">
                  <span className="text-lg">{badge.emoji}</span>
                  <span className="font-medium text-foreground">{badge.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Camera Scanner Section */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="gradient-card rounded-3xl p-1 glow-effect">
              <div className="bg-background rounded-3xl p-4 sm:p-6">
                <BarcodeScanner
                  onScan={handleManualSubmit}
                  isLoading={isScanning}
                />
                
                {/* Voice Search Integration */}
                <div className="mt-4 flex justify-center">
                  <VoiceSearchButton 
                    onVoiceResult={handleVoiceSearch}
                    disabled={isScanning}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* NutriBot Chat Sidebar */}
          <div className="lg:col-span-1">
            <div className="gradient-card rounded-3xl p-1 glow-effect h-fit">
              <div className="bg-background rounded-3xl">
                <NutriBotChat />
              </div>
            </div>
          </div>
        </div>

        
        {currentBarcode && (
          <div className="mt-8 sm:mt-12 slide-up">
            <div className="gradient-card rounded-3xl p-1 glow-effect">
              <div className="bg-background rounded-3xl p-4 sm:p-6">
                <ProductResults 
                  barcode={currentBarcode} 
                  filters={currentFilters} 
                  onProductFound={handleProductFound}
                />
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Login/Register Call-to-Action - Only show when not authenticated */}
      {!isAuthenticated && (
        <section className="max-w-6xl mx-auto px-4 pb-8 sm:pb-12">
          <div className="mt-12 fade-in" style={{animationDelay: '0.5s'}}>
            <div className="glass-card p-8 rounded-3xl max-w-2xl mx-auto glow-effect">
              <div className="text-center">
                <h3 className="md:text-2xl text-foreground mb-4 gradient-text font-semibold text-[21px]">{t('home.cta.title')}</h3>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full sm:w-auto">
                  <button
                    onClick={() => window.location.href = '/auth'}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                  >
                    {t('home.cta.signUp')}
                  </button>
                  <button
                    onClick={() => window.location.href = '/auth'}
                    className="border-2 border-primary/30 text-foreground hover:bg-primary/10 font-semibold py-3 px-6 rounded-full transition-all duration-300 w-full sm:w-auto backdrop-blur-sm"
                  >
                    {t('home.cta.signIn')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tutorial Overlay */}
      {showTutorial && (
        <TutorialOverlay
          isOpen={showTutorial}
          onComplete={handleTutorialComplete}
          onClose={handleTutorialClose}
        />
      )}
    </div>
  );
}