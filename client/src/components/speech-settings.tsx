import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mic, 
  Settings, 
  Volume2, 
  Languages, 
  Clock, 
  Zap, 
  Shield,
  CheckCircle,
  AlertCircle,
  Save,
  RefreshCw
} from "lucide-react";

interface SpeechSettings {
  enabled: boolean;
  apiKey: string;
  language: string;
  autoStop: boolean;
  autoStopDuration: number;
  enhancedAccuracy: boolean;
  punctuation: boolean;
  formatText: boolean;
  wordBoost: string[];
  customWords: string;
  confidenceThreshold: number;
  maxRecordingDuration: number;
  sampleRate: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
}

interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'error';
  message: string;
  lastChecked: string;
}

export default function SpeechSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testMode, setTestMode] = useState(false);

  // Fetch current speech settings
  const { data: settings, isLoading } = useQuery<SpeechSettings>({
    queryKey: ["/api/admin/speech-settings"],
  });

  // Fetch service status
  const { data: status } = useQuery<ServiceStatus>({
    queryKey: ["/api/admin/speech-status"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<SpeechSettings>) => {
      return apiRequest("PUT", "/api/admin/speech-settings", newSettings);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Speech-to-Text settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/speech-settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/speech-test");
    },
    onSuccess: (data: any) => {
      toast({
        title: "Connection Test Successful",
        description: data.message || "AssemblyAI service is working correctly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/speech-status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Test Failed",
        description: error.message || "Unable to connect to AssemblyAI service.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      wordBoost: settings.customWords ? 
        settings.customWords.split(',').map(word => word.trim()).filter(Boolean) : 
        settings.wordBoost
    };
    
    updateSettingsMutation.mutate(updatedSettings);
  };

  const handleTestConnection = () => {
    setTestMode(true);
    testConnectionMutation.mutate();
    setTimeout(() => setTestMode(false), 3000);
  };

  const getStatusIcon = () => {
    if (!status) return <AlertCircle className="w-4 h-4 text-gray-500" />;
    
    switch (status.status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    if (!status) return 'secondary';
    
    switch (status.status) {
      case 'healthy':
        return 'default';
      case 'degraded':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5" />
            <span>Service Status</span>
          </CardTitle>
          <CardDescription>
            Current status of the AssemblyAI Speech-to-Text service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <Badge variant={getStatusColor()}>
                  {status?.status?.toUpperCase() || 'UNKNOWN'}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {status?.message || 'Status unknown'}
                </p>
                {status?.lastChecked && (
                  <p className="text-xs text-muted-foreground">
                    Last checked: {new Date(status.lastChecked).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <Button 
              onClick={handleTestConnection}
              disabled={testConnectionMutation.isPending}
              variant="outline"
            >
              {testConnectionMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Basic Configuration</span>
          </CardTitle>
          <CardDescription>
            Core settings for Speech-to-Text functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Speech-to-Text</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to search products using voice input
              </p>
            </div>
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => 
                updateSettingsMutation.mutate({ enabled: checked })
              }
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="apiKey">AssemblyAI API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={settings.apiKey || ''}
              onChange={(e) => 
                updateSettingsMutation.mutate({ apiKey: e.target.value })
              }
              placeholder="Enter your AssemblyAI API key"
            />
            <p className="text-sm text-muted-foreground">
              Your API key is encrypted and stored securely
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={settings.language}
              onValueChange={(value) => 
                updateSettingsMutation.mutate({ language: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
                <SelectItem value="nl">Dutch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Recording Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mic className="w-5 h-5" />
            <span>Recording Settings</span>
          </CardTitle>
          <CardDescription>
            Configure how audio is captured and processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoStop">Auto-stop Recording</Label>
              <p className="text-sm text-muted-foreground">
                Automatically stop recording after a period of silence
              </p>
            </div>
            <Switch
              id="autoStop"
              checked={settings.autoStop}
              onCheckedChange={(checked) => 
                updateSettingsMutation.mutate({ autoStop: checked })
              }
            />
          </div>

          {settings.autoStop && (
            <div className="space-y-2">
              <Label htmlFor="autoStopDuration">Auto-stop Duration (seconds)</Label>
              <Input
                id="autoStopDuration"
                type="number"
                min="3"
                max="30"
                value={settings.autoStopDuration}
                onChange={(e) => 
                  updateSettingsMutation.mutate({ 
                    autoStopDuration: parseInt(e.target.value) || 10 
                  })
                }
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="maxDuration">Max Recording Duration (seconds)</Label>
            <Input
              id="maxDuration"
              type="number"
              min="5"
              max="60"
              value={settings.maxRecordingDuration}
              onChange={(e) => 
                updateSettingsMutation.mutate({ 
                  maxRecordingDuration: parseInt(e.target.value) || 30 
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="echoCancellation">Echo Cancellation</Label>
              <p className="text-sm text-muted-foreground">
                Reduce feedback and echo from speakers
              </p>
            </div>
            <Switch
              id="echoCancellation"
              checked={settings.echoCancellation}
              onCheckedChange={(checked) => 
                updateSettingsMutation.mutate({ echoCancellation: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="noiseSuppression">Noise Suppression</Label>
              <p className="text-sm text-muted-foreground">
                Filter out background noise during recording
              </p>
            </div>
            <Switch
              id="noiseSuppression"
              checked={settings.noiseSuppression}
              onCheckedChange={(checked) => 
                updateSettingsMutation.mutate({ noiseSuppression: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Transcription Quality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Transcription Quality</span>
          </CardTitle>
          <CardDescription>
            Enhance accuracy and formatting of transcribed text
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enhancedAccuracy">Enhanced Accuracy</Label>
              <p className="text-sm text-muted-foreground">
                Use advanced models for better transcription quality
              </p>
            </div>
            <Switch
              id="enhancedAccuracy"
              checked={settings.enhancedAccuracy}
              onCheckedChange={(checked) => 
                updateSettingsMutation.mutate({ enhancedAccuracy: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="punctuation">Auto Punctuation</Label>
              <p className="text-sm text-muted-foreground">
                Automatically add punctuation to transcribed text
              </p>
            </div>
            <Switch
              id="punctuation"
              checked={settings.punctuation}
              onCheckedChange={(checked) => 
                updateSettingsMutation.mutate({ punctuation: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="formatText">Format Text</Label>
              <p className="text-sm text-muted-foreground">
                Apply formatting rules to improve readability
              </p>
            </div>
            <Switch
              id="formatText"
              checked={settings.formatText}
              onCheckedChange={(checked) => 
                updateSettingsMutation.mutate({ formatText: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confidenceThreshold">Confidence Threshold (%)</Label>
            <Input
              id="confidenceThreshold"
              type="number"
              min="0"
              max="100"
              value={Math.round(settings.confidenceThreshold * 100)}
              onChange={(e) => 
                updateSettingsMutation.mutate({ 
                  confidenceThreshold: parseInt(e.target.value) / 100 || 0.5 
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              Minimum confidence level to accept transcription results
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Word Boost */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Languages className="w-5 h-5" />
            <span>Word Boost</span>
          </CardTitle>
          <CardDescription>
            Improve recognition accuracy for specific food-related terms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customWords">Custom Food Terms</Label>
            <Textarea
              id="customWords"
              value={settings.customWords || settings.wordBoost?.join(', ') || ''}
              onChange={(e) => 
                updateSettingsMutation.mutate({ customWords: e.target.value })
              }
              placeholder="Enter comma-separated food terms: organic, protein, gluten-free, nutrition, ingredients..."
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Add terms that users commonly search for to improve recognition accuracy
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Default Boosted Terms:</h4>
            <div className="flex flex-wrap gap-1">
              {['food', 'nutrition', 'ingredients', 'product', 'brand', 'organic', 'protein', 'carbs', 'calories', 'vitamins', 'dairy', 'gluten', 'sugar', 'sodium', 'fiber'].map((term) => (
                <Badge key={term} variant="secondary" className="text-xs">
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end space-x-3">
        <Button 
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
        >
          {updateSettingsMutation.isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}