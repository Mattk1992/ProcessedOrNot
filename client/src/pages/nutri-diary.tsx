import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  X,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import HeaderDropdown from "@/components/header-dropdown";
import LanguageSwitcher from "@/components/language-switcher";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";

const diaryEntrySchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  productBrands: z.string().optional(),
  servingSize: z.number().min(0.1, "Serving size must be at least 0.1"),
  servingUnit: z.string().default("serving"),
  calories: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  carbohydrates: z.number().min(0).optional(),
  proteins: z.number().min(0).optional(),
  salt: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  consumedAt: z.string(),
  notes: z.string().optional(),
  productLookup: z.string().optional(),
});

type DiaryEntryForm = z.infer<typeof diaryEntrySchema>;

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

export default function NutriDiary() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);

  const form = useForm<DiaryEntryForm>({
    resolver: zodResolver(diaryEntrySchema),
    defaultValues: {
      productName: "",
      productBrands: "",
      servingSize: 1,
      servingUnit: "serving",
      calories: 0,
      fat: 0,
      carbohydrates: 0,
      proteins: 0,
      salt: 0,
      fiber: 0,
      mealType: "breakfast",
      consumedAt: new Date().toISOString().slice(0, 16),
      notes: "",
      productLookup: "",
    },
  });

  // Fetch diary entries for selected date
  const { data: diaryEntries, isLoading } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/nutrition/diary", selectedDate],
    enabled: isAuthenticated,
  });

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
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition/diary"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition/diary"] });
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

  const onSubmit = (data: DiaryEntryForm) => {
    addEntryMutation.mutate(data);
  };

  const handleScanBarcode = () => {
    setIsScanning(true);
    toast({
      title: "Barcode Scanner",
      description: "Opening barcode scanner...",
    });
    // TODO: Implement actual barcode scanning logic
    setTimeout(() => {
      setIsScanning(false);
      // Mock barcode scan result
      const mockBarcode = "1234567890123";
      form.setValue("productLookup", mockBarcode);
      toast({
        title: "Barcode Scanned",
        description: `Found barcode: ${mockBarcode}`,
      });
    }, 2000);
  };

  const handleQuickSettings = () => {
    setShowQuickSettings(!showQuickSettings);
    toast({
      title: "Quick Settings",
      description: showQuickSettings ? "Settings closed" : "Settings opened",
    });
  };

  const handleProductLookup = async (barcode: string) => {
    if (!barcode.trim()) return;
    
    toast({
      title: "Looking up product",
      description: "Searching for product information...",
    });
    
    // TODO: Implement actual product lookup API call
    setTimeout(() => {
      form.setValue("productName", "Sample Product");
      form.setValue("productBrands", "Sample Brand");
      form.setValue("calories", 150);
      form.setValue("proteins", 8);
      form.setValue("carbohydrates", 12);
      form.setValue("fat", 6);
      toast({
        title: "Product Found",
        description: "Product information has been populated",
      });
    }, 1500);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Food Diary</h2>
            <p className="text-muted-foreground">Track your daily food intake and nutrition</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Food
                </Button>
              </DialogTrigger>
              <DialogContent className="fixed inset-0 w-full h-full max-w-none max-h-none bg-background overflow-y-auto p-0">
                <div className="min-h-full flex flex-col">
                  <DialogHeader className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/20 px-4 py-4 z-20 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsAddDialogOpen(false)}
                          className="h-9 w-9 rounded-full hover:bg-muted"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                        <div>
                          <DialogTitle className="text-xl font-semibold">Add Food Entry</DialogTitle>
                          <DialogDescription className="text-sm text-muted-foreground">
                            Track your nutrition intake
                          </DialogDescription>
                        </div>
                      </div>
                    </div>
                  </DialogHeader>
                  
                  <div className="flex-1 px-4 py-6">
                
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">
                        {/* Barcode Scanning Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Quick Add</h3>
                          
                          {/* Scan Barcode & Quick Settings */}
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleScanBarcode}
                              disabled={isScanning}
                              className="h-12 text-base font-medium"
                            >
                              <Camera className="w-5 h-5 mr-2" />
                              {isScanning ? "Scanning..." : "Scan Barcode"}
                            </Button>
                            
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleQuickSettings}
                              className="h-12 text-base font-medium"
                            >
                              <Settings className="w-5 h-5 mr-2" />
                              Quick Settings
                            </Button>
                          </div>
                          
                          {/* Product Lookup Field */}
                          <FormField
                            control={form.control}
                            name="productLookup"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-medium">Product Lookup</FormLabel>
                                <div className="flex space-x-2">
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter barcode or product code" 
                                      {...field} 
                                      className="h-12 text-base flex-1"
                                    />
                                  </FormControl>
                                  <Button
                                    type="button"
                                    onClick={() => handleProductLookup(field.value || "")}
                                    disabled={!field.value?.trim()}
                                    className="h-12 px-4"
                                  >
                                    <Search className="w-4 h-4" />
                                  </Button>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {showQuickSettings && (
                            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                              <h4 className="font-medium text-sm">Quick Settings</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <Button variant="ghost" size="sm">Auto-fill nutrition</Button>
                                <Button variant="ghost" size="sm">Camera settings</Button>
                                <Button variant="ghost" size="sm">Default portion</Button>
                                <Button variant="ghost" size="sm">Favorites</Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Basic Information Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Basic Information</h3>
                          
                          <FormField
                            control={form.control}
                            name="productName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-medium">Product Name *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., Greek Yogurt" 
                                    {...field} 
                                    className="h-12 text-base"
                                  />
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
                                <FormLabel className="text-base font-medium">Brand</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., Chobani" 
                                    {...field} 
                                    className="h-12 text-base"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                    
                        {/* Serving Information Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Serving Information</h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="servingSize"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base font-medium">Amount *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.1" 
                                      min="0.1"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                      className="h-12 text-base text-center"
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
                                  <FormLabel className="text-base font-medium">Unit *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-12 text-base">
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
                        </div>
                    
                        {/* Nutrition Facts Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Nutrition Facts</h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="calories"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base font-medium">Calories</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="0"
                                      placeholder="0"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      className="h-12 text-base text-center"
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
                                  <FormLabel className="text-base font-medium">Protein (g)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.1" 
                                      min="0"
                                      placeholder="0"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      className="h-12 text-base text-center"
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
                                  <FormLabel className="text-base font-medium">Carbs (g)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.1" 
                                      min="0"
                                      placeholder="0"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      className="h-12 text-base text-center"
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
                                  <FormLabel className="text-base font-medium">Fat (g)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.1" 
                                      min="0"
                                      placeholder="0"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      className="h-12 text-base text-center"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                    
                        {/* Meal Details Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Meal Details</h3>
                          
                          <FormField
                            control={form.control}
                            name="mealType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-medium">Meal Type *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-12 text-base">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="breakfast">🥞 Breakfast</SelectItem>
                                    <SelectItem value="lunch">🥗 Lunch</SelectItem>
                                    <SelectItem value="dinner">🍽️ Dinner</SelectItem>
                                    <SelectItem value="snack">🍿 Snack</SelectItem>
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
                                <FormLabel className="text-base font-medium">When did you eat this?</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="datetime-local" 
                                    {...field} 
                                    className="h-12 text-base"
                                  />
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
                                <FormLabel className="text-base font-medium">Notes</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Any additional notes about this food..." 
                                    {...field} 
                                    className="min-h-[100px] text-base resize-none"
                                    rows={4}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                    
                      </form>
                    </Form>
                  </div>
                  
                  {/* Fixed Bottom Action Bar */}
                  <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/20 px-4 py-4 z-20 shadow-lg">
                    <div className="flex space-x-3 max-w-lg mx-auto">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddDialogOpen(false)}
                        className="flex-1 h-12 text-base font-medium"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={addEntryMutation.isPending}
                        onClick={form.handleSubmit(onSubmit)}
                        className="flex-1 h-12 text-base font-medium bg-primary hover:bg-primary/90"
                      >
                        {addEntryMutation.isPending ? "Adding..." : "Add Entry"}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                        <CardTitle className="capitalize">{mealType}</CardTitle>
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