import { useState } from "react";
import { Shield } from "lucide-react";
import BarcodeScanner from "@/components/barcode-scanner";
import ProductResults from "@/components/product-results";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [currentBarcode, setCurrentBarcode] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">OpenFoodFacts Scanner</h1>
              <p className="text-sm text-gray-600">Product analysis and processing detection</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <BarcodeScanner onScan={handleScan} isLoading={isScanning} />
        
        {currentBarcode && (
          <div className="mt-8">
            <ProductResults barcode={currentBarcode} />
          </div>
        )}
      </main>
    </div>
  );
}
