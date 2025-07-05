export type ScannerType = 'zxing' | 'quagga' | 'html5-qrcode' | 'web-workers' | 'enhanced-zxing' | 'file-upload';

export interface ScannerConfig {
  type: ScannerType;
  name: string;
  description: string;
  features: string[];
  supportsCamera: boolean;
  supportsFileUpload: boolean;
  isRecommended?: boolean;
}

export const SCANNER_CONFIGS: Record<ScannerType, ScannerConfig> = {
  'zxing': {
    type: 'zxing',
    name: 'ZXing Scanner',
    description: 'Fast and reliable barcode scanner with excellent format support',
    features: ['Multi-format support', 'Real-time scanning', 'High accuracy', 'Fast processing'],
    supportsCamera: true,
    supportsFileUpload: true,
    isRecommended: true
  },
  'quagga': {
    type: 'quagga',
    name: 'QuaggaJS Scanner',
    description: 'Advanced barcode scanner with machine learning capabilities',
    features: ['ML-powered detection', 'Code 128 support', 'EAN support', 'Real-time tracking'],
    supportsCamera: true,
    supportsFileUpload: true
  },
  'html5-qrcode': {
    type: 'html5-qrcode',
    name: 'HTML5 QR Code Scanner',
    description: 'Lightweight QR code and barcode scanner',
    features: ['QR code focus', 'Lightweight', 'Cross-platform', 'Easy integration'],
    supportsCamera: true,
    supportsFileUpload: true
  },
  'web-workers': {
    type: 'web-workers',
    name: 'Web Workers Scanner',
    description: 'High-performance scanner using Web Workers for background processing',
    features: ['Background processing', 'Non-blocking UI', 'High performance', 'Multi-threading'],
    supportsCamera: true,
    supportsFileUpload: false
  },
  'enhanced-zxing': {
    type: 'enhanced-zxing',
    name: 'Enhanced ZXing Alternative',
    description: 'Optimized ZXing with enhanced settings for better scanning',
    features: ['Optimized settings', 'Better low-light performance', 'Enhanced accuracy', 'Adaptive scanning'],
    supportsCamera: true,
    supportsFileUpload: true
  },
  'file-upload': {
    type: 'file-upload',
    name: 'File Upload Scanner',
    description: 'Scanner for uploaded barcode images',
    features: ['Image upload', 'Batch processing', 'High-resolution support', 'No camera required'],
    supportsCamera: false,
    supportsFileUpload: true
  }
};

// Scanner configurations for selection menu
// Implementation will be added to barcode-scanner.tsx component