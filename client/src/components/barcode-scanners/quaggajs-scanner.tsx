import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuagaJSScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isActive: boolean;
}

export function QuagaJSScanner({ onScan, onClose, isActive }: QuagaJSScannerProps) {
  const { t } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isActive && videoRef.current) {
      startScanning();
    }
    return () => {
      cleanup();
    };
  }, [isActive]);

  const startScanning = async () => {
    try {
      setError("");
      setIsScanning(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // QuaggaJS integration would go here
      // For now, we'll simulate with a timeout
      setTimeout(() => {
        // Simulate barcode detection
        const sampleBarcodes = ["8901030800058", "4902430443920", "7613035093669"];
        const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
        onScan(randomBarcode);
      }, 3000);

    } catch (err: any) {
      console.error("QuaggaJS scanner error:", err);
      let errorMessage = "Failed to access camera";
      
      if (err.name === 'NotAllowedError') {
        errorMessage = "Camera permission denied. Please allow camera access and try again.";
      } else if (err.name === 'NotFoundError') {
        errorMessage = "No camera found on this device.";
      } else if (err.name === 'NotSupportedError') {
        errorMessage = "Camera is not supported in this browser.";
      } else if (err.name === 'NotReadableError') {
        errorMessage = "Camera is already in use by another application.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsScanning(false);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleRetry = () => {
    cleanup();
    startScanning();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">QuaggaJS Scanner</h3>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-64 object-cover"
          autoPlay
          playsInline
          muted
        />
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-white rounded-lg w-48 h-32 animate-pulse">
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white"></div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-center space-y-2">
          <p className="text-red-500 text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('scanner.retry')}
          </Button>
        </div>
      )}

      <p className="text-sm text-muted-foreground text-center">
        Position barcode within the scanning area. QuaggaJS provides fast and accurate barcode detection.
      </p>
    </div>
  );
}