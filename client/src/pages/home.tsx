import { useState } from "react";
import { Shield } from "lucide-react";
import BarcodeScanner from "@/components/debug-camera";
import ProductResults from "@/components/product-results";
import LanguageSwitcher from "@/components/language-switcher";
import ThemeToggle from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const [currentBarcode, setCurrentBarcode] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleScan = async (barcode: string) => {
    if (!barcode.trim()) {
      toast({
        title: "Invalid Barcode",
        description: "Please enter a valid barcode",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setCurrentBarcode(barcode);
    
    // Show success message
    toast({
      title: "Analyzing Product",
      description: "Fetching product data and analyzing ingredients...",
    });

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
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg glow-effect floating-animation">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text text-shadow">
                  {t('home.title')}
                </h1>
                <p className="text-sm text-muted-foreground">{t('home.subtitle')}</p>
              </div>
            </div>
            <div className="scale-on-hover">
              <LanguageSwitcher />
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
              Discover How Processed
              <span className="gradient-text block mt-2">Your Food Really Is</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto fade-in leading-relaxed">
              Scan any barcode to get instant AI analysis of processing levels, ingredients, and nutritional insights
            </p>
            <div className="mt-8 flex justify-center">
              <div className="glass-card px-6 py-3 rounded-full">
                <p className="text-sm text-muted-foreground">
                  Powered by <span className="gradient-text font-medium">9 Global Databases</span>
                </p>
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

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            Created by{" "}
            <a
              href="https://www.linkedin.com/in/matthias-kuchenbecker/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors underline decoration-primary/30 hover:decoration-primary"
            >
              Matthias Kuchenbecker
            </a>
          </div>
        </div>
      </footer>

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-40 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
