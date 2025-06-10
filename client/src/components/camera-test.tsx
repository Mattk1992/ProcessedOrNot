import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

export default function CameraTest() {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const testCamera = async () => {
    try {
      setError("");
      setStatus("Testing camera access...");
      
      console.log("Testing basic camera access");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      console.log("Camera stream obtained:", stream);
      setStatus("Camera access successful!");
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
      
    } catch (err) {
      console.error("Camera test error:", err);
      setError(err instanceof Error ? err.message : "Camera access failed");
      setStatus("");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setStatus("");
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Camera Test</h3>
      
      {!isActive ? (
        <Button onClick={testCamera} className="mb-4">
          <Camera className="w-4 h-4 mr-2" />
          Test Camera Access
        </Button>
      ) : (
        <Button onClick={stopCamera} variant="destructive" className="mb-4">
          Stop Camera
        </Button>
      )}
      
      {status && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
          {status}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
      
      {isActive && (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full max-w-md border rounded"
        />
      )}
    </div>
  );
}