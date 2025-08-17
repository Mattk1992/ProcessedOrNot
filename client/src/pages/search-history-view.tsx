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
  BarChart3
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
          <div className="space-y-6">
            {/* Search Info Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {historyItem.searchInputType === 'barcode' && <Package className="w-5 h-5 text-blue-500" />}
                        {historyItem.searchInputType === 'text' && <Package className="w-5 h-5 text-green-500" />}
                        {historyItem.searchInputType === 'voice' && <Package className="w-5 h-5 text-purple-500" />}
                        <span>Search Result</span>
                      </div>
                      <Badge variant="outline">
                        {historyItem.searchInputType}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2 mt-2">
                      <Clock className="w-4 h-4" />
                      <span>Searched on {formatDate(historyItem.createdAt)}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Search Query</h4>
                    <p className="font-mono text-lg">{historyItem.searchInput}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Result */}
            {historyItem.resultFound && historyItem.productName ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-300">Product Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Product Image */}
                    {historyItem.productImageUrl && (
                      <div className="flex justify-center">
                        <img 
                          src={historyItem.productImageUrl} 
                          alt={historyItem.productName}
                          className="w-48 h-48 object-cover rounded-lg border shadow-sm"
                        />
                      </div>
                    )}
                    
                    {/* Product Details */}
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">
                          {historyItem.productName}
                        </h3>
                        {historyItem.productBrands && (
                          <p className="text-lg text-muted-foreground">
                            {historyItem.productBrands}
                          </p>
                        )}
                        {historyItem.productBarcode && (
                          <p className="text-sm text-muted-foreground font-mono mt-2">
                            Barcode: {historyItem.productBarcode}
                          </p>
                        )}
                      </div>

                      {/* Processing Score */}
                      {historyItem.processingScore && (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Badge className={`${getProcessingScoreColor(historyItem.processingScore)} text-white px-3 py-1`}>
                              <Star className="w-4 h-4 mr-1" />
                              {getProcessingScoreText(historyItem.processingScore)} ({historyItem.processingScore}/10)
                            </Badge>
                          </div>
                          
                          {historyItem.processingExplanation && (
                            <div className="bg-muted/50 rounded-lg p-4">
                              <div className="flex items-start space-x-2">
                                <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                  <h4 className="font-medium mb-2">Processing Analysis</h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {historyItem.processingExplanation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Glycemic Information */}
                      {(historyItem.glycemicIndex || historyItem.glycemicLoad) && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                          <div className="flex items-start space-x-2">
                            <Activity className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-medium mb-3 text-blue-800 dark:text-blue-200">Glycemic Information</h4>
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                {historyItem.glycemicIndex && (
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <Zap className="w-4 h-4 text-blue-500" />
                                      <span className="font-medium text-sm">Glycemic Index</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{historyItem.glycemicIndex}</p>
                                  </div>
                                )}
                                {historyItem.glycemicLoad && (
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <BarChart3 className="w-4 h-4 text-blue-500" />
                                      <span className="font-medium text-sm">Glycemic Load</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{historyItem.glycemicLoad}</p>
                                  </div>
                                )}
                              </div>
                              {historyItem.glycemicExplanation && (
                                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                                  {historyItem.glycemicExplanation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Enhanced Product Metadata */}
                      <div className="mt-6 pt-6 border-t border-border/50">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
                              <Info className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Product Information</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {historyItem.productBarcode && (
                              <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4">
                                <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Barcode</div>
                                <div className="font-mono text-lg text-blue-900 dark:text-blue-100">{historyItem.productBarcode}</div>
                              </div>
                            )}
                            {historyItem.productBrands && (
                              <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4">
                                <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Brand</div>
                                <div className="text-lg text-blue-900 dark:text-blue-100">{historyItem.productBrands}</div>
                              </div>
                            )}
                            {historyItem.dataSource && (
                              <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4">
                                <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Data Source</div>
                                <div className="text-lg text-blue-900 dark:text-blue-100">
                                  {historyItem.dataSource}
                                  {historyItem.lookupSource && ` (${historyItem.lookupSource})`}
                                </div>
                              </div>
                            )}
                            <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4">
                              <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Search Type</div>
                              <div className="text-lg text-blue-900 dark:text-blue-100 capitalize">{historyItem.searchInputType}</div>
                            </div>
                            <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4">
                              <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Search Query</div>
                              <div className="text-lg text-blue-900 dark:text-blue-100 font-mono">{historyItem.searchInput}</div>
                            </div>
                            <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4">
                              <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Search Date</div>
                              <div className="text-lg text-blue-900 dark:text-blue-100">{formatDate(historyItem.createdAt)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients Section */}
                  {historyItem.productIngredientsText && (
                    <div className="mt-6 pt-6 border-t border-border/50">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <FileText className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-medium mb-3 text-green-800 dark:text-green-200">Ingredients List</h4>
                            <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                              {historyItem.productIngredientsText}
                            </p>
                          </div>
                        </div>
                      </div>
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
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border/50">
                    <Link href={`/product-lookup?q=${encodeURIComponent(historyItem.searchInput)}`}>
                      <Button variant="outline">
                        <Package className="w-4 h-4 mr-2" />
                        Search Again
                      </Button>
                    </Link>
                    {historyItem.productBarcode && (
                      <Link href={`/product-lookup?barcode=${historyItem.productBarcode}`}>
                        <Button variant="outline">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Get Fresh Analysis
                        </Button>
                      </Link>
                    )}
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