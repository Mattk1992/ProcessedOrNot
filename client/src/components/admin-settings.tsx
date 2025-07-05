import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Settings, Save, RefreshCw, Camera, Timer } from 'lucide-react';

interface AdminSetting {
  id: number;
  settingKey: string;
  settingValue: string;
  settingType: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSettings() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSettings, setEditingSettings] = useState<Record<string, string>>({});

  // Fetch all admin settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return apiRequest(`/api/admin/settings/${key}`, "PUT", { settingValue: value });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Setting Updated",
        description: `${variables.key} has been updated successfully`,
        variant: "default",
      });
      // Remove from editing state
      setEditingSettings(prev => {
        const newState = { ...prev };
        delete newState[variables.key];
        return newState;
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update setting. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize default settings mutation
  const initializeSettingsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/admin/settings/initialize", "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Settings Initialized",
        description: "Default settings have been initialized successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Initialization Failed",
        description: "Failed to initialize default settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (key: string, value: string) => {
    setEditingSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSetting = (key: string) => {
    const value = editingSettings[key];
    if (value !== undefined) {
      updateSettingMutation.mutate({ key, value });
    }
  };

  const handleCancelEdit = (key: string) => {
    setEditingSettings(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'search_engine':
        return <Camera className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getSettingIcon = (settingKey: string) => {
    switch (settingKey) {
      case 'camera_timeout':
        return <Timer className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const formatSettingName = (key: string) => {
    return key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatCategoryName = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Group settings by category
  const settingsByCategory = ((settings as AdminSetting[]) || []).reduce((acc: Record<string, AdminSetting[]>, setting: AdminSetting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, AdminSetting[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Admin Settings
          </h2>
        </div>
        <Button
          onClick={() => initializeSettingsMutation.mutate()}
          disabled={initializeSettingsMutation.isPending}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${initializeSettingsMutation.isPending ? 'animate-spin' : ''}`} />
          Initialize Defaults
        </Button>
      </div>

      {/* Settings by Category */}
      {Object.entries(settingsByCategory).map(([category, categorySettings]) => (
        <Card key={category} className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {getCategoryIcon(category)}
              {formatCategoryName(category)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(categorySettings as AdminSetting[]).map((setting: AdminSetting) => {
              const isEditing = editingSettings[setting.settingKey] !== undefined;
              const currentValue = isEditing ? editingSettings[setting.settingKey] : setting.settingValue;
              
              return (
                <div key={setting.settingKey} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSettingIcon(setting.settingKey)}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatSettingName(setting.settingKey)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {setting.settingType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={() => handleSaveSetting(setting.settingKey)}
                            disabled={updateSettingMutation.isPending}
                            size="sm"
                            variant="default"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            onClick={() => handleCancelEdit(setting.settingKey)}
                            size="sm"
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleInputChange(setting.settingKey, setting.settingValue)}
                          size="sm"
                          variant="outline"
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {setting.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {setting.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor={setting.settingKey} className="text-sm font-medium">
                      Value:
                    </Label>
                    {isEditing ? (
                      <Input
                        id={setting.settingKey}
                        value={currentValue}
                        onChange={(e) => handleInputChange(setting.settingKey, e.target.value)}
                        className="flex-1"
                        type={setting.settingType === 'integer' ? 'number' : 'text'}
                      />
                    ) : (
                      <span className="px-2 py-1 bg-white dark:bg-gray-700 border rounded text-sm">
                        {currentValue}
                      </span>
                    )}
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Key: {setting.settingKey}</span>
                    <span>Updated: {new Date(setting.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Empty State */}
      {Object.keys(settingsByCategory).length === 0 && (
        <Card className="border border-dashed border-gray-300 dark:border-gray-600">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Settings className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Settings Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              Initialize default settings to get started with admin configuration.
            </p>
            <Button
              onClick={() => initializeSettingsMutation.mutate()}
              disabled={initializeSettingsMutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${initializeSettingsMutation.isPending ? 'animate-spin' : ''}`} />
              Initialize Settings
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}