import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Settings, Save, RefreshCw, Camera, Timer, Monitor, Eye, Search, 
  Shield, Zap, Bot, Globe, Filter, RotateCcw, AlertTriangle 
} from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [settingType, setSettingType] = useState<string>('all');

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
        return <Search className="h-4 w-4" />;
      case 'user_interface':
        return <Monitor className="h-4 w-4" />;
      case 'ai_settings':
        return <Bot className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getSettingIcon = (settingKey: string) => {
    switch (settingKey) {
      case 'camera_timeout':
        return <Timer className="h-4 w-4" />;
      case 'tutorial_overlay_enabled':
        return <Eye className="h-4 w-4" />;
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

  // Filter and search logic
  const filteredSettings = useMemo(() => {
    let filtered = (settings as AdminSetting[]) || [];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(setting => 
        setting.settingKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatSettingName(setting.settingKey).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(setting => setting.category === selectedCategory);
    }
    
    // Filter by type
    if (settingType !== 'all') {
      filtered = filtered.filter(setting => setting.settingType === settingType);
    }
    
    return filtered;
  }, [settings, searchTerm, selectedCategory, settingType]);

  // Get unique categories and types for filters
  const categories = useMemo(() => {
    const cats = Array.from(new Set(((settings as AdminSetting[]) || []).map(s => s.category)));
    return cats.sort();
  }, [settings]);

  const settingTypes = useMemo(() => {
    const types = Array.from(new Set(((settings as AdminSetting[]) || []).map(s => s.settingType)));
    return types.sort();
  }, [settings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Group filtered settings by category
  const settingsByCategory = filteredSettings.reduce((acc: Record<string, AdminSetting[]>, setting: AdminSetting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, AdminSetting[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              System Settings
            </h2>
            <Badge variant="secondary" className="ml-2">
              {filteredSettings.length} settings
            </Badge>
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

        {/* Search and Filter Controls */}
        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search settings by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="w-full sm:w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          {formatCategoryName(category)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="w-full sm:w-40">
                <Select value={settingType} onValueChange={setSettingType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {settingTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        <Badge variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || selectedCategory !== 'all' || settingType !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSettingType('all');
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings by Category */}
      {Object.entries(settingsByCategory).map(([category, categorySettings]) => (
        <Card key={category} className="border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg">
              {getCategoryIcon(category)}
              {formatCategoryName(category)}
              <Badge variant="outline" className="ml-auto text-xs">
                {categorySettings.length} settings
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            {(categorySettings as AdminSetting[]).map((setting: AdminSetting) => {
              const isEditing = editingSettings[setting.settingKey] !== undefined;
              const currentValue = isEditing ? editingSettings[setting.settingKey] : setting.settingValue;
              
              return (
                <div key={setting.settingKey} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      {getSettingIcon(setting.settingKey)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatSettingName(setting.settingKey)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {setting.settingType}
                          </Badge>
                        </div>
                        {setting.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {setting.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {setting.settingType === 'boolean' ? (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                          Auto-save
                        </Badge>
                      ) : isEditing ? (
                        <>
                          <Button
                            onClick={() => handleSaveSetting(setting.settingKey)}
                            disabled={updateSettingMutation.isPending}
                            size="sm"
                            variant="default"
                            className="h-8"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            onClick={() => handleCancelEdit(setting.settingKey)}
                            size="sm"
                            variant="outline"
                            className="h-8"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleInputChange(setting.settingKey, setting.settingValue)}
                          size="sm"
                          variant="outline"
                          className="h-8"
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {setting.settingType === 'boolean' ? (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <Label htmlFor={setting.settingKey} className="text-sm font-medium">
                          Status:
                        </Label>
                        <Checkbox
                          id={setting.settingKey}
                          checked={currentValue === 'true'}
                          onCheckedChange={(checked) => {
                            const newValue = checked ? 'true' : 'false';
                            handleInputChange(setting.settingKey, newValue);
                            updateSettingMutation.mutate({ key: setting.settingKey, value: newValue });
                          }}
                          disabled={updateSettingMutation.isPending}
                          className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                        />
                        <span className={`text-sm font-medium ${currentValue === 'true' ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                          {currentValue === 'true' ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    ) : setting.settingType === 'select' ? (
                      <div className="space-y-2">
                        <Label htmlFor={setting.settingKey} className="text-sm font-medium">
                          Current Value:
                        </Label>
                        {isEditing ? (
                          <Select 
                            value={currentValue} 
                            onValueChange={(value) => handleInputChange(setting.settingKey, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {setting.settingKey === 'default_ai_provider' && (
                                <>
                                  <SelectItem value="OpenAI">OpenAI (GPT-4)</SelectItem>
                                  <SelectItem value="Claude">Anthropic Claude</SelectItem>
                                  <SelectItem value="Gemini">Google Gemini</SelectItem>
                                </>
                              )}
                              {setting.settingKey === 'default_analysis_language' && (
                                <>
                                  <SelectItem value="en">English</SelectItem>
                                  <SelectItem value="es">Spanish</SelectItem>
                                  <SelectItem value="fr">French</SelectItem>
                                  <SelectItem value="de">German</SelectItem>
                                  <SelectItem value="zh">Chinese</SelectItem>
                                  <SelectItem value="ja">Japanese</SelectItem>
                                  <SelectItem value="nl">Dutch</SelectItem>
                                </>
                              )}
                              {setting.settingKey === 'dark_mode_default' && (
                                <>
                                  <SelectItem value="light">Light Mode</SelectItem>
                                  <SelectItem value="dark">Dark Mode</SelectItem>
                                  <SelectItem value="system">System Preference</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-md text-sm font-medium">
                            {currentValue}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor={setting.settingKey} className="text-sm font-medium">
                          Value:
                        </Label>
                        {isEditing ? (
                          <Input
                            id={setting.settingKey}
                            value={currentValue}
                            onChange={(e) => handleInputChange(setting.settingKey, e.target.value)}
                            className="w-full"
                            type={setting.settingType === 'integer' ? 'number' : 'text'}
                            min={setting.settingType === 'integer' ? '1' : undefined}
                          />
                        ) : (
                          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-md text-sm font-mono">
                            {currentValue}
                            {setting.settingType === 'integer' && setting.settingKey.includes('timeout') && ' ms'}
                            {setting.settingType === 'integer' && setting.settingKey.includes('days') && ' days'}
                            {setting.settingType === 'integer' && setting.settingKey.includes('hours') && ' hours'}
                            {setting.settingType === 'integer' && setting.settingKey.includes('seconds') && ' seconds'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-mono">Key: {setting.settingKey}</span>
                    <span>Updated: {new Date(setting.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Statistics Dashboard */}
      {filteredSettings.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-blue-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="h-5 w-5" />
              Settings Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{filteredSettings.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Settings</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {filteredSettings.filter(s => s.settingType === 'boolean' && s.settingValue === 'true').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Enabled Features</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredSettings.filter(s => new Date(s.updatedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Updated Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State - No Settings */}
      {((settings as AdminSetting[]) || []).length === 0 && (
        <Card className="border border-dashed border-gray-300 dark:border-gray-600">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No Settings Configured
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
              Initialize the default system settings to configure your application's behavior, security preferences, and performance options.
            </p>
            <Button
              onClick={() => initializeSettingsMutation.mutate()}
              disabled={initializeSettingsMutation.isPending}
              size="lg"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${initializeSettingsMutation.isPending ? 'animate-spin' : ''}`} />
              Initialize Default Settings
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State - No Search Results */}
      {((settings as AdminSetting[]) || []).length > 0 && filteredSettings.length === 0 && (
        <Card className="border border-dashed border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Matching Settings
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              No settings match your current search criteria. Try adjusting your filters or search terms.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSettingType('all');
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}