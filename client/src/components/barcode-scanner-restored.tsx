import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Search, Loader2, X, RotateCcw, ZoomIn, ZoomOut, Eye } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { useTranslation } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import SearchFilter from '@/components/search-filter';
import logoPath from '@assets/ProcessedOrNot_logo.png';

interface BarcodeScannerProps {
  onScan: (barcode: string, filters?: { includeBrands?: string[], excludeBrands?: string[] }) => void;
  isLoading?: boolean;
}

interface SearchFilters {
  includeBrands: string[];
  excludeBrands: string[];
}

const sampleProducts = [
  {
    barcode: "4901301005083",
    name: "Colgate Total Toothpaste",
    description: "Barcode scan"
  },
  {
    barcode: "5901234123457",
    name: "Vitamin D3 Supplement",
    description: "Barcode scan"
  },
  {
    barcode: "7613031301508",
    name: "Oreo Original Cookies",
    description: "Barcode scan"
  },
  {
    barcode: "hamburger",
    name: "McDonald's Big Mac",
    description: "Text search"
  },
  {
    barcode: "gehakt",
    name: "Dutch Ground Beef",
    description: "Text search"
  },
  {
    barcode: "apple",
    name: "Fresh Apple",
    description: "Text search"
  }
];

export default function BarcodeScanner({ onScan, isLoading = false }: BarcodeScannerProps) {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ includeBrands: [], excludeBrands: [] });
  const [isTextSearch, setIsTextSearch] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(3);
  const [scanningAttempts, setScanningAttempts] = useState(0);
  const [scanningStatusText, setScanningStatusText] = useState('');
  const [currentLocationRef, setCurrentLocationRef] = useState(location);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const locationRef = useRef(location);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (codeReader) {
      codeReader.reset();
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    setIsCameraActive(false);
    setIsScanning(false);
  }, [stream, codeReader]);

  const startCamera = useCallback(async () => {
    try {
      const reader = new BrowserMultiFormatReader();
      setCodeReader(reader);
      
      const devices = await reader.listVideoInputDevices();
      const backCamera = devices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('environment')
      ) || devices[0];
      
      if (!backCamera) {
        throw new Error('No camera found');
      }

      const constraints = {
        video: {
          deviceId: { exact: backCamera.deviceId },
          width: { ideal: 2560, min: 1280 },
          height: { ideal: 1440, min: 720 },
          frameRate: { ideal: 60, min: 30 },
          focusMode: { ideal: 'continuous' },
          focusDistance: { ideal: 0.015, min: 0.005, max: 0.12 },
          whiteBalanceMode: { ideal: 'manual' },
          colorTemperature: { ideal: 5600 },
          exposureMode: { ideal: 'manual' },
          exposureTime: { ideal: 0.006, min: 0.001, max: 0.017 },
          iso: { ideal: 64, min: 64, max: 125 },
          brightness: { ideal: 125, min: 100, max: 150 },
          contrast: { ideal: 160, min: 140, max: 180 },
          saturation: { ideal: 40, min: 20, max: 60 },
          sharpness: { ideal: 100, min: 80, max: 100 },
          imageStabilization: { ideal: true },
          zoom: { ideal: 1.2, min: 1.0, max: 3.0 },
          torch: { ideal: false }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setIsCameraActive(true);
      startScanning(reader);
      
    } catch (error) {
      console.error('Error starting camera:', error);
      alert(t('scanner.camera.error'));
    }
  }, [t]);

  const startScanning = useCallback((reader: BrowserMultiFormatReader) => {
    if (!videoRef.current) return;
    
    setIsScanning(true);
    setScanningStatusText(t('scanner.camera.scanning'));
    
    const scan = () => {
      if (!videoRef.current || !isCameraActive) return;
      
      try {
        const result = reader.decodeFromVideoElement(videoRef.current);
        if (result && result.getText()) {
          const scannedCode = result.getText();
          
          // Validate barcode format
          if (/^\d{8,14}$/.test(scannedCode)) {
            stopCamera();
            onScan(scannedCode, filters);
            return;
          }
        }
      } catch (error) {
        // Continue scanning
      }
      
      setScanningAttempts(prev => prev + 1);
      setTimeout(() => {
        if (isCameraActive) {
          scan();
        }
      }, 300);
    };
    
    scan();
  }, [isCameraActive, onScan, filters, stopCamera, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      const input = barcode.trim();
      const isBarcode = /^\d{8,14}$/.test(input);
      setIsTextSearch(!isBarcode);
      
      if (isBarcode) {
        onScan(input);
      } else {
        onScan(input, filters);
      }
    }
  };

  const handleSampleClick = (sampleBarcode: string) => {
    const isBarcode = /^\d{8,14}$/.test(sampleBarcode);
    setIsTextSearch(!isBarcode);
    
    if (isBarcode) {
      onScan(sampleBarcode);
    } else {
      onScan(sampleBarcode, filters);
    }
  };

  // Cleanup on component unmount or location change
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Cleanup camera when leaving the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopCamera();
      }
    };

    const handleBeforeUnload = () => {
      stopCamera();
    };

    const handlePageHide = () => {
      stopCamera();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [stopCamera]);

  // Cleanup camera when route changes
  useEffect(() => {
    if (currentLocationRef !== location) {
      stopCamera();
    }
    setCurrentLocationRef(location);
  }, [location, stopCamera]);

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
              <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl glow-effect short-range-scanner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-96 object-cover scanner-video"
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Center crosshair */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-white rounded-full opacity-80 animate-pulse"></div>
                      
                      {/* Corner guides */}
                      <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg scan-pulse"></div>
                      <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg scan-pulse"></div>
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg scan-pulse"></div>
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg scan-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Scanning status */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                    {scanningStatusText}
                  </div>
                </div>
              </div>
              
              {/* Camera controls */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={stopCamera}
                  variant="destructive"
                  size="lg"
                  className="rounded-2xl"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('scanner.camera.stop')}
                </Button>
                
                <Button
                  onClick={() => startScanning(codeReader!)}
                  variant="outline"
                  size="lg"
                  className="rounded-2xl"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Restart</span>
                  <span className="sm:hidden">Restart</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 mb-8">
              <div className="text-center">
                <Button
                  onClick={startCamera}
                  data-tutorial="camera-scan"
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] mobile-touch-friendly"
                  disabled={isLoading}
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-base">{t('scanner.camera.start')}</span>
                </Button>
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

      {/* Search Filter */}
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