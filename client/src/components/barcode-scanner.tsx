import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, Camera, X, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { useLanguage } from "@/contexts/LanguageContext";
import SearchFilter from "./search-filter";

interface BarcodeScannerProps {
  onScan: (barcode: string, filters?: { includeBrands?: string[], excludeBrands?: string[] }) => void;
  isLoading?: boolean;
}

interface SearchFilters {
  includeBrands: string[];
  excludeBrands: string[];
}

const sampleProducts = [
  { barcode: "8720600618161", name: "Hak Chili sin carne schotel", description: "Barcode scan" },
  { barcode: "5449000000996", name: "Coca-Cola", description: "Barcode scan" },
  { barcode: "3017620425400", name: "Nutella", description: "Barcode scan" },
  { barcode: "Organic Oatmeal", name: "Organic Oatmeal", description: "Text search" },
  { barcode: "Greek Yogurt", name: "Greek Yogurt", description: "Text search" },
  { barcode: "Dark Chocolate", name: "Dark Chocolate", description: "Text search" },
];

export default function BarcodeScanner({ onScan, isLoading = false }: BarcodeScannerProps) {
  const { t } = useLanguage();
  const [location] = useLocation();
  const [barcode, setBarcode] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [maxZoom, setMaxZoom] = useState(3);
  const [minZoom, setMinZoom] = useState(1);
  const [timeoutCountdown, setTimeoutCountdown] = useState<number | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    includeBrands: [],
    excludeBrands: []
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const currentLocationRef = useRef(location);

  // Fetch camera timeout setting from public endpoint
  const { data: timeoutData } = useQuery({
    queryKey: ["/api/settings/camera-timeout"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Get timeout value from setting or use default
  const getCameraTimeout = () => {
    const timeoutSeconds = timeoutData?.timeout || 40;
    return timeoutSeconds * 1000; // Convert to milliseconds
  };

  // Check if the input is likely a text search (contains non-numeric characters)
  const isTextSearch = barcode.trim().length > 0 && !/^[0-9\s]*$/.test(barcode.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      if (isTextSearch) {
        // For text searches, include filters
        onScan(barcode.trim(), filters);
      } else {
        // For barcode searches, no filters needed
        onScan(barcode.trim());
      }
    }
  };

  const handleSampleClick = (sampleBarcode: string) => {
    setBarcode(sampleBarcode);
    const isTextSample = !/^[0-9\s]*$/.test(sampleBarcode);
    if (isTextSample) {
      onScan(sampleBarcode, filters);
    } else {
      onScan(sampleBarcode);
    }
  };

  const handleZoomIn = useCallback(async () => {
    console.log('Zoom in clicked, current zoom:', zoomLevel);
    if (zoomLevel < maxZoom) {
      const newZoom = Math.min(zoomLevel + 0.5, maxZoom);
      setZoomLevel(newZoom);
      console.log('Setting zoom to:', newZoom);
      
      // Apply CSS transform for zoom since camera constraints have limited support
      if (videoRef.current) {
        videoRef.current.style.transform = `scale(${newZoom})`;
        videoRef.current.style.transformOrigin = 'center center';
      }
      
      // Try to apply camera zoom constraint as fallback
      if (streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack && 'applyConstraints' in videoTrack) {
          try {
            await videoTrack.applyConstraints({
              advanced: [{ zoom: newZoom } as any]
            });
          } catch (error) {
            // CSS zoom will handle it if camera zoom is not supported
            console.log('Using CSS zoom as camera zoom is not supported');
          }
        }
      }
    }
  }, [zoomLevel, maxZoom]);

  const handleZoomOut = useCallback(async () => {
    console.log('Zoom out clicked, current zoom:', zoomLevel);
    if (zoomLevel > minZoom) {
      const newZoom = Math.max(zoomLevel - 0.5, minZoom);
      setZoomLevel(newZoom);
      console.log('Setting zoom to:', newZoom);
      
      // Apply CSS transform for zoom
      if (videoRef.current) {
        videoRef.current.style.transform = `scale(${newZoom})`;
        videoRef.current.style.transformOrigin = 'center center';
      }
      
      // Try to apply camera zoom constraint as fallback
      if (streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack && 'applyConstraints' in videoTrack) {
          try {
            await videoTrack.applyConstraints({
              advanced: [{ zoom: newZoom } as any]
            });
          } catch (error) {
            console.log('Using CSS zoom as camera zoom is not supported');
          }
        }
      }
    }
  }, [zoomLevel, minZoom]);

  const resetZoom = useCallback(async () => {
    console.log('Reset zoom clicked, current zoom:', zoomLevel);
    setZoomLevel(1);
    
    // Reset CSS transform
    if (videoRef.current) {
      videoRef.current.style.transform = 'scale(1)';
      videoRef.current.style.transformOrigin = 'center center';
    }
    
    // Try to reset camera zoom constraint
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack && 'applyConstraints' in videoTrack) {
        try {
          await videoTrack.applyConstraints({
            advanced: [{ zoom: 1 } as any]
          });
        } catch (error) {
          console.log('Using CSS zoom reset as camera zoom is not supported');
        }
      }
    }
  }, [zoomLevel]);

  const startCamera = useCallback(async () => {
    try {
      setCameraError("");
      setIsScanning(true);
      
      // Clear any existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported in this browser. Please try entering the barcode manually.");
      }

      // Set camera active first to render the video element
      setIsCameraActive(true);
      
      // Wait for the video element to be rendered
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const videoElement = videoRef.current;
      if (!videoElement) {
        // Reset and try again
        setIsCameraActive(false);
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsCameraActive(true);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const retryVideoElement = videoRef.current;
        if (!retryVideoElement) {
          throw new Error("Camera interface failed to load. Please refresh the page and try again.");
        }
      }

      // Initialize the code reader
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      const finalVideoElement = videoRef.current!;

      // Get camera permissions and start scanning
      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error("No camera devices found on this device.");
      }

      // Use the back camera if available (usually better for scanning)
      const selectedDeviceId = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      )?.deviceId || videoInputDevices[0].deviceId;

      setIsScanning(false);

      // Configure camera constraints for better autofocus and quality
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: { exact: selectedDeviceId },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          facingMode: { ideal: 'environment' },
        }
      };

      // Get the video stream with enhanced constraints
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        finalVideoElement.srcObject = stream;
        streamRef.current = stream;

        // Apply additional autofocus settings if supported
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && 'applyConstraints' in videoTrack) {
          try {
            // Apply enhanced camera settings for better autofocus (short-range optimized)
            const advancedConstraints: any = {
              advanced: [{
                focusMode: 'continuous',
                focusDistance: 0.1, // Optimized for short-range barcode scanning
                whiteBalanceMode: 'auto',
                exposureMode: 'auto',
                autoFocus: true,
              }]
            };
            await videoTrack.applyConstraints(advancedConstraints);
            console.log('Enhanced camera settings applied successfully');
          } catch (constraintError) {
            console.warn('Advanced camera constraints not supported:', constraintError);
          }
        }

        // Configure ZXing reader for better performance
        if (codeReaderRef.current) {
          // Set scanning delay for better performance
          codeReaderRef.current.timeBetweenDecodingAttempts = 300;
        }

        // Start decoding from the camera with enhanced scanning
        await codeReaderRef.current.decodeFromVideoDevice(
          selectedDeviceId,
          finalVideoElement,
          (result, error) => {
            if (result) {
              const scannedCode = result.getText();
              console.log("Scanned barcode:", scannedCode);
              
              // Validate barcode format before processing
              if (scannedCode && /^[0-9]{8,14}$/.test(scannedCode)) {
                stopCamera();
                onScan(scannedCode);
              } else if (scannedCode) {
                // Log invalid format but continue scanning
                console.warn("Invalid barcode format:", scannedCode);
              }
            }
            if (error && !(error instanceof NotFoundException)) {
              console.warn("Barcode scanning error:", error);
            }
          }
        );
      } catch (streamError) {
        console.warn('Enhanced camera constraints failed, using fallback:', streamError);
        
        // Configure ZXing reader for better performance (fallback)
        if (codeReaderRef.current) {
          codeReaderRef.current.timeBetweenDecodingAttempts = 300;
        }
        
        // Fallback to basic ZXing camera initialization with short-range focus
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: selectedDeviceId },
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
            facingMode: { ideal: 'environment' },
          }
        });
        
        finalVideoElement.srcObject = fallbackStream;
        streamRef.current = fallbackStream;
        
        // Try to apply short-range focus for fallback
        const fallbackVideoTrack = fallbackStream.getVideoTracks()[0];
        if (fallbackVideoTrack && 'applyConstraints' in fallbackVideoTrack) {
          try {
            await fallbackVideoTrack.applyConstraints({
              advanced: [{
                focusMode: 'continuous',
                focusDistance: 0.1, // Short-range focus for fallback
              } as any]
            });
          } catch (fallbackConstraintError) {
            console.warn('Fallback focus constraints not supported:', fallbackConstraintError);
          }
        }
        
        await codeReaderRef.current.decodeFromVideoDevice(
          selectedDeviceId,
          finalVideoElement,
          (result, error) => {
            if (result) {
              const scannedCode = result.getText();
              console.log("Scanned barcode (fallback):", scannedCode);
              
              // Validate barcode format before processing
              if (scannedCode && /^[0-9]{8,14}$/.test(scannedCode)) {
                stopCamera();
                onScan(scannedCode);
              } else if (scannedCode) {
                console.warn("Invalid barcode format (fallback):", scannedCode);
              }
            }
            if (error && !(error instanceof NotFoundException)) {
              console.warn("Barcode scanning error:", error);
            }
          }
        );
      }

      // Store stream reference and detect zoom capabilities
      const stream = finalVideoElement.srcObject as MediaStream;
      if (stream) {
        streamRef.current = stream;
        
        // Check zoom capabilities
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && 'getCapabilities' in videoTrack) {
          try {
            const capabilities = videoTrack.getCapabilities() as any;
            if (capabilities.zoom) {
              setMinZoom(capabilities.zoom.min || 1);
              setMaxZoom(capabilities.zoom.max || 3);
            }
          } catch (error) {
            console.warn('Cannot get camera capabilities:', error);
          }
        }
      }

      // Set up camera timeout with countdown
      const timeoutMs = getCameraTimeout();
      const timeoutSeconds = Math.floor(timeoutMs / 1000);
      setTimeoutCountdown(timeoutSeconds);

      // Start countdown
      countdownRef.current = setInterval(() => {
        setTimeoutCountdown(prev => {
          if (prev && prev > 1) {
            return prev - 1;
          } else {
            // Timeout reached
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
            return null;
          }
        });
      }, 1000);

      // Set main timeout to stop camera
      timeoutRef.current = setTimeout(() => {
        stopCamera();
        setCameraError(`Camera timed out after ${timeoutSeconds} seconds. Please try again or enter the barcode manually.`);
      }, timeoutMs);

    } catch (error) {
      console.error("Camera error:", error);
      setIsScanning(false);
      setIsCameraActive(false);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setCameraError("Camera permission denied. Please allow camera access in your browser settings and try again.");
        } else if (error.name === 'NotFoundError') {
          setCameraError("No camera found on this device. Please use manual barcode entry below.");
        } else if (error.name === 'NotSupportedError') {
          setCameraError("Camera is not supported in this browser. Please try a different browser or enter the barcode manually.");
        } else if (error.name === 'NotReadableError') {
          setCameraError("Camera is already in use by another application. Please close other camera apps and try again.");
        } else {
          setCameraError(error.message || "Failed to access camera. Please try manual entry below.");
        }
      } else {
        setCameraError("An unexpected error occurred while accessing the camera. Please try manual entry below.");
      }
    }
  }, [onScan]);

  const stopCamera = useCallback(() => {
    console.log('Stop camera clicked');
    try {
      // Clear timeouts first
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      
      // Stop all video tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          console.log('Stopping track:', track.kind);
          track.stop();
        });
        videoRef.current.srcObject = null;
      }
      
      // Clear stream reference and reset zoom
      streamRef.current = null;
      setZoomLevel(1);
      
      // Reset video transform
      if (videoRef.current) {
        videoRef.current.style.transform = 'scale(1)';
        videoRef.current.style.transformOrigin = 'center center';
      }
    } catch (error) {
      console.error("Error stopping camera:", error);
    } finally {
      setIsCameraActive(false);
      setIsScanning(false);
      setCameraError("");
      setTimeoutCountdown(null);
      console.log('Camera stopped successfully');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Cleanup camera when leaving the website or tab becomes hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isCameraActive) {
        stopCamera();
      }
    };

    const handleBeforeUnload = () => {
      if (isCameraActive) {
        stopCamera();
      }
    };

    const handlePageHide = () => {
      if (isCameraActive) {
        stopCamera();
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [isCameraActive, stopCamera]);

  // Cleanup camera when navigating to a different route
  useEffect(() => {
    if (currentLocationRef.current !== location && isCameraActive) {
      stopCamera();
    }
    currentLocationRef.current = location;
  }, [location, isCameraActive, stopCamera]);

  return (
    <div className="space-y-10">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <img 
            src={logoPath} 
            alt="ProcessedOrNot Logo" 
            className="w-20 h-20 rounded-2xl shadow-lg glow-effect floating-animation"
          />
        </div>
        <h2 className="text-3xl font-bold gradient-text text-shadow mb-2">{t('scanner.header.title')}</h2>
        <p className="text-muted-foreground">{t('scanner.header.description')}</p>
      </div>
      
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          
          {/* Camera Scanner Section */}
          {isCameraActive ? (
            <div className="space-y-6 mb-8">
              <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl glow-effect">
                <video
                  ref={videoRef}
                  className="w-full h-80 sm:h-80 mobile-camera-height object-cover transition-transform duration-300 ease-in-out"
                  style={{ transformOrigin: 'center center' }}
                  autoPlay
                  playsInline
                  muted
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-lg font-medium">Initializing camera...</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Enhanced scanning overlay */}
                  <div className="absolute inset-6 border-2 border-primary/60 rounded-2xl scan-line">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl glow-effect"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl glow-effect"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl glow-effect"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                    {isScanning ? "Starting camera..." : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        Scanning for barcodes...
                      </div>
                    )}
                  </div>
                  
                  {/* Zoom Controls */}
                  <div className="absolute bottom-4 right-4 mobile-zoom-controls flex flex-col gap-2">
                    <Button
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= maxZoom}
                      variant="outline"
                      size="sm"
                      className="bg-black/70 text-white border-white/30 hover:bg-black/80 w-8 h-8 sm:w-8 sm:h-8 p-0 mobile-touch-friendly touch-action-manipulation"
                    >
                      <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <div className="bg-black/70 text-white px-1 sm:px-2 py-1 rounded text-xs text-center min-w-[1.5rem] sm:min-w-[2rem]">
                      {zoomLevel.toFixed(1)}x
                    </div>
                    <Button
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= minZoom}
                      variant="outline"
                      size="sm"
                      className="bg-black/70 text-white border-white/30 hover:bg-black/80 w-8 h-8 sm:w-8 sm:h-8 p-0 mobile-touch-friendly touch-action-manipulation"
                    >
                      <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Timeout Countdown Display */}
              {timeoutCountdown !== null && timeoutCountdown > 0 && (
                <div className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Camera timeout: {timeoutCountdown}s
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="flex-1 border-2 border-destructive/20 text-destructive hover:bg-destructive/10 mobile-button-full touch-action-manipulation"
                >
                  <X className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Stop Camera</span>
                  <span className="sm:hidden">Stop</span>
                </Button>
                <Button
                  onClick={resetZoom}
                  variant="outline"
                  className="flex-1 border-2 border-muted-foreground/20 text-muted-foreground hover:bg-muted/10 mobile-button-full touch-action-manipulation"
                  disabled={zoomLevel === 1}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Reset Zoom</span>
                  <span className="sm:hidden">Reset</span>
                </Button>
                <Button
                  onClick={async () => {
                    console.log('Restart camera clicked');
                    stopCamera();
                    // Wait a moment for cleanup to complete
                    await new Promise(resolve => setTimeout(resolve, 500));
                    startCamera();
                  }}
                  variant="outline"
                  className="flex-1 border-2 border-primary/20 text-primary hover:bg-primary/10 mobile-button-full touch-action-manipulation"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Restart</span>
                  <span className="sm:hidden">Restart</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <Button
                onClick={startCamera}
                disabled={isLoading || isScanning}
                data-tutorial="camera-button"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] mb-6 mobile-touch-friendly touch-action-manipulation"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="text-sm sm:text-base">Starting Camera...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Scan with Camera</span>
                  </>
                )}
              </Button>
              
              {cameraError && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">{cameraError}</p>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/30"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">Or enter manually</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Manual Input Form */}
          {!isCameraActive && (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="relative group">
                <Input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder={t('scanner.input.placeholder')}
                  data-tutorial="manual-input"
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg font-mono tracking-wider pr-12 sm:pr-14 border-2 border-border/20 focus:border-primary/50 bg-card/50 backdrop-blur-sm rounded-2xl transition-all duration-200 group-hover:border-primary/30 mobile-touch-friendly"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <div className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M5 12V7a1 1 0 011-1h4m-4 6v5a1 1 0 001 1h4m6-6V7a1 1 0 00-1-1h-4m4 6v5a1 1 0 01-1 1h-4"></path>
                    </svg>
                  </div>
                </div>

              </div>
              
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] mobile-touch-friendly touch-action-manipulation"
                disabled={isLoading || barcode.trim().length < 1}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="text-sm sm:text-base">{t('scanner.input.analyzing')}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl shimmer"></div>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">{t('scanner.input.button')}</span>
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Search Filter - only visible for text searches */}
      <SearchFilter
        filters={filters}
        onFiltersChange={setFilters}
        isVisible={isTextSearch}
      />

      {/* Sample Products Section */}
      <Card className="bg-gradient-to-br from-card to-muted/30 border-2 border-border/20 shadow-lg">
        <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8 mobile-card-padding">
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t('scanner.samples.title')}</h3>
            <p className="text-sm sm:text-base text-muted-foreground mobile-text-scale">{t('scanner.samples.description')}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mobile-product-grid">
            {sampleProducts.map((product, index) => (
              <button
                key={product.barcode}
                onClick={() => handleSampleClick(product.barcode)}
                className="group text-left p-4 sm:p-6 bg-card border-2 border-border/20 rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mobile-touch-friendly touch-action-manipulation"
                disabled={isLoading}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`font-mono text-sm px-3 py-1 rounded-lg transition-colors ${
                    product.description === "Barcode scan" 
                      ? "bg-primary/10 text-primary group-hover:bg-primary/20" 
                      : "bg-accent/10 text-accent group-hover:bg-accent/20"
                  }`}>
                    {product.barcode}
                  </div>
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                    product.description === "Barcode scan" ? "bg-primary/20" : "bg-accent/20"
                  }`}>
                    {product.description === "Barcode scan" ? (
                      <div className="w-1 h-1 bg-primary rounded-full"></div>
                    ) : (
                      <div className="w-1 h-1 bg-accent rounded-full"></div>
                    )}
                  </div>
                </div>
                <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h4>
                <p className="text-sm text-muted-foreground">{t(`scanner.samples.${product.description === "Barcode scan" ? "barcode" : "text"}`)}</p>
                <div className="mt-3 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>{t('scanner.samples.click')}</span>
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
