import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DefaultScanner } from "./default-scanner";
import { QuagaJSScanner } from "./quaggajs-scanner";
import { HTML5QRScanner } from "./html5-qr-scanner";
import { WebWorkersScanner } from "./web-workers-scanner";
import { EnhancedZXingScanner } from "./enhanced-zxing-scanner";
import { FileUploadScanner } from "./file-upload-scanner";

interface ScannerManagerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isActive: boolean;
}

export interface ScannerType {
  key: string;
  name: string;
  description: string;
  component: React.ComponentType<{
    onScan: (barcode: string) => void;
    onClose: () => void;
    isActive: boolean;
  }>;
}

export const scannerTypes: ScannerType[] = [
  {
    key: "default",
    name: "Default Barcode Scanner",
    description: "Advanced ZXing-based scanner with enhanced camera optimization",
    component: DefaultScanner,
  },
  {
    key: "quaggajs",
    name: "QuaggaJS Scanner",
    description: "Fast and accurate barcode detection using QuaggaJS library",
    component: QuagaJSScanner,
  },
  {
    key: "html5-qr",
    name: "HTML5 QR Code Scanner",
    description: "HTML5-based QR code scanner using Canvas API for image processing",
    component: HTML5QRScanner,
  },
  {
    key: "web-workers",
    name: "Web Workers Scanner",
    description: "Advanced scanner using Web Workers for background image processing",
    component: WebWorkersScanner,
  },
  {
    key: "enhanced-zxing",
    name: "Enhanced ZXing Alternative",
    description: "Enhanced ZXing with advanced camera constraints and multiple barcode formats",
    component: EnhancedZXingScanner,
  },
  {
    key: "file-upload",
    name: "File Upload Scanner",
    description: "Upload any image containing a barcode for scanning",
    component: FileUploadScanner,
  },
];

export function ScannerManager({ onScan, onClose, isActive }: ScannerManagerProps) {
  const [selectedScanner, setSelectedScanner] = useState<string>("default");

  // Query for user's barcode scanner preference (with error handling)
  const { data: scannerSetting } = useQuery({
    queryKey: ["/api/user/settings/barcode_scanner"],
    enabled: true,
    retry: false,
    throwOnError: false,
  });

  // Update selected scanner when user setting is loaded
  useEffect(() => {
    const setting = scannerSetting as any;
    if (setting?.settingValue) {
      setSelectedScanner(setting.settingValue);
    }
  }, [scannerSetting]);

  // Find the selected scanner configuration
  const currentScannerConfig = scannerTypes.find(
    (scanner) => scanner.key === selectedScanner
  ) || scannerTypes[0];

  // Get the scanner component
  const ScannerComponent = currentScannerConfig.component;

  return (
    <ScannerComponent
      onScan={onScan}
      onClose={onClose}
      isActive={isActive}
    />
  );
}