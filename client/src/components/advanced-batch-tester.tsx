import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  TestTube, 
  Play, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Target,
  Database,
  Timer,
  BarChart3,
  Download
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface BatchTestResult {
  barcode: string;
  results: DatabaseTestResult[];
  totalTime: number;
  success: boolean;
  foundInDatabases: number;
}

interface DatabaseTestResult {
  databaseName: string;
  responseTime: number;
  productFound: boolean;
  error?: string;
  productData?: any;
}

interface DatabaseConfig {
  id: string;
  name: string;
  enabled: boolean;
}

const AVAILABLE_DATABASES: DatabaseConfig[] = [
  { id: 'openfoodfacts', name: 'OpenFoodFacts', enabled: true },
  { id: 'fooddb-ca', name: 'FoodDB.ca', enabled: true },
  { id: 'usda-fdc', name: 'USDA Food Data Central', enabled: true },
  { id: 'nutritionix', name: 'Nutritionix', enabled: false },
  { id: 'spoonacular', name: 'Spoonacular', enabled: false },
  { id: 'api-ninjas', name: 'API Ninjas', enabled: true },
  { id: 'upc-database', name: 'UPC Database', enabled: true },
  { id: 'australia-food', name: 'Australian Food Database', enabled: false },
  { id: 'health-canada', name: 'Health Canada', enabled: false },
  { id: 'efsa', name: 'EFSA Database', enabled: false }
];

