import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, Camera, X } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isLoading?: boolean;
}

const sampleProducts = [
  { barcode: "8720600618161", name: "Hak Chili sin carne schotel", description: "Ready meal" },
  { barcode: "5449000000996", name: "Coca-Cola", description: "Soft drink" },
  { barcode: "8710398500434", name: "Lays Chips Naturel 250gr", description: "Potato chips" },
];

export default function DebugCamera({ onScan, isLoading = false }: BarcodeScannerProps) {
  const [barcode, setBarcode] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim() && barcode.trim().length >= 8) {
      onScan(barcode.trim());
    }
  };

  const handleSampleClick = (sampleBarcode: string) => {
    setBarcode(sampleBarcode);
    onScan(sampleBarcode);
  };

  const testCameraAccess = async () => {
    try {
      setDebugInfo("Testing camera access...");
      
      // Check if MediaDevices is available
      if (!navigator.mediaDevices) {
        throw new Error("MediaDevices API not available");
      }
      
      if (!navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia not available");
      }

      setDebugInfo("MediaDevices API available, requesting camera...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      });
      
      setDebugInfo("Camera access granted successfully!");
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setDebugInfo(`Camera test failed: ${errorMsg}`);
      setCameraError(errorMsg);
      return false;
    }
  };

  const startCamera = async () => {
    setCameraError("");
    setIsInitializing(true);
    setDebugInfo("");
    
    try {
      // First test camera access
      const canAccess = await testCameraAccess();
      if (!canAccess) {
        setIsInitializing(false);
        return;
      }

      setDebugInfo("Starting camera stream...");
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Try back camera first
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      setIsCameraActive(true);
      setDebugInfo("Camera stream created, setting up video element...");
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          setDebugInfo("Video metadata loaded, starting playback...");
          videoRef.current?.play()
            .then(() => {
              setDebugInfo("Camera is now active and streaming!");
              setIsInitializing(false);
            })
            .catch((playError) => {
              setDebugInfo(`Play error: ${playError.message}`);
              setIsInitializing(false);
            });
        };
        
        videoRef.current.onerror = (error) => {
          setDebugInfo(`Video error: ${error}`);
          setIsInitializing(false);
        };
      } else {
        throw new Error("Video element not found");
      }

    } catch (error) {
      console.error("Camera error:", error);
      setIsInitializing(false);
      setIsCameraActive(false);
      
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage = "Camera permission denied. Please allow camera access.";
            break;
          case 'NotFoundError':
            errorMessage = "No camera found on this device.";
            break;
          case 'NotSupportedError':
            errorMessage = "Camera not supported in this browser.";
            break;
          case 'NotReadableError':
            errorMessage = "Camera is being used by another application.";
            break;
        }
      }
      
      setCameraError(errorMessage);
      setDebugInfo(`Final error: ${errorMessage}`);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    setIsInitializing(false);
    setCameraError("");
    setDebugInfo("Camera stopped");
  };

  return (
    <div className="space-y-10">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg glow-effect floating-animation">
            <Search className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold gradient-text text-shadow mb-2">Scan Product Barcode</h2>
        <p className="text-muted-foreground">Camera debugging enabled</p>
      </div>
      
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          {/* Debug Information */}
          {debugInfo && (
            <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm">{debugInfo}</p>
            </div>
          )}

          {isCameraActive ? (
            <div className="space-y-6 mb-8">
              <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl glow-effect">
                <video
                  ref={videoRef}
                  className="w-full h-80 object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                {isInitializing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-lg font-medium">Starting camera...</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-6 border-2 border-primary/60 rounded-2xl">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl glow-effect"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl glow-effect"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl glow-effect"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl glow-effect"></div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                    Position barcode in the center and enter it below
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="flex-1 border-2 border-destructive/30 text-destructive hover:bg-destructive/10 bg-destructive/5 rounded-xl scale-on-hover"
                >
                  <X className="w-4 h-4 mr-2" />
                  Stop Camera
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <Button
                onClick={startCamera}
                disabled={isLoading || isInitializing}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-6 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl glow-effect scale-on-hover mb-8"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Starting Camera...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span>Test Camera Access</span>
                  </>
                )}
              </Button>
              
              {cameraError && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm font-medium">Camera Error:</p>
                  <p className="text-destructive text-sm">{cameraError}</p>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/30"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">Manual Entry</span>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <Input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Enter barcode (e.g., 3017620425400)"
                className="w-full px-5 py-4 text-lg font-mono tracking-wider pr-14 border-2 border-border/20 focus:border-primary/50 bg-card/50 backdrop-blur-sm rounded-2xl transition-all duration-200 group-hover:border-primary/30"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <div className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors">
                  <Search className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl glow-effect scale-on-hover"
              disabled={isLoading || !barcode.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Product...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Analyze Product</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="glass-card rounded-3xl p-8 glow-effect">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-lg floating-animation">
              <Search className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold gradient-text mb-2">Try Sample Products</h3>
          <p className="text-muted-foreground">Click on any product below to test the scanner</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleProducts.map((product, index) => (
            <button
              key={product.barcode}
              onClick={() => handleSampleClick(product.barcode)}
              className="group text-left p-6 glass-card rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all duration-300 scale-on-hover disabled:opacity-50 disabled:cursor-not-allowed fade-in"
              disabled={isLoading}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="font-mono text-sm bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-3 py-1 rounded-xl group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-200">
                  {product.barcode}
                </div>
                <div className="w-3 h-3 bg-gradient-to-r from-accent to-primary rounded-full pulse-subtle"></div>
              </div>
              <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors text-shadow">
                {product.name}
              </h4>
              <p className="text-sm text-muted-foreground">{product.description}</p>
              <div className="mt-4 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-all duration-200">
                <span className="font-medium">Click to scan</span>
                <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}