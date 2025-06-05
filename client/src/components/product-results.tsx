import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { Product, ProcessingAnalysis } from "@shared/schema";

interface ProductResultsProps {
  barcode: string;
}

export default function ProductResults({ barcode }: ProductResultsProps) {
  const { data: product, isLoading: isLoadingProduct, error: productError } = useQuery<Product>({
    queryKey: ["/api/products", barcode],
    queryFn: () => api.getProduct(barcode),
    enabled: !!barcode,
  });

  const { data: analysis, isLoading: isLoadingAnalysis } = useQuery<ProcessingAnalysis>({
    queryKey: ["/api/products", barcode, "analysis"],
    queryFn: () => api.getProductAnalysis(barcode),
    enabled: !!product?.ingredientsText,
  });

  if (isLoadingProduct) {
    return (
      <div className="space-y-6">
        {/* Product Loading Skeleton */}
        <Card className="glass-effect border-2 border-border/20 shadow-xl">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
              <div className="flex-shrink-0 mb-4 lg:mb-0">
                <div className="w-32 h-40 bg-muted rounded-2xl animate-pulse"></div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="h-8 bg-muted rounded-lg animate-pulse"></div>
                  <div className="h-6 bg-muted rounded-lg w-2/3 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded-lg w-1/3 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded-xl animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Analysis Loading Skeleton */}
        <Card className="glass-effect border-2 border-border/20 shadow-xl">
          <CardContent className="pt-8 pb-8">
            <div className="space-y-6">
              <div className="h-6 bg-muted rounded-lg w-1/3 animate-pulse"></div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded-lg animate-pulse"></div>
                <div className="h-3 bg-muted rounded-full animate-pulse"></div>
                <div className="h-20 bg-muted rounded-xl animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (productError) {
    return (
      <Alert className="border-2 border-destructive/20 bg-destructive/5 rounded-2xl shadow-lg fade-in">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <AlertDescription className="text-destructive font-medium">
          {productError instanceof Error ? productError.message : "Product not found. Please check the barcode and try again."}
        </AlertDescription>
      </Alert>
    );
  }

  if (!product) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score <= 3) return "text-green-600";
    if (score <= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score <= 3) return "Minimally Processed";
    if (score <= 6) return "Processed";
    return "Ultra-Processed";
  };

  const getScoreBorderColor = (score: number) => {
    if (score <= 3) return "border-green-200 bg-green-50";
    if (score <= 6) return "border-yellow-200 bg-yellow-50";
    return "border-red-200 bg-red-50";
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Product Overview Card */}
      <Card className="glass-effect border-2 border-border/20 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
            {/* Product Image */}
            <div className="flex-shrink-0 mb-6 lg:mb-0">
              {product.imageUrl ? (
                <div className="relative group">
                  <img 
                    src={product.imageUrl} 
                    alt={product.productName || "Product image"} 
                    className="w-40 h-48 object-cover rounded-2xl border-2 border-border/20 shadow-lg group-hover:shadow-xl transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ) : (
                <div className="w-40 h-48 bg-gradient-to-br from-muted to-muted/50 rounded-2xl border-2 border-border/20 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-8 h-8 text-muted-foreground mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-muted-foreground text-sm">No image</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="flex-1">
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-foreground mb-2 slide-up">
                  {product.productName || "Unknown Product"}
                </h3>
                {product.brands && (
                  <p className="text-xl text-muted-foreground mb-2 slide-up">{String(product.brands)}</p>
                )}
                <div className="flex items-center space-x-2 slide-up">
                  <Badge variant="outline" className="font-mono text-xs">
                    {product.barcode}
                  </Badge>
                </div>
              </div>

              {/* Quick Stats */}
              {product.nutriments && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 slide-up">
                  <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-4 text-center border border-border/20 hover:border-primary/30 transition-colors">
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {(product.nutriments as any).energy_100g || "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">kcal/100g</div>
                  </div>
                  <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-4 text-center border border-border/20 hover:border-accent/30 transition-colors">
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {(product.nutriments as any).sugars_100g ? `${(product.nutriments as any).sugars_100g}g` : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Sugars</div>
                  </div>
                  <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-4 text-center border border-border/20 hover:border-primary/30 transition-colors">
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {(product.nutriments as any).fat_100g ? `${(product.nutriments as any).fat_100g}g` : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Fat</div>
                  </div>
                  <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-4 text-center border border-border/20 hover:border-accent/30 transition-colors">
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {(product.nutriments as any).proteins_100g ? `${(product.nutriments as any).proteins_100g}g` : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Protein</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Score Card */}
      {product.processingScore !== null && (
        <Card className="glass-effect border-2 border-border/20 shadow-xl hover:shadow-2xl transition-all duration-300 slide-up">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-foreground">Processing Analysis</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">AI Powered</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-foreground">Processing Level</span>
                <div className="text-right">
                  <span className={`text-4xl font-bold ${getScoreColor(product.processingScore)}`}>
                    {product.processingScore}
                  </span>
                  <span className="text-2xl text-muted-foreground">/10</span>
                </div>
              </div>
              
              {/* Enhanced Score Bar */}
              <div className="relative w-full bg-muted rounded-full h-4 mb-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 rounded-full"></div>
                <div 
                  className="absolute top-0 left-0 h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ 
                    width: `${Math.min((product.processingScore / 10) * 100, 33)}%`,
                    opacity: product.processingScore <= 3 ? 1 : 0 
                  }}
                />
                <div 
                  className="absolute top-0 left-0 h-4 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ 
                    width: `${(product.processingScore / 10) * 100}%`,
                    opacity: product.processingScore > 3 && product.processingScore <= 6 ? 1 : 0 
                  }}
                />
                <div 
                  className="absolute top-0 left-0 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ 
                    width: `${(product.processingScore / 10) * 100}%`,
                    opacity: product.processingScore > 6 ? 1 : 0 
                  }}
                />
                {/* Score indicator */}
                <div 
                  className="absolute top-0 w-1 h-4 bg-white rounded-full shadow-md transition-all duration-1000 ease-out"
                  style={{ left: `${(product.processingScore / 10) * 100}%`, transform: 'translateX(-50%)' }}
                />
              </div>

              {/* Enhanced Score Explanation */}
              <div className={`border-2 rounded-2xl p-6 ${getScoreBorderColor(product.processingScore)} relative overflow-hidden`}>
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    product.processingScore <= 3 ? 'bg-emerald-500' : 
                    product.processingScore <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    {product.processingScore <= 3 ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-xl font-bold mb-2 ${
                      product.processingScore <= 3 ? 'text-emerald-800' : 
                      product.processingScore <= 6 ? 'text-yellow-800' : 'text-red-800'
                    }`}>
                      {getScoreLabel(product.processingScore)}
                    </h4>
                    <p className={`text-base leading-relaxed ${
                      product.processingScore <= 3 ? 'text-emerald-700' : 
                      product.processingScore <= 6 ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {product.processingExplanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ingredients Card */}
      {product.ingredientsText && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients Analysis</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Full Ingredients List</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.ingredientsText}
                </p>
              </div>

              {/* Processing Indicators */}
              {analysis && !isLoadingAnalysis && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-red-200 bg-red-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-red-800">Ultra-processed</span>
                    </div>
                    <ul className="text-xs text-red-700 space-y-1">
                      {analysis.categories.ultraProcessed.length > 0 ? (
                        analysis.categories.ultraProcessed.map((ingredient, index) => (
                          <li key={index}>• {ingredient}</li>
                        ))
                      ) : (
                        <li>• None detected</li>
                      )}
                    </ul>
                  </div>

                  <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-yellow-800">Processed</span>
                    </div>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      {analysis.categories.processed.length > 0 ? (
                        analysis.categories.processed.map((ingredient, index) => (
                          <li key={index}>• {ingredient}</li>
                        ))
                      ) : (
                        <li>• None detected</li>
                      )}
                    </ul>
                  </div>

                  <div className="border border-green-200 bg-green-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-800">Minimally processed</span>
                    </div>
                    <ul className="text-xs text-green-700 space-y-1">
                      {analysis.categories.minimallyProcessed.length > 0 ? (
                        analysis.categories.minimallyProcessed.map((ingredient, index) => (
                          <li key={index}>• {ingredient}</li>
                        ))
                      ) : (
                        <li>• None detected</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nutrition Facts Card */}
      {product.nutriments && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Facts</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-700">Nutrient</th>
                    <th className="text-right py-2 font-medium text-gray-700">Per 100g</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2 text-gray-900">Energy</td>
                    <td className="py-2 text-right text-gray-600">
                      {product.nutriments.energy_100g ? `${product.nutriments.energy_100g} kcal` : "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-900">Fat</td>
                    <td className="py-2 text-right text-gray-600">
                      {product.nutriments.fat_100g ? `${product.nutriments.fat_100g}g` : "N/A"}
                    </td>
                  </tr>
                  {product.nutriments.saturated_fat_100g && (
                    <tr>
                      <td className="py-2 text-gray-900 pl-4">Saturated fat</td>
                      <td className="py-2 text-right text-gray-600">{product.nutriments.saturated_fat_100g}g</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2 text-gray-900">Carbohydrates</td>
                    <td className="py-2 text-right text-gray-600">
                      {product.nutriments.carbohydrates_100g ? `${product.nutriments.carbohydrates_100g}g` : "N/A"}
                    </td>
                  </tr>
                  {product.nutriments.sugars_100g && (
                    <tr>
                      <td className="py-2 text-gray-900 pl-4">Sugars</td>
                      <td className="py-2 text-right text-gray-600">{product.nutriments.sugars_100g}g</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2 text-gray-900">Protein</td>
                    <td className="py-2 text-right text-gray-600">
                      {product.nutriments.proteins_100g ? `${product.nutriments.proteins_100g}g` : "N/A"}
                    </td>
                  </tr>
                  {product.nutriments.salt_100g && (
                    <tr>
                      <td className="py-2 text-gray-900">Salt</td>
                      <td className="py-2 text-right text-gray-600">{product.nutriments.salt_100g}g</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
