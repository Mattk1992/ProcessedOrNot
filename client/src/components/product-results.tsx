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
import { Lightbulb, AlertTriangle, CheckCircle, Plus, Database, Bot, Sparkles, X, Info, BarChart3, Zap, TrendingUp, Activity, Calendar, Apple, Flag, Edit, Settings } from "lucide-react";
import { api } from "@/lib/api";
import ManualProductForm from "./manual-product-form";
import NutritionSpotlight from "./nutrition-spotlight";
import FunFacts from "./fun-facts";
import SocialShare from "./social-share";
import NutritionFactPopup from "./nutrition-fact-popup";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import type { Product, ProcessingAnalysis } from "@shared/schema";

interface ProductResultsProps {
  barcode: string;
  filters?: { includeBrands?: string[], excludeBrands?: string[] };
  onProductFound?: (product: Product) => void;
}

export default function ProductResults({ barcode, filters, onProductFound }: ProductResultsProps) {
  const [showManualForm, setShowManualForm] = useState(false);
  const [showNutritionPopup, setShowNutritionPopup] = useState(false);
  const [showProductAnalysis, setShowProductAnalysis] = useState(false);
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
      nutriBotInsight: true
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

  // Trigger both popups when product is found
  useEffect(() => {
    if (product && !isLoadingProduct && !productError) {
      setShowNutritionPopup(true);
      setShowProductAnalysis(true);
      onProductFound?.(product);
    }
  }, [product, isLoadingProduct, productError, onProductFound]);

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

              {/* Quick Stats */}
              {product.nutriments && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 slide-up">
                  <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-4 text-center border border-border/20 hover:border-primary/30 transition-colors">
                    <div className="text-2xl font-bold text-foreground mb-1">
{(() => {
                        const nutrients = product.nutriments as Record<string, any>;
                        return nutrients?.energy_100g ? String(nutrients.energy_100g) : "N/A";
                      })()}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">{t('nutrition.quick.energy')}</div>
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
                  <span className={`text-4xl font-bold ${getScoreColor(product.processingScore)}`}>
                    {product.processingScore}
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
                      {analysis?.explanation || product.processingExplanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Glycemic Index Card - Always show */}
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

      {/* NutriBot Insights Card */}
      {nutriBotInsight && typeof nutriBotInsight === 'string' && (
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
                {nutriBotInsight}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoadingInsight && (
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

      {/* Nutrition Spotlight */}
      {product.nutriments && typeof product.nutriments === 'object' && (
        <div className="slide-up">
          <NutritionSpotlight 
            productName={product.productName || "Unknown Product"}
            nutriments={product.nutriments as Record<string, any> | null}
            processingScore={product.processingScore || 0}
            barcode={barcode}
          />
        </div>
      )}

      {/* Fun Facts */}
      <div className="slide-up">
        <FunFacts 
          productName={product.productName || "Unknown Product"}
          ingredients={product.ingredientsText || ""}
          nutriments={product.nutriments as Record<string, any> | null}
          processingScore={product.processingScore || 0}
          barcode={barcode}
        />
      </div>

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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nutrition Facts Card */}
      {product.nutriments && (
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
                        {(product.nutriments as any).energy_100g ? `${(product.nutriments as any).energy_100g} kcal` : "N/A"}
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

      {/* Product Analysis & Information Hovering Screen */}
      <Dialog open={showProductAnalysis} onOpenChange={setShowProductAnalysis}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5 text-white" />
                </div>
                Product Analysis & Information
              </DialogTitle>
              
              {/* Add to Diary Button */}
              <Dialog open={showAddToDiary} onOpenChange={setShowAddToDiary}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"
                  >
                    <Calendar className="w-4 h-4" />
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
                            <span className="font-mono">{(product.nutriments as any)?.energy_100g || "N/A"}</span>
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
                                ? Math.round(((product.nutriments as any).energy_100g * parseFloat(portionAmount)) / 100)
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
            <DialogDescription>
              Comprehensive analysis and detailed information for {product?.productName || "this product"}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Product Overview Section */}
              <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Product Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4">
                      {product?.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.productName || "Product"} 
                          className="w-16 h-20 object-cover rounded-lg border-2 border-border/20"
                        />
                      ) : (
                        <div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center">
                          <Database className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{product?.productName || "Unknown Product"}</h3>
                        {product?.brands && <p className="text-muted-foreground">{String(product.brands)}</p>}
                        <Badge variant="outline" className="mt-1 font-mono text-xs">
                          {product?.barcode}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Data Source:</span>
                        <Badge variant="secondary" className="text-xs">
                          <Database className="h-3 w-3 mr-1" />
                          {product?.dataSource || product?.lookupSource || "Database"}
                        </Badge>
                      </div>
                      {product?.processingScore !== null && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Processing Score:</span>
                          <span className={`font-bold ${getScoreColor(product.processingScore)}`}>
                            {product.processingScore}/10
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Processing Analysis Section */}
              {(product?.processingScore !== null || analysis) && analysisSettings.processingAnalysis && (
                <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="w-5 h-5 text-orange-600" />
                      Processing Analysis & Ingredient Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {product?.processingScore !== null && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Processing Level</p>
                          <p className={`text-xl font-bold ${getScoreColor(product.processingScore)}`}>
                            {getScoreLabel(product.processingScore)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Score</p>
                          <p className={`text-3xl font-bold ${getScoreColor(product.processingScore)}`}>
                            {product.processingScore}<span className="text-muted-foreground">/10</span>
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {product.processingExplanation && (
                      <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-border/20">
                        <h4 className="font-semibold mb-2 text-sm">Processing Explanation</h4>
                        <p className="text-sm leading-relaxed">{product.processingExplanation}</p>
                      </div>
                    )}

                    {/* Analysis Score and Data */}
                    {analysis && (
                      <div className="space-y-4">
                        <Separator />
                        <h4 className="font-semibold text-sm">AI Analysis Results</h4>
                        
                        {analysis.score && (
                          <div className="flex items-center justify-between bg-white/50 dark:bg-black/20 rounded-lg p-3">
                            <span className="text-sm font-medium">AI Analysis Score:</span>
                            <span className={`text-lg font-bold ${getScoreColor(analysis.score)}`}>
                              {analysis.score}/10
                            </span>
                          </div>
                        )}

                        {analysis.explanation && (
                          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-border/20">
                            <h5 className="font-semibold mb-2 text-sm">AI Explanation</h5>
                            <p className="text-sm leading-relaxed">{analysis.explanation}</p>
                          </div>
                        )}

                        {/* Ingredient Categories */}
                        {analysis.categories && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Ultra-processed ingredients */}
                            <div className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-4">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
                                <span className="text-sm font-semibold text-red-800">Ultra-Processed</span>
                              </div>
                              <div className="space-y-1 text-xs text-red-700">
                                {analysis.categories.ultraProcessed && analysis.categories.ultraProcessed.length > 0 ? (
                                  analysis.categories.ultraProcessed.map((ingredient: string, index: number) => (
                                    <div key={index} className="flex items-start space-x-2">
                                      <span className="text-red-500 mt-0.5">•</span>
                                      <span>{ingredient}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex items-center space-x-2 text-red-600">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>None detected</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Processed ingredients */}
                            <div className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-2xl p-4">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-sm"></div>
                                <span className="text-sm font-semibold text-yellow-800">Processed</span>
                              </div>
                              <div className="space-y-1 text-xs text-yellow-700">
                                {analysis.categories.processed && analysis.categories.processed.length > 0 ? (
                                  analysis.categories.processed.map((ingredient: string, index: number) => (
                                    <div key={index} className="flex items-start space-x-2">
                                      <span className="text-yellow-500 mt-0.5">•</span>
                                      <span>{ingredient}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex items-center space-x-2 text-yellow-600">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>None detected</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Minimally processed ingredients */}
                            <div className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-4">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-sm"></div>
                                <span className="text-sm font-semibold text-emerald-800">Minimally Processed</span>
                              </div>
                              <div className="space-y-1 text-xs text-emerald-700">
                                {analysis.categories.minimallyProcessed && analysis.categories.minimallyProcessed.length > 0 ? (
                                  analysis.categories.minimallyProcessed.map((ingredient: string, index: number) => (
                                    <div key={index} className="flex items-start space-x-2">
                                      <span className="text-emerald-500 mt-0.5">•</span>
                                      <span>{ingredient}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex items-center space-x-2 text-emerald-600">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>None detected</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Nutrition Information Section */}
              {product?.nutriments && analysisSettings.nutritionFacts && (
                <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Nutrition Facts (per 100g)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {(() => {
                            const nutrients = product.nutriments as Record<string, any>;
                            return nutrients?.energy_100g ? String(nutrients.energy_100g) : "N/A";
                          })()}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">Calories</p>
                      </div>
                      <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {(() => {
                            const nutrients = product.nutriments as any;
                            return nutrients?.proteins_100g ? `${nutrients.proteins_100g}g` : "N/A";
                          })()}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">Protein</p>
                      </div>
                      <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">
                          {(() => {
                            const nutrients = product.nutriments as any;
                            return nutrients?.carbohydrates_100g ? `${nutrients.carbohydrates_100g}g` : "N/A";
                          })()}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">Carbs</p>
                      </div>
                      <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                          {(() => {
                            const nutrients = product.nutriments as any;
                            return nutrients?.fat_100g ? `${nutrients.fat_100g}g` : "N/A";
                          })()}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">Fat</p>
                      </div>
                    </div>
                    
                    {/* Detailed Nutrition Table */}
                    <Separator className="my-4" />
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
                      <h4 className="font-semibold mb-3 text-sm">Complete Nutrition Profile</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Primary Nutrients */}
                        <div className="space-y-2 text-sm">
                          <h5 className="font-medium text-green-700 dark:text-green-400 mb-2">Primary Nutrients</h5>
                          {(product.nutriments as any).sugars_100g && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sugars</span>
                              <span className="font-mono">{(product.nutriments as any).sugars_100g}g</span>
                            </div>
                          )}
                          {(product.nutriments as any).saturated_fat_100g && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Saturated Fat</span>
                              <span className="font-mono">{(product.nutriments as any).saturated_fat_100g}g</span>
                            </div>
                          )}
                          {(product.nutriments as any).fiber_100g && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Fiber</span>
                              <span className="font-mono">{(product.nutriments as any).fiber_100g}g</span>
                            </div>
                          )}
                          {(product.nutriments as any).salt_100g && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Salt</span>
                              <span className="font-mono">{(product.nutriments as any).salt_100g}g</span>
                            </div>
                          )}
                          {(product.nutriments as any).sodium_100g && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sodium</span>
                              <span className="font-mono">{(product.nutriments as any).sodium_100g}mg</span>
                            </div>
                          )}
                        </div>

                        {/* Additional Nutrients */}
                        <div className="space-y-2 text-sm">
                          <h5 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Additional Nutrients</h5>
                          {(product.nutriments as any).trans_fat_100g && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Trans Fat</span>
                              <span className="font-mono">{(product.nutriments as any).trans_fat_100g}g</span>
                            </div>
                          )}
                          {(product.nutriments as any).cholesterol_100g && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Cholesterol</span>
                              <span className="font-mono">{(product.nutriments as any).cholesterol_100g}mg</span>
                            </div>
                          )}
                          {(product.nutriments as any).calcium_100g && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Calcium</span>
                              <span className="font-mono">{(product.nutriments as any).calcium_100g}mg</span>
                            </div>
                          )}
                          {(product.nutriments as any).iron_100g && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Iron</span>
                              <span className="font-mono">{(product.nutriments as any).iron_100g}mg</span>
                            </div>
                          )}
                          {(product.nutriments as any).vitamin_c_100g && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Vitamin C</span>
                              <span className="font-mono">{(product.nutriments as any).vitamin_c_100g}mg</span>
                            </div>
                          )}
                          {(product.nutriments as any).potassium_100g && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Potassium</span>
                              <span className="font-mono">{(product.nutriments as any).potassium_100g}mg</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* All Other Nutriments */}
                      <Separator className="my-3" />
                      <details>
                        <summary className="cursor-pointer font-medium text-sm mb-2 text-purple-700 dark:text-purple-400">
                          All Available Nutriment Data (Click to expand)
                        </summary>
                        <div className="mt-2 p-3 bg-muted/30 rounded border max-h-40 overflow-auto">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {Object.entries(product.nutriments as Record<string, any>).map(([key, value]) => (
                              <div key={key} className="flex justify-between py-1 border-b border-border/10">
                                <span className="text-muted-foreground capitalize">
                                  {key.replace(/_/g, ' ').replace('100g', '(per 100g)')}:
                                </span>
                                <span className="font-mono text-right">
                                  {typeof value === 'number' ? value : String(value)}
                                  {key.includes('energy') ? ' kcal' : 
                                   key.includes('_100g') && typeof value === 'number' ? 
                                   (value < 1 ? 'mg' : 'g') : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Glycemic Information Section */}
              {(product?.glycemicIndex || product?.glycemicLoad) && analysisSettings.glycemicImpact && (
                <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="w-5 h-5 text-purple-600" />
                      Glycemic Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {product.glycemicIndex && (
                        <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{product.glycemicIndex}</p>
                          <p className="text-xs text-muted-foreground font-medium">Glycemic Index</p>
                        </div>
                      )}
                      {product.glycemicLoad && (
                        <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                          <p className="text-2xl font-bold text-pink-600">{product.glycemicLoad}</p>
                          <p className="text-xs text-muted-foreground font-medium">Glycemic Load</p>
                        </div>
                      )}
                    </div>
                    {product.glycemicExplanation && (
                      <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-border/20">
                        <p className="text-sm leading-relaxed">{product.glycemicExplanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Ingredients Section */}
              {product?.ingredientsText && analysisSettings.ingredientsList && (
                <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Database className="w-5 h-5 text-gray-600" />
                      Ingredients List
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-border/20">
                      <p className="text-sm leading-relaxed">{String(product.ingredientsText)}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Images Gallery */}
              {product?.additionalImages && product.additionalImages.length > 0 && (
                <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Additional Product Images
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {product.additionalImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={imageUrl} 
                            alt={`${product.productName} - Image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-border/20 group-hover:shadow-lg transition-all duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Product Video */}
              {product?.videoUrl && (
                <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Product Video
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-border/20">
                      <video 
                        controls 
                        className="w-full max-h-64 rounded-lg"
                        poster={product.imageUrl || undefined}
                      >
                        <source src={product.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Media Gallery */}
              {product?.mediaGallery && typeof product.mediaGallery === 'object' && Array.isArray(product.mediaGallery) && product.mediaGallery.length > 0 && (
                <Card className="border-cyan-200 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                      </svg>
                      Media Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-border/20">
                      <div className="space-y-2">
                        {product.mediaGallery.map((media: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                            <span className="text-sm font-medium">Media Item {index + 1}</span>
                            <Badge variant="outline" className="text-xs">
                              {media.type || "Unknown"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Product Metadata & Additional Information - Admin Only */}
              {analysisSettings.productMetadata && user?.accountType === "Admin" && (
                <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-neutral-50 dark:from-gray-950/20 dark:to-neutral-950/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="w-5 h-5 text-gray-600" />
                    Product Metadata & Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground">Product Identifiers</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Product ID:</span>
                          <span className="font-mono">{product?.id || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Barcode:</span>
                          <span className="font-mono">{product?.barcode || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Data Source:</span>
                          <span>{product?.dataSource || product?.lookupSource || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground">Timestamps & Updates</h4>
                      <div className="space-y-2 text-sm">
                        {product?.lastUpdated && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Updated:</span>
                            <span className="font-mono">{product.lastUpdated}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Analysis Date:</span>
                          <span className="font-mono">{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Raw Product Data for Debugging */}
                  <Separator className="my-4" />
                  <details className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-border/20">
                    <summary className="cursor-pointer font-semibold text-sm mb-2">
                      Raw Product Data (for debugging)
                    </summary>
                    <div className="mt-2 p-3 bg-muted/30 rounded border text-xs font-mono overflow-auto max-h-32">
                      <pre>{JSON.stringify(product, null, 2)}</pre>
                    </div>
                  </details>

                  {/* Analysis Data */}
                  {analysis && (
                    <details className="mt-4 bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-border/20">
                      <summary className="cursor-pointer font-semibold text-sm mb-2">
                        Raw Analysis Data (for debugging)
                      </summary>
                      <div className="mt-2 p-3 bg-muted/30 rounded border text-xs font-mono overflow-auto max-h-32">
                        <pre>{JSON.stringify(analysis, null, 2)}</pre>
                      </div>
                    </details>
                  )}

                  {/* NutriBot Insight Data */}
                  {nutriBotInsight && (
                    <details className="mt-4 bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-border/20">
                      <summary className="cursor-pointer font-semibold text-sm mb-2">
                        Raw NutriBot Data (for debugging)
                      </summary>
                      <div className="mt-2 p-3 bg-muted/30 rounded border text-xs font-mono overflow-auto max-h-32">
                        <pre>{JSON.stringify(nutriBotInsight, null, 2)}</pre>
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>
              )}

              {/* Nutrition Spotlight Section */}
              {product?.nutriments && analysisSettings.nutritionSpotlight && (
                <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      Nutrition Spotlight & Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NutritionSpotlight 
                      productName={product.productName || "Unknown Product"}
                      nutriments={product.nutriments as Record<string, any> | null}
                      processingScore={product.processingScore || 0}
                      barcode={product.barcode}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Fun Facts Section */}
              {analysisSettings.funFacts && (
                <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    Fun Facts & Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FunFacts 
                    productName={product?.productName || "Unknown Product"}
                    ingredients={product?.ingredientsText || ""}
                    nutriments={product?.nutriments as Record<string, any> | null}
                    processingScore={product?.processingScore || 0}
                    barcode={product?.barcode || ""}
                  />
                </CardContent>
              </Card>
              )}

              {/* NutriBot Insight Section */}
              {nutriBotInsight && analysisSettings.nutriBotInsight && (
                <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Bot className="w-5 h-5 text-blue-600" />
                      NutriBot AI Insight
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-border/20">
                      <p className="text-sm leading-relaxed">{nutriBotInsight.insight}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button 
                onClick={handleEditProduct}
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/20"
              >
                <Edit className="w-3 h-3 mr-1" />
                Add Missing Data
              </Button>
              <Button 
                onClick={() => setShowAnalysisSettings(true)}
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/20"
              >
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </Button>
            </div>
            <Button variant="outline" onClick={() => setShowProductAnalysis(false)}>
              Close Analysis
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Data Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-600" />
              Report Product Data Issue
            </DialogTitle>
            <DialogDescription>
              Help us improve data quality by reporting errors or missing information for {product?.productName || "this product"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issue-type">Issue Type</Label>
              <select
                id="issue-type"
                value={reportIssueType}
                onChange={(e) => setReportIssueType(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Select issue type...</option>
                <option value="incorrect_nutrition">Incorrect nutrition data</option>
                <option value="wrong_ingredients">Wrong ingredients list</option>
                <option value="incorrect_name">Incorrect product name</option>
                <option value="wrong_image">Wrong product image</option>
                <option value="missing_info">Missing information</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-[100px] resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowReportModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitReport}
                disabled={isSubmittingReport || !reportDescription.trim() || !reportIssueType}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmittingReport ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={showEditProductModal} onOpenChange={setShowEditProductModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Add Missing Product Data
            </DialogTitle>
            <DialogDescription>
              Help improve our database by adding missing or corrected information for {product?.productName || "this product"}.
            </DialogDescription>
          </DialogHeader>

          {editedProduct && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={editedProduct.productName}
                  onChange={(e) => setEditedProduct({
                    ...editedProduct,
                    productName: e.target.value
                  })}
                  placeholder="Product name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-brands">Brands</Label>
                <Input
                  id="edit-brands"
                  value={editedProduct.brands}
                  onChange={(e) => setEditedProduct({
                    ...editedProduct,
                    brands: e.target.value
                  })}
                  placeholder="Brand names (separated by commas)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-ingredients">Ingredients List</Label>
                <textarea
                  id="edit-ingredients"
                  value={editedProduct.ingredientsText}
                  onChange={(e) => setEditedProduct({
                    ...editedProduct,
                    ingredientsText: e.target.value
                  })}
                  placeholder="Complete ingredients list..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image">Image URL</Label>
                <Input
                  id="edit-image"
                  value={editedProduct.imageUrl}
                  onChange={(e) => setEditedProduct({
                    ...editedProduct,
                    imageUrl: e.target.value
                  })}
                  placeholder="Product image URL"
                />
              </div>

              <div className="space-y-3">
                <Label>Nutrition Information (per 100g)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-energy">Energy (kcal)</Label>
                    <Input
                      id="edit-energy"
                      type="number"
                      value={editedProduct.nutriments?.energy_100g || ""}
                      onChange={(e) => setEditedProduct({
                        ...editedProduct,
                        nutriments: {
                          ...editedProduct.nutriments,
                          energy_100g: e.target.value ? parseFloat(e.target.value) : undefined
                        }
                      })}
                      placeholder="Energy"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-proteins">Proteins (g)</Label>
                    <Input
                      id="edit-proteins"
                      type="number"
                      value={editedProduct.nutriments?.proteins_100g || ""}
                      onChange={(e) => setEditedProduct({
                        ...editedProduct,
                        nutriments: {
                          ...editedProduct.nutriments,
                          proteins_100g: e.target.value ? parseFloat(e.target.value) : undefined
                        }
                      })}
                      placeholder="Proteins"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-carbs">Carbohydrates (g)</Label>
                    <Input
                      id="edit-carbs"
                      type="number"
                      value={editedProduct.nutriments?.carbohydrates_100g || ""}
                      onChange={(e) => setEditedProduct({
                        ...editedProduct,
                        nutriments: {
                          ...editedProduct.nutriments,
                          carbohydrates_100g: e.target.value ? parseFloat(e.target.value) : undefined
                        }
                      })}
                      placeholder="Carbohydrates"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-fat">Fat (g)</Label>
                    <Input
                      id="edit-fat"
                      type="number"
                      value={editedProduct.nutriments?.fat_100g || ""}
                      onChange={(e) => setEditedProduct({
                        ...editedProduct,
                        nutriments: {
                          ...editedProduct.nutriments,
                          fat_100g: e.target.value ? parseFloat(e.target.value) : undefined
                        }
                      })}
                      placeholder="Fat"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditProductModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitEditRequest}
                  disabled={isSubmittingEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmittingEdit ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
