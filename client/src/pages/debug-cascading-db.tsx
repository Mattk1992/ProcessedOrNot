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
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";

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
              <h4 className="font-medium">{database.displayName}</h4>
              <p className="text-sm text-muted-foreground">
                {database.coverage || 'Unknown coverage'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {database.requiresApiKey && !database.apiKeyConfigured && (
          <Badge variant="destructive" className="text-xs">
            API Key Required
          </Badge>
        )}
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {database.isEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <Switch
            checked={database.isEnabled}
            onCheckedChange={(enabled) => onToggleEnabled(database.id, enabled)}
            disabled={isUpdating}
          />
        </div>
      </div>
    </div>
  );
}

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

function CascadingDatabaseDebugConsole() {
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
    mutationFn: async ({ id, testBarcode }: { id: number; testBarcode: string }) => {
      return await fetch(`/api/admin/product-databases/${id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testBarcode }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-databases"] });
    },
  });

  // Toggle database enabled/disabled mutation
  const toggleDatabaseMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      return await fetch(`/api/admin/product-databases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: enabled }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-databases"] });
    },
  });

  // Move database priority mutation
  const movePriorityMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: number; direction: 'up' | 'down' }) => {
      const currentDb = databases?.find(db => db.id === id);
      if (!currentDb || !databases) return;

      const sortedDbs = [...databases].sort((a, b) => a.priority - b.priority);
      const currentIndex = sortedDbs.findIndex(db => db.id === id);
      
      if (direction === 'up' && currentIndex > 0) {
        const targetDb = sortedDbs[currentIndex - 1];
        const updates = [
          { id: currentDb.id, priority: targetDb.priority },
          { id: targetDb.id, priority: currentDb.priority }
        ];
        
        return await fetch('/api/admin/product-databases/reorder', {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ databases: updates }),
        }).then(res => res.json());
      } else if (direction === 'down' && currentIndex < sortedDbs.length - 1) {
        const targetDb = sortedDbs[currentIndex + 1];
        const updates = [
          { id: currentDb.id, priority: targetDb.priority },
          { id: targetDb.id, priority: currentDb.priority }
        ];
        
        return await fetch('/api/admin/product-databases/reorder', {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ databases: updates }),
        }).then(res => res.json());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-databases"] });
    },
  });

  // Initialize databases mutation
  const initializeDatabasesMutation = useMutation({
    mutationFn: async () => {
      return await fetch('/api/admin/product-databases/initialize', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-databases"] });
    },
  });

  // Test all databases mutation
  const testAllDatabasesMutation = useMutation({
    mutationFn: async ({ testBarcode }: { testBarcode: string }) => {
      return await fetch('/api/admin/product-databases/test-all', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testBarcode }),
      }).then(res => res.json());
    },
    onSuccess: (data) => {
      setTestResults(data);
    },
  });

  // Test cascading system function
  const testCascadingSystem = async () => {
    if (!testBarcode.trim()) return;
    
    setIsTestingCascade(true);
    setTestResults(null);
    
    try {
      const response = await fetch('/api/debug/cascading-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: testBarcode }),
      });
      
      const result = await response.json();
      setTestResults(result);
    } catch (error) {
      console.error('Cascading test error:', error);
      setTestResults({
        barcode: testBarcode,
        success: false,
        finalSource: 'none',
        totalTime: 0,
        testResults: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTestingCascade(false);
    }
  };

  // System health calculations
  const systemHealth = databases ? {
    totalDatabases: databases.length,
    enabledDatabases: databases.filter(db => db.isEnabled).length,
    operationalDatabases: databases.filter(db => db.isOperational).length,
    averageResponseTime: databases.reduce((acc, db) => acc + (db.averageResponseTime || 0), 0) / databases.length,
    overallSuccessRate: databases.reduce((acc, db) => acc + (db.successRate || 0), 0) / databases.length,
  } : null;

  const getStatusIcon = (database: ProductDatabase) => {
    if (!database.isEnabled) {
      return <XCircle className="w-4 h-4 text-gray-400" />;
    }
    if (database.isOperational) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  };

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.accountType !== 'Admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              This debug console is only available to Admin users.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-white/20 dark:border-gray-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto mobile-safe-padding py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <img src={logoPath} alt="ProcessedOrNot" className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                  Debug Console
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  System monitoring and database management
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-xs sm:text-sm flex-shrink-0">
              Admin Tools
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mobile-safe-padding py-4 sm:py-6 lg:py-8">
        {/* System Overview */}
        {systemHealth && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{systemHealth.totalDatabases}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{systemHealth.enabledDatabases}</p>
                    <p className="text-xs text-muted-foreground">Enabled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{systemHealth.operationalDatabases}</p>
                    <p className="text-xs text-muted-foreground">Online</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{Math.round(systemHealth.averageResponseTime)}ms</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">Avg Response</p>
                    <p className="text-xs text-muted-foreground sm:hidden">Avg</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{Math.round(systemHealth.overallSuccessRate)}%</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">Success Rate</p>
                    <p className="text-xs text-muted-foreground sm:hidden">Success</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="databases" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md gap-1 p-1">
            <TabsTrigger value="databases" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm p-2 sm:p-3">
              <Database className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Databases</span>
              <span className="xs:hidden sm:hidden">DB</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm p-2 sm:p-3">
              <TestTube className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Testing</span>
              <span className="xs:hidden sm:hidden">Test</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm p-2 sm:p-3">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Analytics</span>
              <span className="xs:hidden sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm p-2 sm:p-3">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Settings</span>
              <span className="xs:hidden sm:hidden">Set</span>
            </TabsTrigger>
          </TabsList>

          {/* Database Status Tab */}
          <TabsContent value="databases" className="space-y-6">
            {databases && databases.length > 0 ? (
              <div className="space-y-6">
                {/* Database Management Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>Database Management</span>
                    </CardTitle>
                    <CardDescription>
                      Manage the cascading database system priority order and enable/disable databases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Databases are processed in priority order (lower numbers = higher priority). 
                        Disabled databases are skipped in the cascading lookup.
                      </p>
                      
                      {/* Sortable Database List */}
                      <div className="space-y-2">
                        {databases
                          .sort((a, b) => a.priority - b.priority)
                          .map((database, index) => (
                            <DatabaseManagementRow 
                              key={database.id}
                              database={database}
                              index={index}
                              totalCount={databases.length}
                              onToggleEnabled={(id, enabled) => toggleDatabaseMutation.mutate({ id, enabled })}
                              onMovePriority={(id, direction) => movePriorityMutation.mutate({ id, direction })}
                              isUpdating={toggleDatabaseMutation.isPending || movePriorityMutation.isPending}
                            />
                          ))
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Database Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>General Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure system-wide cascading database behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Global Timeout (seconds)</label>
                    <Input
                      type="number"
                      placeholder="30"
                      min="5"
                      max="300"
                      className="mobile-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum time to wait for database responses
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Retry Attempts</label>
                    <Input
                      type="number"
                      placeholder="3"
                      min="0"
                      max="10"
                      className="mobile-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of retry attempts for failed requests
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Enable Parallel Requests</p>
                      <p className="text-xs text-muted-foreground">
                        Query multiple databases simultaneously
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Cache Results</p>
                      <p className="text-xs text-muted-foreground">
                        Cache successful lookups for faster responses
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Performance Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Performance Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Optimize database lookup performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cache Duration (minutes)</label>
                    <Input
                      type="number"
                      placeholder="60"
                      min="1"
                      max="1440"
                      className="mobile-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      How long to cache successful responses
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rate Limit (requests/min)</label>
                    <Input
                      type="number"
                      placeholder="100"
                      min="10"
                      max="1000"
                      className="mobile-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum requests per database per minute
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Auto-Disable Failed Databases</p>
                      <p className="text-xs text-muted-foreground">
                        Temporarily disable databases with high failure rates
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Failure Threshold (%)</label>
                    <Input
                      type="number"
                      placeholder="25"
                      min="5"
                      max="90"
                      className="mobile-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      Disable database if failure rate exceeds this threshold
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Monitoring Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Monitoring & Alerts</span>
                  </CardTitle>
                  <CardDescription>
                    Configure monitoring and alert settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Enable Health Monitoring</p>
                      <p className="text-xs text-muted-foreground">
                        Continuously monitor database health
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Health Check Interval (minutes)</label>
                    <Input
                      type="number"
                      placeholder="15"
                      min="1"
                      max="60"
                      className="mobile-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      How often to perform health checks
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Email Alerts</p>
                      <p className="text-xs text-muted-foreground">
                        Send email notifications for critical issues
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Alert Email</label>
                    <Input
                      type="email"
                      placeholder="admin@example.com"
                      className="mobile-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email address for system alerts
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* API Key Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>API Key Management</span>
                  </CardTitle>
                  <CardDescription>
                    Manage API keys for external databases
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Security Notice</AlertTitle>
                    <AlertDescription>
                      API keys are encrypted and stored securely. Never share or expose them in logs.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">USDA API Key</label>
                    <Input
                      type="password"
                      placeholder="Enter USDA API key..."
                      className="mobile-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      Required for USDA Food Data Central access
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nutritionix API Key</label>
                    <Input
                      type="password"
                      placeholder="Enter Nutritionix API key..."
                      className="mobile-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      Required for Nutritionix database access
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Spoonacular API Key</label>
                    <Input
                      type="password"
                      placeholder="Enter Spoonacular API key..."
                      className="mobile-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      Required for Spoonacular database access
                    </p>
                  </div>

                  <Button className="w-full mobile-button" size="mobile">
                    <Settings className="w-4 h-4 mr-2" />
                    Update API Keys
                  </Button>
                </CardContent>
              </Card>

              {/* Backup & Recovery */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5" />
                    <span>Backup & Recovery</span>
                  </CardTitle>
                  <CardDescription>
                    Database backup and recovery settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Auto Backup</p>
                      <p className="text-xs text-muted-foreground">
                        Automatically backup database configurations
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Backup Frequency</label>
                    <select className="w-full p-2 border rounded-md mobile-input">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      How often to create backups
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Retention Period (days)</label>
                    <Input
                      type="number"
                      placeholder="30"
                      min="1"
                      max="365"
                      className="mobile-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      How long to keep backup files
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 mobile-button" size="mobile">
                      Create Backup
                    </Button>
                    <Button variant="outline" className="flex-1 mobile-button" size="mobile">
                      Restore Backup
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Layers className="w-5 h-5" />
                    <span>Advanced Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Advanced system settings for power users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom User Agent</label>
                    <Textarea
                      placeholder="ProcessedOrNot/1.0 (Food Scanner Bot)"
                      className="mobile-input"
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground">
                      Custom user agent string for API requests
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Request Headers (JSON)</label>
                    <Textarea
                      placeholder='{"Accept": "application/json", "Content-Type": "application/json"}'
                      className="mobile-input font-mono text-sm"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Additional headers to include with requests
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Debug Logging</p>
                      <p className="text-xs text-muted-foreground">
                        Enable detailed request/response logging
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Strict SSL Verification</p>
                      <p className="text-xs text-muted-foreground">
                        Enforce strict SSL certificate validation
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Advanced Settings</AlertTitle>
                    <AlertDescription>
                      These settings can affect system performance. Only modify if you understand the implications.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            {/* Save Settings */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Save Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                      Apply changes to the cascading database system
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="mobile-button" size="mobile">
                      Reset to Defaults
                    </Button>
                    <Button className="mobile-button" size="mobile">
                      <Settings className="w-4 h-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default CascadingDatabaseDebugConsole;