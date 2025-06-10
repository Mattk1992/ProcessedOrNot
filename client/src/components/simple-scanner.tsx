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
  { barcode: "8720600618161", name: "Hak Chili sin carne schotel", description: "Ready meal" },
  { barcode: "5449000000996", name: "Coca-Cola", description: "Soft drink" },
  { barcode: "8710398500434", name: "Lays Chips Naturel 250gr", description: "Potato chips" },
];

export default function SimpleScanner({ onScan, isLoading = false }: BarcodeScannerProps) {
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
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg glow-effect floating-animation">
            <Search className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold gradient-text text-shadow mb-2">Scan Product Barcode</h2>
        <p className="text-muted-foreground">Enter barcode to analyze product processing levels</p>
      </div>
      
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <Input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Enter barcode (e.g., 3017620425400)"
                className="w-full px-5 py-6 text-xl font-mono tracking-wider pr-14 border-2 border-border/20 focus:border-primary/50 bg-card/50 backdrop-blur-sm rounded-2xl transition-all duration-200 group-hover:border-primary/30"
                disabled={isLoading}
                autoComplete="off"
                autoFocus
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <div className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors">
                  <Search className="w-5 h-5" />
                </div>
              </div>
              {barcode.length > 0 && barcode.length < 8 && (
                <p className="text-xs text-destructive mt-2 fade-in">Barcode must be at least 8 digits long</p>
              )}
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-6 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl glow-effect scale-on-hover text-lg"
              disabled={isLoading || barcode.trim().length < 8}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Analyzing Product...</span>
                </>
              ) : (
                <>
                  <Search className="w-6 h-6" />
                  <span>Analyze Product</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="glass-card rounded-3xl p-8 glow-effect">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-lg floating-animation">
              <Search className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold gradient-text mb-2">Try Sample Products</h3>
          <p className="text-muted-foreground">Click on any product below to test the analyzer</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleProducts.map((product, index) => (
            <button
              key={product.barcode}
              onClick={() => handleSampleClick(product.barcode)}
              className="group text-left p-6 glass-card rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all duration-300 scale-on-hover disabled:opacity-50 disabled:cursor-not-allowed fade-in"
              disabled={isLoading}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="font-mono text-sm bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-3 py-1 rounded-xl group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-200">
                  {product.barcode}
                </div>
                <div className="w-3 h-3 bg-gradient-to-r from-accent to-primary rounded-full pulse-subtle"></div>
              </div>
              <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors text-shadow">
                {product.name}
              </h4>
              <p className="text-sm text-muted-foreground">{product.description}</p>
              <div className="mt-4 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-all duration-200">
                <span className="font-medium">Click to analyze</span>
                <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-card/30 px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Powered by 9 global food databases</span>
        </div>
      </div>
    </div>
  );
}