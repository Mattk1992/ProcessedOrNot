import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/library";

interface FileUploadScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isActive: boolean;
}

export function FileUploadScanner({ onScan, onClose, isActive }: FileUploadScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [preview, setPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError("");
      setIsProcessing(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      // Initialize ZXing reader
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      // Scan the image
      const result = await codeReaderRef.current.decodeFromImageElement(
        await createImageElement(file)
      );

      if (result) {
        const barcode = result.getText();
        if (barcode && /^[0-9]{8,14}$/.test(barcode)) {
          onScan(barcode);
        } else {
          setError("No valid barcode found in the image. Please try a different image.");
        }
      }
    } catch (err: any) {
      console.error("File scanning error:", err);
      setError("Failed to scan barcode from image. Please try a different image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const createImageElement = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const clearPreview = () => {
    setPreview("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">File Upload Scanner</h3>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Uploaded barcode image"
              className="w-full h-64 object-contain bg-gray-100 rounded-lg"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={clearPreview}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              Upload an image containing a barcode
            </p>
            <Button
              onClick={handleUploadClick}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isProcessing ? "Processing..." : "Choose Image"}
            </Button>
          </div>
        )}

        {error && (
          <div className="text-center space-y-2">
            <p className="text-red-500 text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={clearPreview}>
              Try Again
            </Button>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Upload any image containing a barcode for scanning. Supports JPG, PNG, and other common image formats.
      </p>
    </div>
  );
}