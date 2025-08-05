import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, RotateCcw, X } from "lucide-react";

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
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Quick Camera Settings</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading camera settings...</p>
            </div>
          ) : (
            <>
              {/* Basic Camera Settings */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Basic Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
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
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-lg font-medium mb-4">Zoom Settings</h4>
                    <div className="grid grid-cols-1 gap-6">
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
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
                <div className="text-center">
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    You have unsaved changes
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}