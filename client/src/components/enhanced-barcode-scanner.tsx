
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

interface EnhancedBarcodeScannerProps {
  onScan: (barcode: string) => void;
  isLoading?: boolean;
}

export default function EnhancedBarcodeScanner({ onScan, isLoading = false }: EnhancedBarcodeScannerProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanQuality, setScanQuality] = useState<number>(0);
  const [detectedFormat, setDetectedFormat] = useState<string>("");
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Enhanced barcode detection with quality analysis
  const analyzeImageQuality = useCallback((imageData: ImageData) => {
    const data = imageData.data;
    let contrast = 0;
    let sharpness = 0;
    
    // Calculate contrast and sharpness for quality assessment
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      contrast += Math.abs(brightness - 128);
    }
    
    const quality = Math.min(100, (contrast / (data.length / 4)) / 1.28);
    return Math.round(quality);
  }, []);

  const startEnhancedCamera = useCallback(async () => {
    try {
      setIsScanning(true);
      
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
      const selectedDeviceId = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear')
      )?.deviceId || videoInputDevices[0].deviceId;

      // Ultra-high quality constraints for barcode scanning
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: { exact: selectedDeviceId },
          width: { ideal: 4096, min: 1920 },
          height: { ideal: 2304, min: 1080 },
          facingMode: { ideal: 'environment' },
          frameRate: { ideal: 60, min: 30 },
          focusMode: { ideal: 'continuous' },
          exposureMode: { ideal: 'manual' },
          exposureCompensation: { ideal: 0.5 },
        } as any
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setIsScanning(false);

        // Start enhanced scanning with quality analysis
        await codeReaderRef.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          async (result, error) => {
            if (result) {
              const scannedCode = result.getText();
              const format = result.getBarcodeFormat().toString();
              
              // Analyze scan quality
              if (canvasRef.current && videoRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  canvas.width = videoRef.current.videoWidth;
                  canvas.height = videoRef.current.videoHeight;
                  ctx.drawImage(videoRef.current, 0, 0);
                  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                  const quality = analyzeImageQuality(imageData);
                  setScanQuality(quality);
                }
              }
              
              setDetectedFormat(format);
              
              // Enhanced validation for multiple barcode types
              const isValidBarcode = /^[0-9A-Z\-\.\$\/\+\%\s]{1,48}$/.test(scannedCode);
              
              if (scannedCode && isValidBarcode) {
                console.log(`Enhanced scan - Format: ${format}, Quality: ${scanQuality}%`);
                stopEnhancedCamera();
                onScan(scannedCode);
              }
            }
            if (error && !(error instanceof NotFoundException)) {
              console.warn("Enhanced scanner error:", error);
            }
          }
        );
      }
    } catch (error) {
      console.error("Enhanced camera error:", error);
      setIsScanning(false);
      setIsCameraActive(false);
    }
  }, [onScan, scanQuality, analyzeImageQuality]);

  const stopEnhancedCamera = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    setIsScanning(false);
    setScanQuality(0);
    setDetectedFormat("");
    setZoomLevel(1);
  }, []);

  useEffect(() => {
    return () => {
      stopEnhancedCamera();
    };
  }, [stopEnhancedCamera]);

  return (
    <div className="space-y-4">
      {isCameraActive ? (
        <div className="relative bg-black rounded-3xl overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-96 object-cover"
            style={{ transform: `scale(${zoomLevel})` }}
            autoPlay
            playsInline
            muted
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {/* Enhanced scanning overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Scanning area with quality indicator */}
            <div className="absolute inset-4 border-2 border-primary/70 rounded-xl">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-lg text-xs">
                {detectedFormat && `Format: ${detectedFormat}`}
                {scanQuality > 0 && ` | Quality: ${scanQuality}%`}
                {!detectedFormat && !scanQuality && "Enhanced Multi-Format Scanner"}
              </div>
            </div>
            
            {/* Quality-based feedback */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-xl text-sm">
              {isScanning ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Starting enhanced scanner...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${scanQuality > 70 ? 'bg-green-400' : scanQuality > 40 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                  <span>Enhanced scanner active - Multiple formats supported</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <Button
              onClick={() => setZoomLevel(Math.min(zoomLevel + 0.5, 3))}
              disabled={zoomLevel >= 3}
              variant="outline"
              size="sm"
              className="bg-black/80 text-white border-primary/40 w-10 h-10 p-0"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setZoomLevel(Math.max(zoomLevel - 0.5, 1))}
              disabled={zoomLevel <= 1}
              variant="outline"
              size="sm"
              className="bg-black/80 text-white border-primary/40 w-10 h-10 p-0"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={startEnhancedCamera}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-4 px-6 rounded-2xl"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Starting Enhanced Scanner...
            </>
          ) : (
            <>
              <Camera className="w-5 h-5 mr-2" />
              Enhanced Barcode Scanner
            </>
          )}
        </Button>
      )}
      
      {isCameraActive && (
        <div className="flex gap-2">
          <Button
            onClick={stopEnhancedCamera}
            variant="outline"
            className="flex-1 border-2 border-destructive/20 text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4 mr-2" />
            Stop Scanner
          </Button>
          <Button
            onClick={() => setZoomLevel(1)}
            variant="outline"
            className="flex-1 border-2 border-muted-foreground/20"
            disabled={zoomLevel === 1}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Zoom
          </Button>
        </div>
      )}
      
      {/* Quality metrics display */}
      {isCameraActive && (scanQuality > 0 || detectedFormat) && (
        <div className="p-3 bg-muted/30 rounded-lg border text-sm">
          <div className="flex justify-between items-center">
            {detectedFormat && (
              <span className="font-medium">Format: {detectedFormat}</span>
            )}
            {scanQuality > 0 && (
              <span className={`font-medium ${scanQuality > 70 ? 'text-green-600' : scanQuality > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                Quality: {scanQuality}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
