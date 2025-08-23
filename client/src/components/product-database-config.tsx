import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Database, 
  Settings, 
  TestTube, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowUp, 
  ArrowDown,
  Eye,
  EyeOff,
  Key,
  Globe 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface ProductDatabase {
  id: number;
  databaseName: string;
  databaseType: string;
  apiEndpoint?: string;
  apiKey?: string;
  timeout: number;
  priority: number;
  isEnabled: boolean;
  isOperational?: boolean;
  lastTestedAt?: string;
  averageResponseTime?: number;
  createdAt: string;
  updatedAt: string;
}

interface TestResult {
  databaseId: number;
  databaseName: string;
  success: boolean;
  responseTime: number;
  error?: string;
  hasData: boolean;
  productData?: any;
}

export default function ProductDatabaseConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDatabase, setSelectedDatabase] = useState<ProductDatabase | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testBarcode, setTestBarcode] = useState("7622210995292");
  const [configForm, setConfigForm] = useState<Partial<ProductDatabase>>({});
  const [showApiKeys, setShowApiKeys] = useState<{ [key: number]: boolean }>({});

  // Fetch all product databases
  const { data: databases, isLoading } = useQuery<ProductDatabase[]>({
    queryKey: ["/api/admin/product-databases"],
    queryFn: async (): Promise<ProductDatabase[]> => {
      return apiRequest("GET", "/api/admin/product-databases");
    },
  });

  // Update database configuration mutation
  const updateDatabaseMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<ProductDatabase> }): Promise<ProductDatabase> => {
      return apiRequest("PUT", `/api/admin/product-databases/${id}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Database configuration updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-databases"] });
      setIsConfigDialogOpen(false);
      setSelectedDatabase(null);
      setConfigForm({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update database configuration",
        variant: "destructive",
      });
    },
  });

  // Reorder databases mutation
  const reorderDatabasesMutation = useMutation({
    mutationFn: async (databases: Array<{ id: number; priority: number }>): Promise<ProductDatabase[]> => {
      return apiRequest("PUT", "/api/admin/product-databases/reorder", { databases });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Database order updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-databases"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reorder databases",
        variant: "destructive",
      });
    },
  });

  // Test single database mutation
  const testDatabaseMutation = useMutation({
    mutationFn: async ({ id, testBarcode }: { id: number; testBarcode: string }): Promise<TestResult> => {
      return apiRequest("POST", `/api/admin/product-databases/${id}/test`, { testBarcode });
    },
    onSuccess: (result: TestResult) => {
      const status = result.success ? "Success" : "Error";
      const variant = result.success ? "default" : "destructive";
      toast({
        title: status,
        description: result.success 
          ? `Database test completed in ${result.responseTime}ms` 
          : `Test failed: ${result.error}`,
        variant,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-databases"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to test database",
        variant: "destructive",
      });
    },
  });

  // Test all databases mutation
  const testAllDatabasesMutation = useMutation({
    mutationFn: async (testBarcode: string): Promise<TestResult[]> => {
      return apiRequest("POST", "/api/admin/product-databases/test-all", { testBarcode });
    },
    onSuccess: (results: TestResult[]) => {
      const successCount = results.filter(r => r.success).length;
      toast({
        title: "Batch Test Complete",
        description: `${successCount} out of ${results.length} databases responded successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-databases"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to test databases",
        variant: "destructive",
      });
    },
  });

  // Initialize databases mutation
  const initializeDatabasesMutation = useMutation({
    mutationFn: async (): Promise<ProductDatabase[]> => {
      return apiRequest("POST", "/api/admin/product-databases/initialize");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Default database configurations initialized",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-databases"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize databases",
        variant: "destructive",
      });
    },
  });

  const handleConfigureDatabase = (database: ProductDatabase) => {
    setSelectedDatabase(database);
    setConfigForm({
      databaseName: database.databaseName,
      databaseType: database.databaseType,
      apiEndpoint: database.apiEndpoint,
      apiKey: database.apiKey,
      timeout: database.timeout,
      priority: database.priority,
      isEnabled: database.isEnabled,
    });
    setIsConfigDialogOpen(true);
  };

  const handleUpdateConfiguration = () => {
    if (!selectedDatabase) return;
    updateDatabaseMutation.mutate({
      id: selectedDatabase.id,
      updates: configForm
    });
  };

  const handleToggleEnabled = (database: ProductDatabase) => {
    updateDatabaseMutation.mutate({
      id: database.id,
      updates: { isEnabled: !database.isEnabled }
    });
  };

  const handleMovePriority = (database: ProductDatabase, direction: 'up' | 'down') => {
    if (!databases || !Array.isArray(databases)) return;
    
    const currentIndex = databases.findIndex((db: ProductDatabase) => db.id === database.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= databases.length) return;
    
    const reorderedDatabases = databases.map((db: ProductDatabase, index: number) => ({
      id: db.id,
      priority: index === currentIndex ? newIndex + 1 : 
                index === newIndex ? currentIndex + 1 : 
                index + 1
    }));
    
    reorderDatabasesMutation.mutate(reorderedDatabases);
  };

  const handleTestDatabase = (database: ProductDatabase) => {
    testDatabaseMutation.mutate({
      id: database.id,
      testBarcode
    });
  };

  const handleTestAllDatabases = () => {
    testAllDatabasesMutation.mutate(testBarcode);
  };

  const toggleApiKeyVisibility = (databaseId: number) => {
    setShowApiKeys(prev => ({
      ...prev,
      [databaseId]: !prev[databaseId]
    }));
  };

  const getStatusBadge = (database: ProductDatabase) => {
    if (!database.isEnabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    }
    if (database.isOperational === undefined) {
      return <Badge variant="outline">Untested</Badge>;
    }
    return database.isOperational ? 
      <Badge variant="default" className="bg-green-100 text-green-800">Operational</Badge> :
      <Badge variant="destructive">Error</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading database configurations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Product Database Configuration</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage external product databases and API configurations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => initializeDatabasesMutation.mutate()}
            disabled={initializeDatabasesMutation.isPending}
            variant="outline"
          >
            <Database className="w-4 h-4 mr-2" />
            Initialize Defaults
          </Button>
          <Button
            onClick={handleTestAllDatabases}
            disabled={testAllDatabasesMutation.isPending}
            variant="outline"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Test All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {databases && Array.isArray(databases) ? databases.map((database: ProductDatabase) => (
              <Card key={database.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{database.databaseName}</CardTitle>
                    {getStatusBadge(database)}
                  </div>
                  <CardDescription>{database.databaseType}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                    <div className="flex items-center gap-1">
                      <span>#{database.priority}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMovePriority(database, 'up')}
                        disabled={database.priority === 1}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMovePriority(database, 'down')}
                        disabled={database.priority === databases.length}
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Enabled:</span>
                    <Switch
                      checked={database.isEnabled}
                      onCheckedChange={() => handleToggleEnabled(database)}
                    />
                  </div>

                  {database.averageResponseTime && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Avg Response:</span>
                      <span>{database.averageResponseTime}ms</span>
                    </div>
                  )}

                  {database.lastTestedAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Last Tested:</span>
                      <span>{new Date(database.lastTestedAt).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleConfigureDatabase(database)}
                      className="flex-1"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Configure
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestDatabase(database)}
                      disabled={testDatabaseMutation.isPending}
                    >
                      <TestTube className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : null}
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Configurations</CardTitle>
              <CardDescription>
                Detailed view of all database configurations with sensitive information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {databases && Array.isArray(databases) ? databases.map((database: ProductDatabase) => (
                  <div key={database.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{database.databaseName}</h3>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(database)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfigureDatabase(database)}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Type:</span>
                        <span className="ml-2">{database.databaseType}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Timeout:</span>
                        <span className="ml-2">{database.timeout}ms</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-600 dark:text-gray-400">Endpoint:</span>
                        <span className="ml-2 font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {database.apiEndpoint || 'Not configured'}
                        </span>
                      </div>
                      {database.apiKey && (
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">API Key:</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleApiKeyVisibility(database.id)}
                            >
                              {showApiKeys[database.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                          </div>
                          <span className="ml-2 font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {showApiKeys[database.id] ? database.apiKey : '••••••••••••••••'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Testing</CardTitle>
              <CardDescription>
                Test database connectivity and response times
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="testBarcode">Test Barcode</Label>
                  <Input
                    id="testBarcode"
                    value={testBarcode}
                    onChange={(e) => setTestBarcode(e.target.value)}
                    placeholder="Enter barcode to test"
                  />
                </div>
                <Button
                  onClick={handleTestAllDatabases}
                  disabled={testAllDatabasesMutation.isPending}
                  className="mt-6"
                >
                  {testAllDatabasesMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4 mr-2" />
                  )}
                  Test All Databases
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                {databases && Array.isArray(databases) ? databases.map((database: ProductDatabase) => (
                  <div key={database.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {database.isOperational === true ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : database.isOperational === false ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="font-medium">{database.databaseName}</span>
                      </div>
                      {database.averageResponseTime && (
                        <Badge variant="outline">
                          {database.averageResponseTime}ms
                        </Badge>
                      )}
                      {!database.isEnabled && (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestDatabase(database)}
                      disabled={testDatabaseMutation.isPending || !database.isEnabled}
                    >
                      {testDatabaseMutation.isPending ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <TestTube className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                )) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Database</DialogTitle>
            <DialogDescription>
              Update database configuration and API settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="databaseName">Database Name</Label>
              <Input
                id="databaseName"
                value={configForm.databaseName || ""}
                onChange={(e) => setConfigForm(prev => ({ ...prev, databaseName: e.target.value }))}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="apiEndpoint">API Endpoint</Label>
              <Input
                id="apiEndpoint"
                value={configForm.apiEndpoint || ""}
                onChange={(e) => setConfigForm(prev => ({ ...prev, apiEndpoint: e.target.value }))}
                placeholder="https://api.example.com"
              />
            </div>
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={configForm.apiKey || ""}
                onChange={(e) => setConfigForm(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter API key if required"
              />
            </div>
            <div>
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={configForm.timeout || 5000}
                onChange={(e) => setConfigForm(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isEnabled"
                checked={configForm.isEnabled || false}
                onCheckedChange={(checked) => setConfigForm(prev => ({ ...prev, isEnabled: checked }))}
              />
              <Label htmlFor="isEnabled">Enable Database</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateConfiguration}
              disabled={updateDatabaseMutation.isPending}
            >
              {updateDatabaseMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Settings className="w-4 h-4 mr-2" />
              )}
              Update Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}