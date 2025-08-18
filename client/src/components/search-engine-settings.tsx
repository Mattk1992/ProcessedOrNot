import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Eye, EyeOff, Brain, Lightbulb, Activity, BarChart3, Apple, Beaker, Leaf } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchResultVisibility } from "@/contexts/SearchResultVisibilityContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchEngineSettingsProps {
  children?: React.ReactNode;
}

export default function SearchEngineSettings({ children }: SearchEngineSettingsProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSetting, resetToDefaults } = useSearchResultVisibility();

  const settingsItems = [
    {
      id: 'showNutriBotInsight',
      label: 'NutriBot AI Insight',
      description: 'AI-powered personalized nutrition analysis and recommendations',
      icon: Brain,
      enabled: settings.showNutriBotInsight,
      setEnabled: (value: boolean) => updateSetting('showNutriBotInsight', value),
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'showFunFacts',
      label: 'Fun Facts & Insights',
      description: 'Interesting facts and educational information about the product',
      icon: Lightbulb,
      enabled: settings.showFunFacts,
      setEnabled: (value: boolean) => updateSetting('showFunFacts', value),
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      id: 'showNutritionSpotlight',
      label: 'Nutrition Spotlight & Analysis',
      description: 'Detailed nutritional breakdown and health impact analysis',
      icon: Activity,
      enabled: settings.showNutritionSpotlight,
      setEnabled: (value: boolean) => updateSetting('showNutritionSpotlight', value),
      color: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'showGlycemicImpact',
      label: 'Glycemic Impact',
      description: 'Blood sugar impact assessment and diabetic considerations',
      icon: BarChart3,
      enabled: settings.showGlycemicImpact,
      setEnabled: (value: boolean) => updateSetting('showGlycemicImpact', value),
      color: 'text-red-600 dark:text-red-400'
    },
    {
      id: 'showNutritionFacts',
      label: 'Nutrition Facts',
      description: 'Complete nutritional information and values per serving',
      icon: Apple,
      enabled: settings.showNutritionFacts,
      setEnabled: (value: boolean) => updateSetting('showNutritionFacts', value),
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      id: 'showProcessingAnalysis',
      label: 'Processing Analysis & Ingredient Categories',
      description: 'Food processing level analysis and ingredient categorization',
      icon: Beaker,
      enabled: settings.showProcessingAnalysis,
      setEnabled: (value: boolean) => updateSetting('showProcessingAnalysis', value),
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      id: 'showProductionProcess',
      label: 'Product Production Process',
      description: 'Manufacturing process analysis, sustainability, and production methods',
      icon: Settings,
      enabled: settings.showProductionProcess,
      setEnabled: (value: boolean) => updateSetting('showProductionProcess', value),
      color: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      id: 'showCarbonFootprint',
      label: 'Carbon Footprint Meter',
      description: 'Environmental impact analysis showing CO2 emissions and sustainability metrics',
      icon: Leaf,
      enabled: settings.showCarbonFootprint,
      setEnabled: (value: boolean) => updateSetting('showCarbonFootprint', value),
      color: 'text-emerald-600 dark:text-emerald-400'
    }
  ];

  const enabledCount = settingsItems.filter(item => item.enabled).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            type="button"
            variant="outline"
            className="border-2 border-primary/20 text-primary hover:bg-primary/10 py-3 sm:py-4 px-4 sm:px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] mobile-touch-friendly touch-action-manipulation"
            title="Configure search result display settings and visibility controls"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base hidden sm:inline">Search Settings</span>
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50/95 to-blue-50/50 dark:from-gray-900/95 dark:to-blue-900/20 backdrop-blur-sm border-2 border-blue-200/30 dark:border-blue-700/30">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <Settings className="w-6 h-6" />
            </div>
            Search Engine Settings
          </DialogTitle>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Customize which sections appear in your product analysis results
          </p>
        </DialogHeader>

        {/* Summary Card */}
        <Card className="mb-6 border-2 border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/40 dark:from-blue-900/20 dark:to-indigo-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Visibility Overview
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              {enabledCount} of {settingsItems.length} sections enabled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {settingsItems.map(item => (
                <div 
                  key={item.id}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    item.enabled 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {item.enabled ? <Eye className="w-3 h-3 inline mr-1" /> : <EyeOff className="w-3 h-3 inline mr-1" />}
                  {item.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <Button 
            onClick={() => {
              settingsItems.forEach(item => item.setEnabled(true));
            }}
            variant="outline"
            className="flex-1 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <Eye className="w-4 h-4 mr-2" />
            Show All
          </Button>
          <Button 
            onClick={() => {
              settingsItems.forEach(item => item.setEnabled(false));
            }}
            variant="outline"
            className="flex-1 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Hide All
          </Button>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {settingsItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card key={item.id} className={`border-2 transition-all duration-200 ${
                item.enabled 
                  ? 'border-green-200 dark:border-green-800/50 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-900/10 dark:to-emerald-900/10 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${item.enabled ? 'bg-white dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700'} shadow-sm`}>
                        <IconComponent className={`w-5 h-5 ${item.enabled ? item.color : 'text-gray-400 dark:text-gray-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm leading-tight mb-1 ${
                          item.enabled 
                            ? 'text-gray-900 dark:text-gray-100' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {item.label}
                        </h3>
                        <p className={`text-xs leading-relaxed ${
                          item.enabled 
                            ? 'text-gray-600 dark:text-gray-300' 
                            : 'text-gray-500 dark:text-gray-500'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Switch
                        id={`toggle-${item.id}`}
                        checked={item.enabled}
                        onCheckedChange={item.setEnabled}
                        className="data-[state=checked]:bg-green-600"
                      />
                      <Label 
                        htmlFor={`toggle-${item.id}`}
                        className={`text-xs cursor-pointer ${
                          item.enabled 
                            ? 'text-green-700 dark:text-green-300 font-medium' 
                            : 'text-gray-500 dark:text-gray-500'
                        }`}
                      >
                        {item.enabled ? 'Enabled' : 'Disabled'}
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator className="my-6" />

        {/* Footer */}
        <div className="flex justify-between items-center pt-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Changes are saved automatically and apply to all future searches
          </p>
          <Button 
            onClick={() => setIsOpen(false)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}