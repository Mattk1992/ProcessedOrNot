import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749336369166.png";

interface ProductSearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const sampleProducts = [
  { query: "8720600618161", name: "Hak Chili sin carne schotel", description: "Barcode lookup" },
  { query: "Coca Cola", name: "Coca-Cola", description: "Text search" },
  { query: "Greek yogurt", name: "Greek Yogurt", description: "Text search" },
];

export default function ProductSearch({ onSearch, isLoading = false }: ProductSearchProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleSampleClick = (sampleQuery: string) => {
    setQuery(sampleQuery);
    onSearch(sampleQuery);
  };

  return (
    <div className="space-y-10">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <img 
            src={logoPath}
            alt="ProcessedOrNot Logo"
            className="w-16 h-16 rounded-2xl shadow-lg glow-effect floating-animation"
          />
        </div>
        <h2 className="text-3xl font-bold gradient-text text-shadow mb-2">Product Analyzer</h2>
        <p className="text-muted-foreground">Search by barcode or product name</p>
      </div>
      
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter barcode or product name (e.g., 3017620425400 or 'Coca Cola')"
                className="w-full px-5 py-4 text-lg font-mono tracking-wider pr-14 border-2 border-border/20 focus:border-primary/50 bg-card/50 backdrop-blur-sm rounded-2xl transition-all duration-200 group-hover:border-primary/30"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <div className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors">
                  <Search className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl glow-effect scale-on-hover"
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Product...</span>
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

      <div className="glass-card rounded-3xl p-8 glow-effect">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={logoPath}
              alt="ProcessedOrNot Logo"
              className="w-12 h-12 rounded-2xl shadow-lg floating-animation"
            />
          </div>
          <h3 className="text-2xl font-bold gradient-text mb-2">Try Sample Products</h3>
          <p className="text-muted-foreground">Click on any product below to test the analyzer</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleProducts.map((product, index) => (
            <button
              key={product.query}
              onClick={() => handleSampleClick(product.query)}
              className="group text-left p-6 glass-card rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all duration-300 scale-on-hover disabled:opacity-50 disabled:cursor-not-allowed fade-in"
              disabled={isLoading}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="font-mono text-sm bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-3 py-1 rounded-xl group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-200">
                  {product.query}
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
    </div>
  );
}