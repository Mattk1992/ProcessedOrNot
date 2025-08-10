import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, RotateCcw, X, Monitor, ScanLine, Eye, BarChart3, Camera, Volume2, Smartphone } from "lucide-react";
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
  enableAutoFocus: boolean;
  qualityPreset: string;
  performanceMode: string;
  errorRecoveryEnabled: boolean;
  debugMode: boolean;
  updatedAt: string;
}

interface QuickCameraSettingsProps {
  children: React.ReactNode;
}

export default function QuickCameraSettings({ children }: QuickCameraSettingsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch user camera settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/user/camera-settings'],
    enabled: isOpen,
  });

  // Local state for form
  const [formData, setFormData] = useState<Partial<CameraSettings>>({
    timeout: 40,
    autoStopEnabled: true,
    maxZoomLevel: 3,
    minZoomLevel: 1,
    defaultZoomLevel: 1,
    focusMode: 'continuous',
    flashMode: 'auto',
    scanFrequency: 10,
    enableBeepSound: true,
    enableVibration: true,
    overlayOpacity: 0.70,
    scanAreaSize: 0.60,
    optimizeForCloseRange: true,
    enhanceContrast: true,
    adjustBrightness: 1.0,
    scanIntervalMs: 100,
    torchEnabled: false,
    enableAutoFocus: true,
    qualityPreset: 'balanced',
    performanceMode: 'balanced',
    errorRecoveryEnabled: true,
    debugMode: false,
  });

  // Initialize form data when settings load
  useEffect(() => {
    if (settings) {
      const settingsData = settings as any;
      setFormData({
        timeout: settingsData.timeout || 40,
        autoStopEnabled: settingsData.autoStopEnabled ?? true,
        maxZoomLevel: settingsData.maxZoomLevel || 3,
        minZoomLevel: settingsData.minZoomLevel || 1,
        defaultZoomLevel: settingsData.defaultZoomLevel || 1,
        focusMode: settingsData.focusMode || 'continuous',
        flashMode: settingsData.flashMode || 'auto',
        scanFrequency: settingsData.scanFrequency || 10,
        enableBeepSound: settingsData.enableBeepSound ?? true,
        enableVibration: settingsData.enableVibration ?? true,
        overlayOpacity: settingsData.overlayOpacity || 0.70,
        scanAreaSize: settingsData.scanAreaSize || 0.60,
        optimizeForCloseRange: settingsData.optimizeForCloseRange ?? true,
        enhanceContrast: settingsData.enhanceContrast ?? true,
        adjustBrightness: settingsData.adjustBrightness || 1.0,
        scanIntervalMs: settingsData.scanIntervalMs || 100,
        torchEnabled: settingsData.torchEnabled ?? false,
        enableAutoFocus: settingsData.enableAutoFocus ?? true,
        qualityPreset: settingsData.qualityPreset || 'balanced',
        performanceMode: settingsData.performanceMode || 'balanced',
        errorRecoveryEnabled: settingsData.errorRecoveryEnabled ?? true,
        debugMode: settingsData.debugMode ?? false,
      });
      setHasUnsavedChanges(false);
    }
  }, [settings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: Partial<CameraSettings>) => {
      const response = await apiRequest('PUT', '/api/user/camera-settings', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Your camera settings have been updated successfully.",
      });
      setHasUnsavedChanges(false);
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/user/camera-settings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save camera settings. Please try again.",
        variant: "destructive",
      });
      console.error('Error saving camera settings:', error);
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
    const defaultSettings = {
      timeout: 40,
      autoStopEnabled: true,
      maxZoomLevel: 3,
      minZoomLevel: 1,
      defaultZoomLevel: 1,
      focusMode: 'continuous',
      flashMode: 'auto',
      scanFrequency: 10,
      enableBeepSound: true,
      enableVibration: true,
      overlayOpacity: 0.70,
      scanAreaSize: 0.60,
      optimizeForCloseRange: true,
      enhanceContrast: true,
      adjustBrightness: 1.0,
      scanIntervalMs: 100,
      torchEnabled: false,
      enableAutoFocus: true,
      qualityPreset: 'balanced',
      performanceMode: 'balanced',
      errorRecoveryEnabled: true,
      debugMode: false,
    };
    setFormData(defaultSettings);
    setHasUnsavedChanges(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Quick Camera Settings</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading camera settings...</p>
            </div>
          ) : (
            <Tabs defaultValue="advanced" className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="advanced" className="flex items-center gap-1 text-xs">
                  <Monitor className="w-3 h-3" />
                  <span className="hidden sm:inline">Advanced</span>
                </TabsTrigger>
                <TabsTrigger value="scanning" className="flex items-center gap-1 text-xs">
                  <ScanLine className="w-3 h-3" />
                  <span className="hidden sm:inline">Scanning</span>
                </TabsTrigger>
                <TabsTrigger value="camera" className="flex items-center gap-1 text-xs">
                  <Camera className="w-3 h-3" />
                  <span className="hidden sm:inline">Camera</span>
                </TabsTrigger>
                <TabsTrigger value="feedback" className="flex items-center gap-1 text-xs">
                  <Volume2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Feedback</span>
                </TabsTrigger>
                <TabsTrigger value="display" className="flex items-center gap-1 text-xs">
                  <Eye className="w-3 h-3" />
                  <span className="hidden sm:inline">Display</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-1 text-xs">
                  <BarChart3 className="w-3 h-3" />
                  <span className="hidden sm:inline">Stats</span>
                </TabsTrigger>
              </TabsList>

              <div className="overflow-y-auto max-h-[50vh]">
                {/* Advanced Configuration Tab */}
                <TabsContent value="advanced" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        Advanced Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="quick-timeout">Camera Timeout (seconds)</Label>
                        <Input
                          id="quick-timeout"
                          type="number"
                          value={formData.timeout || 40}
                          onChange={(e) => handleInputChange('timeout', parseInt(e.target.value))}
                          min="10"
                          max="300"
                          className="w-full"
                        />
                        <p className="text-sm text-muted-foreground">
                          How long the camera stays active before auto-stopping
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quick-autoStop">Auto-Stop Camera</Label>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Switch
                            id="quick-autoStop"
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
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Scanning Configuration Tab */}
                <TabsContent value="scanning" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ScanLine className="w-4 h-4" />
                        Scanning Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Camera Hardware Tab */}
                <TabsContent value="camera" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Camera Hardware Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Focus Mode</Label>
                          <Select
                            value={formData.focusMode || 'continuous'}
                            onValueChange={(value) => handleInputChange('focusMode', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select focus mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="continuous">Continuous</SelectItem>
                              <SelectItem value="single">Single Shot</SelectItem>
                              <SelectItem value="manual">Manual</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground">
                            Camera focus behavior during scanning
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Flash Mode</Label>
                          <Select
                            value={formData.flashMode || 'auto'}
                            onValueChange={(value) => handleInputChange('flashMode', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select flash mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto">Auto</SelectItem>
                              <SelectItem value="on">Always On</SelectItem>
                              <SelectItem value="off">Always Off</SelectItem>
                              <SelectItem value="torch">Torch Mode</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground">
                            Flash behavior for low-light conditions
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Quality Preset</Label>
                          <Select
                            value={formData.qualityPreset || 'balanced'}
                            onValueChange={(value) => handleInputChange('qualityPreset', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select quality preset" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High Quality</SelectItem>
                              <SelectItem value="balanced">Balanced</SelectItem>
                              <SelectItem value="performance">Performance</SelectItem>
                              <SelectItem value="battery">Battery Saving</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground">
                            Balance between quality and performance
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Performance Mode</Label>
                          <Select
                            value={formData.performanceMode || 'balanced'}
                            onValueChange={(value) => handleInputChange('performanceMode', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select performance mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="maximum">Maximum</SelectItem>
                              <SelectItem value="balanced">Balanced</SelectItem>
                              <SelectItem value="efficiency">Efficiency</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground">
                            CPU and processing performance level
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Brightness Adjustment</Label>
                          <Slider
                            value={[formData.adjustBrightness || 1.0]}
                            onValueChange={(value) => handleInputChange('adjustBrightness', value[0])}
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            className="w-full"
                          />
                          <p className="text-sm text-muted-foreground">
                            Current: {formData.adjustBrightness || 1.0}x brightness
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Switch
                              checked={formData.enableAutoFocus ?? true}
                              onCheckedChange={(checked) => handleInputChange('enableAutoFocus', checked)}
                            />
                            <div>
                              <p className="text-sm font-medium">Auto Focus</p>
                              <p className="text-xs text-muted-foreground">
                                Automatic focus adjustment
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Switch
                              checked={formData.torchEnabled ?? false}
                              onCheckedChange={(checked) => handleInputChange('torchEnabled', checked)}
                            />
                            <div>
                              <p className="text-sm font-medium">Torch/Flashlight</p>
                              <p className="text-xs text-muted-foreground">
                                Enable camera torch
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Switch
                              checked={formData.enhanceContrast ?? true}
                              onCheckedChange={(checked) => handleInputChange('enhanceContrast', checked)}
                            />
                            <div>
                              <p className="text-sm font-medium">Enhance Contrast</p>
                              <p className="text-xs text-muted-foreground">
                                Improve barcode visibility
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Switch
                              checked={formData.optimizeForCloseRange ?? true}
                              onCheckedChange={(checked) => handleInputChange('optimizeForCloseRange', checked)}
                            />
                            <div>
                              <p className="text-sm font-medium">Close Range Optimization</p>
                              <p className="text-xs text-muted-foreground">
                                Better for close-up scanning
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Feedback Settings Tab */}
                <TabsContent value="feedback" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        Audio & Haptic Feedback
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Switch
                            checked={formData.enableBeepSound ?? true}
                            onCheckedChange={(checked) => handleInputChange('enableBeepSound', checked)}
                          />
                          <div>
                            <p className="text-sm font-medium">Scan Sound</p>
                            <p className="text-xs text-muted-foreground">
                              Play sound when barcode is detected
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Switch
                            checked={formData.enableVibration ?? true}
                            onCheckedChange={(checked) => handleInputChange('enableVibration', checked)}
                          />
                          <div>
                            <p className="text-sm font-medium">Vibration</p>
                            <p className="text-xs text-muted-foreground">
                              Vibrate on successful scan
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Switch
                            checked={formData.errorRecoveryEnabled ?? true}
                            onCheckedChange={(checked) => handleInputChange('errorRecoveryEnabled', checked)}
                          />
                          <div>
                            <p className="text-sm font-medium">Error Recovery</p>
                            <p className="text-xs text-muted-foreground">
                              Auto-recovery from scan errors
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Switch
                            checked={formData.debugMode ?? false}
                            onCheckedChange={(checked) => handleInputChange('debugMode', checked)}
                          />
                          <div>
                            <p className="text-sm font-medium">Debug Mode</p>
                            <p className="text-xs text-muted-foreground">
                              Show detailed scanning info
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="scan-frequency">Scan Frequency (per second)</Label>
                          <Input
                            id="scan-frequency"
                            type="number"
                            value={formData.scanFrequency || 10}
                            onChange={(e) => handleInputChange('scanFrequency', parseInt(e.target.value))}
                            min="1"
                            max="30"
                            className="w-full"
                          />
                          <p className="text-sm text-muted-foreground">
                            How many scans per second to attempt
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="scan-interval">Scan Interval (milliseconds)</Label>
                          <Input
                            id="scan-interval"
                            type="number"
                            value={formData.scanIntervalMs || 100}
                            onChange={(e) => handleInputChange('scanIntervalMs', parseInt(e.target.value))}
                            min="50"
                            max="1000"
                            className="w-full"
                          />
                          <p className="text-sm text-muted-foreground">
                            Delay between scan attempts
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Display & Overlay Settings Tab */}
                <TabsContent value="display" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Display & Overlay Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Overlay Opacity</Label>
                          <Slider
                            value={[formData.overlayOpacity || 0.70]}
                            onValueChange={(value) => handleInputChange('overlayOpacity', value[0])}
                            min={0.1}
                            max={1.0}
                            step={0.05}
                            className="w-full"
                          />
                          <p className="text-sm text-muted-foreground">
                            Current: {Math.round((formData.overlayOpacity || 0.70) * 100)}% opacity
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Scan Area Size</Label>
                          <Slider
                            value={[formData.scanAreaSize || 0.60]}
                            onValueChange={(value) => handleInputChange('scanAreaSize', value[0])}
                            min={0.3}
                            max={0.9}
                            step={0.05}
                            className="w-full"
                          />
                          <p className="text-sm text-muted-foreground">
                            Current: {Math.round((formData.scanAreaSize || 0.60) * 100)}% of screen
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Visual Effects</Label>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center space-x-3 p-3 border rounded-lg">
                              <Switch
                                checked={true}
                                disabled
                              />
                              <div>
                                <p className="text-sm font-medium">Scan Overlay</p>
                                <p className="text-xs text-muted-foreground">
                                  Show scanning target overlay
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 border rounded-lg">
                              <Switch
                                checked={true}
                                disabled
                              />
                              <div>
                                <p className="text-sm font-medium">Success Animation</p>
                                <p className="text-xs text-muted-foreground">
                                  Play animation on successful scan
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="text-sm font-semibold mb-3">Preview</h4>
                          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg h-32 overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div 
                                className="border-2 border-primary rounded-lg bg-transparent"
                                style={{
                                  width: `${(formData.scanAreaSize || 0.60) * 100}%`,
                                  height: `${(formData.scanAreaSize || 0.60) * 80}%`,
                                  backgroundColor: `rgba(59, 130, 246, ${(formData.overlayOpacity || 0.70) * 0.1})`,
                                  borderColor: `rgba(59, 130, 246, ${formData.overlayOpacity || 0.70})`,
                                }}
                              >
                                <div className="flex items-center justify-center h-full">
                                  <ScanLine className="w-6 h-6 text-primary animate-pulse" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Preview of scan overlay with current settings
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Quick Stats Section Tab */}
                <TabsContent value="stats" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Quick Stats Section
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-primary/10 rounded-lg">
                          <div className="text-2xl font-bold text-primary mb-1">14+</div>
                          <div className="text-sm text-muted-foreground">Food Databases</div>
                        </div>
                        <div className="text-center p-4 bg-accent/10 rounded-lg">
                          <div className="text-2xl font-bold text-accent mb-1">7</div>
                          <div className="text-sm text-muted-foreground">Languages</div>
                        </div>
                        <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                          <div className="text-2xl font-bold text-purple-500 mb-1">6+</div>
                          <div className="text-sm text-muted-foreground">Barcode Formats</div>
                        </div>
                        <div className="text-center p-4 bg-orange-500/10 rounded-lg">
                          <div className="text-2xl font-bold text-orange-500 mb-1">AI</div>
                          <div className="text-sm text-muted-foreground">Powered Analysis</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-semibold mb-3">Camera Performance</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Last Scan Time</span>
                              <span>1.2s</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Average Scan Time</span>
                              <span>1.8s</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Success Rate</span>
                              <span className="text-green-600">94%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-semibold mb-3">System Status</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Camera Ready</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>AI Analysis Online</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Database Connected</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button 
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || saveSettingsMutation.isPending}
                  className="flex-1"
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
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
                <Button 
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
              
              {hasUnsavedChanges && (
                <div className="text-center pt-2">
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    You have unsaved changes
                  </p>
                </div>
              )}
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}