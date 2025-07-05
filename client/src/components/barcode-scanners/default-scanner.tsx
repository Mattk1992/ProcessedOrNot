import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { useLanguage } from "@/contexts/LanguageContext";

interface DefaultScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isActive: boolean;
}

export function DefaultScanner({ onScan, onClose, isActive }: DefaultScannerProps) {
  const { t } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [maxZoom, setMaxZoom] = useState(3);
  const [minZoom, setMinZoom] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isActive) {
      // Add a small delay to ensure the video element is rendered
      const timer = setTimeout(() => {
        if (videoRef.current) {
          startScanning();
        } else {
          setError("Camera interface failed to load. Please try again.");
        }
      }, 100);
      
      return () => {
        clearTimeout(timer);
        cleanup();
      };
    }
    return () => {
      cleanup();
    };
  }, [isActive]);

  const startScanning = async () => {
    try {
      setError("");
      setIsScanning(true);

      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported in this browser");
      }

      // Initialize ZXing reader
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      // Enhanced camera constraints for optimal barcode scanning
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 2560, min: 1280 },
          height: { ideal: 1440, min: 720 },
          frameRate: { ideal: 60, min: 30 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Set up zoom capabilities
        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();
        
        if ('zoom' in capabilities) {
          const zoomCap = (capabilities as any).zoom;
          setMinZoom(zoomCap?.min || 1);
          setMaxZoom(zoomCap?.max || 3);
        }
      }

      // Start barcode detection
      if (codeReaderRef.current && videoRef.current) {
        codeReaderRef.current.timeBetweenDecodingAttempts = 300;
        
        codeReaderRef.current.decodeFromVideoDevice(null, videoRef.current, (result, error) => {
          if (result) {
            const barcode = result.getText();
            if (barcode && /^[0-9]{8,14}$/.test(barcode)) {
              onScan(barcode);
            }
          }
        });
      }

    } catch (err: any) {
      console.error("Camera error:", err);
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
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleZoomChange = (newZoom: number) => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      
      if ('zoom' in capabilities) {
        const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
        setZoomLevel(clampedZoom);
        
        videoTrack.applyConstraints({
          advanced: [{ zoom: clampedZoom } as any]
        }).catch(console.error);
      }
    }
  };

  const handleRetry = () => {
    cleanup();
    startScanning();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Default Barcode Scanner</h3>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-64 object-cover"
          style={{ 
            transformOrigin: 'center center',
            filter: 'contrast(1.2) brightness(1.1) saturate(0.8)',
            imageRendering: 'crisp-edges'
          }}
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

      {/* Zoom Controls */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleZoomChange(zoomLevel - 0.5)}
          disabled={zoomLevel <= minZoom}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm">Zoom: {zoomLevel.toFixed(1)}x</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleZoomChange(zoomLevel + 0.5)}
          disabled={zoomLevel >= maxZoom}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
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
        Advanced ZXing-based scanner with enhanced camera optimization. Position barcode 2-8cm from camera for best results.
      </p>
    </div>
  );
}