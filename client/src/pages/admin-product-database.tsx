import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Settings, 
  Play, 
  Pause, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowUp, 
  ArrowDown,
  Key,
  Globe,
  Activity,
  Zap
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

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

export default function AdminProductDatabase() {
  const [editingDatabase, setEditingDatabase] = useState<ProductDatabase | null>(null);
  const [testBarcode, setTestBarcode] = useState('7622210995292');
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all databases
  const { data: databases = [], isLoading } = useQuery({
    queryKey: ['/api/admin/product-databases'],
  });

  // Initialize databases
  const initializeMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/product-databases/initialize', {
      method: 'POST',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/product-databases'] });
      toast({
        title: "Success",
        description: "Product databases initialized successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initialize databases",
        variant: "destructive",
      });
    },
  });

  // Update database
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<ProductDatabase> }) =>
      apiRequest(`/api/admin/product-databases/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/product-databases'] });
      setEditingDatabase(null);
      toast({
        title: "Success",
        description: "Database updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update database",
        variant: "destructive",
      });
    },
  });

  // Test single database
  const testSingleMutation = useMutation({
    mutationFn: ({ id, testBarcode }: { id: number; testBarcode: string }) =>
      apiRequest(`/api/admin/product-databases/${id}/test`, {
        method: 'POST',
        body: JSON.stringify({ testBarcode }),
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/product-databases'] });
      toast({
        title: "Test Complete",
        description: `${result.databaseName}: ${result.result} (${result.responseTime}ms)`,
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to test database",
        variant: "destructive",
      });
    },
  });

  // Test all databases
  const testAllMutation = useMutation({
    mutationFn: (testBarcode: string) =>
      apiRequest('/api/admin/product-databases/test-all', {
        method: 'POST',
        body: JSON.stringify({ testBarcode }),
      }),
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/product-databases'] });
      const successCount = results.filter((r: any) => r.success).length;
      toast({
        title: "Test Complete",
        description: `${successCount}/${results.length} databases responded successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Test Failed",
        description: "Failed to test databases",
        variant: "destructive",
      });
    },
  });

  // Reorder databases
  const reorderMutation = useMutation({
    mutationFn: (databases: Array<{ id: number; priority: number }>) =>
      apiRequest('/api/admin/product-databases/reorder', {
        method: 'PUT',
        body: JSON.stringify({ databases }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/product-databases'] });
      toast({
        title: "Success",
        description: "Database order updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reorder databases",
        variant: "destructive",
      });
    },
  });

  const handleToggleEnabled = (database: ProductDatabase) => {
    updateMutation.mutate({
      id: database.id,
      updates: { isEnabled: !database.isEnabled }
    });
  };

  const handleMovePriority = (database: ProductDatabase, direction: 'up' | 'down') => {
    const currentIndex = databases.findIndex((db: ProductDatabase) => db.id === database.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= databases.length) return;
    
    const targetDatabase = databases[targetIndex];
    const updates = [
      { id: database.id, priority: targetDatabase.priority },
      { id: targetDatabase.id, priority: database.priority }
    ];
    
    reorderMutation.mutate(updates);
  };

  const handleTestAll = () => {
    setIsTesting(true);
    testAllMutation.mutate(testBarcode, {
      onSettled: () => setIsTesting(false)
    });
  };

  const handleTestSingle = (database: ProductDatabase) => {
    testSingleMutation.mutate({
      id: database.id,
      testBarcode
    });
  };

  const getStatusIcon = (database: ProductDatabase) => {
    if (!database.isEnabled) return <Pause className="h-4 w-4 text-gray-400" />;
    if (database.isOperational) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (database: ProductDatabase) => {
    if (!database.isEnabled) return <Badge variant="secondary">Disabled</Badge>;
    if (database.requiresApiKey && !database.apiKeyConfigured) return <Badge variant="destructive">API Key Required</Badge>;
    if (database.isOperational) return <Badge variant="default">Operational</Badge>;
    return <Badge variant="destructive">Not Operational</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Product Database Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure and manage the cascading product lookup system with 14+ databases
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => initializeMutation.mutate()}
            disabled={initializeMutation.isPending || databases.length > 0}
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Initialize Databases
          </Button>
        </div>
      </div>

      {/* Test All Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test All Databases
          </CardTitle>
          <CardDescription>
            Test all enabled databases with a specific barcode to verify connectivity and performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="testBarcode">Test Barcode</Label>
              <Input
                id="testBarcode"
                value={testBarcode}
                onChange={(e) => setTestBarcode(e.target.value)}
                placeholder="Enter barcode (e.g., 7622210995292)"
              />
            </div>
            <Button
              onClick={handleTestAll}
              disabled={isTesting || testAllMutation.isPending}
              className="px-6"
            >
              {isTesting || testAllMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Test All
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Database List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Cascading Database Configuration</h2>
        
        {databases.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Databases Configured</h3>
              <p className="text-muted-foreground mb-4">
                Initialize the default database configuration to get started
              </p>
              <Button onClick={() => initializeMutation.mutate()}>
                <Settings className="h-4 w-4 mr-2" />
                Initialize Default Databases
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {databases.map((database: ProductDatabase, index: number) => (
              <Card key={database.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-muted-foreground">
                        #{database.priority}
                      </div>
                      {getStatusIcon(database)}
                      <div>
                        <CardTitle className="text-lg">{database.displayName}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Globe className="h-3 w-3" />
                          {database.coverage} • {database.dataType}
                          {database.requiresApiKey && (
                            <>
                              • <Key className="h-3 w-3" /> API Key Required
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(database)}
                      
                      {/* Priority Controls */}
                      <div className="flex flex-col">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMovePriority(database, 'up')}
                          disabled={index === 0 || reorderMutation.isPending}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMovePriority(database, 'down')}
                          disabled={index === databases.length - 1 || reorderMutation.isPending}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Enable/Disable Toggle */}
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={database.isEnabled}
                          onCheckedChange={() => handleToggleEnabled(database)}
                          disabled={updateMutation.isPending}
                        />
                        <Label className="text-sm">Enabled</Label>
                      </div>
                      
                      {/* Test Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestSingle(database)}
                        disabled={!database.isEnabled || testSingleMutation.isPending}
                      >
                        <TestTube className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm">{database.description || 'No description available'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">API Endpoint</p>
                      <p className="text-sm font-mono break-all">
                        {database.apiEndpoint || 'Not configured'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      {database.averageResponseTime && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Response Time:</span>
                          <span>{database.averageResponseTime}ms</span>
                        </div>
                      )}
                      
                      {database.dataFoundRate !== null && database.dataFoundRate !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Data Found Rate:</span>
                          <span>{database.dataFoundRate}%</span>
                        </div>
                      )}
                      
                      {database.lastTested && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Last Tested:</span>
                          <span>{new Date(database.lastTested).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {database.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-sm bg-muted p-2 rounded mt-1">{database.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      {databases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {databases.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Databases</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {databases.filter((db: ProductDatabase) => db.isEnabled).length}
                </div>
                <div className="text-sm text-muted-foreground">Enabled</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {databases.filter((db: ProductDatabase) => db.isOperational).length}
                </div>
                <div className="text-sm text-muted-foreground">Operational</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {databases.filter((db: ProductDatabase) => db.requiresApiKey && !db.apiKeyConfigured).length}
                </div>
                <div className="text-sm text-muted-foreground">Need API Keys</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}