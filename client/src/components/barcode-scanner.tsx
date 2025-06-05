import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isLoading?: boolean;
}

const sampleProducts = [
  { barcode: "3017620425400", name: "Nutella", description: "Hazelnut spread" },
  { barcode: "5449000000996", name: "Coca-Cola", description: "Soft drink" },
  { barcode: "8480000818768", name: "Organic Banana", description: "Fresh produce" },
];

export default function BarcodeScanner({ onScan, isLoading = false }: BarcodeScannerProps) {
  const [barcode, setBarcode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim() && barcode.trim().length >= 8) {
      onScan(barcode.trim());
    }
  };

  const handleSampleClick = (sampleBarcode: string) => {
    setBarcode(sampleBarcode);
    onScan(sampleBarcode);
  };

  return (
    <div className="space-y-10">
      <Card className="glass-effect border-2 border-border/20 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardContent className="pt-8 pb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Scan Product</h2>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <Input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Enter barcode (e.g., 3017620425400)"
                className="w-full px-5 py-4 text-lg font-mono tracking-wider pr-14 border-2 border-border/20 focus:border-primary/50 bg-card/50 backdrop-blur-sm rounded-2xl transition-all duration-200 group-hover:border-primary/30"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <div className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M5 12V7a1 1 0 011-1h4m-4 6v5a1 1 0 001 1h4m6-6V7a1 1 0 00-1-1h-4m4 6v5a1 1 0 01-1 1h-4"></path>
                  </svg>
                </div>
              </div>
              {barcode.length > 0 && barcode.length < 8 && (
                <p className="text-xs text-destructive mt-1 fade-in">Barcode must be at least 8 digits</p>
              )}
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading || barcode.trim().length < 8}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Product...</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl shimmer"></div>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Analyze Product</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sample Products Section */}
      <Card className="bg-gradient-to-br from-card to-muted/30 border-2 border-border/20 shadow-lg">
        <CardContent className="pt-8 pb-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">Try Sample Products</h3>
            <p className="text-muted-foreground">Click on any product below to test the scanner</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleProducts.map((product, index) => (
              <button
                key={product.barcode}
                onClick={() => handleSampleClick(product.barcode)}
                className="group text-left p-6 bg-card border-2 border-border/20 rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="font-mono text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg group-hover:bg-primary/20 transition-colors">
                    {product.barcode}
                  </div>
                  <div className="w-2 h-2 bg-accent rounded-full pulse-subtle"></div>
                </div>
                <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h4>
                <p className="text-sm text-muted-foreground">{product.description}</p>
                <div className="mt-3 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Click to scan</span>
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
