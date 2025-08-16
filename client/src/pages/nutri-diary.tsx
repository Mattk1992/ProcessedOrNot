import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, 
  Search, 
  Calendar, 
  Edit3, 
  Trash2, 
  Coffee, 
  Sun, 
  Sunset, 
  Moon,
  AlertCircle,
  Scale,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Scan,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import HeaderDropdown from "@/components/header-dropdown";
import LanguageSwitcher from "@/components/language-switcher";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BarcodeScanner from "@/components/barcode-scanner";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";

const diaryEntrySchema = z.object({
  productBarcode: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  productBrands: z.string().optional(),
  productImageUrl: z.string().optional(),
  servingSize: z.number().min(0.1, "Serving size must be at least 0.1"),
  servingUnit: z.string().default("serving"),
  calories: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  saturatedFat: z.number().min(0).optional(),
  carbohydrates: z.number().min(0).optional(),
  sugars: z.number().min(0).optional(),
  proteins: z.number().min(0).optional(),
  salt: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  processingScore: z.number().min(0).max(10).optional(),
  processingExplanation: z.string().optional(),
  glycemicIndex: z.number().min(0).optional(),
  glycemicLoad: z.number().min(0).optional(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  consumedAt: z.string(),
  notes: z.string().optional(),
});

const weightEntrySchema = z.object({
  weight: z.number().min(1, "Weight must be at least 1 kg"),
  bodyFat: z.number().min(0).max(100).optional(),
  muscleMass: z.number().min(0).optional(),
  notes: z.string().optional(),
  recordedAt: z.string(),
});

type DiaryEntryForm = z.infer<typeof diaryEntrySchema>;
type WeightEntryForm = z.infer<typeof weightEntrySchema>;

interface DiaryEntry {
  id: number;
  productName: string;
  productBrands?: string;
  productImageUrl?: string;
  servingSize: number;
  servingUnit: string;
  calories?: number;
  fat?: number;
  carbohydrates?: number;
  proteins?: number;
  salt?: number;
  fiber?: number;
  processingScore?: number;
  mealType: string;
  consumedAt: string;
  notes?: string;
}

interface WeightEntry {
  id: number;
  userId: number;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
  recordedAt: string;
  createdAt: string;
}

export default function NutriDiary() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const [mealTimes, setMealTimes] = useState({
    breakfast: "08:00",
    lunch: "13:00",
    dinner: "18:00",
    snack: "20:00"
  });
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isProductLookupActive, setIsProductLookupActive] = useState(false);
  const [isLookingUpProduct, setIsLookingUpProduct] = useState(false);
  const [productLookupError, setProductLookupError] = useState<string>("");

  // Date navigation functions
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return "Today";
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return "Yesterday";
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const form = useForm<DiaryEntryForm>({
    resolver: zodResolver(diaryEntrySchema),
    defaultValues: {
      productBarcode: "",
      productName: "",
      productBrands: "",
      productImageUrl: "",
      servingSize: 1,
      servingUnit: "serving",
      calories: 0,
      fat: 0,
      saturatedFat: 0,
      carbohydrates: 0,
      sugars: 0,
      proteins: 0,
      salt: 0,
      fiber: 0,
      processingScore: undefined,
      processingExplanation: "",
      glycemicIndex: undefined,
      glycemicLoad: undefined,
      mealType: "breakfast",
      consumedAt: selectedDate + "T12:00",
      notes: "",
    },
  });

  const weightForm = useForm<WeightEntryForm>({
    resolver: zodResolver(weightEntrySchema),
    defaultValues: {
      weight: 70,
      bodyFat: undefined,
      muscleMass: undefined,
      notes: "",
      recordedAt: new Date().toISOString().slice(0, 16),
    },
  });

  // Update form default date when selectedDate changes
  useEffect(() => {
    form.setValue("consumedAt", selectedDate + "T12:00");
  }, [selectedDate, form]);

  // Fetch meal times from database
  const { data: savedMealTimes } = useQuery({
    queryKey: ["/api/nutrition/meal-times"],
    enabled: isAuthenticated,
  });

  // Update local state when saved meal times are loaded
  useEffect(() => {
    if (savedMealTimes) {
      const times = savedMealTimes as any;
      setMealTimes({
        breakfast: times.breakfastTime || "08:00",
        lunch: times.lunchTime || "13:00",
        dinner: times.dinnerTime || "18:00",
        snack: times.snackTime || "20:00"
      });
    }
  }, [savedMealTimes]);

  // Mutation to save meal times
  const saveMealTimesMutation = useMutation({
    mutationFn: async (mealTimesData: any) => {
      const response = await fetch("/api/nutrition/meal-times", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealTimesData),
      });
      if (!response.ok) throw new Error("Failed to save meal times");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition/meal-times"] });
      toast({
        title: "Success",
        description: "Meal times saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save meal times",
        variant: "destructive",
      });
    },
  });

  // Handle meal time changes
  const handleMealTimeChange = (mealType: string, time: string) => {
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Update local state immediately
    const newMealTimes = {
      ...mealTimes,
      [mealType]: time
    };
    setMealTimes(newMealTimes);

    // Save to database with debouncing
    const timeoutId = setTimeout(() => {
      const mealTimesData = {
        breakfastTime: newMealTimes.breakfast,
        lunchTime: newMealTimes.lunch,
        dinnerTime: newMealTimes.dinner,
        snackTime: newMealTimes.snack,
      };
      
      saveMealTimesMutation.mutate(mealTimesData);
    }, 1500);

    setSaveTimeout(timeoutId);
  };

  // Fetch diary entries for selected date
  const { data: diaryEntries, isLoading } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/nutrition/diary", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/nutrition/diary?date=${selectedDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch diary entries');
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Product lookup function
  const handleProductLookup = async (input: string) => {
    setIsLookingUpProduct(true);
    setProductLookupError("");
    
    try {
      const response = await fetch(`/api/products/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input })
      });
      
      if (!response.ok) {
        throw new Error("Failed to lookup product");
      }
      
      const data = await response.json();
      
      if (data.product) {
        const product = data.product;
        // Populate form with product data
        form.setValue("productBarcode", input || "");
        form.setValue("productName", product.productName || "");
        form.setValue("productBrands", product.brands || "");
        form.setValue("productImageUrl", product.imageUrl || "");
        form.setValue("processingScore", product.processingScore || undefined);
        form.setValue("processingExplanation", product.processingExplanation || "");
        form.setValue("glycemicIndex", product.glycemicIndex || undefined);
        form.setValue("glycemicLoad", product.glycemicLoad || undefined);
        
        // Extract nutritional data from nutriments
        if (product.nutriments) {
          const nutriments = product.nutriments;
          form.setValue("calories", nutriments.energy_kcal || nutriments['energy-kcal'] || 0);
          form.setValue("fat", nutriments.fat || 0);
          form.setValue("saturatedFat", nutriments.saturated_fat || nutriments['saturated-fat'] || 0);
          form.setValue("carbohydrates", nutriments.carbohydrates || 0);
          form.setValue("sugars", nutriments.sugars || 0);
          form.setValue("proteins", nutriments.proteins || 0);
          form.setValue("salt", nutriments.salt || 0);
          form.setValue("fiber", nutriments.fiber || 0);
        }
        
        toast({
          title: "Product Found",
          description: `Found ${product.productName} from ${data.source}`,
        });
        
        setIsProductLookupActive(false);
      } else {
        const errorMsg = data.error || "Product not found in our databases";
        setProductLookupError(errorMsg);
        toast({
          title: "Product Not Found",
          description: "This product isn't in our databases yet. You can add it manually below.",
          variant: "default",
        });
      }
    } catch (error: any) {
      setProductLookupError(error.message || "Failed to lookup product");
    } finally {
      setIsLookingUpProduct(false);
    }
  };

  // Add diary entry mutation
  const addEntryMutation = useMutation({
    mutationFn: async (data: DiaryEntryForm) => {
      const response = await apiRequest("POST", "/api/nutrition/diary", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Entry Added",
        description: "Food entry has been added to your diary",
      });
      setIsAddDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition/diary", selectedDate] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add entry",
        variant: "destructive",
      });
    },
  });

  // Delete diary entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const response = await apiRequest("DELETE", `/api/nutrition/diary/${entryId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Entry Deleted",
        description: "Food entry has been removed from your diary",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition/diary", selectedDate] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete entry",
        variant: "destructive",
      });
    },
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
                  <p className="text-xs text-muted-foreground">Nutri Diary</p>
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
            <p className="text-muted-foreground">Please sign in to access your nutrition diary.</p>
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

  const filteredEntries = diaryEntries?.filter(entry =>
    entry.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.productBrands?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getEntriesByMeal = (mealType: string) => {
    return filteredEntries.filter(entry => entry.mealType === mealType);
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return <Coffee className="w-5 h-5" />;
      case 'lunch': return <Sun className="w-5 h-5" />;
      case 'dinner': return <Sunset className="w-5 h-5" />;
      case 'snack': return <Moon className="w-5 h-5" />;
      default: return <Coffee className="w-5 h-5" />;
    }
  };

  const getMealTotal = (mealType: string, nutrient: 'calories' | 'fat' | 'carbohydrates' | 'proteins') => {
    return getEntriesByMeal(mealType).reduce((total, entry) => {
      const value = entry[nutrient] || 0;
      return total + (value * entry.servingSize);
    }, 0);
  };

  // Calculate daily totals
  const getDailyTotal = (nutrient: 'calories' | 'fat' | 'carbohydrates' | 'proteins' | 'salt' | 'fiber') => {
    return filteredEntries.reduce((total, entry) => {
      const value = entry[nutrient] || 0;
      return total + (value * entry.servingSize);
    }, 0);
  };

  const dailyStats = {
    calories: getDailyTotal('calories'),
    fat: getDailyTotal('fat'),
    carbohydrates: getDailyTotal('carbohydrates'),
    proteins: getDailyTotal('proteins'),
    salt: getDailyTotal('salt'),
    fiber: getDailyTotal('fiber'),
    totalEntries: filteredEntries.length
  };

  const onSubmit = (data: DiaryEntryForm) => {
    console.log('Form submission data:', data);
    
    // Ensure consumedAt is properly formatted as ISO string
    const formattedData = {
      ...data,
      consumedAt: new Date(data.consumedAt).toISOString(),
      // Set defaults for missing optional fields
      processingScore: data.processingScore || undefined,
      glycemicIndex: data.glycemicIndex || undefined,
      glycemicLoad: data.glycemicLoad || undefined,
    };
    
    console.log('Formatted submission data:', formattedData);
    addEntryMutation.mutate(formattedData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Header */}
      <header className="backdrop-blur-md bg-background/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src={logoPath} alt="ProcessedOrNot Scanner" className="w-10 h-10 rounded-full" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold gradient-text">ProcessedOrNot</h1>
                <p className="text-xs text-muted-foreground">Nutri Diary</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/nutri-dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/nutri-dashboard/diary" className="text-foreground font-medium">Diary</Link>
              <Link href="/nutri-dashboard/progress" className="text-muted-foreground hover:text-foreground transition-colors">Progress</Link>
              <Link href="/nutri-dashboard/profile" className="text-muted-foreground hover:text-foreground transition-colors">Profile</Link>
              <Link href="/nutri-dashboard/settings" className="text-muted-foreground hover:text-foreground transition-colors">Settings</Link>
            </nav>

            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <HeaderDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Food Diary</h2>
            <p className="text-muted-foreground">Track your daily food intake and nutrition</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Food
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Food Entry</DialogTitle>
                  <DialogDescription>
                    Add a new food item to your diary
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="manual" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="scan" className="flex items-center gap-2">
                      <Scan className="w-4 h-4" />
                      Scan Barcode
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4" />
                      Manual Entry
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="scan" className="space-y-4">
                    <div className="text-center space-y-4">
                      <h3 className="font-semibold">Scan Product Barcode</h3>
                      <p className="text-sm text-muted-foreground">
                        Scan a barcode to automatically fill in product information
                      </p>
                      
                      {!isProductLookupActive ? (
                        <Button
                          onClick={() => setIsProductLookupActive(true)}
                          disabled={isLookingUpProduct}
                          className="w-full"
                          variant="outline"
                        >
                          {isLookingUpProduct ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Looking up product...
                            </>
                          ) : (
                            <>
                              <Scan className="w-4 h-4 mr-2" />
                              Start Barcode Scanner
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <BarcodeScanner
                            onScan={handleProductLookup}
                            isLoading={isLookingUpProduct}
                          />
                          <Button
                            onClick={() => {
                              setIsProductLookupActive(false);
                              setProductLookupError("");
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            Cancel Scanner
                          </Button>
                        </div>
                      )}
                      
                      {productLookupError && (
                        <div className="p-3 bg-muted/50 border border-border rounded-md">
                          <p className="text-sm text-muted-foreground">{productLookupError}</p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              onClick={() => {
                                setProductLookupError("");
                                // Switch to manual entry tab
                                const manualTab = document.querySelector('[value="manual"]') as HTMLElement;
                                manualTab?.click();
                              }}
                              size="sm"
                              className="h-auto py-1"
                            >
                              Enter Manually
                            </Button>
                            <Button
                              onClick={() => setProductLookupError("")}
                              variant="outline"
                              size="sm"
                              className="h-auto py-1"
                            >
                              Try Again
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="manual">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Greek Yogurt" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="productBrands"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Chobani" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="servingSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Serving Size</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                min="0.1"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="servingUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="serving">serving</SelectItem>
                                <SelectItem value="cup">cup</SelectItem>
                                <SelectItem value="piece">piece</SelectItem>
                                <SelectItem value="g">grams</SelectItem>
                                <SelectItem value="ml">ml</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="calories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Calories</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fat (g)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="carbohydrates"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Carbs (g)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="proteins"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Protein (g)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="mealType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meal Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="breakfast">Breakfast</SelectItem>
                              <SelectItem value="lunch">Lunch</SelectItem>
                              <SelectItem value="dinner">Dinner</SelectItem>
                              <SelectItem value="snack">Snack</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="consumedAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consumed At</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Any additional notes..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsAddDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={addEntryMutation.isPending}>
                            {addEntryMutation.isPending ? "Adding..." : "Add Entry"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center bg-muted/30 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousDay}
                className="flex items-center space-x-2 px-4 py-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              <div className="px-6 py-2 text-center min-w-[120px]">
                <div className="font-semibold text-lg">{formatDisplayDate(selectedDate)}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(selectedDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextDay}
                className="flex items-center space-x-2 px-4 py-2"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search food entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Daily Statistics */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Daily Statistics
              </CardTitle>
              <CardDescription>
                Nutritional summary for {formatDisplayDate(selectedDate)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(dailyStats.calories)}
                  </div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.round(dailyStats.proteins)}g
                  </div>
                  <div className="text-sm text-muted-foreground">Protein</div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {Math.round(dailyStats.carbohydrates)}g
                  </div>
                  <div className="text-sm text-muted-foreground">Carbs</div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {Math.round(dailyStats.fat)}g
                  </div>
                  <div className="text-sm text-muted-foreground">Fat</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    {Math.round(dailyStats.fiber)}g
                  </div>
                  <div className="text-sm text-muted-foreground">Fiber</div>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                    {Math.round(dailyStats.salt * 1000)}mg
                  </div>
                  <div className="text-sm text-muted-foreground">Salt</div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-950/20 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                    {dailyStats.totalEntries}
                  </div>
                  <div className="text-sm text-muted-foreground">Entries</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Diary Entries by Meal */}
        <div className="space-y-6">
          {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
            const mealEntries = getEntriesByMeal(mealType);
            const mealCalories = getMealTotal(mealType, 'calories');
            
            return (
              <Card key={mealType}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getMealIcon(mealType)}
                      <div>
                        <div className="flex items-center space-x-3">
                          <CardTitle className="capitalize">{mealType}</CardTitle>
                          <Input
                            type="time"
                            value={mealTimes[mealType as keyof typeof mealTimes]}
                            onChange={(e) => handleMealTimeChange(mealType, e.target.value)}
                            className="w-20 h-8 text-sm"
                          />
                        </div>
                        <CardDescription>
                          {mealEntries.length} items • {mealCalories.toFixed(0)} calories
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {mealCalories.toFixed(0)} cal
                    </Badge>
                  </div>
                </CardHeader>
                
                {mealEntries.length > 0 && (
                  <CardContent>
                    <div className="space-y-3">
                      {mealEntries.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{entry.productName}</h4>
                              {entry.productBrands && (
                                <Badge variant="secondary" className="text-xs">
                                  {entry.productBrands}
                                </Badge>
                              )}
                              {entry.processingScore !== undefined && (
                                <Badge 
                                  variant={entry.processingScore <= 5 ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  PS: {entry.processingScore}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {entry.servingSize} {entry.servingUnit} • {((entry.calories || 0) * entry.servingSize).toFixed(0)} cal
                              {entry.notes && (
                                <span className="ml-2 italic">"{entry.notes}"</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteEntryMutation.mutate(entry.id)}
                              disabled={deleteEntryMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Quick Add from Recent Scans */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Add from Recent Scans</CardTitle>
            <CardDescription>
              Add products you've recently scanned to your diary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Link href="/product-lookup">
                <Button variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Scan Product to Add
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}