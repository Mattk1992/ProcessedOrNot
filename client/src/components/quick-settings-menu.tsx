import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Settings, Sparkles, Brain, ChartLine, Lightbulb, Share2, Utensils, BarChart3, Zap, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickSettingsMenuProps {
  className?: string;
}

export function QuickSettingsMenu({ className }: QuickSettingsMenuProps) {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  // Query for user settings
  const { data: userSettings = [] } = useQuery({
    queryKey: ['/api/user/settings'],
    enabled: true,
  });

  // Query for AI provider setting
  const { data: aiProvider } = useQuery({
    queryKey: ['/api/user/settings/ai_provider'],
    enabled: true,
  });

  // Mutation for updating settings
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await fetch(`/api/user/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settingValue: value }),
      });
      if (!response.ok) {
        throw new Error(`Failed to update setting: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
      toast({
        title: t('settings.updated'),
        description: t('settings.changes_saved'),
      });
    },
    onError: (error) => {
      toast({
        title: t('settings.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Default settings
  const defaultSettings = {
    ai_provider: 'openai',
    barcode_scanner_type: 'zxing',
    show_processing_analysis: 'true',
    show_glycemic_index: 'true',
    show_nutrition_spotlight: 'true',
    show_share_analysis: 'true',
    show_ingredients_analysis: 'true',
    show_nutrition_facts: 'true',
    show_fun_facts: 'true',
  };

  // Get setting value with fallback to default
  const getSetting = (key: string) => {
    const setting = Array.isArray(userSettings) ? userSettings.find((s: any) => s.settingKey === key) : null;
    return setting?.settingValue || defaultSettings[key as keyof typeof defaultSettings];
  };

  // Update setting
  const updateSetting = (key: string, value: string) => {
    updateSettingMutation.mutate({ key, value });
  };

  // Setting configurations
  const settingConfigs = [
    {
      key: 'show_processing_analysis',
      title: t('quickSettings.processingAnalysis'),
      description: t('quickSettings.processingAnalysisDesc'),
      icon: <Brain className="h-4 w-4" />,
    },
    {
      key: 'show_glycemic_index',
      title: t('quickSettings.glycemicIndex'),
      description: t('quickSettings.glycemicIndexDesc'),
      icon: <ChartLine className="h-4 w-4" />,
    },
    {
      key: 'show_nutrition_spotlight',
      title: t('quickSettings.nutritionSpotlight'),
      description: t('quickSettings.nutritionSpotlightDesc'),
      icon: <Lightbulb className="h-4 w-4" />,
    },
    {
      key: 'show_share_analysis',
      title: t('quickSettings.shareAnalysis'),
      description: t('quickSettings.shareAnalysisDesc'),
      icon: <Share2 className="h-4 w-4" />,
    },
    {
      key: 'show_ingredients_analysis',
      title: t('quickSettings.ingredientsAnalysis'),
      description: t('quickSettings.ingredientsAnalysisDesc'),
      icon: <Utensils className="h-4 w-4" />,
    },
    {
      key: 'show_nutrition_facts',
      title: t('quickSettings.nutritionFacts'),
      description: t('quickSettings.nutritionFactsDesc'),
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      key: 'show_fun_facts',
      title: t('quickSettings.funFacts'),
      description: t('quickSettings.funFactsDesc'),
      icon: <Zap className="h-4 w-4" />,
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg group ${className}`}
        >
          <Settings className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
          <span className="hidden sm:inline">{t('quickSettings.title')}</span>
          <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('quickSettings.title')}
          </SheetTitle>
          <SheetDescription>
            {t('quickSettings.description')}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* AI Provider Setting */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              {t('settings.ai_provider')}
            </label>
            <Select
              value={getSetting('ai_provider')}
              onValueChange={(value) => updateSetting('ai_provider', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('settings.select_ai_provider')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                <SelectItem value="google">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Barcode Scanner Setting */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Camera className="h-4 w-4" />
              {t('settings.barcode_scanner')}
            </label>
            <Select
              value={getSetting('barcode_scanner_type')}
              onValueChange={(value) => updateSetting('barcode_scanner_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('settings.select_scanner')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zxing">ZXing Scanner (Recommended)</SelectItem>
                <SelectItem value="quagga">QuaggaJS Scanner</SelectItem>
                <SelectItem value="html5-qrcode">HTML5 QR Code Scanner</SelectItem>
                <SelectItem value="web-workers">Web Workers Scanner</SelectItem>
                <SelectItem value="enhanced-zxing">Enhanced ZXing Alternative</SelectItem>
                <SelectItem value="file-upload">File Upload Scanner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Output Control Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('quickSettings.outputControls')}
            </h3>
            
            <div className="space-y-4">
              {settingConfigs.map((config) => (
                <div key={config.key} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <Checkbox
                    id={config.key}
                    checked={getSetting(config.key) === 'true'}
                    onCheckedChange={(checked) => updateSetting(config.key, checked ? 'true' : 'false')}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor={config.key}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                    >
                      {config.icon}
                      {config.title}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Info */}
          <div className="text-xs text-muted-foreground p-3 bg-accent/20 rounded-lg">
            <p className="flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              {t('quickSettings.autoSave')}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}