import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Search, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScanningProgressProps {
  barcode: string;
  isScanning: boolean;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

interface DatabaseStatus {
  name: string;
  status: 'pending' | 'searching' | 'completed' | 'failed';
  found?: boolean;
  error?: string;
}

const DATABASE_SOURCES = [
  'OpenFoodFacts',
  'FoodData Central',
  'NEVO',
  'RIVM', 
  'Voedingscentrum',
  'Kenniscentrum Gezond Gewicht',
  'CIQUAL (ANSES)',
  'BLS (Germany)',
  'Fineli (Finland)',
  'DTU Food (Denmark)',
  'BDA-IEO (Italy)',
  'USDA',
  'EFSA',
  'Health Canada',
  'Australian Food',
  'Barcode Spider',
  'EAN Search',
  'Product API',
  'UPC Database'
];

export default function ScanningProgress({ barcode, isScanning, onComplete, onError }: ScanningProgressProps) {
  const [databases, setDatabases] = useState<DatabaseStatus[]>([]);
  const [currentDatabase, setCurrentDatabase] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!isScanning) {
      setDatabases([]);
      setProgress(0);
      setCurrentDatabase('');
      return;
    }

    // Initialize database statuses
    const initialDatabases = DATABASE_SOURCES.map(name => ({
      name,
      status: 'pending' as const
    }));
    setDatabases(initialDatabases);

    // Poll for progress updates
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/progress/${barcode}`);
        
        if (response.ok) {
          const data = await response.json();
          
          setCurrentDatabase(data.currentSource);
          setProgress((data.completedSources.length / DATABASE_SOURCES.length) * 100);
          
          setDatabases(prev => prev.map(db => {
            if (data.completedSources.includes(db.name)) {
              return { ...db, status: 'completed' };
            } else if (db.name === data.currentSource) {
              return { ...db, status: 'searching' };
            }
            return db;
          }));

          if (data.found) {
            // Product found, mark the successful database
            setDatabases(prev => prev.map(db => 
              db.name === data.currentSource 
                ? { ...db, status: 'completed', found: true }
                : db
            ));
            
            // Complete the progress
            setProgress(100);
            setCurrentDatabase('');
            clearInterval(pollInterval);
            
            if (onComplete) {
              onComplete(data);
            }
          } else if (data.isComplete) {
            setProgress(100);
            setCurrentDatabase('');
            clearInterval(pollInterval);
            
            if (onError) {
              onError('Product not found in any database');
            }
          }
        } else if (response.status === 404) {
          // No progress yet, continue polling
        } else {
          console.error('Error fetching progress:', response.statusText);
        }
      } catch (error) {
        console.error('Error polling progress:', error);
      }
    }, 500); // Poll every 500ms

    return () => {
      clearInterval(pollInterval);
    };
  }, [barcode, isScanning, onComplete, onError]);

  if (!isScanning) return null;

  const completedCount = databases.filter(db => db.status === 'completed').length;
  const foundDatabase = databases.find(db => db.found);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card border border-border rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Scanning Product Database
        </h3>
        <p className="text-sm text-muted-foreground">
          Searching through {DATABASE_SOURCES.length} databases for barcode: {barcode}
        </p>
      </div>

      {/* Main Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">
            {foundDatabase ? 'Product Found!' : 'Scanning Progress'}
          </span>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{DATABASE_SOURCES.length}
          </span>
        </div>
        <Progress 
          value={progress} 
          className="h-3 transition-all duration-300"
        />
      </div>

      {/* Current Database Indicator */}
      {currentDatabase && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-primary animate-spin" />
            <span className="text-sm font-medium text-foreground">
              Currently searching: {currentDatabase}
            </span>
          </div>
        </div>
      )}

      {/* Found Indicator */}
      {foundDatabase && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Product found in {foundDatabase.name}!
            </span>
          </div>
        </div>
      )}

      {/* Database Status Grid */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <h4 className="text-sm font-medium text-foreground mb-2">Database Status:</h4>
        <div className="grid grid-cols-1 gap-1">
          {databases.map((db) => (
            <div
              key={db.name}
              className={cn(
                "flex items-center justify-between p-2 rounded text-xs transition-all duration-200",
                db.status === 'completed' && db.found && "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200",
                db.status === 'completed' && !db.found && "bg-muted text-muted-foreground",
                db.status === 'searching' && "bg-primary/10 text-primary font-medium animate-pulse",
                db.status === 'failed' && "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200",
                db.status === 'pending' && "bg-background text-muted-foreground"
              )}
            >
              <span className="truncate">{db.name}</span>
              <div className="flex items-center space-x-1">
                {db.status === 'completed' && db.found && (
                  <Badge variant="default" className="bg-green-600 text-white">Found</Badge>
                )}
                {db.status === 'completed' && !db.found && (
                  <CheckCircle className="h-3 w-3" />
                )}
                {db.status === 'searching' && (
                  <Clock className="h-3 w-3 animate-spin" />
                )}
                {db.status === 'failed' && (
                  <Badge variant="destructive">Error</Badge>
                )}
                {db.status === 'pending' && (
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}