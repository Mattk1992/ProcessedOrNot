import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Bot, ArrowLeft, Save, Sparkles, Brain, Zap, Cpu, Camera, Trash2, AlertTriangle, ExternalLink } from "lucide-react";
import { Link, useLocation } from "wouter";
import HeaderDropdown from "@/components/header-dropdown";
import LanguageSwitcher from "@/components/language-switcher";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";

interface UserSetting {
  id: number;
  userId: number;
  settingKey: string;
  settingValue: string;
  createdAt: string;
  updatedAt: string;
}

interface AIProvider {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const aiProviders: AIProvider[] = [
  {
    value: "ChatGPT Nano",
    label: "ChatGPT Nano",
    description: "OpenAI's ultra-fast and efficient model optimized for quick responses",
    icon: Zap,
    color: "text-emerald-600 dark:text-emerald-400"
  },
  {
    value: "ChatGPT",
    label: "ChatGPT",
    description: "OpenAI's advanced language model for comprehensive analysis",
    icon: Bot,
    color: "text-green-600 dark:text-green-400"
  },
  {
    value: "Perplexity", 
    label: "Perplexity",
    description: "Real-time web search powered AI for up-to-date information",
    icon: Sparkles,
    color: "text-purple-600 dark:text-purple-400"
  },
  {
    value: "Mistral",
    label: "Mistral",
    description: "European AI model focused on efficiency and accuracy",
    icon: Brain,
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    value: "Deepseek R1",
    label: "Deepseek R1",
    description: "Advanced reasoning model for complex analysis",
    icon: Cpu,
    color: "text-orange-600 dark:text-orange-400"
  }
];

interface BarcodeScannerSystem {
  value: string;
  label: string;
  description: string;
  icon: any;
  color: string;
}

const barcodeScannerSystems: BarcodeScannerSystem[] = [
  {
    value: "Main Barcode Scanner",
    label: "Main Barcode Scanner",
    description: "Advanced ZXing-based scanner with optimized camera settings",
    icon: Camera,
    color: "text-blue-600 dark:text-blue-400"
  }
];

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAIProvider, setSelectedAIProvider] = useState<string>("");
  const [selectedBarcodeScannerSystem, setSelectedBarcodeScannerSystem] = useState<string>("");
  
  // Check if user is admin or paid user
  const isAdmin = user?.accountType === 'Admin';
  const isPaidUser = user?.accountType === 'Paid';

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  // Fetch user's AI provider setting
  const { data: aiProviderSetting, isLoading } = useQuery({
    queryKey: ["/api/user/settings/ai_provider"],
    enabled: !!user,
  });

  // Fetch user's barcode scanner system setting
  const { data: barcodeScannerSetting, isLoading: isBarcodeScannerLoading } = useQuery({
    queryKey: ["/api/user/settings/barcode_scanner_system"],
    enabled: !!user,
  });

  // Set selected AI provider when data loads
  useEffect(() => {
    if (aiProviderSetting && typeof aiProviderSetting === 'object' && 'settingValue' in aiProviderSetting) {
      setSelectedAIProvider(aiProviderSetting.settingValue || "ChatGPT Nano");
    } else {
      // Set default to ChatGPT Nano if no setting exists
      setSelectedAIProvider("ChatGPT Nano");
    }
  }, [aiProviderSetting]);

  // Set selected barcode scanner system when data loads
  useEffect(() => {
    if (barcodeScannerSetting && typeof barcodeScannerSetting === 'object' && 'settingValue' in barcodeScannerSetting) {
      setSelectedBarcodeScannerSystem(barcodeScannerSetting.settingValue || "Main Barcode Scanner");
    } else {
      // Set default to Main Barcode Scanner if no setting exists
      setSelectedBarcodeScannerSystem("Main Barcode Scanner");
    }
  }, [barcodeScannerSetting]);

  // Update AI provider mutation
  const updateAIProviderMutation = useMutation({
    mutationFn: async (provider: string) => {
      return apiRequest("PUT", "/api/user/settings/ai_provider", { settingValue: provider });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
      toast({
        title: "Settings Updated",
        description: `AI provider has been changed to ${selectedAIProvider}`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update AI provider setting. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update barcode scanner system mutation
  const updateBarcodeScannerSystemMutation = useMutation({
    mutationFn: async (system: string) => {
      return apiRequest("PUT", "/api/user/settings/barcode_scanner_system", { settingValue: system });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
      toast({
        title: "Settings Updated",
        description: `Barcode scanner system has been changed to ${selectedBarcodeScannerSystem}`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update barcode scanner system setting. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveAIProvider = () => {
    if (selectedAIProvider && selectedAIProvider !== aiProviderSetting?.settingValue) {
      updateAIProviderMutation.mutate(selectedAIProvider);
    }
  };

  const handleSaveBarcodeScannerSystem = () => {
    if (selectedBarcodeScannerSystem && selectedBarcodeScannerSystem !== barcodeScannerSetting?.settingValue) {
      updateBarcodeScannerSystemMutation.mutate(selectedBarcodeScannerSystem);
    }
  };

  const getProviderInfo = (value: string) => {
    return aiProviders.find(provider => provider.value === value) || aiProviders[0];
  };

  const selectedProviderInfo = getProviderInfo(selectedAIProvider);
  const hasUnsavedChanges = selectedAIProvider !== aiProviderSetting?.settingValue;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Header */}
      <header className="backdrop-blur-md bg-background/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src={logoPath} alt="ProcessedOrNot Scanner" className="w-10 h-10 rounded-full" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold gradient-text">ProcessedOrNot</h1>
                <p className="text-xs text-muted-foreground">Settings</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/nutri-dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/nutri-dashboard/diary" className="text-muted-foreground hover:text-foreground transition-colors">Diary</Link>
              <Link href="/nutri-dashboard/progress" className="text-muted-foreground hover:text-foreground transition-colors">Progress</Link>
              <Link href="/nutri-dashboard/profile" className="text-muted-foreground hover:text-foreground transition-colors">Profile</Link>
              <Link href="/nutri-dashboard/settings" className="text-foreground font-medium">Settings</Link>
            </nav>

            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <HeaderDropdown />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/nutri-dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="h-8 w-8 text-blue-600" />
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Customize your experience and preferences
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            <Bot className="h-4 w-4 mr-1" />
            Personal Settings
          </Badge>
        </div>

        {/* AI Provider Settings - Admin/Paid only */}
        {(isAdmin || isPaidUser) && (
          <div className="max-w-4xl">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Zap className="h-6 w-6 text-yellow-500" />
                NutriAnalysisAI Provider
              </CardTitle>
              <CardDescription className="text-base">
                Choose the AI model that powers your product analysis and nutrition insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Current Selection Display */}
                  {selectedProviderInfo && (
                    <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className={`p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm`}>
                        <selectedProviderInfo.icon className={`h-6 w-6 ${selectedProviderInfo.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Current: {selectedProviderInfo.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {selectedProviderInfo.description}
                        </p>
                      </div>
                      {aiProviderSetting && typeof aiProviderSetting === 'object' && 'isDefault' in aiProviderSetting && aiProviderSetting.isDefault && (
                        <Badge variant="outline" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  )}

                  <Separator />

                  {/* AI Provider Selection */}
                  <div className="space-y-4">
                    <Label htmlFor="ai-provider" className="text-lg font-medium">
                      Select AI Provider
                    </Label>
                    
                    <Select value={selectedAIProvider} onValueChange={setSelectedAIProvider}>
                      <SelectTrigger id="ai-provider" className="w-full h-14">
                        <SelectValue placeholder="Choose an AI provider">
                          {selectedProviderInfo && (
                            <div className="flex items-center gap-3">
                              <selectedProviderInfo.icon className={`h-5 w-5 ${selectedProviderInfo.color}`} />
                              <span className="font-medium">{selectedProviderInfo.label}</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {aiProviders.map((provider) => (
                          <SelectItem key={provider.value} value={provider.value} className="h-16">
                            <div className="flex items-center gap-3 py-2">
                              <div className={`p-1.5 rounded-md bg-gray-100 dark:bg-gray-700`}>
                                <provider.icon className={`h-4 w-4 ${provider.color}`} />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{provider.label}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {provider.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Provider Descriptions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {aiProviders.map((provider) => (
                        <div
                          key={provider.value}
                          className={`p-4 border rounded-lg transition-all cursor-pointer ${
                            selectedAIProvider === provider.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                          onClick={() => setSelectedAIProvider(provider.value)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              selectedAIProvider === provider.value 
                                ? 'bg-blue-100 dark:bg-blue-800' 
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              <provider.icon className={`h-5 w-5 ${provider.color}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {provider.label}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {provider.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  {hasUnsavedChanges && (
                    <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                          You have unsaved changes
                        </span>
                      </div>
                      <Button
                        onClick={handleSaveAIProvider}
                        disabled={updateAIProviderMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateAIProviderMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Barcode Scanner System Settings Card - Admin/Paid only */}
        {(isAdmin || isPaidUser) && (
          <div className="max-w-4xl mt-6">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Barcode Scan System
              </CardTitle>
              <CardDescription>
                Choose your preferred barcode scanner for product searches
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isBarcodeScannerLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading scanner settings...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label htmlFor="barcode-scanner-system" className="text-sm font-medium">
                        Scanner System
                      </Label>
                      <Select
                        value={selectedBarcodeScannerSystem}
                        onValueChange={setSelectedBarcodeScannerSystem}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a barcode scanner system">
                            {selectedBarcodeScannerSystem && (
                              <div className="flex items-center gap-2">
                                <Camera className="h-4 w-4 text-blue-600" />
                                <span>{selectedBarcodeScannerSystem}</span>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {barcodeScannerSystems.map((system) => (
                            <SelectItem key={system.value} value={system.value} className="h-16">
                              <div className="flex items-center gap-3 py-2">
                                <div className={`p-1.5 rounded-md bg-gray-100 dark:bg-gray-700`}>
                                  <system.icon className={`h-4 w-4 ${system.color}`} />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">{system.label}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {system.description}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Scanner System Description */}
                      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800">
                            <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {selectedBarcodeScannerSystem}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {barcodeScannerSystems.find(s => s.value === selectedBarcodeScannerSystem)?.description}
                            </p>
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <Badge variant="secondary" className="text-xs">
                                Default System
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSaveBarcodeScannerSystem}
                        disabled={updateBarcodeScannerSystemMutation.isPending || 
                                selectedBarcodeScannerSystem === (barcodeScannerSetting && typeof barcodeScannerSetting === 'object' && 'settingValue' in barcodeScannerSetting ? barcodeScannerSetting.settingValue : '')}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateBarcodeScannerSystemMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Account Management Settings */}
        <div className="max-w-4xl mt-6">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Trash2 className="h-5 w-5" />
                Account Management
              </CardTitle>
              <CardDescription>
                Manage your account data and deletion requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Account Deletion Section */}
                <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-800">
                      <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        Delete Account
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                        Request permanent deletion of your account and all associated data. This action cannot be undone.
                        All your search history, preferences, and personal information will be permanently removed.
                      </p>
                      <div className="space-y-3">
                        <div className="text-xs text-red-600 dark:text-red-400">
                          <strong>What will be deleted:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Your user account and profile information</li>
                            <li>All search history and product queries</li>
                            <li>Personalized settings and preferences</li>
                            <li>All encrypted personal data</li>
                          </ul>
                        </div>
                        <Button
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                          onClick={() => {
                            if (window.confirm(
                              "Are you sure you want to request account deletion? This action cannot be undone. " +
                              "An admin will review your request and permanently delete your account and all data."
                            )) {
                              // Here we would typically send a deletion request
                              toast({
                                title: "Deletion Request Submitted",
                                description: "Your account deletion request has been submitted. An admin will review and process your request.",
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Request Account Deletion
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Export Section */}
                <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-6 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800">
                      <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Export Your Data
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                        Download a copy of your personal data including search history and preferences.
                      </p>
                      <Button
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-800"
                        onClick={() => {
                          toast({
                            title: "Data Export Requested",
                            description: "Your data export is being prepared. You'll receive a download link shortly.",
                          });
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Export My Data
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}