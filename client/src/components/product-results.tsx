import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, AlertTriangle, CheckCircle, Plus, Database, Bot, Sparkles, X, Info, BarChart3, Zap, TrendingUp, Activity, Calendar, Apple, Flag, Edit, Settings, Factory } from "lucide-react";
import { api } from "@/lib/api";
import ManualProductForm from "./manual-product-form";
import NutritionSpotlight from "./nutrition-spotlight";
import FunFacts from "./fun-facts";
import SocialShare from "./social-share";
import NutritionFactPopup from "./nutrition-fact-popup";
import CarbonFootprintMeter from "./carbon-footprint-meter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSearchResultVisibility } from "@/contexts/SearchResultVisibilityContext";
import { useAuth } from "@/hooks/useAuth";
import { productInsightsManager, searchHistoryInsightsManager } from "@/lib/product-insights";
import type { Product, ProcessingAnalysis } from "@shared/schema";

interface ProductResultsProps {
  barcode: string;
  filters?: { includeBrands?: string[], excludeBrands?: string[] };
  onProductFound?: (product: Product) => void;
}

export default function ProductResults({ barcode, filters, onProductFound }: ProductResultsProps) {
  const [showManualForm, setShowManualForm] = useState(false);
  const [showNutritionPopup, setShowNutritionPopup] = useState(false);
  const [showAddToDiary, setShowAddToDiary] = useState(false);
  const [portionAmount, setPortionAmount] = useState<string>("100");
  const [consumedDateTime, setConsumedDateTime] = useState<string>(
    new Date().toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
  );
  const [isAddingToDiary, setIsAddingToDiary] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [reportDescription, setReportDescription] = useState("");
  const [reportIssueType, setReportIssueType] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editedProduct, setEditedProduct] = useState<any>(null);
  const [showAnalysisSettings, setShowAnalysisSettings] = useState(false);
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { settings: visibilitySettings } = useSearchResultVisibility();

  // Analysis section visibility settings
  const [analysisSettings, setAnalysisSettings] = useState(() => {
    const saved = localStorage.getItem('productAnalysisSettings');
    return saved ? JSON.parse(saved) : {
      processingAnalysis: true,
      nutritionFacts: true,
      glycemicImpact: true,
      ingredientsList: true,
      productMetadata: true,
      nutritionSpotlight: true,
      funFacts: true,
      nutriBotInsight: true,
      productionProcess: true
    };
  });

  // Save settings to localStorage whenever they change
  const updateAnalysisSettings = (newSettings: typeof analysisSettings) => {
    setAnalysisSettings(newSettings);
    localStorage.setItem('productAnalysisSettings', JSON.stringify(newSettings));
  };

  // Function to handle adding product to diary
  const handleAddToDiary = async () => {
    if (!product || !portionAmount) return;
    
    setIsAddingToDiary(true);
    try {
      const portion = parseFloat(portionAmount);
      if (isNaN(portion) || portion <= 0) {
        alert("Please enter a valid portion amount");
        return;
      }

      // Calculate nutritional values based on portion
      const nutriments = product.nutriments as Record<string, any>;
      const scaledNutriments: Record<string, number> = {};
      
      // Scale all nutrients based on portion (assuming base is per 100g/ml)
      Object.entries(nutriments).forEach(([key, value]) => {
        if (typeof value === 'number' && key.includes('_100g')) {
          const baseKey = key.replace('_100g', '');
          scaledNutriments[baseKey] = (value * portion) / 100;
        }
      });

      const diaryEntry = {
        productBarcode: product.barcode,
        productName: product.productName,
        productBrands: product.brands,
        productImageUrl: product.imageUrl,
        servingSize: portion / 100, // Convert to multiplier (e.g., 150g = 1.5)
        servingUnit: "g",
        calories: scaledNutriments.energy || 0,
        fat: scaledNutriments.fat || 0,
        saturatedFat: scaledNutriments.saturated_fat || 0,
        carbohydrates: scaledNutriments.carbohydrates || 0,
        sugars: scaledNutriments.sugars || 0,
        proteins: scaledNutriments.proteins || 0,
        salt: scaledNutriments.salt || 0,
        fiber: scaledNutriments.fiber || 0,
        processingScore: product.processingScore,
        mealType: "snack", // Default to snack, could be made configurable
        consumedAt: new Date(consumedDateTime).toISOString(),
        notes: "",
      };

      const response = await fetch('/api/nutrition-diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diaryEntry),
      });

      if (!response.ok) {
        throw new Error('Failed to add to diary');
      }

      setShowAddToDiary(false);
      setPortionAmount("100");
      setConsumedDateTime(new Date().toISOString().slice(0, 16));
      alert("Product added to your nutrition diary!");
      
    } catch (error) {
      console.error('Error adding to diary:', error);
      alert("Failed to add product to diary. Please try again.");
    } finally {
      setIsAddingToDiary(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportDescription.trim() || !reportIssueType) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmittingReport(true);
    try {
      const reportData = {
        requestType: 'report_error',
        productBarcode: product?.barcode,
        productName: product?.productName || 'Unknown Product',
        currentData: product,
        proposedChanges: {}, // Empty for reports, user just identifies issues
        description: reportDescription,
        issueType: reportIssueType,
        priority: 'medium'
      };

      const response = await fetch('/api/data-change-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      setShowReportModal(false);
      setReportDescription("");
      setReportIssueType("");
      alert("Thank you for reporting this issue! Our team will review it soon.");
      
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleEditProduct = () => {
    setEditedProduct({
      barcode: product?.barcode || '',
      productName: product?.productName || '',
      brands: product?.brands || '',
      ingredientsText: product?.ingredientsText || '',
      nutriments: product?.nutriments || {},
      imageUrl: product?.imageUrl || ''
    });
    setShowEditProductModal(true);
  };

  const handleSubmitEditRequest = async () => {
    if (!editedProduct) return;

    setIsSubmittingEdit(true);
    try {
      const editData = {
        requestType: 'add_missing_data',
        productBarcode: product?.barcode,
        productName: product?.productName || 'Unknown Product',
        currentData: product,
        proposedChanges: editedProduct,
        description: 'User provided additional/corrected product information',
        issueType: 'missing_data',
        priority: 'medium'
      };

      const response = await fetch('/api/data-change-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit edit request');
      }

      setShowEditProductModal(false);
      setEditedProduct(null);
      alert("Thank you for providing additional data! Your request has been sent to our team for review.");
      
    } catch (error) {
      console.error('Error submitting edit request:', error);
      alert('Failed to submit edit request. Please try again.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Determine if this is a text search with filters
  const isTextSearch = !/^[0-9\s]*$/.test(barcode.trim());
  const hasFilters = filters && (filters.includeBrands?.length || filters.excludeBrands?.length);

  const { data: product, isLoading: isLoadingProduct, error: productError, refetch } = useQuery<Product & { lookupSource?: string }>({
    queryKey: ["/api/products", barcode, filters],
    queryFn: async () => {
      if (isTextSearch && hasFilters) {
        // Use the new filtered search endpoint for text searches with filters
        const response = await fetch('/api/products/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: barcode,
            filters: filters
          })
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to search product');
        }
        return response.json();
      } else {
        // Use the regular barcode lookup for barcodes or text searches without filters
        return api.getProduct(barcode);
      }
    },
    enabled: !!barcode,
    retry: false, // Don't retry on 404s for manual entry option
  });

  const { data: analysis, isLoading: isLoadingAnalysis } = useQuery<ProcessingAnalysis>({
    queryKey: ["/api/products", barcode, "analysis", language],
    queryFn: async () => {
      const response = await fetch(`/api/products/${barcode}/analysis?language=${language}`);
      if (!response.ok) throw new Error('Failed to get product analysis');
      return response.json();
    },
    enabled: !!product?.ingredientsText,
  });

  const { data: nutriBotInsight, isLoading: isLoadingInsight } = useQuery<{ insight: string }>({
    queryKey: ["/api/products", barcode, "nutribot-insight", language],
    queryFn: async () => {
      const response = await fetch(`/api/products/${barcode}/nutribot-insight?language=${language}`);
      if (!response.ok) throw new Error('Failed to get NutriBot insight');
      return response.json();
    },
    enabled: !!product,
  });

  const { data: productionProcess, isLoading: isLoadingProductionProcess } = useQuery<{ process: string }>({
    queryKey: ["/api/products", barcode, "production-process", language],
    queryFn: async () => {
      const response = await fetch(`/api/products/${barcode}/production-process?language=${language}`);
      if (!response.ok) throw new Error('Failed to get production process');
      return response.json();
    },
    enabled: !!product,
  });

  // Trigger both popups when product is found
  useEffect(() => {
    if (product && !isLoadingProduct && !productError) {
      setShowNutritionPopup(true);
      onProductFound?.(product);
      
      // Auto-save basic product insights to products database
      productInsightsManager.saveAllProductInsights(product.barcode, product);
      
      // Auto-save basic product insights to search history database
      searchHistoryInsightsManager.saveAllInsights(product.barcode, product);
    }
  }, [product, isLoadingProduct, productError, onProductFound]);

  // Auto-save analysis (processing analysis & ingredient categories) when loaded
  useEffect(() => {
    if (analysis && !isLoadingAnalysis && product?.barcode) {
      productInsightsManager.saveProcessingAnalysis(product.barcode, analysis);
      searchHistoryInsightsManager.saveProcessingAnalysis(product.barcode, analysis);
    }
  }, [analysis, isLoadingAnalysis, product?.barcode]);

  // Auto-save NutriBot insight when loaded
  useEffect(() => {
    if (nutriBotInsight?.insight && !isLoadingInsight && product?.barcode) {
      productInsightsManager.saveNutriBotInsight(product.barcode, nutriBotInsight.insight);
      searchHistoryInsightsManager.saveNutriBotInsight(product.barcode, nutriBotInsight.insight);
    }
  }, [nutriBotInsight?.insight, isLoadingInsight, product?.barcode]);

  // Auto-save production process when loaded
  useEffect(() => {
    if (productionProcess?.process && !isLoadingProductionProcess && product?.barcode) {
      console.log('Production process data received:', productionProcess);
      console.log('Visibility settings:', visibilitySettings.showProductionProcess);
      console.log('Production process text length:', productionProcess.process?.length);
      console.log('Production process first 200 chars:', productionProcess.process?.substring(0, 200));
      productInsightsManager.saveProductionProcess(product.barcode, productionProcess.process);
      searchHistoryInsightsManager.saveProductionProcess(product.barcode, productionProcess.process);
    }
  }, [productionProcess?.process, isLoadingProductionProcess, product?.barcode]);

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
    // Check if this is a 404 error that allows manual entry
    const errorMessage = productError instanceof Error ? productError.message : "";
    const allowsManualEntry = errorMessage.includes("not found in any database");

    if (showManualForm && allowsManualEntry) {
      return (
        <ManualProductForm
          barcode={barcode}
          onProductCreated={() => {
            setShowManualForm(false);
            refetch();
          }}
          onCancel={() => setShowManualForm(false)}
        />
      );
    }

    return (
      <div className="space-y-4">
        <Alert className="border-2 border-destructive/20 bg-destructive/5 rounded-2xl shadow-lg fade-in">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <AlertDescription className="text-destructive font-medium">
            {allowsManualEntry ? t('product.notfound.description') : errorMessage || t('product.notfound.description')}
          </AlertDescription>
        </Alert>

        {allowsManualEntry && (
          <Card className="glass-effect border-2 border-border/20 shadow-xl">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Database className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t('product.notfound.title')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t('product.addmanual.description')}
                  </p>
                  <Button 
                    onClick={() => setShowManualForm(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {t('product.notfound.add')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
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
    if (score <= 3) return t('processing.level.minimal');
    if (score <= 6) return t('processing.level.processed');
    return t('processing.level.ultra');
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
                  {(product.dataSource || product.lookupSource) && (
                    <Badge variant="secondary" className="text-xs">
                      <Database className="h-3 w-3 mr-1" />
                      {product.dataSource || product.lookupSource}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Enhanced Quick Stats */}
              {product.nutriments && (
                <div className="space-y-6 slide-up">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-4 text-center border border-border/20 hover:border-primary/30 transition-colors">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {(() => {
                          const nutrients = product.nutriments as Record<string, any>;
                          return nutrients?.energy_100g ? String(Math.round(nutrients.energy_100g / 4.184)) : "N/A";
                        })()}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">{String(t('nutrition.quick.energy'))}</div>
                    </div>
                    <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-4 text-center border border-border/20 hover:border-accent/30 transition-colors">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {(() => {
                          const nutrients = product.nutriments as any;
                          return nutrients?.sugars_100g ? `${nutrients.sugars_100g}g` : "N/A";
                        })()}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">{String(t('nutrition.quick.sugars'))}</div>
                    </div>
                    <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-4 text-center border border-border/20 hover:border-primary/30 transition-colors">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {(() => {
                          const nutrients = product.nutriments as any;
                          return nutrients?.fat_100g ? `${nutrients.fat_100g}g` : "N/A";
                        })()}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">{String(t('nutrition.quick.fat'))}</div>
                    </div>
                    <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-4 text-center border border-border/20 hover:border-accent/30 transition-colors">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {(() => {
                          const nutrients = product.nutriments as any;
                          return nutrients?.proteins_100g ? `${nutrients.proteins_100g}g` : "N/A";
                        })()}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">{String(t('nutrition.quick.protein'))}</div>
                    </div>
                  </div>

                  {/* Additional Nutritional Information */}
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                    {(() => {
                      const nutrients = product.nutriments as Record<string, any>;
                      const additionalNutrients = [
                        { key: 'carbohydrates_100g', label: 'Carbs', unit: 'g' },
                        { key: 'fiber_100g', label: 'Fiber', unit: 'g' },
                        { key: 'salt_100g', label: 'Salt', unit: 'g' },
                        { key: 'sodium_100g', label: 'Sodium', unit: 'mg' },
                        { key: 'saturated_fat_100g', label: 'Sat. Fat', unit: 'g' },
                        { key: 'trans_fat_100g', label: 'Trans Fat', unit: 'g' }
                      ];

                      return additionalNutrients.map((nutrient, index) => {
                        const value = nutrients?.[nutrient.key];
                        if (!value) return null;
                        
                        return (
                          <div key={index} className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-3 text-center border border-border/10">
                            <div className="text-lg font-semibold text-foreground">
                              {typeof value === 'number' ? value.toFixed(1) : String(value)}{nutrient.unit}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">{nutrient.label}</div>
                          </div>
                        );
                      }).filter(Boolean);
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Management Section */}
      <div className="slide-up">
        <Card className="glass-effect border-2 border-blue-200/50 dark:border-blue-800/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Product Management</h3>
                  <p className="text-sm text-muted-foreground">Customize settings and enhance product data</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleEditProduct}
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/20 px-4 py-2"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Add Missing Data
                </Button>
                <Button 
                  onClick={() => setShowAnalysisSettings(true)}
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/20 px-4 py-2"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add to Diary Section */}
      <div className="slide-up">
        <Card className="glass-effect border-2 border-green-200/50 dark:border-green-800/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Add to Nutrition Diary</h3>
                  <p className="text-sm text-muted-foreground">Track this product in your daily food intake</p>
                </div>
              </div>
              <Dialog open={showAddToDiary} onOpenChange={setShowAddToDiary}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg min-w-[140px]"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Diary
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Apple className="w-5 h-5 text-green-600" />
                      Add to Nutrition Diary
                    </DialogTitle>
                    <DialogDescription>
                      Add {product?.productName || "this product"} to your nutrition diary
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Product Summary */}
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      {product?.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product?.productName || "Product"} 
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Database className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold">{product?.productName || "Unknown Product"}</h4>
                        {product?.brands && <p className="text-sm text-muted-foreground">{String(product.brands)}</p>}
                      </div>
                    </div>

                    {/* Nutrition Summary */}
                    {product?.nutriments && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-sm">Nutrition Facts (per 100g)</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex justify-between">
                            <span>Calories:</span>
                            <span className="font-mono">{(product.nutriments as any)?.energy_100g ? `${Math.round((product.nutriments as any).energy_100g / 4.184)} kcal` : "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Protein:</span>
                            <span className="font-mono">{(product.nutriments as any)?.proteins_100g ? `${(product.nutriments as any).proteins_100g}g` : "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Carbs:</span>
                            <span className="font-mono">{(product.nutriments as any)?.carbohydrates_100g ? `${(product.nutriments as any).carbohydrates_100g}g` : "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fat:</span>
                            <span className="font-mono">{(product.nutriments as any)?.fat_100g ? `${(product.nutriments as any).fat_100g}g` : "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Portion Input */}
                    <div className="space-y-3">
                      <Label htmlFor="portion-amount" className="text-base font-semibold">
                        Portion Amount
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="portion-amount"
                          type="number"
                          value={portionAmount}
                          onChange={(e) => setPortionAmount(e.target.value)}
                          placeholder="100"
                          min="0"
                          step="0.1"
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-muted-foreground px-3 py-2 bg-muted rounded-md">
                          grams
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enter the weight or volume you consumed
                      </p>
                    </div>

                    {/* Date and Time Input */}
                    <div className="space-y-3">
                      <Label htmlFor="consumed-datetime" className="text-base font-semibold">
                        Date and Time Consumed
                      </Label>
                      <Input
                        id="consumed-datetime"
                        type="datetime-local"
                        value={consumedDateTime}
                        onChange={(e) => setConsumedDateTime(e.target.value)}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Select when you consumed this product
                      </p>
                    </div>

                    {/* Calculated Nutrition for Portion */}
                    {product?.nutriments && portionAmount && !isNaN(parseFloat(portionAmount)) && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-sm">Nutrition for {portionAmount}g portion:</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex justify-between">
                            <span>Calories:</span>
                            <span className="font-mono">
                              {(product.nutriments as any)?.energy_100g 
                                ? Math.round((Math.round((product.nutriments as any).energy_100g / 4.184) * parseFloat(portionAmount)) / 100)
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Protein:</span>
                            <span className="font-mono">
                              {(product.nutriments as any)?.proteins_100g 
                                ? `${(((product.nutriments as any).proteins_100g * parseFloat(portionAmount)) / 100).toFixed(1)}g`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Carbs:</span>
                            <span className="font-mono">
                              {(product.nutriments as any)?.carbohydrates_100g 
                                ? `${(((product.nutriments as any).carbohydrates_100g * parseFloat(portionAmount)) / 100).toFixed(1)}g`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fat:</span>
                            <span className="font-mono">
                              {(product.nutriments as any)?.fat_100g 
                                ? `${(((product.nutriments as any).fat_100g * parseFloat(portionAmount)) / 100).toFixed(1)}g`
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Add Button */}
                    <Button 
                      onClick={handleAddToDiary}
                      disabled={isAddingToDiary || !portionAmount || isNaN(parseFloat(portionAmount)) || !consumedDateTime}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                    >
                      {isAddingToDiary ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Diary
                        </>
                      )}
                    </Button>

                    {/* Report Button */}
                    <Button 
                      onClick={() => setShowReportModal(true)}
                      variant="outline"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Report Wrong Data
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Score Card */}
      {(product.processingScore !== null || product.processingExplanation) && (
        <Card className="glass-effect border-2 border-border/20 shadow-xl hover:shadow-2xl transition-all duration-300 slide-up">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-foreground">{t('processing.title')}</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">{t('processing.aiPowered')}</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-foreground">{t('processing.level')}</span>
                <div className="text-right">
                  <span className={`text-4xl font-bold ${getScoreColor(product.processingScore || 0)}`}>
                    {product.processingScore !== null ? product.processingScore : '?'}
                  </span>
                  <span className="text-2xl text-muted-foreground">/{t('processing.outof')}</span>
                </div>
              </div>
              
              {/* Enhanced Score Bar */}
              <div className="relative w-full bg-muted rounded-full h-4 mb-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 rounded-full"></div>
                <div 
                  className="absolute top-0 left-0 h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ 
                    width: `${Math.min(((product.processingScore || 0) / 10) * 100, 33)}%`,
                    opacity: (product.processingScore || 0) <= 3 ? 1 : 0 
                  }}
                />
                <div 
                  className="absolute top-0 left-0 h-4 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ 
                    width: `${((product.processingScore || 0) / 10) * 100}%`,
                    opacity: (product.processingScore || 0) > 3 && (product.processingScore || 0) <= 6 ? 1 : 0 
                  }}
                />
                <div 
                  className="absolute top-0 left-0 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ 
                    width: `${((product.processingScore || 0) / 10) * 100}%`,
                    opacity: (product.processingScore || 0) > 6 ? 1 : 0 
                  }}
                />
                {/* Score indicator */}
                <div 
                  className="absolute top-0 w-1 h-4 bg-white rounded-full shadow-md transition-all duration-1000 ease-out"
                  style={{ left: `${((product.processingScore || 0) / 10) * 100}%`, transform: 'translateX(-50%)' }}
                />
              </div>

              {/* Enhanced Score Explanation */}
              <div className={`border-2 rounded-2xl p-6 ${getScoreBorderColor(product.processingScore || 0)} relative overflow-hidden`}>
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    (product.processingScore || 0) <= 3 ? 'bg-emerald-500' : 
                    (product.processingScore || 0) <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    {(product.processingScore || 0) <= 3 ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-xl font-bold mb-2 ${
                      (product.processingScore || 0) <= 3 ? 'text-emerald-800' : 
                      (product.processingScore || 0) <= 6 ? 'text-yellow-800' : 'text-red-800'
                    }`}>
                      {getScoreLabel(product.processingScore || 0)}
                    </h4>
                    <p className={`text-base leading-relaxed ${
                      (product.processingScore || 0) <= 3 ? 'text-emerald-700' : 
                      (product.processingScore || 0) <= 6 ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {analysis?.explanation || product.processingExplanation || 'Processing analysis is being calculated. This food product is being evaluated for its level of processing.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Glycemic Index Card */}
      {visibilitySettings.showGlycemicImpact && (product.glycemicIndex !== null || product.glycemicLoad !== null || product.glycemicExplanation) && (
        <Card className="glass-effect border-2 border-border/20 shadow-xl hover:shadow-2xl transition-all duration-300 slide-up">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{String(t('glycemic.index.title'))}</h3>
            </div>
            
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 text-center border border-border/20">
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {product.glycemicIndex !== null && product.glycemicIndex !== undefined ? product.glycemicIndex : '?'}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{String(t('glycemic.index.gi'))}</div>
                  <div className={`text-xs font-semibold mt-2 px-2 py-1 rounded-full ${
                    product.glycemicIndex !== null && product.glycemicIndex !== undefined ? (
                      product.glycemicIndex <= 55 ? 'bg-emerald-100 text-emerald-800' : 
                      product.glycemicIndex <= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    ) : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.glycemicIndex !== null && product.glycemicIndex !== undefined ? (
                      product.glycemicIndex <= 55 ? String(t('glycemic.index.low')) : 
                      product.glycemicIndex <= 70 ? String(t('glycemic.index.medium')) : String(t('glycemic.index.high'))
                    ) : 'Analyzing...'}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 text-center border border-border/20">
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {product.glycemicLoad !== null && product.glycemicLoad !== undefined ? product.glycemicLoad : '?'}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{String(t('glycemic.index.gl'))}</div>
                  <div className={`text-xs font-semibold mt-2 px-2 py-1 rounded-full ${
                    product.glycemicLoad !== null && product.glycemicLoad !== undefined ? (
                      product.glycemicLoad <= 10 ? 'bg-emerald-100 text-emerald-800' : 
                      product.glycemicLoad <= 20 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    ) : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.glycemicLoad !== null && product.glycemicLoad !== undefined ? (
                      product.glycemicLoad <= 10 ? String(t('glycemic.index.low')) : 
                      product.glycemicLoad <= 20 ? String(t('glycemic.index.medium')) : String(t('glycemic.index.high'))
                    ) : 'Analyzing...'}
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 border border-border/20">
                <h4 className="text-lg font-semibold text-foreground mb-4">{String(t('glycemic.index.explanation'))}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.glycemicExplanation || 'Glycemic index analysis is being calculated. This shows how the food affects blood sugar levels.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Product Metadata Card */}
      <Card className="glass-effect border-2 border-border/20 shadow-xl hover:shadow-2xl transition-all duration-300 slide-up">
        <CardContent className="pt-8 pb-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Product Information</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Product Info */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 border border-border/20">
                <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Flag className="w-5 h-5 mr-2 text-primary" />
                  Product Details
                </h4>
                <div className="space-y-3">
                  {product.barcode && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Barcode:</span>
                      <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{product.barcode}</span>
                    </div>
                  )}
                  {product.brands && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Brand:</span>
                      <span className="text-sm font-semibold">{String(product.brands)}</span>
                    </div>
                  )}
                  {(product as any).categories && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-muted-foreground">Category:</span>
                      <span className="text-sm text-right max-w-xs">{String((product as any).categories)}</span>
                    </div>
                  )}
                  {(product as any).countries && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Country:</span>
                      <span className="text-sm">{String((product as any).countries)}</span>
                    </div>
                  )}
                  {(product as any).packaging && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-muted-foreground">Packaging:</span>
                      <span className="text-sm text-right max-w-xs">{String((product as any).packaging)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Nutritional Overview */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 border border-border/20">
                <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Apple className="w-5 h-5 mr-2 text-green-600" />
                  Nutritional Overview
                </h4>
                {product.nutriments && (
                  <div className="space-y-3">
                    {(() => {
                      const nutrients = product.nutriments as Record<string, any>;
                      const nutritionGrade = (product as any).nutritionGrade || (product as any).nutriscore_grade;
                      const servingSize = (product as any).serving_size || nutrients.serving_size;
                      
                      return (
                        <>
                          {nutritionGrade && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-muted-foreground">Nutri-Score:</span>
                              <Badge 
                                className={`${
                                  nutritionGrade.toLowerCase() === 'a' ? 'bg-green-500' :
                                  nutritionGrade.toLowerCase() === 'b' ? 'bg-lime-500' :
                                  nutritionGrade.toLowerCase() === 'c' ? 'bg-yellow-500' :
                                  nutritionGrade.toLowerCase() === 'd' ? 'bg-orange-500' :
                                  'bg-red-500'
                                } text-white`}
                              >
                                {nutritionGrade.toUpperCase()}
                              </Badge>
                            </div>
                          )}
                          {servingSize && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-muted-foreground">Serving Size:</span>
                              <span className="text-sm font-semibold">{String(servingSize)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Energy per 100g:</span>
                            <span className="text-sm font-semibold">
                              {nutrients.energy_100g ? `${Math.round(nutrients.energy_100g / 4.184)} kcal` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Total Fat:</span>
                            <span className="text-sm">{nutrients.fat_100g ? `${nutrients.fat_100g}g` : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Total Carbs:</span>
                            <span className="text-sm">{nutrients.carbohydrates_100g ? `${nutrients.carbohydrates_100g}g` : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Protein:</span>
                            <span className="text-sm">{nutrients.proteins_100g ? `${nutrients.proteins_100g}g` : 'N/A'}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Allergens and Labels */}
          {((product as any).allergens || (product as any).labels) && (
            <div className="mt-6 space-y-4">
              {(product as any).allergens && (
                <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-2xl p-4">
                  <h4 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Allergens
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {String((product as any).allergens).split(',').map((allergen, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {allergen.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {(product as any).labels && (
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-2xl p-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Labels & Certifications
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {String((product as any).labels).split(',').map((label, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                        {label.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comprehensive Nutrition Facts Card */}
      {product.nutriments && (
        <Card className="glass-effect border-2 border-border/20 shadow-xl hover:shadow-2xl transition-all duration-300 slide-up">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Complete Nutrition Facts</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {(() => {
                const nutrients = product.nutriments as Record<string, any>;
                
                const macronutrients = [
                  { key: 'energy_100g', label: 'Energy', unit: 'kcal', icon: '⚡' },
                  { key: 'fat_100g', label: 'Total Fat', unit: 'g', icon: '🧈' },
                  { key: 'saturated_fat_100g', label: 'Saturated Fat', unit: 'g', icon: '🔸', indent: true },
                  { key: 'trans_fat_100g', label: 'Trans Fat', unit: 'g', icon: '🔸', indent: true },
                  { key: 'carbohydrates_100g', label: 'Total Carbohydrates', unit: 'g', icon: '🌾' },
                  { key: 'fiber_100g', label: 'Dietary Fiber', unit: 'g', icon: '🔸', indent: true },
                  { key: 'sugars_100g', label: 'Total Sugars', unit: 'g', icon: '🔸', indent: true },
                  { key: 'proteins_100g', label: 'Protein', unit: 'g', icon: '💪' },
                  { key: 'salt_100g', label: 'Salt', unit: 'g', icon: '🧂' },
                  { key: 'sodium_100g', label: 'Sodium', unit: 'mg', icon: '🧂' }
                ];

                const vitamins = [
                  { key: 'vitamin_a_100g', label: 'Vitamin A', unit: 'μg', icon: '🥕' },
                  { key: 'vitamin_c_100g', label: 'Vitamin C', unit: 'mg', icon: '🍊' },
                  { key: 'vitamin_d_100g', label: 'Vitamin D', unit: 'μg', icon: '☀️' },
                  { key: 'vitamin_e_100g', label: 'Vitamin E', unit: 'mg', icon: '🥜' },
                  { key: 'vitamin_k_100g', label: 'Vitamin K', unit: 'μg', icon: '🥬' },
                  { key: 'vitamin_b1_100g', label: 'Thiamin (B1)', unit: 'mg', icon: '🅱️' },
                  { key: 'vitamin_b2_100g', label: 'Riboflavin (B2)', unit: 'mg', icon: '🅱️' },
                  { key: 'vitamin_b6_100g', label: 'Vitamin B6', unit: 'mg', icon: '🅱️' },
                  { key: 'vitamin_b12_100g', label: 'Vitamin B12', unit: 'μg', icon: '🅱️' },
                  { key: 'folate_100g', label: 'Folate', unit: 'μg', icon: '🥬' }
                ];

                const minerals = [
                  { key: 'calcium_100g', label: 'Calcium', unit: 'mg', icon: '🦴' },
                  { key: 'iron_100g', label: 'Iron', unit: 'mg', icon: '🩸' },
                  { key: 'magnesium_100g', label: 'Magnesium', unit: 'mg', icon: '⚡' },
                  { key: 'phosphorus_100g', label: 'Phosphorus', unit: 'mg', icon: '🦴' },
                  { key: 'potassium_100g', label: 'Potassium', unit: 'mg', icon: '🍌' },
                  { key: 'zinc_100g', label: 'Zinc', unit: 'mg', icon: '🔧' },
                  { key: 'copper_100g', label: 'Copper', unit: 'mg', icon: '🔩' },
                  { key: 'manganese_100g', label: 'Manganese', unit: 'mg', icon: '⚙️' },
                  { key: 'selenium_100g', label: 'Selenium', unit: 'μg', icon: '🔬' },
                  { key: 'iodine_100g', label: 'Iodine', unit: 'μg', icon: '🧂' }
                ];

                const renderNutrientSection = (nutrients_list: any[], title: string) => {
                  const availableNutrients = nutrients_list.filter(nutrient => nutrients[nutrient.key]);
                  if (availableNutrients.length === 0) return null;

                  return (
                    <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 border border-border/20">
                      <h4 className="text-lg font-semibold text-foreground mb-4">{title}</h4>
                      <div className="space-y-3">
                        {availableNutrients.map((nutrient, index) => {
                          const rawValue = nutrients[nutrient.key];
                          // Convert energy from kJ to kcal for OpenFoodFacts data
                          const value = nutrient.key === 'energy_100g' && typeof rawValue === 'number' 
                            ? Math.round(rawValue / 4.184) 
                            : rawValue;
                          return (
                            <div key={index} className={`flex justify-between items-center ${nutrient.indent ? 'ml-4' : ''}`}>
                              <span className="text-sm text-muted-foreground flex items-center">
                                <span className="mr-2">{nutrient.icon}</span>
                                {nutrient.label}
                              </span>
                              <span className="text-sm font-semibold">
                                {typeof value === 'number' ? value.toFixed(2) : String(value)}{nutrient.unit}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                };

                return (
                  <>
                    {renderNutrientSection(macronutrients, 'Macronutrients')}
                    {renderNutrientSection(vitamins, 'Vitamins')}
                    {renderNutrientSection(minerals, 'Minerals')}
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* NutriBot Insights Card */}
      {visibilitySettings.showNutriBotInsight && nutriBotInsight && typeof nutriBotInsight === 'object' && 'insight' in nutriBotInsight && (
        <Card className="glass-card border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-300 slide-up glow-effect">
          <CardHeader className="bg-gradient-to-r from-primary to-accent text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center floating-animation">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{t('nutribot.insights.title')}</h3>
                <p className="text-sm text-white/80">{t('nutribot.insights.subtitle')}</p>
              </div>
              <Sparkles className="w-5 h-5 text-white/80 ml-auto" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 border border-border/20">
              <p className="text-foreground leading-relaxed text-lg">
                {(nutriBotInsight as { insight: string }).insight}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {visibilitySettings.showNutriBotInsight && isLoadingInsight && (
        <Card className="glass-card border-2 border-primary/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary to-accent text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{t('nutribot.insights.title')}</h3>
                <p className="text-sm text-white/80">{t('nutribot.insights.analyzing')}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 border border-border/20">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">{t('nutribot.insights.loading')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Production Process Card */}
      {visibilitySettings.showProductionProcess && productionProcess?.process && (
        <Card className="glass-card border-2 border-purple-200/50 dark:border-purple-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 slide-up">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center floating-animation">
                <Factory className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Manufacturing Process</h3>
                <p className="text-sm text-white/80">Production analysis from farm to table</p>
              </div>
              <Info className="w-5 h-5 text-white/80 ml-auto" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            <div className="bg-gradient-to-br from-purple-50/50 to-indigo-50/30 dark:from-purple-900/20 dark:to-indigo-900/10 rounded-2xl p-6 border border-purple-200/30 dark:border-purple-700/30">
              <div className="flex items-start space-x-4">
                <Factory className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h5 className="font-semibold mb-4 text-purple-800 dark:text-purple-200 text-lg">How This Product Is Made</h5>
                  <div className="prose prose-sm max-w-none">
                    <div className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed space-y-4">
                      {productionProcess?.process?.split('\n\n').map((paragraph, index) => {
                        // Handle markdown headers
                        if (paragraph.startsWith('###')) {
                          return (
                            <h4 key={index} className="font-semibold text-base text-purple-800 dark:text-purple-200 mt-6 mb-3 border-b border-purple-200/50 pb-2">
                              {paragraph.replace('###', '').trim()}
                            </h4>
                          );
                        }
                        // Handle markdown subheaders
                        if (paragraph.startsWith('##')) {
                          return (
                            <h3 key={index} className="font-bold text-lg text-purple-800 dark:text-purple-200 mt-8 mb-4">
                              {paragraph.replace('##', '').trim()}
                            </h3>
                          );
                        }
                        // Handle markdown main headers
                        if (paragraph.startsWith('#')) {
                          return (
                            <h2 key={index} className="font-bold text-xl text-purple-800 dark:text-purple-200 mt-6 mb-4">
                              {paragraph.replace('#', '').trim()}
                            </h2>
                          );
                        }
                        // Handle bullet points
                        if (paragraph.includes('- **') || paragraph.includes('• ')) {
                          const lines = paragraph.split('\n');
                          return (
                            <div key={index} className="space-y-2">
                              {lines.map((line, lineIndex) => {
                                if (line.trim().startsWith('- **') || line.trim().startsWith('• ')) {
                                  const content = line.replace(/^[•-]\s*\*\*(.*?)\*\*:?\s*/, '');
                                  const title = line.match(/\*\*(.*?)\*\*/)?.[1] || '';
                                  return (
                                    <div key={lineIndex} className="flex items-start space-x-2 ml-4">
                                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                      <div>
                                        <span className="font-medium text-purple-800 dark:text-purple-200">{title}:</span>
                                        <span className="ml-2">{content}</span>
                                      </div>
                                    </div>
                                  );
                                } else if (line.trim()) {
                                  return (
                                    <p key={lineIndex} className="ml-6 text-sm">
                                      {line.trim()}
                                    </p>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          );
                        }
                        // Handle numbered lists
                        if (paragraph.match(/^\d+\./)) {
                          const lines = paragraph.split('\n');
                          return (
                            <div key={index} className="space-y-3">
                              {lines.map((line, lineIndex) => {
                                const numberMatch = line.match(/^(\d+)\.\s*\*\*(.*?)\*\*:?\s*(.*)/);
                                if (numberMatch) {
                                  const [, number, title, content] = numberMatch;
                                  return (
                                    <div key={lineIndex} className="flex items-start space-x-3">
                                      <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                                        {number}
                                      </div>
                                      <div>
                                        <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-1">{title}</h5>
                                        <p className="text-sm">{content}</p>
                                      </div>
                                    </div>
                                  );
                                } else if (line.trim() && !line.match(/^\d+\./)) {
                                  return (
                                    <p key={lineIndex} className="ml-9 text-sm">
                                      {line.trim()}
                                    </p>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          );
                        }
                        // Regular paragraphs
                        return paragraph.trim() ? (
                          <p key={index} className="text-sm leading-relaxed">
                            {paragraph.trim()}
                          </p>
                        ) : null;
                      }).filter(Boolean)}
                    </div>
                  </div>
                  
                  {/* Info footer */}
                  <div className="mt-6 pt-4 border-t border-purple-200/50">
                    <div className="flex items-center gap-2 text-xs text-purple-600/80 dark:text-purple-400/80">
                      <Info className="w-3 h-3" />
                      <span>AI-generated manufacturing analysis based on ingredients and product data</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {visibilitySettings.showProductionProcess && isLoadingProductionProcess && (
        <Card className="glass-card border-2 border-purple-200/50 dark:border-purple-800/50 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Product Production Process</h3>
                <p className="text-sm text-white/80">Analyzing manufacturing process...</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            <div className="bg-gradient-to-br from-purple-50/50 to-indigo-50/30 dark:from-purple-900/20 dark:to-indigo-900/10 rounded-2xl p-6 border border-purple-200/30 dark:border-purple-700/30">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-purple-600 dark:text-purple-400">Loading production process analysis...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nutrition Spotlight */}
      {visibilitySettings.showNutritionSpotlight && product.nutriments && typeof product.nutriments === 'object' && (
        <div className="slide-up">
          <NutritionSpotlight 
            productName={product.productName || "Unknown Product"}
            nutriments={product.nutriments as Record<string, any> | null}
            processingScore={product.processingScore || 0}
            barcode={barcode}
          />
        </div>
      )}

      {/* Carbon Footprint Meter */}
      {visibilitySettings.showCarbonFootprint && (
        <div className="slide-up">
          <CarbonFootprintMeter 
            productName={product.productName || "Unknown Product"}
            ingredients={product.ingredientsText || ""}
            nutriments={product.nutriments as Record<string, any> | null}
            barcode={barcode}
            existingFootprint={product.carbonFootprint}
            existingExplanation={product.carbonFootprintExplanation}
          />
        </div>
      )}

      {/* Fun Facts */}
      {visibilitySettings.showFunFacts && (
        <div className="slide-up">
          <FunFacts 
            productName={product.productName || "Unknown Product"}
            ingredients={product.ingredientsText || ""}
            nutriments={product.nutriments as Record<string, any> | null}
            processingScore={product.processingScore || 0}
            barcode={barcode}
          />
        </div>
      )}

      {/* Social Sharing */}
      <div className="slide-up">
        <SocialShare 
          productName={product.productName || "Unknown Product"}
          processingScore={product.processingScore || 0}
          processingExplanation={product.processingExplanation || ""}
          barcode={barcode}
          nutriments={product.nutriments as Record<string, any> | null}
          dataSource={product.dataSource || product.lookupSource || "Database"}
        />
      </div>


      {/* Product Metadata & Additional Information - Admin Only */}
      {visibilitySettings.showProductMetadata && user?.accountType === "Admin" && (
        <div className="slide-up">
          <Card className="glass-effect border-2 border-gray-200/50 dark:border-gray-800/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-neutral-600 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Product Metadata & Additional Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 border border-border/20">
                  <h4 className="font-semibold text-lg text-foreground mb-4">Product Identifiers</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Product ID:</span>
                      <span className="font-mono bg-muted px-2 py-1 rounded">{product?.id || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Barcode:</span>
                      <span className="font-mono bg-muted px-2 py-1 rounded">{product?.barcode || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Data Source:</span>
                      <span className="bg-muted px-2 py-1 rounded">{product?.dataSource || product?.lookupSource || "N/A"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 border border-border/20">
                  <h4 className="font-semibold text-lg text-foreground mb-4">Timestamps & Updates</h4>
                  <div className="space-y-3 text-sm">
                    {product?.lastUpdated && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span className="font-mono bg-muted px-2 py-1 rounded">{product.lastUpdated}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Analysis Date:</span>
                      <span className="font-mono bg-muted px-2 py-1 rounded">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw Data Section */}
              <div className="mt-8 space-y-4">
                {/* Raw Product Data for Debugging */}
                <details className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 border border-border/20">
                  <summary className="cursor-pointer font-semibold text-base mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Raw Product Data (for debugging)
                  </summary>
                  <div className="mt-4 p-4 bg-muted/50 rounded-xl border text-xs font-mono overflow-auto max-h-32">
                    <pre>{JSON.stringify(product, null, 2)}</pre>
                  </div>
                </details>

                {/* Analysis Data */}
                {analysis && (
                  <details className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 border border-border/20">
                    <summary className="cursor-pointer font-semibold text-base mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Raw Analysis Data (for debugging)
                    </summary>
                    <div className="mt-4 p-4 bg-muted/50 rounded-xl border text-xs font-mono overflow-auto max-h-32">
                      <pre>{JSON.stringify(analysis, null, 2)}</pre>
                    </div>
                  </details>
                )}

                {/* NutriBot Insight Data */}
                {nutriBotInsight && (
                  <details className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 border border-border/20">
                    <summary className="cursor-pointer font-semibold text-base mb-3 flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      Raw NutriBot Data (for debugging)
                    </summary>
                    <div className="mt-4 p-4 bg-muted/50 rounded-xl border text-xs font-mono overflow-auto max-h-32">
                      <pre>{JSON.stringify(nutriBotInsight, null, 2)}</pre>
                    </div>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ingredients Card */}
      {product.ingredientsText && (
        <Card className="glass-effect border-2 border-border/20 shadow-xl hover:shadow-2xl transition-all duration-300 slide-up">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{t('ingredients.title')}</h3>
            </div>
            
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 border border-border/20">
                <h4 className="text-lg font-semibold text-foreground mb-4">{t('ingredients.fullList')}</h4>
                <div className="bg-card/50 rounded-xl p-4 border border-border/20">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {String(product.ingredientsText)}
                  </p>
                </div>
              </div>

              {/* Processing Indicators */}
              {visibilitySettings.showProcessingAnalysis && (
                <>
                  {isLoadingAnalysis ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse"></div>
                      ))}
                    </div>
                  ) : analysis ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
                          <span className="text-base font-semibold text-red-800">{t('ingredients.ultraProcessed')}</span>
                        </div>
                        <ul className="text-sm text-red-700 space-y-2">
                          {analysis.categories.ultraProcessed.length > 0 ? (
                            analysis.categories.ultraProcessed.map((ingredient, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>{ingredient}</span>
                              </li>
                            ))
                          ) : (
                            <li className="flex items-center space-x-2 text-red-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>{t('ingredients.noneDetected')}</span>
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-sm"></div>
                          <span className="text-base font-semibold text-yellow-800">{t('ingredients.processed')}</span>
                        </div>
                        <ul className="text-sm text-yellow-700 space-y-2">
                          {analysis.categories.processed.length > 0 ? (
                            analysis.categories.processed.map((ingredient, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-yellow-500 mt-1">•</span>
                                <span>{ingredient}</span>
                              </li>
                            ))
                          ) : (
                            <li className="flex items-center space-x-2 text-yellow-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>{t('ingredients.noneDetected')}</span>
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-sm"></div>
                          <span className="text-base font-semibold text-emerald-800">{t('ingredients.minimallyProcessed')}</span>
                        </div>
                        <ul className="text-sm text-emerald-700 space-y-2">
                          {analysis.categories.minimallyProcessed.length > 0 ? (
                            analysis.categories.minimallyProcessed.map((ingredient, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-emerald-500 mt-1">•</span>
                                <span>{ingredient}</span>
                              </li>
                            ))
                          ) : (
                            <li className="flex items-center space-x-2 text-emerald-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span>{t('ingredients.noneDetected')}</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nutrition Facts Card */}
      {visibilitySettings.showNutritionFacts && product.nutriments && (
        <Card className="glass-effect border-2 border-border/20 shadow-xl hover:shadow-2xl transition-all duration-300 slide-up">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{t('nutrition.facts.title')}</h3>
            </div>
            
            <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 border border-border/20">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-border/30">
                      <th className="text-left py-4 text-lg font-semibold text-foreground">{t('nutrition.facts.nutrient')}</th>
                      <th className="text-right py-4 text-lg font-semibold text-foreground">{t('nutrition.facts.per100g')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 text-foreground font-medium">{t('nutrition.facts.energy')}</td>
                      <td className="py-4 text-right text-muted-foreground font-mono">
                        {(product.nutriments as any).energy_100g ? `${Math.round((product.nutriments as any).energy_100g / 4.184)} kcal` : "N/A"}
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 text-foreground font-medium">{t('nutrition.facts.fat')}</td>
                      <td className="py-4 text-right text-muted-foreground font-mono">
                        {(product.nutriments as any).fat_100g ? `${(product.nutriments as any).fat_100g}g` : "N/A"}
                      </td>
                    </tr>
                    {(product.nutriments as any).saturated_fat_100g && (
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 text-muted-foreground font-medium pl-6">{t('nutrition.facts.saturatedFat')}</td>
                        <td className="py-4 text-right text-muted-foreground font-mono">{(product.nutriments as any).saturated_fat_100g}g</td>
                      </tr>
                    )}
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 text-foreground font-medium">{t('nutrition.facts.carbohydrates')}</td>
                      <td className="py-4 text-right text-muted-foreground font-mono">
                        {(product.nutriments as any).carbohydrates_100g ? `${(product.nutriments as any).carbohydrates_100g}g` : "N/A"}
                      </td>
                    </tr>
                    {(product.nutriments as any).sugars_100g && (
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 text-muted-foreground font-medium pl-6">{t('nutrition.facts.sugars')}</td>
                        <td className="py-4 text-right text-muted-foreground font-mono">{(product.nutriments as any).sugars_100g}g</td>
                      </tr>
                    )}
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 text-foreground font-medium">{t('nutrition.facts.protein')}</td>
                      <td className="py-4 text-right text-muted-foreground font-mono">
                        {(product.nutriments as any).proteins_100g ? `${(product.nutriments as any).proteins_100g}g` : "N/A"}
                      </td>
                    </tr>
                    {(product.nutriments as any).salt_100g && (
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 text-foreground font-medium">{t('nutrition.facts.salt')}</td>
                        <td className="py-4 text-right text-muted-foreground font-mono">{(product.nutriments as any).salt_100g}g</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nutrition Fact Popup */}
      <NutritionFactPopup
        productName={product?.productName || ''}
        nutriments={product?.nutriments as Record<string, any> || null}
        processingScore={analysis?.score || 0}
        isVisible={showNutritionPopup}
        onClose={() => setShowNutritionPopup(false)}
        onComplete={() => setShowNutritionPopup(false)}
      />



      {/* Analysis Settings Modal */}
      <Dialog open={showAnalysisSettings} onOpenChange={setShowAnalysisSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Product Analysis Settings
            </DialogTitle>
            <DialogDescription>
              Customize which analysis sections you want to see when viewing product details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="processing-analysis"
                  checked={analysisSettings.processingAnalysis}
                  onCheckedChange={(checked) => 
                    updateAnalysisSettings({ ...analysisSettings, processingAnalysis: !!checked })
                  }
                />
                <Label htmlFor="processing-analysis" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Processing Analysis & Ingredient Categories
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="nutrition-facts"
                  checked={analysisSettings.nutritionFacts}
                  onCheckedChange={(checked) => 
                    updateAnalysisSettings({ ...analysisSettings, nutritionFacts: !!checked })
                  }
                />
                <Label htmlFor="nutrition-facts" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Nutrition Facts
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="glycemic-impact"
                  checked={analysisSettings.glycemicImpact}
                  onCheckedChange={(checked) => 
                    updateAnalysisSettings({ ...analysisSettings, glycemicImpact: !!checked })
                  }
                />
                <Label htmlFor="glycemic-impact" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Glycemic Impact
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ingredients-list"
                  checked={analysisSettings.ingredientsList}
                  onCheckedChange={(checked) => 
                    updateAnalysisSettings({ ...analysisSettings, ingredientsList: !!checked })
                  }
                />
                <Label htmlFor="ingredients-list" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Ingredients List
                </Label>
              </div>

              {/* Product Metadata checkbox - Admin Only */}
              {user?.accountType === "Admin" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="product-metadata"
                    checked={analysisSettings.productMetadata}
                    onCheckedChange={(checked) => 
                      updateAnalysisSettings({ ...analysisSettings, productMetadata: !!checked })
                    }
                  />
                  <Label htmlFor="product-metadata" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Product Metadata & Additional Information
                  </Label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="nutrition-spotlight"
                  checked={analysisSettings.nutritionSpotlight}
                  onCheckedChange={(checked) => 
                    updateAnalysisSettings({ ...analysisSettings, nutritionSpotlight: !!checked })
                  }
                />
                <Label htmlFor="nutrition-spotlight" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Nutrition Spotlight & Analysis
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fun-facts"
                  checked={analysisSettings.funFacts}
                  onCheckedChange={(checked) => 
                    updateAnalysisSettings({ ...analysisSettings, funFacts: !!checked })
                  }
                />
                <Label htmlFor="fun-facts" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Fun Facts & Insights
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="nutribot-insight"
                  checked={analysisSettings.nutriBotInsight}
                  onCheckedChange={(checked) => 
                    updateAnalysisSettings({ ...analysisSettings, nutriBotInsight: !!checked })
                  }
                />
                <Label htmlFor="nutribot-insight" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  NutriBot AI Insight
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="production-process"
                  checked={analysisSettings.productionProcess}
                  onCheckedChange={(checked) => 
                    updateAnalysisSettings({ ...analysisSettings, productionProcess: !!checked })
                  }
                />
                <Label htmlFor="production-process" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Product Production Process
                </Label>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowAnalysisSettings(false)}
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  // Reset to all enabled
                  updateAnalysisSettings({
                    processingAnalysis: true,
                    nutritionFacts: true,
                    glycemicImpact: true,
                    ingredientsList: true,
                    productMetadata: true,
                    nutritionSpotlight: true,
                    funFacts: true,
                    nutriBotInsight: true
                  });
                }}
                variant="outline"
              >
                Enable All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
