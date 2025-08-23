import { useState, useEffect, useMemo } from "react";
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
  Loader2,
  Camera,
  Settings
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
import QuickCameraSettings from "@/components/quick-camera-settings";
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
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack", "meal4", "meal5", "meal6", "snack1", "snack2"]),
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
    snack: "20:00",
    meal4: "10:00",
    meal5: "15:30",
    meal6: "21:00",
    snack1: "10:30",
    snack2: "15:00"
  });
  const [mealPercentages, setMealPercentages] = useState({
    breakfast: 10,
    lunch: 35,
    dinner: 55,
    snack: 0,
    meal4: 0,
    meal5: 0,
    meal6: 0,
    snack1: 0,
    snack2: 0
  });
  const [originalMealPercentages, setOriginalMealPercentages] = useState({
    breakfast: 10,
    lunch: 35,
    dinner: 55,
    snack: 0,
    meal4: 0,
    meal5: 0,
    meal6: 0,
    snack1: 0,
    snack2: 0
  });
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isProductLookupActive, setIsProductLookupActive] = useState(false);
  const [isLookingUpProduct, setIsLookingUpProduct] = useState(false);
  const [productLookupError, setProductLookupError] = useState<string>("");
  const [textSearchQuery, setTextSearchQuery] = useState<string>("");

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

  // Fetch user's onboarding data to get mealsPerDay setting
  const { data: onboardingData } = useQuery({
    queryKey: ["/api/onboarding"],
    enabled: isAuthenticated,
  });

  // Generate dynamic meal types based on user's mealsPerDay and snacksPerDay settings
  const mealTypes = useMemo(() => {
    const mealsPerDay = (onboardingData as any)?.mealsPerDay || 3;
    const snacksPerDay = (onboardingData as any)?.snacksPerDay || 0;
    const baseMeals = ['breakfast', 'lunch', 'dinner'];
    let types = [...baseMeals];
    
    // Add additional meals based on mealsPerDay setting
    if (mealsPerDay > 3) {
      for (let i = 4; i <= Math.min(mealsPerDay, 6); i++) {
        types.push(`meal${i}`);
      }
    }
    
    // Add snack sections based on snacksPerDay setting
    if (snacksPerDay > 0) {
      for (let i = 1; i <= Math.min(snacksPerDay, 2); i++) {
        types.push(`snack${i}`);
      }
    }
    
    return types;
  }, [onboardingData]);

  // Update local state when saved meal times are loaded
  useEffect(() => {
    if (savedMealTimes) {
      const times = savedMealTimes as any;
      setMealTimes({
        breakfast: times.breakfastTime || "08:00",
        lunch: times.lunchTime || "13:00",
        dinner: times.dinnerTime || "18:00",
        snack: times.snackTime || "20:00",
        meal4: times.meal4Time || "10:00",
        meal5: times.meal5Time || "15:30",
        meal6: times.meal6Time || "21:00",
        snack1: times.snack1Time || "10:30",
        snack2: times.snack2Time || "15:00"
      });
      
      const loadedPercentages = {
        breakfast: times.breakfastPercent || 10,
        lunch: times.lunchPercent || 35,
        dinner: times.dinnerPercent || 55,
        snack: times.snackPercent || 0,
        meal4: times.meal4Percent || 0,
        meal5: times.meal5Percent || 0,
        meal6: times.meal6Percent || 0,
        snack1: times.snack1Percent || 0,
        snack2: times.snack2Percent || 0,
      };
      
      setMealPercentages(loadedPercentages);
      setOriginalMealPercentages(loadedPercentages);
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
        meal4Time: newMealTimes.meal4,
        meal5Time: newMealTimes.meal5,
        meal6Time: newMealTimes.meal6,
        snack1Time: newMealTimes.snack1,
        snack2Time: newMealTimes.snack2,
      };
      
      saveMealTimesMutation.mutate(mealTimesData);
    }, 1500);

    setSaveTimeout(timeoutId);
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  // Handle meal percentage changes
  const handleMealPercentageChange = (mealType: string, newPercent: number) => {
    const newPercentages = { ...mealPercentages, [mealType]: newPercent };
    setMealPercentages(newPercentages);
    
    // Check if values have changed from original
    const hasChanges = Object.keys(newPercentages).some(
      key => newPercentages[key as keyof typeof newPercentages] !== originalMealPercentages[key as keyof typeof originalMealPercentages]
    );
    
    setShowSaveButton(hasChanges);
  };

  const calculatePercentageTotal = () => {
    return Object.values(mealPercentages).reduce((sum, percent) => sum + percent, 0);
  };

  const isValidPercentageDistribution = () => {
    return calculatePercentageTotal() === 100;
  };

  // Mutation to save meal percentages
  const saveMealPercentagesMutation = useMutation({
    mutationFn: async (percentageData: any) => {
      const response = await fetch("/api/nutrition/meal-times", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(percentageData),
      });
      if (!response.ok) throw new Error("Failed to save meal percentages");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition/meal-times"] });
      setOriginalMealPercentages(mealPercentages);
      setShowSaveButton(false);
      toast({
        title: "Success",
        description: "Meal percentages saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save meal percentages",
        variant: "destructive",
      });
    },
  });

  const handleSaveMealPercentages = () => {
    if (!isValidPercentageDistribution()) {
      toast({
        title: "Invalid Distribution",
        description: "Daily % Division must add up to 100%",
        variant: "destructive",
      });
      return;
    }

    const percentageData = {
      breakfastPercent: mealPercentages.breakfast,
      lunchPercent: mealPercentages.lunch,
      dinnerPercent: mealPercentages.dinner,
      snackPercent: mealPercentages.snack,
      meal4Percent: mealPercentages.meal4,
      meal5Percent: mealPercentages.meal5,
      meal6Percent: mealPercentages.meal6,
      snack1Percent: mealPercentages.snack1,
      snack2Percent: mealPercentages.snack2,
    };
    
    saveMealPercentagesMutation.mutate(percentageData);
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

  // Product lookup function with cascading database fallback
  const handleProductLookup = async (input: string) => {
    setIsLookingUpProduct(true);
    setProductLookupError("");
    
    // Create AbortController for cleanup
    const controller = new AbortController();
    
    try {
      // Use the cascading database fallback system
      const response = await fetch(`/api/products/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error("Failed to lookup product");
      }
      
      const data = await response.json();
      
      if (data && data.productName) {
        // Product found in cascading database system - auto-fill Manual Entry tab
        const product = data;
        
        // Populate form with product data
        form.setValue("productBarcode", input || "");
        form.setValue("productName", product.productName || "");
        form.setValue("productBrands", product.brands || "");
        form.setValue("productImageUrl", product.imageUrl || "");
        form.setValue("processingScore", product.processingScore || undefined);
        form.setValue("processingExplanation", product.processingExplanation || "");
        form.setValue("glycemicIndex", product.glycemicIndex || undefined);
        form.setValue("glycemicLoad", product.glycemicLoad || undefined);
        
        // Extract nutritional data from nutriments object
        if (product.nutriments) {
          const nutriments = product.nutriments;
          form.setValue("calories", 
            nutriments.energy_kcal || 
            nutriments['energy-kcal'] || 
            nutriments.energy_kcal_100g || 
            nutriments['energy-kcal_100g'] || 
            0);
          form.setValue("fat", 
            nutriments.fat || 
            nutriments.fat_100g || 
            0);
          form.setValue("saturatedFat", 
            nutriments.saturated_fat || 
            nutriments['saturated-fat'] || 
            nutriments.saturated_fat_100g || 
            nutriments['saturated-fat_100g'] || 
            0);
          form.setValue("carbohydrates", 
            nutriments.carbohydrates || 
            nutriments.carbohydrates_100g || 
            0);
          form.setValue("sugars", 
            nutriments.sugars || 
            nutriments.sugars_100g || 
            0);
          form.setValue("proteins", 
            nutriments.proteins || 
            nutriments.proteins_100g || 
            0);
          form.setValue("salt", 
            nutriments.salt || 
            nutriments.salt_100g || 
            nutriments.sodium || 
            nutriments.sodium_100g || 
            0);
          form.setValue("fiber", 
            nutriments.fiber || 
            nutriments.fiber_100g || 
            nutriments.fibre || 
            nutriments.fibre_100g || 
            0);
        }
        
        // Success message with database source
        const source = data.lookupSource || data.source || "AI Text Search";
        const searchType = /^[0-9]{8,14}$/.test(input.trim()) ? "Barcode" : "Text Search";
        
        toast({
          title: "Product Found",
          description: `Found "${product.productName}" via ${searchType} (${source}). Form auto-filled in Manual Entry tab.`,
          duration: 5000,
        });
        
        // Switch to Manual Entry tab and deactivate scanner
        setIsProductLookupActive(false);
        setTextSearchQuery(""); // Clear search query after successful lookup
        
        // Auto-switch to manual entry tab to show the filled form
        const manualTabTrigger = document.querySelector('[value="manual"]') as HTMLElement;
        if (manualTabTrigger) {
          manualTabTrigger.click();
        }
        
      } else {
        // Product not found in any database - show helpful error
        const errorMsg = data?.error || "Product not found in any of our food databases";
        setProductLookupError(errorMsg);
        toast({
          title: "Product Not Found",
          description: "This product isn't in our databases yet. Please fill in the details manually in the Manual Entry tab.",
          variant: "default",
          duration: 6000,
        });
        
        // Auto-switch to manual entry tab for user to add manually
        const manualTabTrigger = document.querySelector('[value="manual"]') as HTMLElement;
        if (manualTabTrigger) {
          manualTabTrigger.click();
        }
        
        // Pre-fill barcode if it was scanned, otherwise pre-fill product name if it was a text search
        if (input && /^[0-9]{8,14}$/.test(input.trim())) {
          form.setValue("productBarcode", input);
        } else if (input && input.trim()) {
          form.setValue("productName", input.trim());
        }
        
        // Clear search query
        setTextSearchQuery("");
      }
    } catch (error: any) {
      const errorMsg = error.message || "Failed to lookup product";
      setProductLookupError(errorMsg);
      toast({
        title: "Lookup Failed",
        description: "Unable to search databases. Please try again or add the product manually.",
        variant: "destructive",
        duration: 6000,
      });
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
      case 'meal4': return <Utensils className="w-5 h-5" />;
      case 'meal5': return <Utensils className="w-5 h-5" />;
      case 'meal6': return <Utensils className="w-5 h-5" />;
      case 'snack1': return <Moon className="w-5 h-5" />;
      case 'snack2': return <Moon className="w-5 h-5" />;
      default: return <Coffee className="w-5 h-5" />;
    }
  };

  const getMealDisplayName = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'Breakfast';
      case 'lunch': return 'Lunch';
      case 'dinner': return 'Dinner';
      case 'snack': return 'Snack';
      case 'meal4': return 'Mid Morning';
      case 'meal5': return 'Afternoon Snack';
      case 'meal6': return 'Late Evening';
      case 'snack1': return 'Snack 1';
      case 'snack2': return 'Snack 2';
      default: return mealType.charAt(0).toUpperCase() + mealType.slice(1);
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
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="font-semibold">Product Search</h3>
                        <p className="text-sm text-muted-foreground">
                          Scan a barcode or search by product name
                        </p>
                      </div>
                      
                      {/* Text Search Section */}
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Search by product name (e.g., Greek Yogurt, Apple, Coca Cola)"
                            value={textSearchQuery}
                            onChange={(e) => setTextSearchQuery(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && textSearchQuery.trim()) {
                                handleProductLookup(textSearchQuery.trim());
                              }
                            }}
                            className="flex-1"
                            disabled={isLookingUpProduct}
                          />
                          <Button
                            onClick={() => textSearchQuery.trim() && handleProductLookup(textSearchQuery.trim())}
                            disabled={isLookingUpProduct || !textSearchQuery.trim()}
                            size="default"
                          >
                            {isLookingUpProduct ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Search className="w-4 h-4" />
                            )}
                          </Button>
                          {textSearchQuery && !isLookingUpProduct && (
                            <Button
                              onClick={() => setTextSearchQuery("")}
                              variant="outline"
                              size="default"
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                        
                        {isLookingUpProduct && textSearchQuery && (
                          <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-md">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                                AI-Powered Text Search Active
                              </p>
                            </div>
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                              🧠 Step 1: Optimizing search keywords with ChatGPT Nano<br/>
                              📊 Step 2: Generating realistic nutritional data<br/>  
                              📝 Step 3: Auto-filling Manual Entry form
                            </p>
                          </div>
                        )}
                        
                        {!isLookingUpProduct && textSearchQuery && (
                          <div className="p-2 bg-muted/50 border rounded-md">
                            <p className="text-xs text-muted-foreground">
                              AI Text Search will analyze "{textSearchQuery}" to generate optimized keywords and nutritional data
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-border"></div>
                        <span className="text-xs text-muted-foreground uppercase">OR</span>
                        <div className="flex-1 h-px bg-border"></div>
                      </div>
                      
                      {!isProductLookupActive ? (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setIsProductLookupActive(true)}
                            disabled={isLookingUpProduct}
                            className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            {isLookingUpProduct ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Starting Camera...</span>
                              </>
                            ) : (
                              <>
                                <Camera className="w-4 h-4" />
                                <span className="text-sm">Scan with Camera</span>
                              </>
                            )}
                          </Button>
                          
                          <QuickCameraSettings>
                            <Button
                              variant="outline"
                              className="border-2 border-primary/20 text-primary hover:bg-primary/10 py-3 px-3 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                              title="Quick Camera Settings"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </QuickCameraSettings>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
                              Cascading Database Search Active
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              Scanning through USDA, OpenFoodFacts, and 20+ food databases for the most accurate product data.
                            </p>
                          </div>
                          
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
                        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-md">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                                Product Not Found in Databases
                              </p>
                              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                Searched through all available food databases but couldn't find this product.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              onClick={() => {
                                setProductLookupError("");
                                setIsProductLookupActive(true);
                              }}
                              size="sm"
                              variant="outline"
                              className="text-orange-700 border-orange-300 hover:bg-orange-100"
                            >
                              <Scan className="w-3 h-3 mr-1" />
                              Try Again
                            </Button>
                            <Button
                              onClick={() => {
                                setProductLookupError("");
                                setIsProductLookupActive(false);
                                // Switch to manual entry
                                const manualTab = document.querySelector('[value="manual"]') as HTMLElement;
                                if (manualTab) manualTab.click();
                              }}
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Edit3 className="w-3 h-3 mr-1" />
                              Add Manually
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="manual">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Auto-fill indicator */}
                        {form.watch("productBarcode") && (
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                                Form auto-filled from cascading database search
                              </p>
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              Product data populated automatically. Review and adjust as needed.
                            </p>
                          </div>
                        )}
                        
                        <FormField
                          control={form.control}
                          name="productBarcode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Barcode (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 1234567890123" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
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
                              <SelectItem value="meal4">Mid Morning</SelectItem>
                              <SelectItem value="meal5">Afternoon Snack</SelectItem>
                              <SelectItem value="meal6">Late Evening</SelectItem>
                              <SelectItem value="snack1">Snack 1</SelectItem>
                              <SelectItem value="snack2">Snack 2</SelectItem>
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

        {/* Daily % Division Summary and Save Button */}
        {showSaveButton && (
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="font-medium">Total Distribution:</span>
                    <span className={`ml-2 font-bold ${
                      calculatePercentageTotal() === 100 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {calculatePercentageTotal()}%
                    </span>
                  </div>
                  {!isValidPercentageDistribution() && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      ⚠️ Must equal 100% to save
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      setMealPercentages(originalMealPercentages);
                      setShowSaveButton(false);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveMealPercentages}
                    disabled={!isValidPercentageDistribution() || saveMealPercentagesMutation.isPending}
                    size="sm"
                  >
                    {saveMealPercentagesMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Diary Entries by Meal */}
        <div className="space-y-6">
          {mealTypes.map((mealType) => {
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
                          <CardTitle>{getMealDisplayName(mealType)}</CardTitle>
                          <Input
                            type="time"
                            value={mealTimes[mealType as keyof typeof mealTimes]}
                            onChange={(e) => handleMealTimeChange(mealType, e.target.value)}
                            className="w-20 h-8 text-sm"
                          />
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-sm text-muted-foreground">Daily % Division:</span>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={mealPercentages[mealType as keyof typeof mealPercentages]}
                            onChange={(e) => handleMealPercentageChange(mealType, parseInt(e.target.value) || 0)}
                            className="w-16 h-8 text-sm"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
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