export function AdvancedBatchTester() {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedDatabases, setSelectedDatabases] = useState<string[]>(
    AVAILABLE_DATABASES.filter(db => db.enabled).map(db => db.id)
  );
  const [batchResults, setBatchResults] = useState<BatchTestResult[]>([]);
  const [currentTestingBarcode, setCurrentTestingBarcode] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Parse barcodes from input
  const parseBarcodes = (input: string): string[] => {
    return input
      .split(/[\n,;]/)
      .map(barcode => barcode.trim())
      .filter(barcode => barcode && /^\d+$/.test(barcode));
  };

  const barcodeList = parseBarcodes(barcodeInput);

  // Batch testing mutation
  const batchTestMutation = useMutation({
    mutationFn: async ({ barcodes, databases }: { barcodes: string[], databases: string[] }) => {
      const results: BatchTestResult[] = [];
      
      for (let i = 0; i < barcodes.length; i++) {
        const barcode = barcodes[i];
        setCurrentTestingBarcode(barcode);
        setProgress((i / barcodes.length) * 100);
        
        try {
          // Test against selected databases
          const response = await apiRequest('POST', '/api/product-lookup/batch-test', {
            barcode,
            databases
          });
          
          if (response.ok) {
            const result = await response.json();
            results.push({
              barcode,
              results: result.databaseResults || [],
              totalTime: result.totalTime || 0,
              success: true,
              foundInDatabases: result.databaseResults?.filter((r: any) => r.productFound).length || 0
            });
          } else {
            results.push({
              barcode,
              results: [],
              totalTime: 0,
              success: false,
              foundInDatabases: 0
            });
          }
        } catch (error) {
          results.push({
            barcode,
            results: [],
            totalTime: 0,
            success: false,
            foundInDatabases: 0
          });
        }

        // Small delay to prevent overwhelming the APIs
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return results;
    },
    onSuccess: (results) => {
      setBatchResults(results);
      setCurrentTestingBarcode(null);
      setProgress(100);
    },
    onError: () => {
      setCurrentTestingBarcode(null);
      setProgress(0);
    }
  });

  const handleDatabaseToggle = (databaseId: string) => {
    setSelectedDatabases(prev => 
      prev.includes(databaseId)
        ? prev.filter(id => id !== databaseId)
        : [...prev, databaseId]
    );
  };

  const startBatchTest = () => {
    if (barcodeList.length === 0) return;
    setBatchResults([]);
    setProgress(0);
    batchTestMutation.mutate({ 
      barcodes: barcodeList, 
      databases: selectedDatabases 
    });
  };

  const exportResults = () => {
    const csvData = batchResults.map(result => ({
      barcode: result.barcode,
      success: result.success,
      foundInDatabases: result.foundInDatabases,
      totalTime: result.totalTime,
      databases: result.results.map(r => `${r.databaseName}:${r.productFound ? 'Found' : 'Not Found'}`).join('; ')
    }));
    
    const csv = [
      'Barcode,Success,Found In Databases,Total Time (ms),Database Results',
      ...csvData.map(row => `${row.barcode},${row.success},${row.foundInDatabases},${row.totalTime},"${row.databases}"`)
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-test-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate summary statistics
  const totalBarcodes = batchResults.length;
  const successfulTests = batchResults.filter(r => r.success).length;
  const averageTime = totalBarcodes > 0 ? batchResults.reduce((sum, r) => sum + r.totalTime, 0) / totalBarcodes : 0;
  const totalProductsFound = batchResults.reduce((sum, r) => sum + r.foundInDatabases, 0);

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="w-5 h-5" />
            <span>Advanced Batch Testing Configuration</span>
          </CardTitle>
          <CardDescription>
            Test multiple barcodes across selected databases for comprehensive analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Barcode Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Barcodes to Test</label>
            <Textarea
              placeholder="Enter barcodes (one per line or comma-separated)&#10;Example:&#10;1234567890123&#10;9876543210987&#10;5555666677778"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="min-h-[120px]"
            />
            <p className="text-sm text-muted-foreground">
              {barcodeList.length} valid barcode{barcodeList.length !== 1 ? 's' : ''} detected
            </p>
          </div>

          {/* Database Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Databases to Test</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AVAILABLE_DATABASES.map((database) => (
                <div key={database.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={database.id}
                    checked={selectedDatabases.includes(database.id)}
                    onCheckedChange={() => handleDatabaseToggle(database.id)}
                  />
                  <label
                    htmlFor={database.id}
                    className="text-sm cursor-pointer flex items-center space-x-1"
                  >
                    <Database className="w-3 h-3" />
                    <span>{database.name}</span>
                  </label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedDatabases.length} database{selectedDatabases.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          {/* Test Controls */}
          <div className="flex items-center justify-between">
            <Button
              onClick={startBatchTest}
              disabled={barcodeList.length === 0 || selectedDatabases.length === 0 || batchTestMutation.isPending}
              className="flex items-center space-x-2"
            >
              {batchTestMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>
                {batchTestMutation.isPending ? 'Testing...' : `Start Batch Test (${barcodeList.length} barcodes)`}
              </span>
            </Button>
            
            {batchResults.length > 0 && (
              <Button onClick={exportResults} variant="outline" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Results</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {batchTestMutation.isPending && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Testing Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              {currentTestingBarcode && (
                <p className="text-sm text-muted-foreground text-center">
                  Currently testing: {currentTestingBarcode}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {batchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Batch Test Results Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalBarcodes}</div>
                <div className="text-sm text-muted-foreground">Total Tested</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{successfulTests}</div>
                <div className="text-sm text-muted-foreground">Successful Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalProductsFound}</div>
                <div className="text-sm text-muted-foreground">Products Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{Math.round(averageTime)}</div>
                <div className="text-sm text-muted-foreground">Avg Time (ms)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      {batchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Detailed Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {batchResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="font-mono">
                        {result.barcode}
                      </Badge>
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Database className="w-4 h-4" />
                        <span>{result.foundInDatabases}/{selectedDatabases.length} found</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Timer className="w-4 h-4" />
                        <span>{result.totalTime}ms</span>
                      </div>
                    </div>
                  </div>
                  
                  {result.results.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {result.results.map((dbResult, dbIndex) => (
                        <div key={dbIndex} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center space-x-2">
                            {dbResult.productFound ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-sm">{dbResult.databaseName}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {dbResult.responseTime}ms
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AdvancedBatchTester;