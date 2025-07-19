import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";
import BarcodeScanner from "@/components/barcode-scanner";
import ProductResults from "@/components/product-results";
import LanguageSwitcher from "@/components/language-switcher";
import HeaderDropdown from "@/components/header-dropdown";
import NutriBotChat from "@/components/nutribot-chat";
import TutorialOverlay from "@/components/tutorial-overlay";


import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
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

  const handleStartTutorial = () => {
    setShowTutorial(true);
  };

  const handleProductFound = (product: any) => {
    // Don't show nutrition popup during tutorial
    if (showTutorial) return;
    
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-effect border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-6 mobile-compact-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-3">
              <div className="scale-on-hover" data-tutorial="menu-dropdown">
                <HeaderDropdown 
                  onStartTutorial={tutorialSetting && tutorialSetting.enabled ? handleStartTutorial : undefined} 
                />
              </div>
              <div className="scale-on-hover hidden md:block">
                <LanguageSwitcher />
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold gradient-text text-shadow truncate">
                  {t('brand.title')}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate hidden md:block">{t('brand.subtitle')}</p>
              </div>
              <img 
                src={logoPath} 
                alt="ProcessedOrNot Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg floating-animation"
              />
            </div>
          </div>
        </div>
      </header>
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
            <div className="mt-4 sm:mt-8 flex justify-center">
              <div className="glass-card px-3 sm:px-6 py-2 sm:py-3 rounded-full">
                <p className="text-xs sm:text-sm mobile-text-scale text-muted-foreground">
                  {t('hero.databases')}
                </p>
              </div>
            </div>

            {/* Enhanced Features Grid */}
            <div className="mt-12 sm:mt-16 max-w-6xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 gradient-text">
                  Powerful Features for Better Nutrition
                </h3>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Discover comprehensive tools to analyze, understand, and improve your food choices
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* AI-Powered Analysis */}
                <div className="glass-card p-6 rounded-2xl hover:scale-105 transition-all duration-300 glow-effect group">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <span className="text-white font-bold text-lg">AI</span>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground">AI Analysis</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Advanced GPT-4 powered ingredient analysis with processing level scoring (0-10 scale) and detailed health insights
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Processing Score</span>
                    <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">Health Insights</span>
                  </div>
                </div>

                {/* Multi-Database Integration */}
                <div className="glass-card p-6 rounded-2xl hover:scale-105 transition-all duration-300 glow-effect group">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <span className="text-white text-xl">🌐</span>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground">14+ Databases</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Comprehensive food data from OpenFoodFacts, USDA, Health Canada, EFSA, and 10+ regional databases worldwide
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Global Coverage</span>
                    <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">Real-time Data</span>
                  </div>
                </div>

                {/* Advanced Barcode Scanning */}
                <div className="glass-card p-6 rounded-2xl hover:scale-105 transition-all duration-300 glow-effect group">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <span className="text-white text-xl">📷</span>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground">Smart Scanning</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Optimized camera controls with 2-8cm close-range scanning, autofocus, and support for 6+ barcode formats
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">Close-Range</span>
                    <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">Multi-Format</span>
                  </div>
                </div>

                {/* NutriBot Chat */}
                <div className="glass-card p-6 rounded-2xl hover:scale-105 transition-all duration-300 glow-effect group">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <span className="text-white text-xl">🤖</span>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground">NutriBot Chat</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Interactive AI nutritionist providing personalized advice, recipe suggestions, and nutrition education
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full">24/7 Support</span>
                    <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">Personalized</span>
                  </div>
                </div>

                {/* Multi-Language Support */}
                <div className="glass-card p-6 rounded-2xl hover:scale-105 transition-all duration-300 glow-effect group">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <span className="text-white text-xl">🌍</span>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground">7 Languages</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Full internationalization support: English, Spanish, French, German, Chinese, Japanese, and Dutch
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">Global</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Native UI</span>
                  </div>
                </div>

                {/* Advanced Analytics */}
                <div className="glass-card p-6 rounded-2xl hover:scale-105 transition-all duration-300 glow-effect group">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <span className="text-white text-xl">📊</span>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground">Smart Analytics</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Glycemic index calculation, nutritional breakdowns, search history tracking, and personalized insights
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full">Glycemic Index</span>
                    <span className="text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full">History</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats Section */}
              <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">14+</div>
                  <div className="text-sm text-muted-foreground">Food Databases</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">7</div>
                  <div className="text-sm text-muted-foreground">Languages</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-purple-500 mb-2">6+</div>
                  <div className="text-sm text-muted-foreground">Barcode Formats</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-2">AI</div>
                  <div className="text-sm text-muted-foreground">Powered Analysis</div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-12 sm:mt-16 text-center">
                <button
                  onClick={() => document.querySelector('[data-tutorial="camera-button"]')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:from-primary/90 hover:to-accent/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Start Scanning Products
                </button>
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

          {/* Bottom Bar */}
          <div className="border-t border-border/30 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                © 2025 ProcessedOrNot. {t('footer.rightsReserved')}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
                {t('footer.createdBy')}{" "}
                <a
                  href="https://www.linkedin.com/in/matthias-kuchenbecker/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground hover:text-primary transition-colors underline decoration-primary/30 hover:decoration-primary touch-action-manipulation"
                  aria-label={t('footer.linkedin')}
                >
                  Matthias Kuchenbecker
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {/* NutriBot Chat */}
      <NutriBotChat />

      {/* Tutorial Overlay */}
      <TutorialOverlay 
        isOpen={showTutorial}
        onClose={handleTutorialClose}
        onComplete={handleTutorialComplete}
      />

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-40 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
