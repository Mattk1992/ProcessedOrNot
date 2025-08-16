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

                      {/* Data Source */}
                      {historyItem.dataSource && (
                        <div className="pt-4 border-t border-border/50">
                          <p className="text-sm text-muted-foreground">
                            <strong>Data Source:</strong> {historyItem.dataSource}
                            {historyItem.lookupSource && ` (${historyItem.lookupSource})`}
                          </p>
                        </div>
                      )}
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

                  {/* Nutritional Information */}
                  {historyItem.productNutriments && Object.keys(historyItem.productNutriments).length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border/50">
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <BarChart3 className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-medium mb-3 text-orange-800 dark:text-orange-200">Nutritional Information</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              {historyItem.productNutriments.energy && (
                                <div className="bg-white/50 dark:bg-black/20 rounded p-3">
                                  <span className="font-medium text-orange-800 dark:text-orange-200 block">Energy</span>
                                  <span className="text-orange-600 dark:text-orange-400">{historyItem.productNutriments.energy} kJ</span>
                                </div>
                              )}
                              {historyItem.productNutriments.fat && (
                                <div className="bg-white/50 dark:bg-black/20 rounded p-3">
                                  <span className="font-medium text-orange-800 dark:text-orange-200 block">Fat</span>
                                  <span className="text-orange-600 dark:text-orange-400">{historyItem.productNutriments.fat}g</span>
                                </div>
                              )}
                              {historyItem.productNutriments.carbohydrates && (
                                <div className="bg-white/50 dark:bg-black/20 rounded p-3">
                                  <span className="font-medium text-orange-800 dark:text-orange-200 block">Carbs</span>
                                  <span className="text-orange-600 dark:text-orange-400">{historyItem.productNutriments.carbohydrates}g</span>
                                </div>
                              )}
                              {historyItem.productNutriments.proteins && (
                                <div className="bg-white/50 dark:bg-black/20 rounded p-3">
                                  <span className="font-medium text-orange-800 dark:text-orange-200 block">Protein</span>
                                  <span className="text-orange-600 dark:text-orange-400">{historyItem.productNutriments.proteins}g</span>
                                </div>
                              )}
                              {historyItem.productNutriments.sugars && (
                                <div className="bg-white/50 dark:bg-black/20 rounded p-3">
                                  <span className="font-medium text-orange-800 dark:text-orange-200 block">Sugars</span>
                                  <span className="text-orange-600 dark:text-orange-400">{historyItem.productNutriments.sugars}g</span>
                                </div>
                              )}
                              {historyItem.productNutriments.salt && (
                                <div className="bg-white/50 dark:bg-black/20 rounded p-3">
                                  <span className="font-medium text-orange-800 dark:text-orange-200 block">Salt</span>
                                  <span className="text-orange-600 dark:text-orange-400">{historyItem.productNutriments.salt}g</span>
                                </div>
                              )}
                              {historyItem.productNutriments.fiber && (
                                <div className="bg-white/50 dark:bg-black/20 rounded p-3">
                                  <span className="font-medium text-orange-800 dark:text-orange-200 block">Fiber</span>
                                  <span className="text-orange-600 dark:text-orange-400">{historyItem.productNutriments.fiber}g</span>
                                </div>
                              )}
                              {historyItem.productNutriments.sodium && (
                                <div className="bg-white/50 dark:bg-black/20 rounded p-3">
                                  <span className="font-medium text-orange-800 dark:text-orange-200 block">Sodium</span>
                                  <span className="text-orange-600 dark:text-orange-400">{historyItem.productNutriments.sodium}mg</span>
                                </div>
                              )}
                              {historyItem.productNutriments['saturated-fat'] && (
                                <div className="bg-white/50 dark:bg-black/20 rounded p-3">
                                  <span className="font-medium text-orange-800 dark:text-orange-200 block">Saturated Fat</span>
                                  <span className="text-orange-600 dark:text-orange-400">{historyItem.productNutriments['saturated-fat']}g</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
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