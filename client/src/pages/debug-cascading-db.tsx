import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Target
} from "lucide-react";
import HeaderDropdown from "@/components/header-dropdown";
import LanguageSwitcher from "@/components/language-switcher";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest } from "@/lib/queryClient";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";

interface ProductDatabase {
  id: number;
  databaseName: string;
  displayName: string;
  priority: number;
  isEnabled: boolean;
  apiEndpoint?: string;
  requiresApiKey: boolean;
  apiKeyConfigured: boolean;
  description?: string;
  coverage?: string;
  dataType?: string;
  averageResponseTime?: number;
  successRate?: number;
  dataFoundRate?: number;
  lastTested?: string;
  isOperational: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseTestResult {
  databaseName: string;
  success: boolean;
  responseTime: number;
  error?: string;
  productFound: boolean;
  productData?: any;
}

interface CascadingTestResult {
  barcode: string;
  totalTime: number;
  finalSource: string;
  finalProduct?: any;
  testResults: DatabaseTestResult[];
  success: boolean;
  error?: string;
}

export default function DebugCascadingDatabase() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [testBarcode, setTestBarcode] = useState("7622300871000"); // Nutella barcode for testing
  const [testResults, setTestResults] = useState<CascadingTestResult | null>(null);
  const [isTestingCascade, setIsTestingCascade] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<ProductDatabase | null>(null);

  // Fetch all product databases
  const { data: databases, isLoading: databasesLoading, error: databasesError } = useQuery<ProductDatabase[]>({
    queryKey: ["/api/admin/product-databases"],
    enabled: isAuthenticated && user?.accountType === 'Admin',
  });

