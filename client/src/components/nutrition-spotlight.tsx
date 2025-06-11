import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Heart, Shield, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NutritionSpotlightProps {
  productName: string;
  nutriments: Record<string, any> | null;
  processingScore: number;
  barcode?: string;
}

interface NutrientInfo {
  name: string;
  value: number;
  unit: string;
  description: string;
  healthImpact: string;
  category: 'good' | 'moderate' | 'high';
  recommendation: string;
}

interface NutritionInsights {
  nutrients: NutrientInfo[];
  overallAssessment: string;
  healthScore: number;
}

export default function NutritionSpotlight({ productName, nutriments, processingScore, barcode }: NutritionSpotlightProps) {
  const [currentSpotlight, setCurrentSpotlight] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { t, language } = useLanguage();

  const { data: insights, isLoading } = useQuery<NutritionInsights>({
    queryKey: ["/api/products", barcode, "nutrition-spotlight", language],
    queryFn: async () => {
      const response = await fetch(`/api/products/${barcode}/nutrition-spotlight?language=${language}`);
      if (!response.ok) throw new Error('Failed to get nutrition insights');
      return response.json();
    },
    enabled: !!barcode && !!nutriments,
  });

  const nutrients = insights?.nutrients || [];

  const nextSpotlight = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSpotlight((prev) => (prev + 1) % nutrients.length);
      setIsAnimating(false);
    }, 200);
  };

  useEffect(() => {
    if (nutrients.length > 0) {
      const interval = setInterval(nextSpotlight, 6000);
      return () => clearInterval(interval);
    }
  }, [nutrients.length]);

  const getIconForCategory = (category: string): React.ReactNode => {
    switch (category) {
      case 'good': return <TrendingUp className="w-4 h-4" />;
      case 'moderate': return <Minus className="w-4 h-4" />;
      case 'high': return <TrendingDown className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600';
    }
  };

  const getProgressColor = (category: string) => {
    switch (category) {
      case 'good': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="nutrition-spotlight-entrance">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-primary" />
            {t('nutrition.spotlight.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">{t('nutrition.spotlight.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nutrients.length) return null;

  const currentNutrient = nutrients[currentSpotlight];
  const healthScore = insights?.healthScore || 0;

  return (
    <Card className="glass-card border-2 border-primary/20 shadow-xl glow-effect overflow-hidden nutrition-spotlight-entrance">
      <CardHeader className="bg-gradient-to-r from-primary to-accent text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center floating-animation">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{t('nutrition.spotlight.title')}</h3>
              <p className="text-white/80 text-sm">{t('nutrition.spotlight.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-white/20 text-white border-white/30">
              <Heart className="w-3 h-3 mr-1" />
              {healthScore}/10
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(currentNutrient.category)}`}>
                {getIconForCategory(currentNutrient.category)}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground">
                  {currentNutrient.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {currentNutrient.value}{currentNutrient.unit}
                </p>
              </div>
            </div>
            <Badge className={getCategoryColor(currentNutrient.category)}>
              {t(`nutrition.category.${currentNutrient.category}`)}
            </Badge>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">{t('nutrition.spotlight.level')}</span>
              <span className="font-medium">{currentNutrient.value}{currentNutrient.unit}</span>
            </div>
            <div className="relative">
              <Progress 
                value={Math.min(100, (currentNutrient.value / 50) * 100)} 
                className="h-2" 
              />
              <div 
                className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getProgressColor(currentNutrient.category)}`}
                style={{ width: `${Math.min(100, (currentNutrient.value / 50) * 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-gradient-to-br from-card to-muted/30 rounded-xl p-4 border border-border/20">
              <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {t('nutrition.spotlight.description')}
              </h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentNutrient.description}
              </p>
            </div>

            <div className="bg-gradient-to-br from-card to-muted/30 rounded-xl p-4 border border-border/20">
              <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                {t('nutrition.spotlight.health_impact')}
              </h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentNutrient.healthImpact}
              </p>
            </div>

            {currentNutrient.recommendation && (
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-4 border border-primary/20">
                <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t('nutrition.spotlight.recommendation')}
                </h5>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentNutrient.recommendation}
                </p>
              </div>
            )}
          </div>
        </div>

        {insights?.overallAssessment && (
          <div className="mt-6 pt-6 border-t border-border/20">
            <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              {t('nutrition.spotlight.overall_assessment')}
            </h5>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insights.overallAssessment}
            </p>
          </div>
        )}

        {nutrients.length > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {nutrients.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSpotlight(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentSpotlight
                    ? 'bg-primary w-6'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                }`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}