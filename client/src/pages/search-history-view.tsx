import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { 
  ArrowLeft,
  Package, 
  AlertCircle, 
  Clock,
  ExternalLink,
  Star,
  Info,
  Activity,
  Zap,
  FileText,
  BarChart3,
  Brain,
  MessageSquare,
  Lightbulb,
  Target,
  List,
  Tags
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import HeaderDropdown from "@/components/header-dropdown";
import LanguageSwitcher from "@/components/language-switcher";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";

interface SearchHistoryItem {
  id: number;
  searchId: string;
  searchInput: string;
  searchInputType: string;
  userId?: number;
  resultFound: boolean;
  productBarcode?: string;
  productName?: string;
  productBrands?: string;
  productImageUrl?: string;
  productIngredientsText?: string;
  productNutriments?: any;
  processingScore?: number;
  processingExplanation?: string;
  glycemicIndex?: number;
  glycemicLoad?: number;
  glycemicExplanation?: string;
  dataSource?: string;
  lookupSource?: string;
  errorMessage?: string;
  // AI-Generated Insights
  nutriBotInsight?: string;
  funFacts?: string;
  nutritionSpotlight?: string;
  ingredientsList?: any;
  glycemicImpact?: string;
  nutritionFact?: string;
  processingAnalysis?: string;
  ingredientCategories?: any;
  createdAt: string;
}

export default function SearchHistoryView() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [match, params] = useRoute("/search-history/view/:id");
  const historyId = params?.id;

  // Fetch the specific search history item
  const { data: historyItem, isLoading, error } = useQuery<SearchHistoryItem>({
    queryKey: [`/api/search-history/by-id/${historyId}`],
    enabled: isAuthenticated && !!historyId,
  });

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        <header className="backdrop-blur-md bg-background/80 border-b border-border/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <img src={logoPath} alt="ProcessedOrNot Scanner" className="w-10 h-10 rounded-full" />
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold gradient-text">ProcessedOrNot</h1>
                  <p className="text-xs text-muted-foreground">Search History</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <LanguageSwitcher />
                <HeaderDropdown />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to view your search history.</p>
          </div>
          <div className="space-x-4">
            <Link href="/auth">
              <Button size="lg">Sign In</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProcessingScoreColor = (score?: number) => {
    if (!score) return "bg-gray-500";
    if (score <= 2) return "bg-green-500";
    if (score <= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProcessingScoreText = (score?: number) => {
    if (!score) return "Unknown";
    if (score <= 2) return "Minimally Processed";
    if (score <= 4) return "Processed";
    return "Ultra-Processed";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <header className="backdrop-blur-md bg-background/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src={logoPath} alt="ProcessedOrNot Scanner" className="w-10 h-10 rounded-full" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold gradient-text">ProcessedOrNot</h1>
                <p className="text-xs text-muted-foreground">Search History View</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <HeaderDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/lookup-history">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to History
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading search result...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                Failed to Load Search Result
              </h3>
              <p className="text-red-600 dark:text-red-400">
                Unable to retrieve this search result. It may have been deleted.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Search Result Display */}
        {!isLoading && !error && historyItem && (
          <div className="space-y-8">
            {/* Enhanced Search Info Header */}
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-background via-primary/5 to-background">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-3 text-xl">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        historyItem.searchInputType === 'barcode' ? 'bg-blue-500' :
                        historyItem.searchInputType === 'text' ? 'bg-green-500' : 'bg-purple-500'
                      }`}>
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="gradient-text">Search History Record</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`${
                            historyItem.searchInputType === 'barcode' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            historyItem.searchInputType === 'text' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}>
                            {historyItem.searchInputType.charAt(0).toUpperCase() + historyItem.searchInputType.slice(1)} Search
                          </Badge>
                          {historyItem.resultFound ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Product Found
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              No Result
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardTitle>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Search Date</span>
                    </div>
                    <p className="font-medium">{formatDate(historyItem.createdAt)}</p>
                    {historyItem.dataSource && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Data: {historyItem.dataSource}
                        {historyItem.lookupSource && ` (${historyItem.lookupSource})`}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <h4 className="font-semibold text-foreground">Search Query</h4>
                  </div>
                  <p className="font-mono text-lg bg-background/50 rounded-lg px-3 py-2 border">
                    {historyItem.searchInput}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Product Result */}
            {historyItem.resultFound && historyItem.productName ? (
              <Card className="border-green-200 bg-gradient-to-br from-green-50/50 via-background to-emerald-50/30 dark:from-green-900/20 dark:via-background dark:to-emerald-900/10">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-green-700 dark:text-green-300">Product Analysis Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-4 gap-6">
                    {/* Product Image */}
                    {historyItem.productImageUrl ? (
                      <div className="lg:col-span-1 flex justify-center">
                        <div className="relative">
                          <img 
                            src={historyItem.productImageUrl} 
                            alt={historyItem.productName}
                            className="w-full max-w-48 h-48 object-cover rounded-xl border-2 border-green-200 shadow-lg"
                          />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Package className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="lg:col-span-1 flex justify-center">
                        <div className="w-48 h-48 bg-muted/50 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                          <div className="text-center">
                            <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No Image Available</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Product Details */}
                    <div className="lg:col-span-3 space-y-6">
                      {/* Product Identity */}
                      <div className="bg-white/60 dark:bg-black/20 rounded-xl p-5 border border-green-200/50">
                        <h3 className="text-2xl font-bold text-foreground mb-3 leading-tight">
                          {historyItem.productName}
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {historyItem.productBrands && (
                            <div>
                              <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Brand</div>
                              <p className="text-lg font-medium text-foreground">
                                {historyItem.productBrands}
                              </p>
                            </div>
                          )}
                          {historyItem.productBarcode && (
                            <div>
                              <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Barcode</div>
                              <p className="text-lg font-mono font-medium text-foreground bg-muted/30 rounded px-2 py-1 inline-block">
                                {historyItem.productBarcode}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Processing Score */}
                      {historyItem.processingScore && (
                        <div className="bg-white/60 dark:bg-black/20 rounded-xl p-5 border border-orange-200/50">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200">Processing Level Analysis</h4>
                            <Badge className={`${getProcessingScoreColor(historyItem.processingScore)} text-white px-4 py-2 text-sm font-medium`}>
                              <Star className="w-4 h-4 mr-2" />
                              {getProcessingScoreText(historyItem.processingScore)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex-1 bg-muted/30 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full transition-all duration-500 ${getProcessingScoreColor(historyItem.processingScore)}`}
                                style={{ width: `${(historyItem.processingScore / 10) * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-bold text-foreground">{historyItem.processingScore}</span>
                              <span className="text-muted-foreground">/10</span>
                            </div>
                          </div>
                          
                          {historyItem.processingExplanation && (
                            <div className="bg-orange-50/50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200/30">
                              <div className="flex items-start space-x-3">
                                <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <h5 className="font-medium mb-2 text-orange-800 dark:text-orange-200">Detailed Analysis</h5>
                                  <p className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed">
                                    {historyItem.processingExplanation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Enhanced Glycemic Information */}
                      {(historyItem.glycemicIndex || historyItem.glycemicLoad) && (
                        <div className="bg-white/60 dark:bg-black/20 rounded-xl p-5 border border-blue-200/50">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
                              <Activity className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Glycemic Impact</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            {historyItem.glycemicIndex && (
                              <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                  <Zap className="w-5 h-5 text-blue-500" />
                                  <span className="font-medium text-blue-800 dark:text-blue-200">Glycemic Index</span>
                                </div>
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                  {historyItem.glycemicIndex}
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                                  {historyItem.glycemicIndex <= 55 ? 'Low GI' : 
                                   historyItem.glycemicIndex <= 70 ? 'Medium GI' : 'High GI'}
                                </div>
                              </div>
                            )}
                            
                            {historyItem.glycemicLoad && (
                              <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                  <BarChart3 className="w-5 h-5 text-blue-500" />
                                  <span className="font-medium text-blue-800 dark:text-blue-200">Glycemic Load</span>
                                </div>
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                  {historyItem.glycemicLoad}
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                                  {historyItem.glycemicLoad <= 10 ? 'Low GL' : 
                                   historyItem.glycemicLoad <= 20 ? 'Medium GL' : 'High GL'}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {historyItem.glycemicExplanation && (
                            <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/30">
                              <h5 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Impact Explanation</h5>
                              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                                {historyItem.glycemicExplanation}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Enhanced Search & Data Metadata */}
                      <div className="bg-white/60 dark:bg-black/20 rounded-xl p-5 border border-slate-200/50">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-slate-500 rounded-xl flex items-center justify-center">
                            <Info className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Search & Data Information</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-slate-50/50 dark:bg-slate-900/20 rounded-lg p-4 text-center">
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search Method</div>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              historyItem.searchInputType === 'barcode' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              historyItem.searchInputType === 'text' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            }`}>
                              {historyItem.searchInputType.charAt(0).toUpperCase() + historyItem.searchInputType.slice(1)}
                            </div>
                          </div>
                          
                          {historyItem.dataSource && (
                            <div className="bg-slate-50/50 dark:bg-slate-900/20 rounded-lg p-4 text-center">
                              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Data Source</div>
                              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {historyItem.dataSource}
                              </div>
                              {historyItem.lookupSource && (
                                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                  via {historyItem.lookupSource}
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="bg-slate-50/50 dark:bg-slate-900/20 rounded-lg p-4 text-center">
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search Date</div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {new Date(historyItem.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {new Date(historyItem.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Ingredients Section */}
                  {historyItem.productIngredientsText && (
                    <div className="mt-8">
                      <Card className="border-green-200 bg-gradient-to-br from-green-50/50 via-background to-emerald-50/30 dark:from-green-900/20 dark:via-background dark:to-emerald-900/10">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-green-700 dark:text-green-300">Ingredients Analysis</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-white/60 dark:bg-black/20 rounded-xl p-5 border border-green-200/50">
                            <h5 className="font-semibold text-green-800 dark:text-green-200 mb-3">Complete Ingredients List</h5>
                            <div className="bg-green-50/50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200/30">
                              <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                                {historyItem.productIngredientsText}
                              </p>
                            </div>
                            <div className="mt-3 text-xs text-green-600 dark:text-green-400">
                              💡 Ingredients are listed in order of quantity (highest to lowest)
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Enhanced Comprehensive Nutritional Information */}
                  {historyItem.productNutriments && Object.keys(historyItem.productNutriments).length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border/50 space-y-6">
                      {/* Macronutrients */}
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:bg-orange-900/20 rounded-2xl p-6 border border-orange-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200">Macronutrients (per 100g)</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {(() => {
                            const macronutrients = [
                              { key: 'energy_100g', label: 'Energy', unit: 'kcal', fallback: 'energy' },
                              { key: 'fat_100g', label: 'Total Fat', unit: 'g', fallback: 'fat' },
                              { key: 'carbohydrates_100g', label: 'Carbohydrates', unit: 'g', fallback: 'carbohydrates' },
                              { key: 'proteins_100g', label: 'Protein', unit: 'g', fallback: 'proteins' },
                              { key: 'saturated_fat_100g', label: 'Saturated Fat', unit: 'g', fallback: 'saturated-fat' },
                              { key: 'sugars_100g', label: 'Sugars', unit: 'g', fallback: 'sugars' },
                              { key: 'fiber_100g', label: 'Fiber', unit: 'g', fallback: 'fiber' },
                              { key: 'salt_100g', label: 'Salt', unit: 'g', fallback: 'salt' },
                              { key: 'sodium_100g', label: 'Sodium', unit: 'mg', fallback: 'sodium' }
                            ];

                            return macronutrients.map((nutrient, index) => {
                              const value = historyItem.productNutriments[nutrient.key] || historyItem.productNutriments[nutrient.fallback];
                              if (!value) return null;
                              
                              return (
                                <div key={index} className="bg-white/60 dark:bg-black/20 rounded-xl p-4 text-center">
                                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300 mb-1">
                                    {typeof value === 'number' ? value.toFixed(1) : String(value)}
                                    <span className="text-sm font-normal">{nutrient.unit}</span>
                                  </div>
                                  <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">{nutrient.label}</div>
                                </div>
                              );
                            }).filter(Boolean);
                          })()}
                        </div>
                      </div>

                      {/* Vitamins */}
                      {(() => {
                        const vitamins = [
                          { key: 'vitamin_a_100g', label: 'Vitamin A', unit: 'μg' },
                          { key: 'vitamin_c_100g', label: 'Vitamin C', unit: 'mg' },
                          { key: 'vitamin_d_100g', label: 'Vitamin D', unit: 'μg' },
                          { key: 'vitamin_e_100g', label: 'Vitamin E', unit: 'mg' },
                          { key: 'vitamin_k_100g', label: 'Vitamin K', unit: 'μg' },
                          { key: 'vitamin_b1_100g', label: 'Thiamin (B1)', unit: 'mg' },
                          { key: 'vitamin_b2_100g', label: 'Riboflavin (B2)', unit: 'mg' },
                          { key: 'vitamin_b6_100g', label: 'Vitamin B6', unit: 'mg' },
                          { key: 'vitamin_b12_100g', label: 'Vitamin B12', unit: 'μg' },
                          { key: 'folate_100g', label: 'Folate', unit: 'μg' }
                        ];
                        
                        const availableVitamins = vitamins.filter(vitamin => historyItem.productNutriments[vitamin.key]);
                        
                        if (availableVitamins.length === 0) return null;
                        
                        return (
                          <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-sm">V</span>
                              </div>
                              <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">Vitamins (per 100g)</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                              {availableVitamins.map((vitamin, index) => {
                                const value = historyItem.productNutriments[vitamin.key];
                                return (
                                  <div key={index} className="bg-white/60 dark:bg-black/20 rounded-xl p-4 text-center">
                                    <div className="text-xl font-bold text-green-700 dark:text-green-300 mb-1">
                                      {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                      <span className="text-xs font-normal">{vitamin.unit}</span>
                                    </div>
                                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">{vitamin.label}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Minerals */}
                      {(() => {
                        const minerals = [
                          { key: 'calcium_100g', label: 'Calcium', unit: 'mg' },
                          { key: 'iron_100g', label: 'Iron', unit: 'mg' },
                          { key: 'magnesium_100g', label: 'Magnesium', unit: 'mg' },
                          { key: 'phosphorus_100g', label: 'Phosphorus', unit: 'mg' },
                          { key: 'potassium_100g', label: 'Potassium', unit: 'mg' },
                          { key: 'zinc_100g', label: 'Zinc', unit: 'mg' },
                          { key: 'copper_100g', label: 'Copper', unit: 'mg' },
                          { key: 'manganese_100g', label: 'Manganese', unit: 'mg' },
                          { key: 'selenium_100g', label: 'Selenium', unit: 'μg' },
                          { key: 'iodine_100g', label: 'Iodine', unit: 'μg' }
                        ];
                        
                        const availableMinerals = minerals.filter(mineral => historyItem.productNutriments[mineral.key]);
                        
                        if (availableMinerals.length === 0) return null;
                        
                        return (
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-200">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-sm">M</span>
                              </div>
                              <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200">Minerals (per 100g)</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                              {availableMinerals.map((mineral, index) => {
                                const value = historyItem.productNutriments[mineral.key];
                                return (
                                  <div key={index} className="bg-white/60 dark:bg-black/20 rounded-xl p-4 text-center">
                                    <div className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-1">
                                      {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                      <span className="text-xs font-normal">{mineral.unit}</span>
                                    </div>
                                    <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">{mineral.label}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* AI-Generated Insights - Auto-Detecting Dynamic System */}
                      {(() => {
                        // Define known insight field configurations with their display properties
                        const knownInsightFields = [
                          {
                            key: 'nutriBotInsight',
                            title: 'NutriBot AI Insight',
                            icon: MessageSquare,
                            colors: {
                              bg: 'from-blue-50 to-indigo-100/50',
                              bgDark: 'dark:bg-blue-900/20',
                              border: 'border-blue-200',
                              iconBg: 'bg-blue-500',
                              titleColor: 'text-blue-800 dark:text-blue-200',
                              textColor: 'text-blue-900 dark:text-blue-100'
                            }
                          },
                          {
                            key: 'funFacts',
                            title: 'Fun Facts & Insights',
                            icon: Lightbulb,
                            colors: {
                              bg: 'from-green-50 to-emerald-100/50',
                              bgDark: 'dark:bg-green-900/20',
                              border: 'border-green-200',
                              iconBg: 'bg-green-500',
                              titleColor: 'text-green-800 dark:text-green-200',
                              textColor: 'text-green-900 dark:text-green-100'
                            }
                          },
                          {
                            key: 'nutritionSpotlight',
                            title: 'Nutrition Spotlight & Analysis',
                            icon: Target,
                            colors: {
                              bg: 'from-orange-50 to-amber-100/50',
                              bgDark: 'dark:bg-orange-900/20',
                              border: 'border-orange-200',
                              iconBg: 'bg-orange-500',
                              titleColor: 'text-orange-800 dark:text-orange-200',
                              textColor: 'text-orange-900 dark:text-orange-100'
                            }
                          },
                          {
                            key: 'glycemicImpact',
                            title: 'Glycemic Impact Analysis',
                            icon: Activity,
                            colors: {
                              bg: 'from-red-50 to-rose-100/50',
                              bgDark: 'dark:bg-red-900/20',
                              border: 'border-red-200',
                              iconBg: 'bg-red-500',
                              titleColor: 'text-red-800 dark:text-red-200',
                              textColor: 'text-red-900 dark:text-red-100'
                            }
                          },
                          {
                            key: 'nutritionFact',
                            title: 'Key Nutrition Fact',
                            icon: Info,
                            colors: {
                              bg: 'from-cyan-50 to-teal-100/50',
                              bgDark: 'dark:bg-cyan-900/20',
                              border: 'border-cyan-200',
                              iconBg: 'bg-cyan-500',
                              titleColor: 'text-cyan-800 dark:text-cyan-200',
                              textColor: 'text-cyan-900 dark:text-cyan-100'
                            }
                          },
                          {
                            key: 'processingAnalysis',
                            title: 'Processing Analysis & Categories',
                            icon: Zap,
                            colors: {
                              bg: 'from-violet-50 to-purple-100/50',
                              bgDark: 'dark:bg-violet-900/20',
                              border: 'border-violet-200',
                              iconBg: 'bg-violet-500',
                              titleColor: 'text-violet-800 dark:text-violet-200',
                              textColor: 'text-violet-900 dark:text-violet-100'
                            }
                          },
                          {
                            key: 'ingredientsList',
                            title: 'Structured Ingredients Analysis',
                            icon: List,
                            isJSON: true,
                            colors: {
                              bg: 'from-emerald-50 to-green-100/50',
                              bgDark: 'dark:bg-emerald-900/20',
                              border: 'border-emerald-200',
                              iconBg: 'bg-emerald-500',
                              titleColor: 'text-emerald-800 dark:text-emerald-200',
                              textColor: 'text-emerald-900 dark:text-emerald-100'
                            }
                          },
                          {
                            key: 'ingredientCategories',
                            title: 'Ingredient Categories',
                            icon: Tags,
                            isJSON: true,
                            colors: {
                              bg: 'from-amber-50 to-yellow-100/50',
                              bgDark: 'dark:bg-amber-900/20',
                              border: 'border-amber-200',
                              iconBg: 'bg-amber-500',
                              titleColor: 'text-amber-800 dark:text-amber-200',
                              textColor: 'text-amber-900 dark:text-amber-100'
                            }
                          }
                        ];

                        // Auto-detect any additional insight fields not in the known list
                        // This will automatically include any new columns added to the database
                        const excludeFields = [
                          'id', 'searchId', 'searchInput', 'searchInputType', 'userId', 'resultFound',
                          'productBarcode', 'productName', 'productBrands', 'productImageUrl', 
                          'productIngredientsText', 'productNutriments', 'processingScore', 
                          'processingExplanation', 'glycemicIndex', 'glycemicLoad', 'glycemicExplanation',
                          'dataSource', 'lookupSource', 'errorMessage', 'createdAt', 'lastUpdated',
                          'additionalImages', 'videoUrl', 'mediaGallery'
                        ];

                        const defaultColors = [
                          {
                            bg: 'from-indigo-50 to-blue-100/50',
                            bgDark: 'dark:bg-indigo-900/20',
                            border: 'border-indigo-200',
                            iconBg: 'bg-indigo-500',
                            titleColor: 'text-indigo-800 dark:text-indigo-200',
                            textColor: 'text-indigo-900 dark:text-indigo-100'
                          },
                          {
                            bg: 'from-purple-50 to-pink-100/50',
                            bgDark: 'dark:bg-purple-900/20',
                            border: 'border-purple-200',
                            iconBg: 'bg-purple-500',
                            titleColor: 'text-purple-800 dark:text-purple-200',
                            textColor: 'text-purple-900 dark:text-purple-100'
                          },
                          {
                            bg: 'from-teal-50 to-emerald-100/50',
                            bgDark: 'dark:bg-teal-900/20',
                            border: 'border-teal-200',
                            iconBg: 'bg-teal-500',
                            titleColor: 'text-teal-800 dark:text-teal-200',
                            textColor: 'text-teal-900 dark:text-teal-100'
                          }
                        ];

                        // Create a map of known fields for quick lookup
                        const knownFieldsMap = new Map(knownInsightFields.map(field => [field.key, field]));

                        // Find all fields with data, including unknown ones
                        const allInsightFields: Array<any> = [];
                        let unknownFieldIndex = 0;

                        Object.keys(historyItem).forEach(key => {
                          const value = historyItem[key as keyof SearchHistoryItem];
                          
                          // Skip excluded fields and empty values
                          if (excludeFields.includes(key) || value === null || value === undefined || value === '') {
                            return;
                          }

                          if (knownFieldsMap.has(key)) {
                            // Use known field configuration
                            allInsightFields.push(knownFieldsMap.get(key));
                          } else {
                            // Auto-detect new insight field and create default configuration
                            const colorScheme = defaultColors[unknownFieldIndex % defaultColors.length];
                            unknownFieldIndex++;

                            // Generate user-friendly title from camelCase field name
                            const title = key
                              .replace(/([A-Z])/g, ' $1')
                              .replace(/^./, str => str.toUpperCase())
                              .trim();

                            allInsightFields.push({
                              key,
                              title: title || 'New AI Insight',
                              icon: Brain, // Default icon for new fields
                              isJSON: typeof value === 'object',
                              colors: colorScheme
                            });
                          }
                        });

                        // Return early if no insights available
                        if (allInsightFields.length === 0) return null;

                        return (
                          <div className="mt-6 pt-6 border-t border-border/50 space-y-6">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <Brain className="w-5 h-5 text-white" />
                              </div>
                              <h3 className="text-xl font-bold text-foreground">AI-Generated Insights</h3>
                            </div>

                            {/* Dynamically render each available insight */}
                            {allInsightFields.map((field) => {
                              const IconComponent = field.icon;
                              const value = historyItem[field.key as keyof SearchHistoryItem];

                              return (
                                <div key={field.key} className={`bg-gradient-to-br ${field.colors.bg} ${field.colors.bgDark} rounded-2xl p-6 border ${field.colors.border}`}>
                                  <div className="flex items-center space-x-3 mb-3">
                                    <div className={`w-7 h-7 ${field.colors.iconBg} rounded-lg flex items-center justify-center`}>
                                      <IconComponent className="w-4 h-4 text-white" />
                                    </div>
                                    <h4 className={`text-lg font-semibold ${field.colors.titleColor}`}>{field.title}</h4>
                                  </div>
                                  <div className={field.colors.textColor}>
                                    {field.isJSON && typeof value === 'object' ? (
                                      <pre className="whitespace-pre-wrap font-mono text-sm bg-white/50 dark:bg-black/20 rounded-lg p-3">
                                        {JSON.stringify(value, null, 2)}
                                      </pre>
                                    ) : (
                                      <p className="leading-relaxed">{String(value)}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Enhanced Action Buttons */}
                  <div className="mt-8">
                    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl p-6 border-2 border-primary/20">
                      <h4 className="font-semibold text-foreground mb-4 flex items-center space-x-2">
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                        <span>Quick Actions</span>
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        <Link href={`/product-lookup?q=${encodeURIComponent(historyItem.searchInput)}`}>
                          <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg">
                            <Package className="w-4 h-4 mr-2" />
                            Search Again
                          </Button>
                        </Link>
                        {historyItem.productBarcode && (
                          <Link href={`/product-lookup?barcode=${historyItem.productBarcode}`}>
                            <Button variant="outline" className="border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-700 dark:text-green-300">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Get Fresh Analysis
                            </Button>
                          </Link>
                        )}
                        <Link href="/lookup-history">
                          <Button variant="outline" className="border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/20">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to History
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                        No Product Found
                      </h3>
                      <p className="text-red-600 dark:text-red-400 mb-4">
                        No product was found for this search query at the time of the original search.
                      </p>
                      {historyItem.errorMessage && (
                        <p className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 rounded p-2">
                          <strong>Error Details:</strong> {historyItem.errorMessage}
                        </p>
                      )}
                      
                      {/* Try Again Button */}
                      <div className="mt-4">
                        <Link href={`/product-lookup?q=${encodeURIComponent(historyItem.searchInput)}`}>
                          <Button variant="outline">
                            <Package className="w-4 h-4 mr-2" />
                            Try Searching Again
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}