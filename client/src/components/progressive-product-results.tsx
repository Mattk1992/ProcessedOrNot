import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Loader2, Search, AlertTriangle, CheckCircle, Plus, Database, Lightbulb } from "lucide-react";
import { api } from "@/lib/api";
import ManualProductForm from "./manual-product-form";
import type { Product, ProcessingAnalysis } from "@shared/schema";

interface ProgressiveProductResultsProps {
  barcode: string;
}

interface SearchProgress {
  currentSource: string;
  completedSources: string[];
  totalSources: number;
  found: boolean;
}

const DATA_SOURCES = [
  "OpenFoodFacts",
  "USDA FoodData Central", 
  "EFSA",
  "Health Canada",
  "Australian Food Database",
  "Barcode Spider",
  "EAN Search", 
  "Product API",
  "UPC Database"
];

export default function ProgressiveProductResults({ barcode }: ProgressiveProductResultsProps) {
  const [showManualForm, setShowManualForm] = useState(false);
  const [searchProgress, setSearchProgress] = useState<SearchProgress>({
    currentSource: "",
    completedSources: [],
    totalSources: DATA_SOURCES.length,
    found: false
  });

  const { data: product, isLoading: isLoadingProduct, error: productError, refetch } = useQuery<Product & { lookupSource?: string }>({
    queryKey: ["/api/products", barcode],
    queryFn: () => api.getProduct(barcode),
    enabled: !!barcode,
    retry: false,
  });

  const { data: analysis, isLoading: isLoadingAnalysis } = useQuery<ProcessingAnalysis>({
    queryKey: ["/api/products", barcode, "analysis"],
    queryFn: () => api.getProductAnalysis(barcode),
    enabled: !!product?.ingredientsText,
  });

  const { data: suggestions, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ["/api/products", barcode, "suggestions"],
    queryFn: () => api.getSearchSuggestions(barcode),
    enabled: !!productError && !isLoadingProduct,
    retry: false,
  });

  // Simulate progressive search updates during loading
  useEffect(() => {
    if (isLoadingProduct && !product) {
      let sourceIndex = 0;
      const interval = setInterval(() => {
        if (sourceIndex < DATA_SOURCES.length) {
          setSearchProgress(prev => ({
            ...prev,
            currentSource: DATA_SOURCES[sourceIndex],
            completedSources: DATA_SOURCES.slice(0, sourceIndex)
          }));
          sourceIndex++;
        } else {
          clearInterval(interval);
        }
      }, 300);

      return () => clearInterval(interval);
    } else if (product) {
      setSearchProgress(prev => ({
        ...prev,
        found: true,
        currentSource: product.dataSource || "Unknown"
      }));
    }
  }, [isLoadingProduct, product]);

  // Progressive loading state
  if (isLoadingProduct && !product) {
    const progressPercentage = (searchProgress.completedSources.length / searchProgress.totalSources) * 100;

    return (
      <div className="space-y-6">
        <Card className="glass-effect border-2 border-primary/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Searching Product Databases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">
                Currently searching: <span className="text-primary">{searchProgress.currentSource}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {DATA_SOURCES.map((source) => {
                  const isCompleted = searchProgress.completedSources.includes(source);
                  const isCurrent = searchProgress.currentSource === source;
                  
                  return (
                    <div
                      key={source}
                      className={`p-2 rounded-lg border ${
                        isCompleted 
                          ? 'bg-muted border-muted-foreground/20' 
                          : isCurrent 
                          ? 'bg-primary/10 border-primary animate-pulse' 
                          : 'bg-background border-border'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {isCompleted ? (
                          <CheckCircle className="h-3 w-3 text-muted-foreground" />
                        ) : isCurrent ? (
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        ) : (
                          <div className="h-3 w-3 rounded-full border border-border" />
                        )}
                        <span className={isCompleted ? 'text-muted-foreground' : isCurrent ? 'text-primary font-medium' : 'text-foreground'}>
                          {source}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Product found - show full results
  if (product && !productError) {
    return (
      <div className="space-y-6">
        <Card className="glass-effect border-2 border-green-500/20 shadow-xl">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
              <div className="flex-shrink-0 mb-4 lg:mb-0">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.productName || "Product"}
                    className="w-32 h-40 object-cover rounded-2xl shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-40 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center">
                    <Database className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {product.productName || "Unknown Product"}
                  </h3>
                  {product.brands && (
                    <p className="text-lg text-muted-foreground mb-2">{product.brands}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {product.dataSource || product.lookupSource || "Unknown Source"}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {barcode}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {analysis && (
          <Card className="glass-effect border-2 border-border/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Processing Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{analysis.score}/10</div>
                    <div className="text-sm text-muted-foreground">Processing Score</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">{analysis.explanation}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Product not found - show search suggestions and manual entry
  return (
    <div className="space-y-6">
      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          Product not found in any database. You can add this product manually or try searching for similar products.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-effect border-2 border-border/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="w-5 h-5 text-primary" />
              Add Product Manually
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Help improve our database by adding information for this product.
            </p>
            <Button
              onClick={() => setShowManualForm(true)}
              className="w-full"
            >
              Add Product Information
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect border-2 border-border/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="w-5 h-5 text-primary" />
              Search Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSuggestions ? (
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-8 bg-muted rounded animate-pulse"></div>
                <div className="h-8 bg-muted rounded animate-pulse"></div>
              </div>
            ) : suggestions?.suggestions && suggestions.suggestions.length > 0 ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Similar products found in our database:
                </p>
                <div className="space-y-2">
                  {suggestions.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => window.location.href = `/?barcode=${suggestion.barcode}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{suggestion.productName}</div>
                          {suggestion.brands && (
                            <div className="text-sm text-muted-foreground">{suggestion.brands}</div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {suggestion.reason} • {Math.round(suggestion.similarity * 100)}% match
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.barcode}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    External search options:
                  </p>
                  <div className="space-y-1">
                    {suggestions.externalSearchLinks.map((link, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        {link.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  No similar products found. Try these external search options:
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open(`https://www.google.com/search?q=${barcode}+barcode+product`, '_blank')}
                  >
                    Search Google for "{barcode}"
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open(`https://world.openfoodfacts.org/product/${barcode}`, '_blank')}
                  >
                    Check OpenFoodFacts
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open(`https://www.upcitemdb.com/upc/${barcode}`, '_blank')}
                  >
                    UPC Database Lookup
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showManualForm && (
        <ManualProductForm
          barcode={barcode}
          onProductCreated={() => {
            setShowManualForm(false);
            refetch();
          }}
          onCancel={() => setShowManualForm(false)}
        />
      )}
    </div>
  );
}