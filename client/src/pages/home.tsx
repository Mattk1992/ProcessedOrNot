import { useState } from "react";
import { useLocation } from "wouter";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";
import BarcodeScanner from "@/components/barcode-scanner";
import ProductResults from "@/components/product-results";
import LanguageSwitcher from "@/components/language-switcher";
import HeaderDropdown from "@/components/header-dropdown";
import NutriBotChat from "@/components/nutribot-chat";

import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const [currentBarcode, setCurrentBarcode] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [location, setLocation] = useLocation();

  const { toast } = useToast();
  const { t } = useLanguage();

  const handleScan = async (input: string) => {
    setIsScanning(true);
    setCurrentBarcode(input);
    
    // Determine if input is barcode or text for appropriate messaging
    const isNumeric = /^[0-9\s-]+$/.test(input.replace(/\s/g, ''));
    
    if (isNumeric) {
      toast({
        title: "Scanning Barcode",
        description: "Searching product databases...",
      });
    } else {
      toast({
        title: "Searching Product",
        description: "Finding product information and analyzing ingredients...",
      });
    }

    // The ProductResults component will handle the actual loading
    setTimeout(() => setIsScanning(false), 500);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-effect border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={logoPath} 
                alt="ProcessedOrNot Logo" 
                className="w-12 h-12 rounded-xl shadow-lg floating-animation"
              />
              <div>
                <h1 className="text-2xl font-bold gradient-text text-shadow">
                  {t('brand.title')}
                </h1>
                <p className="text-sm text-muted-foreground">{t('brand.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="scale-on-hover">
                <LanguageSwitcher />
              </div>
              <div className="scale-on-hover">
                <HeaderDropdown />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent/10 rounded-full blur-3xl floating-animation" style={{animationDelay: '1s'}}></div>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 fade-in text-shadow">
              {t('hero.title.part1')}
              <span className="gradient-text block mt-2">{t('hero.title.part2')}</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto fade-in leading-relaxed">
              {t('hero.description')}
            </p>
            <div className="mt-8 flex justify-center">
              <div className="glass-card px-6 py-3 rounded-full">
                <p className="text-sm text-muted-foreground">
                  {t('hero.databases')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="relative py-16 mt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20"></div>
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-blue-300/20 dark:bg-blue-600/20 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-purple-300/20 dark:bg-purple-600/20 rounded-full blur-3xl floating-animation" style={{animationDelay: '1.5s'}}></div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="glass-card p-8 md:p-12 rounded-3xl morphing-border glow-effect">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 gradient-text">
              Unlock Your Full Nutrition Journey
            </h3>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Register or log in now to unlock the scanner's full potential and discover all the amazing features and benefits waiting for you!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => setLocation('/register')}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-5 h-5 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="relative z-10">Create Account</span>
              </button>
              
              <span className="text-muted-foreground">or</span>
              
              <button 
                onClick={() => setLocation('/login')}
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-foreground bg-white/50 dark:bg-gray-800/50 border border-border/50 rounded-2xl shadow-lg hover:shadow-xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300 ease-out"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </button>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-foreground mb-1">Personalized Analysis</h4>
                <p className="text-sm text-muted-foreground">Custom nutrition insights based on your preferences</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-foreground mb-1">Save Your Scans</h4>
                <p className="text-sm text-muted-foreground">Track your nutrition journey over time</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-foreground mb-1">Share Results</h4>
                <p className="text-sm text-muted-foreground">Share your discoveries with friends and family</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-12">
        <div className="slide-up">
          <div className="glass-card p-8 rounded-3xl morphing-border glow-effect">
            <BarcodeScanner onScan={handleScan} isLoading={isScanning} />
          </div>
        </div>

        
        {currentBarcode && (
          <div className="mt-12 slide-up">
            <div className="gradient-card rounded-3xl p-1 glow-effect">
              <div className="bg-background rounded-3xl p-6">
                <ProductResults barcode={currentBarcode} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Call-to-Action Section */}
      <section className="relative py-16 mt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20"></div>
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-blue-300/20 dark:bg-blue-600/20 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-purple-300/20 dark:bg-purple-600/20 rounded-full blur-3xl floating-animation" style={{animationDelay: '1.5s'}}></div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="glass-card p-8 md:p-12 rounded-3xl morphing-border glow-effect">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 gradient-text">
              Unlock Your Full Nutrition Journey
            </h3>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Register or log in now to unlock the scanner's full potential and discover all the amazing features and benefits waiting for you!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => setLocation('/register')}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-5 h-5 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="relative z-10">Create Account</span>
              </button>
              
              <span className="text-muted-foreground">or</span>
              
              <button 
                onClick={() => setLocation('/login')}
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-foreground bg-white/50 dark:bg-gray-800/50 border border-border/50 rounded-2xl shadow-lg hover:shadow-xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300 ease-out"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </button>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-foreground mb-1">Personalized Analysis</h4>
                <p className="text-sm text-muted-foreground">Custom nutrition insights based on your preferences</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-foreground mb-1">Save Your Scans</h4>
                <p className="text-sm text-muted-foreground">Track your nutrition journey over time</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-foreground mb-1">Share Results</h4>
                <p className="text-sm text-muted-foreground">Share your discoveries with friends and family</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            {t('footer.createdBy')}{" "}
            <a
              href="https://www.linkedin.com/in/matthias-kuchenbecker/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors underline decoration-primary/30 hover:decoration-primary"
              aria-label={t('footer.linkedin')}
            >
              Matthias Kuchenbecker
            </a>
          </div>
        </div>
      </footer>

      {/* NutriBot Chat */}
      <NutriBotChat />

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-40 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
