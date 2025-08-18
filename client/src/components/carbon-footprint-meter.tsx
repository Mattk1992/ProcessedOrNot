import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Leaf, AlertCircle, Info, Zap, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface CarbonFootprintMeterProps {
  productName: string;
  ingredients?: string | null;
  nutriments?: Record<string, any> | null;
  barcode: string;
  existingFootprint?: number | null;
  existingExplanation?: string | null;
}

interface CarbonFootprintResult {
  carbonFootprint: number;
  explanation: string;
  breakdown: {
    ingredients: number;
    processing: number;
    packaging: number;
    transportation: number;
  };
  rating: 'excellent' | 'good' | 'moderate' | 'high' | 'very-high';
  suggestions: string[];
}

// Get sustainability rating based on carbon footprint
const getSustainabilityRating = (footprint: number): { rating: string; color: string; bgColor: string; progressColor: string } => {
  if (footprint < 0.5) {
    return { 
      rating: 'Excellent', 
      color: 'text-emerald-700 dark:text-emerald-300',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      progressColor: 'bg-emerald-500'
    };
  } else if (footprint < 1.0) {
    return { 
      rating: 'Good', 
      color: 'text-green-700 dark:text-green-300',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      progressColor: 'bg-green-500'
    };
  } else if (footprint < 2.0) {
    return { 
      rating: 'Moderate', 
      color: 'text-yellow-700 dark:text-yellow-300',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      progressColor: 'bg-yellow-500'
    };
  } else if (footprint < 4.0) {
    return { 
      rating: 'High', 
      color: 'text-orange-700 dark:text-orange-300',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      progressColor: 'bg-orange-500'
    };
  } else {
    return { 
      rating: 'Very High', 
      color: 'text-red-700 dark:text-red-300',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      progressColor: 'bg-red-500'
    };
  }
};

