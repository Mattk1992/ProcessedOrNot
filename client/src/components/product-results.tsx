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

  if (productError) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-700">
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
    <div className="space-y-6">
      {/* Product Overview Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
            {/* Product Image */}
            <div className="flex-shrink-0 mb-4 lg:mb-0">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.productName || "Product image"} 
                  className="w-32 h-40 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-32 h-40 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No image</span>
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="flex-1">
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                  {product.productName || "Unknown Product"}
                </h3>
                {product.brands && (
                  <p className="text-lg text-gray-600">{product.brands}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Barcode: {product.barcode}
                </p>
              </div>

              {/* Quick Stats */}
              {product.nutriments && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {product.nutriments.energy_100g || "N/A"}
                    </div>
                    <div className="text-xs text-gray-600">kcal/100g</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {product.nutriments.sugars_100g ? `${product.nutriments.sugars_100g}g` : "N/A"}
                    </div>
                    <div className="text-xs text-gray-600">Sugars</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {product.nutriments.fat_100g ? `${product.nutriments.fat_100g}g` : "N/A"}
                    </div>
                    <div className="text-xs text-gray-600">Fat</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {product.nutriments.proteins_100g ? `${product.nutriments.proteins_100g}g` : "N/A"}
                    </div>
                    <div className="text-xs text-gray-600">Protein</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Score Card */}
      {product.processingScore !== null && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Processing Analysis</h3>
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600">AI Analysis</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Processing Level</span>
                <span className={`text-2xl font-bold ${getScoreColor(product.processingScore)}`}>
                  {product.processingScore}/10
                </span>
              </div>
              
              {/* Score Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-3 rounded-full relative">
                  <div 
                    className={`absolute top-0 left-0 h-3 rounded-full ${
                      product.processingScore <= 3 ? 'bg-green-500' : 
                      product.processingScore <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(product.processingScore / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Score Explanation */}
              <div className={`border rounded-lg p-4 ${getScoreBorderColor(product.processingScore)}`}>
                <div className="flex items-start space-x-3">
                  {product.processingScore <= 3 ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className={`font-medium mb-1 ${
                      product.processingScore <= 3 ? 'text-green-800' : 
                      product.processingScore <= 6 ? 'text-yellow-800' : 'text-red-800'
                    }`}>
                      {getScoreLabel(product.processingScore)}
                    </h4>
                    <p className={`text-sm ${
                      product.processingScore <= 3 ? 'text-green-700' : 
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
