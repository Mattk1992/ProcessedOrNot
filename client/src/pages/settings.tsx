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
import { Settings, Bot, ArrowLeft, Save, Sparkles, Brain, Zap, Cpu, Camera } from "lucide-react";
import { Link, useLocation } from "wouter";
import { scannerTypes } from "@/components/barcode-scanners/scanner-manager";

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

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAIProvider, setSelectedAIProvider] = useState<string>("");

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

  // Set selected AI provider when data loads
  useEffect(() => {
    if (aiProviderSetting) {
      setSelectedAIProvider(aiProviderSetting.settingValue || "ChatGPT");
    }
  }, [aiProviderSetting]);

  // Update AI provider mutation
  const updateAIProviderMutation = useMutation({
    mutationFn: async (provider: string) => {
      return apiRequest("/api/user/settings/ai_provider", "PUT", { settingValue: provider });
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

  const handleSaveAIProvider = () => {
    if (selectedAIProvider && selectedAIProvider !== aiProviderSetting?.settingValue) {
      updateAIProviderMutation.mutate(selectedAIProvider);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
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

        {/* AI Provider Settings */}
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
                      {aiProviderSetting?.isDefault && (
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

          {/* Barcode Scanner Settings */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg mt-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Camera className="h-6 w-6 text-blue-500" />
                Barcode Scanners
              </CardTitle>
              <CardDescription className="text-base">
                Choose your preferred barcode scanning method for optimal performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="barcode-scanner" className="text-lg font-medium">
                  Select Barcode Scanner
                </Label>
                
                <Select value="default" onValueChange={() => {}}>
                  <SelectTrigger id="barcode-scanner" className="w-full h-14">
                    <SelectValue placeholder="Choose a barcode scanner">
                      <div className="flex items-center gap-3">
                        <Camera className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Default Barcode Scanner</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {scannerTypes.map((scanner) => (
                      <SelectItem key={scanner.key} value={scanner.key} className="h-16">
                        <div className="flex items-center gap-3 py-2">
                          <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700">
                            <Camera className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{scanner.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {scanner.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Scanner Descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {scannerTypes.map((scanner) => (
                    <div
                      key={scanner.key}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                          <Camera className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {scanner.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {scanner.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}