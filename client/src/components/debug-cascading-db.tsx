import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Database, 
  Settings, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Loader2,
  Eye,
  Zap,
  Activity,
  BarChart3,
  Layers,
  Link,
  Clock,
  Target,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest } from "@/lib/queryClient";

interface DatabaseManagementRowProps {
  database: ProductDatabase;
  index: number;
  totalCount: number;
  onToggleEnabled: (id: number, enabled: boolean) => void;
  onMovePriority: (id: number, direction: 'up' | 'down') => void;
  isUpdating: boolean;
}

function DatabaseManagementRow({ 
  database, 
  index, 
  totalCount, 
  onToggleEnabled, 
  onMovePriority, 
  isUpdating 
}: DatabaseManagementRowProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col space-y-1">
          <Button
            onClick={() => onMovePriority(database.id, 'up')}
            disabled={index === 0 || isUpdating}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
          <Button
            onClick={() => onMovePriority(database.id, 'down')}
            disabled={index === totalCount - 1 || isUpdating}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="min-w-[3rem] justify-center">
            #{database.priority}
          </Badge>
          
          <div className="flex items-center space-x-2">
            {database.isOperational ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <div>
              <h4 className="font-medium">{database.name}</h4>
              <p className="text-sm text-muted-foreground">{database.description}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="text-right text-sm">
          <p className="font-medium">{database.averageResponseTime}ms</p>
          <p className="text-muted-foreground">avg response</p>
        </div>
        
        <Switch
          checked={database.isEnabled}
          onCheckedChange={(checked) => onToggleEnabled(database.id, checked)}
          disabled={isUpdating}
        />
      </div>
    </div>
  );
}

interface ProductDatabase {
  id: number;
  name: string;
  endpoint: string;
  description: string;
  priority: number;
  isEnabled: boolean;
  isOperational: boolean;
  averageResponseTime: number;
  lastCheckedAt: string;
  apiKey?: string;
  createdAt: string;
  updatedAt: string;
}

interface TestResult {
  databaseName: string;
  success: boolean;
  responseTime: number;
  productFound: boolean;
  error?: string;
}

interface CascadeTestResult {
  barcode: string;
  success: boolean;
  totalTime: number;
  finalSource: string;
  testResults: TestResult[];
  error?: string;
}

