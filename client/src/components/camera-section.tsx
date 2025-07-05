import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, X, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { useLanguage } from "@/contexts/LanguageContext";

interface CameraSectionProps {
  onScan: (barcode: string) => void;
  isLoading?: boolean;
}

export default function CameraSection({ onScan, isLoading = false }: CameraSectionProps) {
  const { t } = useLanguage();
  const [location] = useLocation();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [maxZoom, setMaxZoom] = useState(3);
  const [minZoom, setMinZoom] = useState(1);
  const [timeoutCountdown, setTimeoutCountdown] = useState<number | null>(null);
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
    const timeoutSeconds = (timeoutData as any)?.timeout || 40;
    return timeoutSeconds * 1000; // Convert to milliseconds
  };

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (zoomLevel < maxZoom && isCameraActive) {
      const newZoom = Math.min(zoomLevel + 0.5, maxZoom);
      setZoomLevel(newZoom);
      
      if (videoRef.current) {
        videoRef.current.style.transform = `scale(${newZoom})`;
        videoRef.current.style.transformOrigin = 'center center';
      }
    }
  }, [zoomLevel, maxZoom, isCameraActive]);

  const handleZoomOut = useCallback(() => {
    if (zoomLevel > minZoom && isCameraActive) {
      const newZoom = Math.max(zoomLevel - 0.5, minZoom);
      setZoomLevel(newZoom);
      
      if (videoRef.current) {
        videoRef.current.style.transform = `scale(${newZoom})`;
        videoRef.current.style.transformOrigin = 'center center';
      }
    }
  }, [zoomLevel, minZoom, isCameraActive]);

  const resetZoom = useCallback(async () => {
    if (!isCameraActive) {
      console.log('Reset zoom disabled - camera not active');
      return;
    }
    
    setZoomLevel(1);
    console.log('Reset zoom to 1');
    
    if (videoRef.current) {
      videoRef.current.style.transform = 'scale(1)';
      videoRef.current.style.transformOrigin = 'center center';
      console.log('Video transform reset');
    }
    
    // Try to reset camera zoom constraint (non-blocking)
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack && 'applyConstraints' in videoTrack) {
        try {
          await videoTrack.applyConstraints({
            advanced: [{ zoom: 1 } as any]
          });
          console.log('Reset camera zoom constraint to 1');
        } catch (error) {
          console.log('Using CSS zoom reset as camera zoom is not supported');
        }
      }
    }
  }, [zoomLevel, isCameraActive]);

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

      // Optimized camera constraints for short-range barcode scanning
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: { exact: selectedDeviceId },
          width: { ideal: 2560, min: 1920 },
          height: { ideal: 1440, min: 1080 },
          facingMode: { ideal: 'environment' },
          frameRate: { ideal: 60, min: 30 },
          aspectRatio: { ideal: 16/9 },
        }
      };

      // Get the media stream with advanced constraints
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();
        
        // Apply advanced camera settings for short-range scanning
        if ((capabilities as any).focusMode && (capabilities as any).focusMode.includes('continuous')) {
          await videoTrack.applyConstraints({
            advanced: [{ focusMode: 'continuous' }] as any
          });
        }
        
        // Set zoom capabilities
        if ((capabilities as any).zoom) {
          setMaxZoom((capabilities as any).zoom.max || 3);
          setMinZoom((capabilities as any).zoom.min || 1);
        }
        
        finalVideoElement.srcObject = stream;
        
      } catch (constraintError) {
        console.warn('Advanced camera constraints not supported:', constraintError);
        
        // Fallback to basic constraints
        const fallbackConstraints: MediaStreamConstraints = {
          video: {
            deviceId: { exact: selectedDeviceId },
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            facingMode: { ideal: 'environment' },
            frameRate: { ideal: 30, min: 15 },
          }
        };
        
        const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        streamRef.current = fallbackStream;
        finalVideoElement.srcObject = fallbackStream;
      }

      // Start barcode detection
      await codeReaderRef.current.decodeFromVideoDevice(selectedDeviceId, finalVideoElement, (result, error) => {
        if (result) {
          const scannedBarcode = result.getText();
          console.log('Barcode scanned:', scannedBarcode);
          
          // Validate barcode format (8-14 digits)
          if (/^\d{8,14}$/.test(scannedBarcode)) {
            onScan(scannedBarcode);
            stopCamera();
          } else {
            console.log('Invalid barcode format:', scannedBarcode);
          }
        }
        
        if (error && !(error instanceof NotFoundException)) {
          console.warn('Barcode scanning error:', error);
        }
      });

      // Set up camera timeout
      const timeoutMs = getCameraTimeout();
      let countdown = Math.floor(timeoutMs / 1000);
      
      // Start countdown timer
      const countdownInterval = setInterval(() => {
        countdown--;
        setTimeoutCountdown(countdown);
        
        if (countdown <= 0) {
          clearInterval(countdownInterval);
          setTimeoutCountdown(null);
        }
      }, 1000);
      
      countdownRef.current = countdownInterval;
      
      // Set up timeout to stop camera
      timeoutRef.current = setTimeout(() => {
        console.log('Camera timeout reached, stopping camera');
        stopCamera();
      }, timeoutMs);
      
    } catch (error) {
      console.error('Error starting camera:', error);
      setCameraError(error instanceof Error ? error.message : "Failed to access camera. Please check your permissions and try again.");
      setIsCameraActive(false);
      setIsScanning(false);
    }
  }, [onScan, getCameraTimeout]);

  const stopCamera = useCallback(() => {
    console.log('Stop camera clicked');
    
    // Clear timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      console.log('Cleared timeout');
    }
    
    // Clear countdown if it exists
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
      console.log('Cleared countdown');
    }
    
    // Reset the code reader
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
        console.log('Code reader reset');
      } catch (error) {
        console.warn('Error resetting code reader:', error);
      }
    }
    
    // Stop all video tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
      console.log('Stream reference cleared, zoom reset');
    }
    
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.style.transform = 'scale(1)';
      videoRef.current.style.transformOrigin = 'center center';
      console.log('Video transform reset');
    }
    
    // Reset states
    setIsCameraActive(false);
    setIsScanning(false);
    setZoomLevel(1);
    setTimeoutCountdown(null);
    setCameraError("");
    
    console.log('Camera stopped successfully');
  }, []);

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

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

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

  if (!isCameraActive) {
    return (
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
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl glow-effect short-range-scanner">
        <video
          ref={videoRef}
          className="w-full h-96 sm:h-96 mobile-camera-height object-cover transition-transform duration-200 ease-in-out short-range-video"
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
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <div className="text-white text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-lg font-medium">Optimizing camera for close-range scanning...</p>
              <p className="text-sm text-white/70 mt-1">Hold barcode 2-8cm from camera</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 pointer-events-none">
          {/* Enhanced Close-Range Scanning Overlay */}
          <div className="absolute inset-4 border-2 border-primary/70 rounded-xl short-range-overlay">
            {/* Close-range focus zone */}
            <div className="absolute inset-8 border border-primary/40 rounded-lg">
              {/* Optimal scanning area indicator */}
              <div className="absolute inset-4 border border-green-400/60 rounded-md bg-green-400/10">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-green-400 font-medium bg-black/60 px-2 py-1 rounded">
                  2-8cm
                </div>
              </div>
            </div>
            
            {/* Enhanced corner guides for precise alignment */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl glow-effect animate-pulse"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl glow-effect animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl glow-effect animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl glow-effect animate-pulse"></div>
            
            {/* Center crosshair for precise positioning */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-0.5 bg-primary/60 rounded-full"></div>
              <div className="w-0.5 h-6 bg-primary/60 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
          
          {/* Dynamic scanning feedback */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-xl text-sm backdrop-blur-sm">
            {isScanning ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Initializing close-range scanner...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Hold barcode close (2-8cm) for best results</span>
              </div>
            )}
          </div>
          
          {/* Enhanced Zoom Controls - Optimized for Short-Range Barcode Scanning */}
          <div className="absolute bottom-4 right-4 mobile-zoom-controls flex flex-col gap-2 short-range-zoom-panel">
            {/* Zoom indicator with range guidance */}
            <div className="bg-black/80 text-white px-2 py-1 rounded-lg text-xs text-center backdrop-blur-sm border border-white/20">
              <div className="font-medium text-primary">Close-Range</div>
              <div className="text-white/80">{zoomLevel.toFixed(1)}x</div>
            </div>
            
            {/* Zoom In - Enhanced for barcode detail */}
            <Button
              onClick={() => {
                console.log('Short-range zoom in clicked');
                handleZoomIn();
              }}
              disabled={zoomLevel >= maxZoom || !isCameraActive}
              variant="outline"
              size="sm"
              className="bg-black/80 text-white border-primary/40 hover:bg-primary/20 hover:border-primary/60 w-10 h-10 p-0 mobile-touch-friendly touch-action-manipulation transition-all duration-200 glow-effect"
              title="Zoom in for better barcode detail (2-8cm range)"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            {/* Quick Focus Preset for Optimal Range */}
            <Button
              onClick={() => {
                console.log('Optimal zoom preset clicked');
                setZoomLevel(1.5); // Optimal zoom for close-range scanning
                if (videoRef.current) {
                  videoRef.current.style.transform = 'scale(1.5)';
                  videoRef.current.style.transformOrigin = 'center center';
                }
              }}
              disabled={!isCameraActive}
              variant="outline"
              size="sm"
              className="bg-green-900/60 text-green-200 border-green-400/40 hover:bg-green-800/60 hover:border-green-400/60 w-10 h-10 p-0 mobile-touch-friendly touch-action-manipulation transition-all duration-200"
              title="Optimal zoom for 2-8cm barcode scanning"
            >
              <div className="text-xs font-bold">1.5x</div>
            </Button>
            
            {/* Zoom Out */}
            <Button
              onClick={() => {
                console.log('Short-range zoom out clicked');
                handleZoomOut();
              }}
              disabled={zoomLevel <= minZoom || !isCameraActive}
              variant="outline"
              size="sm"
              className="bg-black/80 text-white border-primary/40 hover:bg-primary/20 hover:border-primary/60 w-10 h-10 p-0 mobile-touch-friendly touch-action-manipulation transition-all duration-200 glow-effect"
              title="Zoom out for wider view"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            {/* Distance Guide */}
            <div className="bg-black/80 text-white px-2 py-1 rounded-lg text-xs text-center backdrop-blur-sm border border-green-400/20 mt-1">
              <div className="text-green-400 font-medium">📏 2-8cm</div>
              <div className="text-white/60">optimal</div>
            </div>
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
          onClick={() => {
            console.log('Stop camera button clicked');
            stopCamera();
          }}
          variant="outline"
          className="flex-1 border-2 border-destructive/20 text-destructive hover:bg-destructive/10 mobile-button-full touch-action-manipulation"
        >
          <X className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Stop Camera</span>
          <span className="sm:hidden">Stop</span>
        </Button>
        <Button
          onClick={() => {
            console.log('Reset zoom button clicked');
            resetZoom();
          }}
          variant="outline"
          className="flex-1 border-2 border-muted-foreground/20 text-muted-foreground hover:bg-muted/10 mobile-button-full touch-action-manipulation"
          disabled={zoomLevel === 1 || !isCameraActive}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Reset Zoom</span>
          <span className="sm:hidden">Reset</span>
        </Button>
        <Button
          onClick={async () => {
            console.log('Restart camera clicked');
            if (isCameraActive) {
              stopCamera();
              await new Promise(resolve => setTimeout(resolve, 800));
              console.log('Restarting camera after cleanup');
              startCamera();
            } else {
              console.log('Camera not active, starting camera');
              startCamera();
            }
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
  );
}