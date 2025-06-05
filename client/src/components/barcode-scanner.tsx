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
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Scan Product</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Enter barcode (e.g., 3017620425400)"
                className="w-full px-4 py-3 text-lg font-mono tracking-wider pr-12"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M5 12V7a1 1 0 011-1h4m-4 6v5a1 1 0 001 1h4m6-6V7a1 1 0 00-1-1h-4m4 6v5a1 1 0 01-1 1h-4"></path>
                </svg>
              </div>
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              disabled={isLoading || barcode.trim().length < 8}
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

      {/* Sample Products Section */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Try Sample Products</h3>
        <p className="text-sm text-gray-600 mb-4">Click on any barcode below to test the scanner:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sampleProducts.map((product) => (
            <button
              key={product.barcode}
              onClick={() => handleSampleClick(product.barcode)}
              className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
              disabled={isLoading}
            >
              <div className="font-mono text-sm text-blue-600 mb-1">{product.barcode}</div>
              <div className="font-medium text-gray-900">{product.name}</div>
              <div className="text-sm text-gray-600">{product.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
