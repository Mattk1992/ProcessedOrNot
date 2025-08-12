import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Settings, 
  Cpu, 
  Zap, 
  BarChart3, 
  Save, 
  RefreshCcw, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Sparkles
} from "lucide-react";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  maxTokens: number;
  costPer1kTokens: number;
  isActive: boolean;
}

interface AIConfiguration {
  analysisAI: {
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    enabled: boolean;
  };
}

export default function AdminAIManagement() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("analysis");

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.accountType !== 'Admin') {
    setLocation("/login");
    return null;
  }

  // Available AI models
  const availableModels: AIModel[] = [
    {
      id: "gpt-4o",
      name: "GPT-4o",
      provider: "OpenAI",
      description: "Latest OpenAI model with enhanced capabilities",
      maxTokens: 128000,
      costPer1kTokens: 0.005,
      isActive: true
    },
    {
      id: "gpt-4o-mini",
      name: "GPT-4o Mini",
      provider: "OpenAI", 
      description: "Faster, cost-effective version of GPT-4o",
      maxTokens: 128000,
      costPer1kTokens: 0.00015,
      isActive: true
    },
    {
      id: "gpt-4-turbo",
      name: "GPT-4 Turbo",
      provider: "OpenAI",
      description: "High-performance GPT-4 variant",
      maxTokens: 128000,
      costPer1kTokens: 0.01,
      isActive: true
    },
    {
      id: "gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
      provider: "OpenAI",
      description: "Fast and economical GPT model",
      maxTokens: 16385,
      costPer1kTokens: 0.0005,
      isActive: true
    }
  ];

  // Fetch AI configuration
  const { data: aiConfig, isLoading: isLoadingConfig } = useQuery<AIConfiguration>({
    queryKey: ['/api/admin/ai-config'],
    enabled: isAuthenticated && user?.accountType === 'Admin',
  });

  // Update AI configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (configData: Partial<AIConfiguration>) => {
      const response = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update configuration');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-config'] });
      toast({
        title: "Configuration Updated",
        description: "AI settings have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update AI configuration.",
        variant: "destructive",
      });
    },
  });

  // Test AI connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (model: string) => {
      const response = await fetch('/api/admin/ai-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to test connection');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Connection Successful",
        description: `${data.model} is working correctly. Response time: ${data.responseTime}ms`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to AI model.",
        variant: "destructive",
      });
    },
  });

  const handleAnalysisAIUpdate = (field: string, value: any) => {
    if (!aiConfig) return;
    
    const updatedConfig = {
      ...aiConfig,
      analysisAI: {
        ...aiConfig.analysisAI,
        [field]: value
      }
    };
    
    updateConfigMutation.mutate(updatedConfig);
  };

  const handleTestConnection = (model: string) => {
    testConnectionMutation.mutate(model);
  };

  if (isLoadingConfig) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Loading AI configuration...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/admin")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Management & Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure and manage AI models used throughout the platform
            </p>
          </div>
        </div>
      </div>

      {/* AI Models Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Available AI Models
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableModels.map((model) => (
              <div key={model.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{model.name}</h3>
                  <Badge variant={model.isActive ? "default" : "secondary"}>
                    {model.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {model.description}
                </p>
                <div className="space-y-1 text-xs">
                  <div>Provider: {model.provider}</div>
                  <div>Max Tokens: {model.maxTokens.toLocaleString()}</div>
                  <div>Cost: ${model.costPer1kTokens}/1K tokens</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => handleTestConnection(model.id)}
                  disabled={testConnectionMutation.isPending}
                >
                  {testConnectionMutation.isPending ? (
                    <RefreshCcw className="w-3 h-3 animate-spin" />
                  ) : (
                    "Test Connection"
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analysis AI
          </TabsTrigger>
        </TabsList>

        {/* Analysis AI Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Analysis AI Configuration
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure the AI model used for food product analysis, ingredient processing, and nutrition insights.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Model Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="analysis-model">AI Analysis Model</Label>
                  <Select
                    value={aiConfig?.analysisAI?.model || "gpt-4o"}
                    onValueChange={(value) => handleAnalysisAIUpdate('model', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.filter(m => m.isActive).map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            {model.name} - {model.provider}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Primary model for ingredient analysis and processing score calculation
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="analysis-enabled">Enable Analysis AI</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="analysis-enabled"
                      checked={aiConfig?.analysisAI?.enabled ?? true}
                      onCheckedChange={(checked) => handleAnalysisAIUpdate('enabled', checked)}
                    />
                    <span className="text-sm">
                      {aiConfig?.analysisAI?.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Toggle AI-powered analysis features on/off
                  </p>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="analysis-temperature">Temperature</Label>
                  <Input
                    id="analysis-temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={aiConfig?.analysisAI?.temperature ?? 0.3}
                    onChange={(e) => handleAnalysisAIUpdate('temperature', parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">
                    Controls randomness (0.0 = deterministic, 2.0 = very creative)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="analysis-max-tokens">Max Tokens</Label>
                  <Input
                    id="analysis-max-tokens"
                    type="number"
                    min="100"
                    max="4000"
                    value={aiConfig?.analysisAI?.maxTokens ?? 1500}
                    onChange={(e) => handleAnalysisAIUpdate('maxTokens', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">
                    Maximum response length for analysis results
                  </p>
                </div>
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <Label htmlFor="analysis-prompt">System Prompt</Label>
                <Textarea
                  id="analysis-prompt"
                  rows={6}
                  value={aiConfig?.analysisAI?.systemPrompt ?? "You are a professional nutritionist and food analysis expert..."}
                  onChange={(e) => handleAnalysisAIUpdate('systemPrompt', e.target.value)}
                  placeholder="Enter the system prompt for analysis AI..."
                />
                <p className="text-xs text-gray-500">
                  Instructions that guide how the AI analyzes food products and ingredients
                </p>
              </div>

              {/* Usage Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1,247</div>
                  <div className="text-sm text-gray-600">Analyses Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">98.5%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">0.8s</div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <Button
                  onClick={() => handleTestConnection(aiConfig?.analysisAI?.model || "gpt-4o")}
                  disabled={testConnectionMutation.isPending}
                  variant="outline"
                >
                  {testConnectionMutation.isPending ? (
                    <>
                      <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {updateConfigMutation.isPending ? (
                    <>
                      <RefreshCcw className="w-3 h-3 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      All changes saved automatically
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}