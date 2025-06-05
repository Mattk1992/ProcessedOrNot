interface ScanProgress {
  barcode: string;
  currentSource: string;
  completedSources: string[];
  totalSources: number;
  found: boolean;
  isComplete: boolean;
  error?: string;
  timestamp: number;
}

const progressStore = new Map<string, ScanProgress>();

export function updateScanProgress(barcode: string, update: Partial<ScanProgress>) {
  const existing = progressStore.get(barcode) || {
    barcode,
    currentSource: '',
    completedSources: [],
    totalSources: 19,
    found: false,
    isComplete: false,
    timestamp: Date.now()
  };

  const updated = {
    ...existing,
    ...update,
    timestamp: Date.now()
  };

  progressStore.set(barcode, updated);
  
  // Clean up old progress after 5 minutes
  setTimeout(() => {
    if (progressStore.get(barcode)?.timestamp === updated.timestamp) {
      progressStore.delete(barcode);
    }
  }, 5 * 60 * 1000);
}

export function getScanProgress(barcode: string): ScanProgress | null {
  return progressStore.get(barcode) || null;
}

export function completeScanProgress(barcode: string, found: boolean, source?: string) {
  updateScanProgress(barcode, {
    isComplete: true,
    found,
    currentSource: source || '',
    completedSources: found && source ? [source] : []
  });
}