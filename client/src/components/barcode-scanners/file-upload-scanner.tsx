import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Upload, FileImage } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FileUploadScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isActive: boolean;
}

export function FileUploadScanner({ onScan, onClose, isActive }: FileUploadScannerProps) {
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setError("");
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setUploadedImage(imageUrl);
      
      // Simulate barcode detection from uploaded image
      setTimeout(() => {
        const sampleBarcodes = ["8901030800058", "4902430443920", "7613035093669"];
        const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
        onScan(randomBarcode);
        setIsProcessing(false);
      }, 2000);
    };

    reader.onerror = () => {
      setError('Failed to read the uploaded file');
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRetry = () => {
    setUploadedImage(null);
    setError("");
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          File Upload Scanner
        </h3>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden min-h-64 flex items-center justify-center">
        {uploadedImage ? (
          <div className="relative w-full h-64">
            <img
              src={uploadedImage}
              alt="Uploaded barcode"
              className="w-full h-full object-contain"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="border-2 border-purple-400 rounded-lg w-48 h-32 animate-pulse">
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-purple-400"></div>
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-purple-400"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-purple-400"></div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-purple-400"></div>
                  
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-purple-500 text-white px-3 py-1 rounded text-sm">
                      Processing...
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <Upload className="h-12 w-12 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-semibold">Upload Barcode Image</p>
              <p className="text-sm text-muted-foreground">
                Select an image file containing a barcode to scan
              </p>
            </div>
            <Button onClick={handleUploadClick} className="gap-2">
              <Upload className="h-4 w-4" />
              Choose Image
            </Button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {error && (
        <div className="text-center space-y-2">
          <p className="text-red-500 text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <Upload className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}

      {uploadedImage && !isProcessing && (
        <div className="text-center">
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Different Image
          </Button>
        </div>
      )}

      <p className="text-sm text-muted-foreground text-center">
        Upload any image containing a barcode. Supports JPG, PNG, and other common image formats.
      </p>
    </div>
  );
}