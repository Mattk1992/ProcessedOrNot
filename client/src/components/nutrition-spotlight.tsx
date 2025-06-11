import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Heart, Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NutritionSpotlightProps {
  productName: string;
  nutriments: Record<string, any> | null;
  processingScore: number;
}

interface NutrientInfo {
  name: string;
  value: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
  category: 'good' | 'moderate' | 'high';
  description: string;
  dailyValue?: number;
}

export default function NutritionSpotlight({ productName, nutriments, processingScore }: NutritionSpotlightProps) {
  const [currentSpotlight, setCurrentSpotlight] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const getNutrientCategory = (nutrient: string, value: number): 'good' | 'moderate' | 'high' => {
    const thresholds: Record<string, { moderate: number; high: number }> = {
      energy: { moderate: 300, high: 500 },
      fat: { moderate: 5, high: 15 },
      saturated_fat: { moderate: 2, high: 5 },
      sugars: { moderate: 10, high: 20 },
      salt: { moderate: 0.6, high: 1.5 },
      sodium: { moderate: 240, high: 600 },
      proteins: { moderate: 10, high: 20 }
    };

    const threshold = thresholds[nutrient];
    if (!threshold) return 'moderate';

    if (nutrient === 'proteins') {
      // For proteins, higher is better
      if (value >= threshold.high) return 'good';
      if (value >= threshold.moderate) return 'moderate';
      return 'high';
    } else {
      // For most nutrients, lower is better
      if (value <= threshold.moderate) return 'good';
      if (value <= threshold.high) return 'moderate';
      return 'high';
    }
  };

  const parseNutrients = (): NutrientInfo[] => {
    if (!nutriments) return [];

    const nutrients: NutrientInfo[] = [];

    // Energy/Calories
    if (nutriments.energy_100g || nutriments.energy) {
      const energy = nutriments.energy_100g || nutriments.energy;
      const category = getNutrientCategory('energy', energy);
      nutrients.push({
        name: 'Energy',
        value: energy,
        unit: 'kcal',
        color: category === 'good' ? 'text-green-600' : category === 'moderate' ? 'text-yellow-600' : 'text-red-600',
        icon: <Zap className="w-5 h-5" />,
        category,
        description: 'Energy content per 100g',
        dailyValue: 2000
      });
    }

    // Fat
    if (nutriments.fat_100g || nutriments.fat) {
      const fat = nutriments.fat_100g || nutriments.fat;
      const category = getNutrientCategory('fat', fat);
      nutrients.push({
        name: 'Fat',
        value: fat,
        unit: 'g',
        color: category === 'good' ? 'text-green-600' : category === 'moderate' ? 'text-yellow-600' : 'text-red-600',
        icon: <TrendingDown className="w-5 h-5" />,
        category,
        description: 'Total fat content',
        dailyValue: 70
      });
    }

    // Saturated Fat
    if (nutriments.saturated_fat_100g || nutriments.saturated_fat) {
      const saturatedFat = nutriments.saturated_fat_100g || nutriments.saturated_fat;
      const category = getNutrientCategory('saturated_fat', saturatedFat);
      nutrients.push({
        name: 'Saturated Fat',
        value: saturatedFat,
        unit: 'g',
        color: category === 'good' ? 'text-green-600' : category === 'moderate' ? 'text-yellow-600' : 'text-red-600',
        icon: <TrendingDown className="w-5 h-5" />,
        category,
        description: 'Saturated fat content',
        dailyValue: 20
      });
    }

    // Sugars
    if (nutriments.sugars_100g || nutriments.sugars) {
      const sugars = nutriments.sugars_100g || nutriments.sugars;
      const category = getNutrientCategory('sugars', sugars);
      nutrients.push({
        name: 'Sugars',
        value: sugars,
        unit: 'g',
        color: category === 'good' ? 'text-green-600' : category === 'moderate' ? 'text-yellow-600' : 'text-red-600',
        icon: <TrendingDown className="w-5 h-5" />,
        category,
        description: 'Sugar content',
        dailyValue: 50
      });
    }

    // Proteins
    if (nutriments.proteins_100g || nutriments.proteins) {
      const proteins = nutriments.proteins_100g || nutriments.proteins;
      const category = getNutrientCategory('proteins', proteins);
      nutrients.push({
        name: 'Protein',
        value: proteins,
        unit: 'g',
        color: category === 'good' ? 'text-green-600' : category === 'moderate' ? 'text-yellow-600' : 'text-red-600',
        icon: <TrendingUp className="w-5 h-5" />,
        category,
        description: 'Protein content',
        dailyValue: 50
      });
    }

    // Salt/Sodium
    if (nutriments.salt_100g || nutriments.salt || nutriments.sodium_100g || nutriments.sodium) {
      const salt = nutriments.salt_100g || nutriments.salt || (nutriments.sodium_100g || nutriments.sodium) * 2.5;
      const category = getNutrientCategory('salt', salt);
      nutrients.push({
        name: 'Salt',
        value: salt,
        unit: 'g',
        color: category === 'good' ? 'text-green-600' : category === 'moderate' ? 'text-yellow-600' : 'text-red-600',
        icon: <Shield className="w-5 h-5" />,
        category,
        description: 'Salt content',
        dailyValue: 6
      });
    }

    return nutrients;
  };

  const nutrients = parseNutrients();

  useEffect(() => {
    if (nutrients.length === 0) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSpotlight((prev) => (prev + 1) % nutrients.length);
        setIsAnimating(false);
      }, 200);
    }, 3000);

    return () => clearInterval(interval);
  }, [nutrients.length]);

  if (nutrients.length === 0) {
    return null;
  }

  const currentNutrient = nutrients[currentSpotlight];
  const dailyValuePercentage = currentNutrient.dailyValue 
    ? Math.min((currentNutrient.value / currentNutrient.dailyValue) * 100, 100)
    : 0;

  const getCategoryBadge = (category: 'good' | 'moderate' | 'high', nutrientName: string) => {
    if (nutrientName === 'Protein') {
      // For protein, reverse the logic
      switch (category) {
        case 'good': return { text: 'High', color: 'bg-green-100 text-green-800 border-green-200' };
        case 'moderate': return { text: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
        case 'high': return { text: 'Low', color: 'bg-red-100 text-red-800 border-red-200' };
      }
    } else {
      switch (category) {
        case 'good': return { text: 'Low', color: 'bg-green-100 text-green-800 border-green-200' };
        case 'moderate': return { text: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
        case 'high': return { text: 'High', color: 'bg-red-100 text-red-800 border-red-200' };
      }
    }
  };

  const categoryBadge = getCategoryBadge(currentNutrient.category, currentNutrient.name);

  return (
    <Card className="glass-card border-2 border-primary/20 shadow-xl glow-effect overflow-hidden nutrition-spotlight-entrance">
      <CardHeader className="bg-gradient-to-r from-primary to-accent text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 spotlight-rotate opacity-30"></div>
        <CardTitle className="flex items-center space-x-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center nutrition-bounce">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Nutrition Spotlight</h3>
            <p className="text-sm text-white/80">Key nutritional insights</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-8">
        {/* Main Spotlight */}
        <div className={`transition-all duration-500 transform ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-gradient-to-r from-primary/20 to-accent/20 ${currentNutrient.color} nutrition-bounce nutrient-highlight`}>
              {currentNutrient.icon}
            </div>
            
            <h4 className="text-2xl font-bold text-foreground mb-2">
              {currentNutrient.name}
            </h4>
            
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${currentNutrient.color} mb-1 value-counter`}>
                  {currentNutrient.value.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">{currentNutrient.unit}/100g</div>
              </div>
              
              <Badge className={`${categoryBadge.color} border scale-on-hover nutrient-card-enter`}>
                {categoryBadge.text}
              </Badge>
            </div>

            <p className="text-muted-foreground mb-6">{currentNutrient.description}</p>

            {/* Daily Value Progress */}
            {currentNutrient.dailyValue && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Daily Value</span>
                  <span className={`font-medium ${currentNutrient.color}`}>
                    {dailyValuePercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="relative">
                  <Progress 
                    value={dailyValuePercentage} 
                    className="h-3 progress-glow"
                  />
                  <div 
                    className="absolute top-0 h-3 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(dailyValuePercentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Based on a 2000 calorie diet
                </p>
              </div>
            )}
          </div>

          {/* Nutrient Navigation Dots */}
          <div className="flex justify-center space-x-2 mb-6">
            {nutrients.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSpotlight(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSpotlight 
                    ? 'bg-primary scale-125 glow-effect nutrient-dot-pulse' 
                    : 'bg-muted hover:bg-muted-foreground/30 scale-on-hover'
                }`}
              />
            ))}
          </div>

          {/* Quick Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {nutrients.slice(0, 6).map((nutrient, index) => (
              <div 
                key={nutrient.name}
                className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer nutrient-card-enter ${
                  index === currentSpotlight 
                    ? 'border-primary/50 bg-primary/5 scale-105 nutrient-highlight' 
                    : 'border-border/20 bg-card/50 hover:border-primary/30 scale-on-hover'
                }`}
                onClick={() => setCurrentSpotlight(index)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-2">
                  <div className={`${nutrient.color} opacity-70 ${index === currentSpotlight ? 'nutrition-bounce' : ''}`}>
                    {nutrient.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {nutrient.name}
                    </div>
                    <div className={`text-xs ${nutrient.color} ${index === currentSpotlight ? 'value-counter' : ''}`}>
                      {nutrient.value.toFixed(1)}{nutrient.unit}
                    </div>
                  </div>
                  {index === currentSpotlight && (
                    <div className="w-2 h-2 bg-primary rounded-full nutrient-dot-pulse"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}