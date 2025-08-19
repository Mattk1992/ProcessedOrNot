import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  Scale, 
  Activity,
  BarChart3,
  LineChart,
  AlertCircle,
  PieChart,
  Calculator
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import HeaderDropdown from "@/components/header-dropdown";
import LanguageSwitcher from "@/components/language-switcher";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";

interface ProgressStats {
  weeklyCalories: number[];
  weeklyWeight: number[];
  weeklyProcessingScore: number[];
  averageProcessingScore: number;
  totalEntries: number;
  streakDays: number;
  weightChange: number;
  calorieGoalAchievement: number;
}

interface WeightEntry {
  id: number;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  recordedAt: string;
  notes?: string;
  createdAt: string;
}

interface DailyStats {
  totalCalories: number;
  totalFat: number;
  totalCarbs: number;
  totalProteins: number;
  totalSalt: number;
  totalFiber: number;
  entriesCount: number;
  averageProcessingScore: number;
}

export default function NutriProgress() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("7"); // days
  const [progressType, setProgressType] = useState("weight");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const [weightFormData, setWeightFormData] = useState({
    weight: "",
    notes: "",
    recordedAt: new Date().toISOString().split('T')[0]
  });

  // Fetch progress statistics
  const { data: progressStats } = useQuery<ProgressStats>({
    queryKey: ["/api/nutrition/progress-stats", timeRange],
    enabled: isAuthenticated,
  });

  // Fetch weight entries
  const { data: weightEntries } = useQuery<WeightEntry[]>({
    queryKey: ["/api/weight-entries"],
    enabled: isAuthenticated,
  });

  // Fetch daily statistics
  const { data: dailyStats } = useQuery<DailyStats>({
    queryKey: ["/api/nutrition/daily-stats", selectedDate],
    enabled: isAuthenticated,
  });

  // Create weight entry mutation
  const createWeightEntryMutation = useMutation({
    mutationFn: async (data: { weight: number; notes?: string; recordedAt?: string }) => {
      const response = await apiRequest("POST", "/api/weight-entries", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Weight Entry Added",
        description: "Your weight has been recorded successfully.",
      });
      setIsWeightDialogOpen(false);
      setWeightFormData({
        weight: "",
        notes: "",
        recordedAt: new Date().toISOString().split('T')[0]
      });
      // Invalidate weight entries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/weight-entries"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add weight entry",
        variant: "destructive",
      });
    },
  });

  const handleWeightSubmit = () => {
    if (!weightFormData.weight) {
      toast({
        title: "Error",
        description: "Please enter your weight",
        variant: "destructive",
      });
      return;
    }

    const weight = parseFloat(weightFormData.weight);
    if (isNaN(weight) || weight <= 0 || weight > 1000) {
      toast({
        title: "Error",
        description: "Please enter a valid weight (1-1000 kg)",
        variant: "destructive",
      });
      return;
    }

    createWeightEntryMutation.mutate({
      weight: weight,
      notes: weightFormData.notes || undefined,
      recordedAt: weightFormData.recordedAt ? new Date(weightFormData.recordedAt).toISOString() : undefined
    });
  };

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
                  <p className="text-xs text-muted-foreground">Nutri Progress</p>
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
            <p className="text-muted-foreground">Please sign in to view your nutrition progress.</p>
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

  const stats = progressStats || {
    weeklyCalories: [],
    weeklyWeight: [],
    weeklyProcessingScore: [],
    averageProcessingScore: 0,
    totalEntries: 0,
    streakDays: 0,
    weightChange: 0,
    calorieGoalAchievement: 0,
  };

  const getProgressIcon = (value: number, isWeight = false) => {
    if (isWeight) {
      return value < 0 ? (
        <TrendingDown className="w-5 h-5 text-green-500" />
      ) : value > 0 ? (
        <TrendingUp className="w-5 h-5 text-red-500" />
      ) : (
        <Target className="w-5 h-5 text-blue-500" />
      );
    } else {
      return value > 0 ? (
        <TrendingUp className="w-5 h-5 text-green-500" />
      ) : value < 0 ? (
        <TrendingDown className="w-5 h-5 text-red-500" />
      ) : (
        <Target className="w-5 h-5 text-blue-500" />
      );
    }
  };

  const getProgressColor = (achievement: number) => {
    if (achievement >= 90) return "text-green-500";
    if (achievement >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Header */}
      <header className="backdrop-blur-md bg-background/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Progress</h2>
            <p className="text-muted-foreground">Track your nutrition and health journey</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={progressType} onValueChange={setProgressType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight">Weight</SelectItem>
                <SelectItem value="calories">Calories</SelectItem>
                <SelectItem value="processing">Processing Score</SelectItem>
                <SelectItem value="nutrients">Nutrients</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          {/* Progress Tab Content */}
          <TabsContent value="progress" className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weight Change</CardTitle>
              {getProgressIcon(stats.weightChange, true)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.weightChange > 0 ? '+' : ''}{stats.weightChange.toFixed(1)} kg
              </div>
              <p className="text-xs text-muted-foreground">
                Last {timeRange} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Score</CardTitle>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageProcessingScore.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Lower is better
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tracking Streak</CardTitle>
              <Calendar className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streakDays}</div>
              <p className="text-xs text-muted-foreground">
                Days in a row
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Goal Achievement</CardTitle>
              <Target className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getProgressColor(stats.calorieGoalAchievement)}`}>
                {stats.calorieGoalAchievement.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Calorie goals met
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="w-5 h-5" />
                  <span>{progressType.charAt(0).toUpperCase() + progressType.slice(1)} Trend</span>
                </CardTitle>
                <CardDescription>
                  Your {progressType} over the last {timeRange} days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Chart visualization would appear here</p>
                    <p className="text-sm">Integration with charting library needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
                <CardDescription>
                  Overview of your progress this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Days tracked:</span>
                    <Badge variant="outline">{Math.min(7, stats.totalEntries)} / 7</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tracking consistency</span>
                      <span>{((Math.min(7, stats.totalEntries) / 7) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(Math.min(7, stats.totalEntries) / 7) * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Goal achievement</span>
                      <span>{stats.calorieGoalAchievement.toFixed(0)}%</span>
                    </div>
                    <Progress value={stats.calorieGoalAchievement} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Weight Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="w-5 h-5" />
                  <span>Weight History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weightEntries && weightEntries.length > 0 ? (
                  <div className="space-y-3">
                    {weightEntries.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="font-medium">{entry.weight} kg</p>
                          <p className="text-muted-foreground">
                            {new Date(entry.recordedAt).toLocaleDateString()}
                          </p>
                          {entry.notes && (
                            <p className="text-xs text-muted-foreground">{entry.notes}</p>
                          )}
                        </div>
                        {entry.bodyFat && (
                          <Badge variant="outline">
                            {entry.bodyFat}% BF
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Scale className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No weight entries yet</p>
                    <Dialog open={isWeightDialogOpen} onOpenChange={setIsWeightDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="mt-2">
                          Add Weight Entry
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Weight Entry</DialogTitle>
                          <DialogDescription>
                            Record your current weight to track your progress.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                              id="weight"
                              type="number"
                              min="1"
                              max="1000"
                              step="0.1"
                              placeholder="70.5"
                              value={weightFormData.weight}
                              onChange={(e) => setWeightFormData(prev => ({ ...prev, weight: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="recordedAt">Date</Label>
                            <Input
                              id="recordedAt"
                              type="date"
                              value={weightFormData.recordedAt}
                              onChange={(e) => setWeightFormData(prev => ({ ...prev, recordedAt: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="notes">Notes (optional)</Label>
                            <Textarea
                              id="notes"
                              placeholder="Any notes about this weight entry..."
                              value={weightFormData.notes}
                              onChange={(e) => setWeightFormData(prev => ({ ...prev, notes: e.target.value }))}
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button 
                              onClick={handleWeightSubmit}
                              disabled={createWeightEntryMutation.isPending}
                              className="flex-1"
                            >
                              {createWeightEntryMutation.isPending ? "Adding..." : "Add Entry"}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setIsWeightDialogOpen(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Processing Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Processing Score</CardTitle>
                <CardDescription>
                  Your food quality this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Minimally Processed</span>
                    <Badge variant="default">40%</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Processed</span>
                    <Badge variant="secondary">35%</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ultra-Processed</span>
                    <Badge variant="destructive">25%</Badge>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Average Score</span>
                      <Badge variant={stats.averageProcessingScore <= 5 ? "default" : "destructive"}>
                        {stats.averageProcessingScore.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
          </TabsContent>

          {/* Stats Tab Content */}
          <TabsContent value="stats" className="space-y-6">
            {/* Daily Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Calories</CardTitle>
                  <PieChart className="w-4 h-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dailyStats?.totalCalories?.toFixed(0) || '0'} kcal
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Fat</CardTitle>
                  <PieChart className="w-4 h-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dailyStats?.totalFat?.toFixed(1) || '0.0'} g
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Carbs</CardTitle>
                  <PieChart className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dailyStats?.totalCarbs?.toFixed(1) || '0.0'} g
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Proteins</CardTitle>
                  <PieChart className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dailyStats?.totalProteins?.toFixed(1) || '0.0'} g
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Date Selector for Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Daily Statistics</span>
                </CardTitle>
                <CardDescription>
                  View nutrition totals for any specific date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <label htmlFor="date-select" className="text-sm font-medium">Select Date:</label>
                  <input
                    id="date-select"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                {dailyStats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Calories</span>
                        <Badge variant="outline">{dailyStats.totalCalories?.toFixed(0) || '0'} kcal</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Fat</span>
                        <Badge variant="outline">{dailyStats.totalFat?.toFixed(1) || '0.0'} g</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Carbohydrates</span>
                        <Badge variant="outline">{dailyStats.totalCarbs?.toFixed(1) || '0.0'} g</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Proteins</span>
                        <Badge variant="outline">{dailyStats.totalProteins?.toFixed(1) || '0.0'} g</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Salt</span>
                        <Badge variant="outline">{dailyStats.totalSalt?.toFixed(1) || '0.0'} g</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Fiber</span>
                        <Badge variant="outline">{dailyStats.totalFiber?.toFixed(1) || '0.0'} g</Badge>
                      </div>
                    </div>
                  </div>
                )}
                
                {!dailyStats && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No nutrition data found for this date.</p>
                    <p className="text-sm">Try selecting a different date or log some food entries.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}