import { useState } from "react";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SearchFilter from "./search-filter";

interface ManualInputProps {
  onScan: (barcode: string, filters?: { includeBrands?: string[], excludeBrands?: string[] }) => void;
  isLoading?: boolean;
}

interface SearchFilters {
  includeBrands: string[];
  excludeBrands: string[];
}

// Example searches for autocomplete
const exampleSearches = [
  { barcode: "8712100111136", name: "Product Example 1", description: "Barcode example" },
  { barcode: "3017620425035", name: "Product Example 2", description: "Barcode example" },
  { barcode: "Coca Cola", name: "Coca Cola", description: "Text search" },
  { barcode: "Greek Yogurt", name: "Greek Yogurt", description: "Text search" },
  { barcode: "Dark Chocolate", name: "Dark Chocolate", description: "Text search" },
];

export default function ManualInput({ onScan, isLoading = false }: ManualInputProps) {
  const { t } = useLanguage();
  const [barcode, setBarcode] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    includeBrands: [],
    excludeBrands: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      onScan(barcode.trim(), filters);
    }
  };

  return (
    <div className="space-y-10">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <img 
            src={logoPath} 
            alt="ProcessedOrNot Logo" 
            className="w-20 h-20 rounded-2xl shadow-lg glow-effect floating-animation"
          />
        </div>
        <h2 className="text-3xl font-bold gradient-text text-shadow mb-2">{t('scanner.header.title')}</h2>
        <p className="text-muted-foreground">{t('scanner.header.description')}</p>
      </div>
      
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          
          {/* Manual Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="relative group">
              <Input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder={t('scanner.input.placeholder')}
                data-tutorial="manual-input"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg font-mono tracking-wider pr-12 sm:pr-14 border-2 border-border/20 focus:border-primary/50 bg-card/50 backdrop-blur-sm rounded-2xl transition-all duration-200 group-hover:border-primary/30 mobile-touch-friendly"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <div className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M5 12V7a1 1 0 011-1h4m-4 6v5a1 1 0 001 1h4m6-6V7a1 1 0 00-1-1h-4m4 6v5a1 1 0 01-1 1h-4"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] mobile-touch-friendly touch-action-manipulation"
              disabled={isLoading || barcode.trim().length < 1}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span className="text-sm sm:text-base">Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">{t('scanner.button.search')}</span>
                </>
              )}
            </Button>
          </form>

          {/* Search Filters */}
          <div className="mt-6 border-t border-border/10 pt-6">
            <SearchFilter
              filters={filters}
              onFiltersChange={setFilters}
              isVisible={true}
            />
          </div>

          {/* Example Searches */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">{t('scanner.examples.title')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {exampleSearches.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setBarcode(example.barcode)}
                  className="p-3 text-left border border-border/20 hover:border-primary/30 rounded-lg transition-all duration-200 hover:bg-card/50 group"
                  disabled={isLoading}
                >
                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {example.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">
                    {example.barcode}
                  </div>
                  <div className="text-xs text-muted-foreground/70 mt-1">
                    {example.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}