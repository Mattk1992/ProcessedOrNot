import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Camera, Settings, Save, RotateCcw, AlertTriangle, CheckCircle, Clock, Zap } from "lucide-react";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";
import { apiRequest } from "@/lib/queryClient";

interface CameraSettings {
  id: number;
  timeout: number;
  autoStopEnabled: boolean;
  maxZoomLevel: number;
  minZoomLevel: number;
  defaultZoomLevel: number;
  focusMode: string;
  flashMode: string;
  scanFrequency: number;
  enableBeepSound: boolean;
  enableVibration: boolean;
  overlayOpacity: number;
  scanAreaSize: number;
  optimizeForCloseRange: boolean;
  enhanceContrast: boolean;
  adjustBrightness: number;
  scanIntervalMs: number;
  torchEnabled: boolean;
  videoConstraints: string;
  preferredCameraId: string;
  enableAutoFocus: boolean;
  qualityPreset: string;
  performanceMode: string;
  errorRecoveryEnabled: boolean;
  debugMode: boolean;
  updatedAt: string;
}

export default function AdminCameraConfig() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch camera settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['/api/admin/camera-settings'],
    enabled: isAuthenticated && user?.accountType === 'Admin',
  });

  // Local state for form
  const [formData, setFormData] = useState<Partial<CameraSettings>>({});

  // Initialize form data when settings load
  useEffect(() => {
    if (settings) {
      setFormData(settings);
      setHasUnsavedChanges(false);
    }
  }, [settings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: Partial<CameraSettings>) => {
      const response = await fetch('/api/admin/camera-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/camera-settings'] });
      setHasUnsavedChanges(false);
      toast({
        title: "Settings Saved",
        description: "Camera configuration has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save camera settings.",
        variant: "destructive",
      });
    },
  });

  // Reset to defaults mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/camera-settings/reset', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reset settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/camera-settings'] });
      setHasUnsavedChanges(false);
      toast({
        title: "Settings Reset",
        description: "Camera settings have been reset to defaults.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset camera settings.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof CameraSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    saveSettingsMutation.mutate(formData);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all camera settings to defaults? This cannot be undone.')) {
      resetMutation.mutate();
    }
  };

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.accountType !== 'Admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              Camera configuration is only available to Admin users.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading camera settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Settings</h2>
            <p className="text-muted-foreground mb-4">
              Failed to load camera configuration.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
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
                  Camera Configuration
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Barcode scanner camera settings and optimization
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-xs sm:text-sm">
                Admin Tools
              </Badge>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 text-xs">
                  Unsaved Changes
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto mobile-safe-padding py-4 sm:py-6 lg:py-8">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Button 
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saveSettingsMutation.isPending}
            className="mobile-button"
            size="mobile"
          >
            {saveSettingsMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button 
            onClick={handleReset}
            disabled={resetMutation.isPending}
            variant="outline"
            className="mobile-button"
            size="mobile"
          >
            {resetMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Resetting...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </>
            )}
          </Button>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mobile-tabs">
            <TabsTrigger value="basic" className="text-xs sm:text-sm">Basic</TabsTrigger>
            <TabsTrigger value="scanning" className="text-xs sm:text-sm">Scanning</TabsTrigger>
            <TabsTrigger value="display" className="text-xs sm:text-sm">Display</TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs sm:text-sm">Advanced</TabsTrigger>
          </TabsList>

          {/* Basic Settings */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Basic Camera Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Camera Timeout (seconds)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={formData.timeout || 30}
                      onChange={(e) => handleInputChange('timeout', parseInt(e.target.value))}
                      min="10"
                      max="300"
                      className="mobile-input"
                    />
                    <p className="text-sm text-muted-foreground">
                      How long the camera stays active before auto-stopping
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="autoStop">Auto-Stop Camera</Label>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Switch
                        id="autoStop"
                        checked={formData.autoStopEnabled ?? true}
                        onCheckedChange={(checked) => handleInputChange('autoStopEnabled', checked)}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {formData.autoStopEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Automatically stop camera after timeout
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Zoom Settings</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Default Zoom Level</Label>
                      <Slider
                        value={[formData.defaultZoomLevel || 1]}
                        onValueChange={(value) => handleInputChange('defaultZoomLevel', value[0])}
                        min={1}
                        max={5}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-sm text-muted-foreground">
                        Current: {formData.defaultZoomLevel || 1}x
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Minimum Zoom</Label>
                      <Slider
                        value={[formData.minZoomLevel || 1]}
                        onValueChange={(value) => handleInputChange('minZoomLevel', value[0])}
                        min={0.5}
                        max={3}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-sm text-muted-foreground">
                        Current: {formData.minZoomLevel || 1}x
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Maximum Zoom</Label>
                      <Slider
                        value={[formData.maxZoomLevel || 3]}
                        onValueChange={(value) => handleInputChange('maxZoomLevel', value[0])}
                        min={2}
                        max={10}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-sm text-muted-foreground">
                        Current: {formData.maxZoomLevel || 3}x
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scanning Settings */}
          <TabsContent value="scanning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Scanning Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Scan Frequency (per second)</Label>
                    <Slider
                      value={[formData.scanFrequency || 10]}
                      onValueChange={(value) => handleInputChange('scanFrequency', value[0])}
                      min={1}
                      max={30}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Current: {formData.scanFrequency || 10} scans/second
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Scan Interval (milliseconds)</Label>
                    <Input
                      type="number"
                      value={formData.scanIntervalMs || 100}
                      onChange={(e) => handleInputChange('scanIntervalMs', parseInt(e.target.value))}
                      min="50"
                      max="1000"
                      className="mobile-input"
                    />
                    <p className="text-sm text-muted-foreground">
                      Time between scan attempts
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="focusMode">Focus Mode</Label>
                    <Select 
                      value={formData.focusMode || 'continuous'} 
                      onValueChange={(value: string) => handleInputChange('focusMode', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select focus mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="continuous">Continuous</SelectItem>
                        <SelectItem value="single-shot">Single Shot</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualityPreset">Quality Preset</Label>
                    <Select 
                      value={formData.qualityPreset || 'balanced'} 
                      onValueChange={(value: string) => handleInputChange('qualityPreset', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality preset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="quality">Quality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Close-Range Optimization</Label>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Switch
                        checked={formData.optimizeForCloseRange ?? true}
                        onCheckedChange={(checked) => handleInputChange('optimizeForCloseRange', checked)}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {formData.optimizeForCloseRange ? 'Enabled' : 'Disabled'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Optimize for 2-8cm scanning
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Auto Focus</Label>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Switch
                        checked={formData.enableAutoFocus ?? true}
                        onCheckedChange={(checked) => handleInputChange('enableAutoFocus', checked)}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {formData.enableAutoFocus ? 'Enabled' : 'Disabled'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Automatic focus adjustment
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Torch/Flash</Label>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Switch
                        checked={formData.torchEnabled ?? false}
                        onCheckedChange={(checked) => handleInputChange('torchEnabled', checked)}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {formData.torchEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enable camera flash/torch
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display Settings */}
          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Display & Feedback Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Overlay Opacity</Label>
                    <Slider
                      value={[formData.overlayOpacity || 0.7]}
                      onValueChange={(value) => handleInputChange('overlayOpacity', value[0])}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Current: {Math.round((formData.overlayOpacity || 0.7) * 100)}%
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Scan Area Size</Label>
                    <Slider
                      value={[formData.scanAreaSize || 0.6]}
                      onValueChange={(value) => handleInputChange('scanAreaSize', value[0])}
                      min={0.3}
                      max={0.9}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Current: {Math.round((formData.scanAreaSize || 0.6) * 100)}% of screen
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Brightness Adjustment</Label>
                    <Slider
                      value={[formData.adjustBrightness || 1]}
                      onValueChange={(value) => handleInputChange('adjustBrightness', value[0])}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Current: {formData.adjustBrightness || 1}x
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Enhance Contrast</Label>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Switch
                        checked={formData.enhanceContrast ?? true}
                        onCheckedChange={(checked) => handleInputChange('enhanceContrast', checked)}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {formData.enhanceContrast ? 'Enabled' : 'Disabled'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Improve barcode visibility
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Beep Sound</Label>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Switch
                        checked={formData.enableBeepSound ?? true}
                        onCheckedChange={(checked) => handleInputChange('enableBeepSound', checked)}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {formData.enableBeepSound ? 'Enabled' : 'Disabled'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Audio feedback on successful scan
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Vibration</Label>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Switch
                        checked={formData.enableVibration ?? true}
                        onCheckedChange={(checked) => handleInputChange('enableVibration', checked)}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {formData.enableVibration ? 'Enabled' : 'Disabled'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Haptic feedback on successful scan
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="performanceMode">Performance Mode</Label>
                    <Select 
                      value={formData.performanceMode || 'balanced'} 
                      onValueChange={(value: string) => handleInputChange('performanceMode', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select performance mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low-power">Low Power</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="high-performance">High Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredCamera">Preferred Camera ID</Label>
                    <Input
                      id="preferredCamera"
                      value={formData.preferredCameraId || ''}
                      onChange={(e) => handleInputChange('preferredCameraId', e.target.value)}
                      placeholder="Leave empty for auto-detection"
                      className="mobile-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoConstraints">Video Constraints (JSON)</Label>
                  <Textarea
                    id="videoConstraints"
                    value={formData.videoConstraints || '{}'}
                    onChange={(e) => handleInputChange('videoConstraints', e.target.value)}
                    placeholder='{"width": 1280, "height": 720, "facingMode": "environment"}'
                    className="min-h-[100px] font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Advanced video stream configuration in JSON format
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Error Recovery</Label>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Switch
                        checked={formData.errorRecoveryEnabled ?? true}
                        onCheckedChange={(checked) => handleInputChange('errorRecoveryEnabled', checked)}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {formData.errorRecoveryEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Automatic recovery from camera errors
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Debug Mode</Label>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Switch
                        checked={formData.debugMode ?? false}
                        onCheckedChange={(checked) => handleInputChange('debugMode', checked)}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {formData.debugMode ? 'Enabled' : 'Disabled'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enable debug logging and overlays
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Status Information */}
        {settings && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Configuration Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleString() : 'Never'}
                  </p>
                </div>
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}