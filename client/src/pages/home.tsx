import { useState } from "react";
import { ScanLine } from "lucide-react";
import BarcodeScanner from "@/components/barcode-scanner";
import ProgressiveProductResults from "@/components/progressive-product-results";
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
    if (barcode.length < 8) {
      toast({
        title: "Invalid Barcode",
        description: "Barcode must be at least 8 digits long",
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
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                <ScanLine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t('home.title')}
                </h1>
                <p className="text-sm text-muted-foreground">{t('home.subtitle')}</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent"></div>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 fade-in">
              Discover How Processed
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Your Food Really Is</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto fade-in">
              Scan any barcode to get instant AI analysis of processing levels, ingredients, and nutritional insights
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-12">
        <div className="slide-up">
          <BarcodeScanner onScan={handleScan} isLoading={isScanning} />
        </div>
        
        {currentBarcode && (
          <div className="mt-12 slide-up">
            <ProgressiveProductResults barcode={currentBarcode} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
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
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Theme:</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </footer>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-40 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
