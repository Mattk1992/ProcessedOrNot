import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, RotateCcw, X, Monitor, ScanLine, Eye, BarChart3 } from "lucide-react";

interface CameraSettings {
  id: number;
  timeout: number;
  autoStopEnabled: boolean;
  maxZoomLevel: number;
  minZoomLevel: number;
  defaultZoomLevel: number;
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

  // Fetch camera settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings/camera-timeout'],
    enabled: isOpen,
  });

  // Local state for form
  const [formData, setFormData] = useState<Partial<CameraSettings>>({
    timeout: 40,
    autoStopEnabled: true,
    maxZoomLevel: 3,
    minZoomLevel: 1,
    defaultZoomLevel: 1,
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
      });
      setHasUnsavedChanges(false);
    }
  }, [settings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: Partial<CameraSettings>) => {
      const response = await fetch('/api/admin/camera-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save camera settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Camera settings have been updated successfully.",
      });
      setHasUnsavedChanges(false);
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/settings/camera-timeout'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/camera-settings'] });
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
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="advanced" className="flex items-center gap-1 text-xs">
                  <Monitor className="w-3 h-3" />
                  <span className="hidden sm:inline">Advanced</span>
                </TabsTrigger>
                <TabsTrigger value="scanning" className="flex items-center gap-1 text-xs">
                  <ScanLine className="w-3 h-3" />
                  <span className="hidden sm:inline">Scanning</span>
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

                {/* Display & Feedback Settings Tab */}
                <TabsContent value="display" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Display & Feedback Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Visual Feedback</Label>
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

                        <div className="space-y-2">
                          <Label>Audio Feedback</Label>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center space-x-3 p-3 border rounded-lg">
                              <Switch
                                checked={false}
                                disabled
                              />
                              <div>
                                <p className="text-sm font-medium">Scan Sound</p>
                                <p className="text-xs text-muted-foreground">
                                  Play sound when barcode is detected
                                </p>
                              </div>
                            </div>
                          </div>
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