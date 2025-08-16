import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";
import BarcodeScanner from "@/components/barcode-scanner";
import ProductResults from "@/components/product-results";

import NutriBotChat from "@/components/nutribot-chat";
import TutorialOverlay from "@/components/tutorial-overlay";
import { VoiceSearchButton } from "@/components/voice-search-button";

import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent } from "@/lib/analytics";
import { ResponsiveAd, HeaderBannerAd } from "@/components/ads";

export default function ProductLookup() {
  const [currentBarcode, setCurrentBarcode] = useState<string>("");
  const [currentFilters, setCurrentFilters] = useState<{ includeBrands?: string[], excludeBrands?: string[] } | undefined>();
  const [isScanning, setIsScanning] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const { toast } = useToast();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();

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

  const handleProductFound = (product: any) => {
    // Don't show nutrition popup during tutorial
    if (showTutorial) return;
    
    // Track successful product lookup
    trackEvent('product_found', 'product_search', 'search_success', product.processingScore || 0);
    
    console.log('Product found:', product.productName);
  };

  const handleScan = async (input: string, filters?: { includeBrands?: string[], excludeBrands?: string[] }) => {
    setIsScanning(true);
    setCurrentBarcode(input);
    setCurrentFilters(filters);
    
    // Determine if input is barcode or text for appropriate messaging
    const isNumeric = /^[0-9\s-]+$/.test(input.replace(/\s/g, ''));
    
    if (isNumeric) {
      toast({
        title: "Scanning Barcode",
        description: "Searching product databases...",
      });
    } else {
      const filterMsg = filters && (filters.includeBrands?.length || filters.excludeBrands?.length) 
        ? " with brand filters applied" 
        : "";
      toast({
        title: "Searching Product",
        description: `Finding product information and analyzing ingredients${filterMsg}...`,
      });
    }

    // The ProductResults component will handle the actual loading
    setTimeout(() => setIsScanning(false), 500);
  };

  return (
    <div className="min-h-screen">{/* Content with sidebar navigation */}
      {/* Hero Section */}
      <section className="relative overflow-hidden py-8 sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-16 sm:w-32 h-16 sm:h-32 bg-primary/10 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute bottom-1/4 right-1/4 w-20 sm:w-40 h-20 sm:h-40 bg-accent/10 rounded-full blur-3xl floating-animation" style={{animationDelay: '1s'}}></div>
        <div className="max-w-6xl mx-auto px-4 mobile-scanner-container">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-6xl mobile-hero-text font-bold text-foreground mb-4 sm:mb-6 fade-in text-shadow">
              {t('hero.title.part1')}
              <span className="gradient-text block mt-1 sm:mt-2">{t('hero.title.part2')}</span>
            </h2>
            <p className="text-base sm:text-xl md:text-2xl mobile-hero-subtitle text-muted-foreground max-w-3xl mx-auto fade-in leading-relaxed px-2">
              {t('hero.description')}
            </p>
            <div className="mt-4 sm:mt-8 flex justify-center gap-3 flex-wrap max-w-4xl mx-auto">
              <div className="glass-card px-3 sm:px-6 py-2 sm:py-3 rounded-full">
                <p className="text-xs sm:text-sm mobile-text-scale text-muted-foreground">
                  {t('hero.databases')}
                </p>
              </div>
              <div className="glass-card px-3 sm:px-6 py-2 sm:py-3 rounded-full">
                <p className="text-xs sm:text-sm mobile-text-scale text-muted-foreground">
                  🤖 AI-Powered Analysis & NutriBot Chat
                </p>
              </div>
              <div className="glass-card px-3 sm:px-6 py-2 sm:py-3 rounded-full">
                <p className="text-xs sm:text-sm mobile-text-scale text-muted-foreground">
                  ⚡ Instant Barcode Scanning
                </p>
              </div>
              <div className="glass-card px-3 sm:px-6 py-2 sm:py-3 rounded-full">
                <p className="text-xs sm:text-sm mobile-text-scale text-muted-foreground">
                  🎯 Processing Score 0-10
                </p>
              </div>
              <div className="glass-card px-3 sm:px-6 py-2 sm:py-3 rounded-full">
                <p className="text-xs sm:text-sm mobile-text-scale text-muted-foreground">
                  🌍 7 Languages Support
                </p>
              </div>
              <div className="glass-card px-3 sm:px-6 py-2 sm:py-3 rounded-full">
                <p className="text-xs sm:text-sm mobile-text-scale text-muted-foreground">
                  📊 Glycemic Index Calculator
                </p>
              </div>
              <div className="glass-card px-3 sm:px-6 py-2 sm:py-3 rounded-full">
                <p className="text-xs sm:text-sm mobile-text-scale text-muted-foreground">
                  🎙️ Voice Search Enabled
                </p>
              </div>
              <div className="glass-card px-3 sm:px-6 py-2 sm:py-3 rounded-full">
                <p className="text-xs sm:text-sm mobile-text-scale text-muted-foreground">
                  🔒 Enterprise-Grade Security
                </p>
              </div>
            </div>

            {/* Enhanced Features Grid */}
            <div className="mt-8 sm:mt-12 lg:mt-16 max-w-6xl mx-auto">
              <div className="text-center mb-6 sm:mb-8 lg:mb-12">
                <h3 className="mobile-subheading-scale sm:text-3xl font-bold text-foreground mb-3 sm:mb-4 gradient-text px-4">
                  Powerful Features for Better Nutrition
                </h3>
                <p className="mobile-text-scale sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
                  Discover comprehensive tools to analyze, understand, and improve your food choices
                </p>
                
                
              </div>



            </div>

          </div>
        </div>
      </section>
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-8 sm:pb-12">
        <div className="slide-up">
          <BarcodeScanner onScan={handleScan} isLoading={isScanning} />
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
                    onClick={() => window.location.href = '/register'}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mobile-touch-friendly touch-action-manipulation text-sm sm:text-base"
                  >
                    {t('home.cta.createAccount')}
                  </button>
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-foreground font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mobile-touch-friendly touch-action-manipulation text-sm sm:text-base"
                  >
                    {t('home.cta.signIn')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      

      
      {/* Footer */}
      <footer className="hidden md:block border-t border-border/50 mt-8 sm:mt-16 bg-gradient-to-r from-background/80 to-background/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About Section */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <img 
                  src={logoPath} 
                  alt="ProcessedOrNot Logo" 
                  className="w-8 h-8 rounded-lg mr-2"
                />
                <h3 className="text-lg font-semibold gradient-text">ProcessedOrNot</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('footer.description')}
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h4 className="text-sm font-semibold text-foreground mb-4">{t('footer.quickLinks')}</h4>
              <div className="space-y-2">
                <a href="/register" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.createAccount')}
                </a>
                <a href="/login" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.signIn')}
                </a>
                <a href="/admin" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.admin')}
                </a>
              </div>
            </div>

            {/* Technology */}
            <div className="text-center md:text-right">
              <h4 className="text-sm font-semibold text-foreground mb-4">{t('footer.poweredBy')}</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center md:justify-end">
                  <span className="mr-2">🤖</span>
                  <span>OpenAI GPT-4</span>
                </div>
                <div className="flex items-center justify-center md:justify-end">
                  <span className="mr-2">🍎</span>
                  <span>OpenFoodFacts</span>
                </div>
                <div className="flex items-center justify-center md:justify-end">
                  <span className="mr-2">🔍</span>
                  <span>14+ Food Databases</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-border/30 pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              © 2024 ProcessedOrNot. {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isVisible={showTutorial}
        onComplete={handleTutorialComplete}
        onClose={handleTutorialClose}
        onDisable={handleTutorialDisable}
        onStartTutorial={handleStartTutorial}
      />

      {/* Chat Integration */}
      <div className="fixed bottom-4 right-4 z-50">
        <NutriBotChat 
          onStartTutorial={user?.username === 'Admin' ? handleStartTutorial : undefined}
        />
      </div>
    </div>
  );
}