export default function DebugCascadingDB() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  const [testBarcode, setTestBarcode] = useState("7622300871000");
  const [isTestingCascade, setIsTestingCascade] = useState(false);
  const [testResults, setTestResults] = useState<CascadeTestResult | null>(null);

  // Fetch databases
  const { data: databases, isLoading: isDatabasesLoading } = useQuery<ProductDatabase[]>({
    queryKey: ['/api/admin/databases'],
    enabled: user?.accountType === 'Admin',
  });

  // Initialize databases mutation
  const initializeDatabasesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/databases/initialize');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/databases'] });
    },
  });

  // Update database mutation
  const updateDatabaseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProductDatabase> }) => {
      return apiRequest('PUT', `/api/admin/databases/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/databases'] });
    },
  });

  // Test individual database mutation
  const testDatabaseMutation = useMutation({
    mutationFn: async ({ id, testBarcode }: { id: number; testBarcode: string }) => {
      return apiRequest('POST', `/api/admin/databases/${id}/test`, { barcode: testBarcode });
    },
  });

  const handleToggleEnabled = (id: number, enabled: boolean) => {
    updateDatabaseMutation.mutate({ id, data: { isEnabled: enabled } });
  };

  const handleMovePriority = (id: number, direction: 'up' | 'down') => {
    const database = databases?.find(db => db.id === id);
    if (!database) return;

    const newPriority = direction === 'up' ? database.priority - 1 : database.priority + 1;
    updateDatabaseMutation.mutate({ id, data: { priority: newPriority } });
  };

  const testCascadingSystem = async () => {
    if (!testBarcode.trim()) return;
    
    setIsTestingCascade(true);
    try {
      const response = await apiRequest('POST', '/api/admin/test-cascade', { 
        barcode: testBarcode.trim() 
      });
      setTestResults(response);
    } catch (error: any) {
      setTestResults({
        barcode: testBarcode,
        success: false,
        totalTime: 0,
        finalSource: 'None',
        testResults: [],
        error: error.message || 'Test failed'
      });
    } finally {
      setIsTestingCascade(false);
    }
  };

  if (isDatabasesLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading database configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6" />
            Debug Cascading Database
          </h2>
          <p className="text-muted-foreground mt-1">
            Monitor and test the cascading database lookup system
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Management
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {databases && databases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {databases
                .sort((a, b) => a.priority - b.priority)
                .map((database) => (
                  <Card key={database.id} className={`${database.isEnabled ? 'border-green-200 dark:border-green-800' : 'border-gray-200 dark:border-gray-700'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            #{database.priority}
                          </Badge>
                          {database.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {database.isOperational ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <Switch
                            checked={database.isEnabled}
                            onCheckedChange={(checked) => handleToggleEnabled(database.id, checked)}
                            size="sm"
                          />
                        </div>
                      </div>
                      <CardDescription>{database.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Response Time</p>
                          <p className="font-medium">{database.averageResponseTime}ms</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Checked</p>
                          <p className="font-medium">
                            {format(new Date(database.lastCheckedAt), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => testDatabaseMutation.mutate({ id: database.id, testBarcode })}
                        disabled={testDatabaseMutation.isPending}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        {testDatabaseMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Database
                      </Button>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Databases Found</h3>
                <p className="text-muted-foreground mb-4">Initialize the database configuration to continue.</p>
                <Button 
                  onClick={() => initializeDatabasesMutation.mutate()}
                  disabled={initializeDatabasesMutation.isPending}
                >
                  {initializeDatabasesMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Initialize Databases
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Management Tab */}
        <TabsContent value="management" className="space-y-6">
          {databases && databases.length > 0 ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Layers className="w-5 h-5" />
                    <span>Database Priority Management</span>
                  </CardTitle>
                  <CardDescription>
                    Manage the order and status of database lookups in the cascading system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {databases
                    .sort((a, b) => a.priority - b.priority)
                    .map((database, index) => (
                      <DatabaseManagementRow
                        key={database.id}
                        database={database}
                        index={index}
                        totalCount={databases.length}
                        onToggleEnabled={handleToggleEnabled}
                        onMovePriority={handleMovePriority}
                        isUpdating={updateDatabaseMutation.isPending}
                      />
                    ))
                  }
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Databases Found</h3>
                <p className="text-muted-foreground mb-4">Initialize the database configuration to continue.</p>
                <Button 
                  onClick={() => initializeDatabasesMutation.mutate()}
                  disabled={initializeDatabasesMutation.isPending}
                >
                  {initializeDatabasesMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Initialize Databases
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="w-5 h-5" />
                <span>Cascading System Test</span>
              </CardTitle>
              <CardDescription>
                Test the complete cascading database lookup system with a barcode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter barcode to test (e.g., 7622300871000)"
                    value={testBarcode}
                    onChange={(e) => setTestBarcode(e.target.value)}
                  />
                </div>
                <Button
                  onClick={testCascadingSystem}
                  disabled={isTestingCascade || !testBarcode.trim()}
                >
                  {isTestingCascade && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Play className="w-4 h-4 mr-2" />
                  Test Cascade
                </Button>
              </div>

              {/* Test Results */}
              {testResults && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-semibold">Test Results for: {testResults.barcode}</h4>
                      <p className="text-sm text-muted-foreground">
                        Total Time: {testResults.totalTime}ms | 
                        Final Source: {testResults.finalSource} | 
                        Success: {testResults.success ? 'Yes' : 'No'}
                      </p>
                    </div>
                    {testResults.success ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>

                  {testResults.error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Test Failed</AlertTitle>
                      <AlertDescription>{testResults.error}</AlertDescription>
                    </Alert>
                  )}

                  {testResults.testResults && testResults.testResults.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Database Test Results:</h5>
                      {testResults.testResults.map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {result.success ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <div>
                              <p className="font-medium">{result.databaseName}</p>
                              <p className="text-sm text-muted-foreground">
                                {result.responseTime}ms | Product Found: {result.productFound ? 'Yes' : 'No'}
                              </p>
                            </div>
                          </div>
                          {result.error && (
                            <Badge variant="destructive" className="text-xs">
                              Error: {result.error}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Database Performance Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Performance metrics and analytics will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}