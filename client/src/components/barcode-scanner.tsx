import { useState, useRef, useCallback, useEffect } from "react";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, Camera, X, RotateCcw } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { useLanguage } from "@/contexts/LanguageContext";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isLoading?: boolean;
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
  const [barcode, setBarcode] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      onScan(barcode.trim());
    }
  };

  const handleSampleClick = (sampleBarcode: string) => {
    setBarcode(sampleBarcode);
    onScan(sampleBarcode);
  };

  const startCamera = useCallback(async () => {
    try {
      setCameraError("");
      setIsScanning(true);
      
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

      // Start decoding from the camera
      await codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        finalVideoElement,
        (result, error) => {
          if (result) {
            const scannedCode = result.getText();
            console.log("Scanned barcode:", scannedCode);
            if (scannedCode) {
              stopCamera();
              onScan(scannedCode);
            }
          }
          if (error && !(error instanceof NotFoundException)) {
            console.warn("Barcode scanning error:", error);
          }
        }
      );

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
    try {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      
      // Stop all video tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    } catch (error) {
      console.error("Error stopping camera:", error);
    } finally {
      setIsCameraActive(false);
      setIsScanning(false);
      setCameraError("");
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

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
                  className="w-full h-80 object-cover"
                  autoPlay
                  playsInline
                  muted
                  style={{ transform: 'scaleX(-1)' }}
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
                    {isScanning ? "Starting camera..." : "Position barcode within the frame"}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="flex-1 border-2 border-destructive/20 text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Stop Camera
                </Button>
                <Button
                  onClick={startCamera}
                  variant="outline"
                  className="flex-1 border-2 border-primary/20 text-primary hover:bg-primary/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <Button
                onClick={startCamera}
                disabled={isLoading || isScanning}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] mb-6"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Starting Camera...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span>Scan with Camera</span>
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <Input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder={t('scanner.input.placeholder')}
                  className="w-full px-5 py-4 text-lg font-mono tracking-wider pr-14 border-2 border-border/20 focus:border-primary/50 bg-card/50 backdrop-blur-sm rounded-2xl transition-all duration-200 group-hover:border-primary/30"
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
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading || barcode.trim().length < 1}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('scanner.input.analyzing')}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl shimmer"></div>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>{t('scanner.input.button')}</span>
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Sample Products Section */}
      <Card className="bg-gradient-to-br from-card to-muted/30 border-2 border-border/20 shadow-lg">
        <CardContent className="pt-8 pb-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">{t('scanner.samples.title')}</h3>
            <p className="text-muted-foreground">{t('scanner.samples.description')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleProducts.map((product, index) => (
              <button
                key={product.barcode}
                onClick={() => handleSampleClick(product.barcode)}
                className="group text-left p-6 bg-card border-2 border-border/20 rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