export default function CarbonFootprintMeter({ 
  productName, 
  ingredients, 
  nutriments, 
  barcode,
  existingFootprint,
  existingExplanation
}: CarbonFootprintMeterProps) {
  const { user } = useAuth();
  const [carbonData, setCarbonData] = useState<CarbonFootprintResult | null>(null);

  // If we have existing carbon footprint data, display it
  useEffect(() => {
    if (existingFootprint && existingExplanation) {
      // Parse existing data or create basic structure
      const rating = getSustainabilityRating(existingFootprint).rating.toLowerCase().replace(' ', '-') as 'excellent' | 'good' | 'moderate' | 'high' | 'very-high';
      setCarbonData({
        carbonFootprint: existingFootprint,
        explanation: existingExplanation,
        breakdown: {
          ingredients: existingFootprint * 0.4,
          processing: existingFootprint * 0.3,
          packaging: existingFootprint * 0.2,
          transportation: existingFootprint * 0.1,
        },
        rating,
        suggestions: []
      });
    }
  }, [existingFootprint, existingExplanation]);

  // Mutation to analyze carbon footprint
  const carbonFootprintMutation = useMutation({
    mutationFn: async (data: { productName: string; ingredients: string; nutriments: any; barcode: string; userId?: number }) => {
      const response = await apiRequest(`/api/analyze-carbon-footprint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (data: CarbonFootprintResult) => {
      setCarbonData(data);
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/search-history'] });
    },
    onError: (error) => {
      console.error('Failed to analyze carbon footprint:', error);
    },
  });

  const handleAnalyzeFootprint = () => {
    if (!ingredients || !productName) return;
    
    carbonFootprintMutation.mutate({
      productName,
      ingredients: ingredients || '',
      nutriments: nutriments || {},
      barcode,
      userId: user?.id,
    });
  };

  // If no existing data and no ingredients, show message
  if (!existingFootprint && (!ingredients || ingredients.trim().length === 0)) {
    return (
      <Card className="glass-card border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Carbon Footprint Meter</h3>
              <p className="text-sm text-white/80">Environmental impact analysis</p>
            </div>
            <AlertCircle className="w-5 h-5 text-white/80 ml-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">Insufficient Data</h4>
            <p className="text-muted-foreground">
              Carbon footprint analysis requires ingredient information. This product may not have detailed ingredient data available.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show loading state during analysis
  if (carbonFootprintMutation.isPending) {
    return (
      <Card className="glass-card border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Carbon Footprint Meter</h3>
              <p className="text-sm text-white/80">Analyzing environmental impact...</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-6">
          <div className="bg-gradient-to-br from-emerald-50/50 to-green-50/30 dark:from-emerald-900/20 dark:to-green-900/10 rounded-2xl p-6 border border-emerald-200/30 dark:border-emerald-700/30">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-emerald-700 dark:text-emerald-300">Calculating carbon footprint and environmental impact...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no data yet and we have ingredients, show analyze button
  if (!carbonData && ingredients) {
    return (
      <Card className="glass-card border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center floating-animation">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Carbon Footprint Meter</h3>
              <p className="text-sm text-white/80">Environmental impact analysis</p>
            </div>
            <Zap className="w-5 h-5 text-white/80 ml-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-6">
          <div className="bg-gradient-to-br from-emerald-50/50 to-green-50/30 dark:from-emerald-900/20 dark:to-green-900/10 rounded-2xl p-6 border border-emerald-200/30 dark:border-emerald-700/30 text-center">
            <TreePine className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-200">
              Analyze Environmental Impact
            </h4>
            <p className="text-emerald-700 dark:text-emerald-300 mb-4">
              Get detailed carbon footprint analysis including ingredient sourcing, processing impact, and sustainability recommendations.
            </p>
            <Button 
              onClick={handleAnalyzeFootprint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Leaf className="w-4 h-4 mr-2" />
              Calculate Carbon Footprint
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show carbon footprint analysis results
  if (carbonData) {
    const sustainability = getSustainabilityRating(carbonData.carbonFootprint);
    const maxFootprint = 5.0; // Maximum for progress bar scale
    const progressValue = Math.min((carbonData.carbonFootprint / maxFootprint) * 100, 100);

    return (
      <Card className="glass-card border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 slide-up">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center floating-animation">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Carbon Footprint Meter</h3>
              <p className="text-sm text-white/80">Environmental impact analysis</p>
            </div>
            <Info className="w-5 h-5 text-white/80 ml-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-6">
          {/* Main Footprint Display */}
          <div className={`${sustainability.bgColor} rounded-2xl p-6 border border-emerald-200/30 dark:border-emerald-700/30 mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                  {carbonData.carbonFootprint.toFixed(2)} kg CO₂e
                </h4>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">per 100g serving</p>
              </div>
              <div className={`px-4 py-2 rounded-full ${sustainability.color} font-semibold text-sm border`}>
                {sustainability.rating}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                <span>Low Impact</span>
                <span>High Impact</span>
              </div>
              <Progress value={progressValue} className="h-3" />
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                  {carbonData.breakdown.ingredients.toFixed(1)}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">Ingredients</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                  {carbonData.breakdown.processing.toFixed(1)}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                  {carbonData.breakdown.packaging.toFixed(1)}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">Packaging</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                  {carbonData.breakdown.transportation.toFixed(1)}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">Transport</div>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 border border-border/20">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium mb-2 text-emerald-800 dark:text-emerald-200">Environmental Impact Analysis</h5>
                <div className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
                  {carbonData.explanation}
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {carbonData.suggestions && carbonData.suggestions.length > 0 && (
            <div className="mt-6 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/10 rounded-2xl p-6 border border-green-200/30 dark:border-green-700/30">
              <h5 className="font-medium mb-3 text-green-800 dark:text-green-200 flex items-center">
                <TreePine className="w-4 h-4 mr-2" />
                Sustainability Tips
              </h5>
              <ul className="space-y-2">
                {carbonData.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-green-700 dark:text-green-300">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}