  // Test individual database mutation
  const testDatabaseMutation = useMutation({
    mutationFn: async ({ id, barcode }: { id: number; barcode: string }) => {
      const response = await apiRequest(`/api/admin/product-databases/${id}/test`, {
        method: "POST",
        body: { barcode },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-databases"] });
    },
  });

  // Test cascading system
  const testCascadingSystem = async () => {
    if (!testBarcode.trim()) return;
    
    setIsTestingCascade(true);
    setTestResults(null);
    
    try {
      const startTime = Date.now();
      const response = await apiRequest(`/api/debug/cascading-test`, {
        method: "POST",
        body: { barcode: testBarcode },
      });
      const endTime = Date.now();
      
      setTestResults({
        ...response,
        totalTime: endTime - startTime,
      });
    } catch (error: any) {
      setTestResults({
        barcode: testBarcode,
        totalTime: 0,
        finalSource: "Error",
        testResults: [],
        success: false,
        error: error.message || "Test failed"
      });
    } finally {
      setIsTestingCascade(false);
    }
  };

  // Initialize default databases
  const initializeDatabasesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/admin/product-databases/initialize", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-databases"] });
    },
  });

  // Authentication check
  if (!isAuthenticated || user?.accountType !== 'Admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        <header className="backdrop-blur-md bg-background/80 border-b border-border/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <img src={logoPath} alt="ProcessedOrNot Scanner" className="w-10 h-10 rounded-full" />
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold gradient-text">ProcessedOrNot</h1>
                  <p className="text-xs text-muted-foreground">Database Debug</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <LanguageSwitcher />
                <HeaderDropdown />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground">This debugging tool is only available to Admin users.</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (database: ProductDatabase) => {
    if (!database.isEnabled) return <XCircle className="w-4 h-4 text-gray-500" />;
    if (!database.isOperational) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusColor = (database: ProductDatabase) => {
    if (!database.isEnabled) return "bg-gray-500";
    if (!database.isOperational) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <header className="backdrop-blur-md bg-background/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src={logoPath} alt="ProcessedOrNot Scanner" className="w-10 h-10 rounded-full" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold gradient-text">ProcessedOrNot</h1>
                <p className="text-xs text-muted-foreground">Database Debug Console</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <HeaderDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Cascading Database Debug Console</h2>
              <p className="text-muted-foreground">
                Debug and test the cascading product database system
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              onClick={() => initializeDatabasesMutation.mutate()}
              disabled={initializeDatabasesMutation.isPending}
              variant="outline"
            >
              {initializeDatabasesMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Settings className="w-4 h-4 mr-2" />
              Initialize Default Databases
            </Button>
            
            <Button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/product-databases"] })}
              variant="outline"
            >
              <Activity className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="databases">Database Status</TabsTrigger>
            <TabsTrigger value="testing">Cascade Testing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Total Databases</p>
                      <p className="text-2xl font-bold">{databases?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Operational</p>
                      <p className="text-2xl font-bold">
                        {databases?.filter(db => db.isOperational && db.isEnabled).length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Issues</p>
                      <p className="text-2xl font-bold">
                        {databases?.filter(db => !db.isOperational || !db.isEnabled).length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">API Keys Required</p>
                      <p className="text-2xl font-bold">
                        {databases?.filter(db => db.requiresApiKey && !db.apiKeyConfigured).length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>System Health Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {databasesLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading database configuration...</p>
                  </div>
                ) : databasesError ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Databases</AlertTitle>
                    <AlertDescription>
                      Failed to load database configuration. Please check your connection and try again.
                    </AlertDescription>
                  </Alert>
                ) : databases && databases.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Databases are listed in priority order (lower numbers = higher priority)
                    </p>
                    {databases
                      .sort((a, b) => a.priority - b.priority)
                      .map((database) => (
                        <div key={database.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(database)}
                            <div>
                              <h4 className="font-medium">{database.displayName}</h4>
                              <p className="text-sm text-muted-foreground">
                                Priority: {database.priority} | Coverage: {database.coverage || 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={`${getStatusColor(database)} text-white`}>
                              #{database.priority}
                            </Badge>
                            {database.requiresApiKey && !database.apiKeyConfigured && (
                              <Badge variant="destructive">API Key Required</Badge>
                            )}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Databases Configured</h3>
                    <p className="text-muted-foreground mb-4">
                      Initialize the default database configuration to get started.
                    </p>
                    <Button
                      onClick={() => initializeDatabasesMutation.mutate()}
                      disabled={initializeDatabasesMutation.isPending}
                    >
                      {initializeDatabasesMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Initialize Databases
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Status Tab */}
          <TabsContent value="databases" className="space-y-6">
            {databases && databases.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {databases
                  .sort((a, b) => a.priority - b.priority)
                  .map((database) => (
                    <Card key={database.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center space-x-2">
                            {getStatusIcon(database)}
                            <span>{database.displayName}</span>
                          </CardTitle>
                          <Badge variant="outline">Priority {database.priority}</Badge>
                        </div>
                        <CardDescription>{database.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Status Information */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Status</p>
                            <p className={database.isOperational ? "text-green-600" : "text-red-600"}>
                              {database.isOperational ? "Operational" : "Not Operational"}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Enabled</p>
                            <p className={database.isEnabled ? "text-green-600" : "text-gray-600"}>
                              {database.isEnabled ? "Yes" : "No"}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Coverage</p>
                            <p className="text-muted-foreground">{database.coverage || 'Unknown'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Data Type</p>
                            <p className="text-muted-foreground">{database.dataType || 'Unknown'}</p>
                          </div>
                        </div>

                        {/* API Configuration */}
                        {database.requiresApiKey && (
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-600" />
                              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                API Key Required
                              </p>
                            </div>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                              Status: {database.apiKeyConfigured ? 'Configured' : 'Not Configured'}
                            </p>
                          </div>
                        )}

                        {/* Performance Metrics */}
                        {(database.averageResponseTime || database.successRate) && (
                          <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                            {database.averageResponseTime && (
                              <div>
                                <p className="font-medium">Avg Response</p>
                                <p className="text-muted-foreground">{database.averageResponseTime}ms</p>
                              </div>
                            )}
                            {database.successRate && (
                              <div>
                                <p className="font-medium">Success Rate</p>
                                <p className="text-muted-foreground">{database.successRate}%</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Test Button */}
                        <Button
                          onClick={() => testDatabaseMutation.mutate({ id: database.id, barcode: testBarcode })}
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
                  <p className="text-muted-foreground">Initialize the database configuration to continue.</p>
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
      </main>
    </div>
  );
}