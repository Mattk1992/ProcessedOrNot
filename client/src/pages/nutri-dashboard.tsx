import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Apple, 
  Utensils, 
  Activity,
  Plus,
  ChevronRight,
  Award,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import HeaderDropdown from "@/components/header-dropdown";
import LanguageSwitcher from "@/components/language-switcher";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";

interface NutritionGoals {
  dailyCalories: number;
  dailyFat: number;
  dailyCarbs: number;
  dailyProteins: number;
  dailySalt: number;
  dailyFiber: number;
  maxProcessingScore: number;
}

interface DailyProgress {
  calories: number;
  fat: number;
  carbs: number;
  proteins: number;
  salt: number;
  fiber: number;
  averageProcessingScore: number;
  entriesCount: number;
}

interface WeightProgress {
  currentWeight: number;
  weightChange: number;
  lastWeighed: string;
}

export default function NutriDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch user nutrition goals
  const { data: goals } = useQuery<NutritionGoals>({
    queryKey: ["/api/nutrition/goals"],
    enabled: isAuthenticated,
  });

  // Fetch daily progress
  const { data: dailyProgress } = useQuery<DailyProgress>({
    queryKey: ["/api/nutrition/daily-progress", selectedDate],
    enabled: isAuthenticated,
  });

  // Fetch weight progress
  const { data: weightProgress } = useQuery<WeightProgress>({
    queryKey: ["/api/nutrition/weight-progress"],
    enabled: isAuthenticated,
  });

  // Fetch recent diary entries
  const { data: recentEntries } = useQuery({
    queryKey: ["/api/nutrition/recent-entries"],
    enabled: isAuthenticated,
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
                  <p className="text-xs text-muted-foreground">Nutri Dashboard</p>
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
            <p className="text-muted-foreground">Please sign in to access your nutrition dashboard.</p>
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

  const defaultGoals: NutritionGoals = {
    dailyCalories: 2000,
    dailyFat: 65,
    dailyCarbs: 300,
    dailyProteins: 50,
    dailySalt: 6,
    dailyFiber: 25,
    maxProcessingScore: 5,
  };

  const currentGoals = goals || defaultGoals;
  const progress = dailyProgress || {
    calories: 0,
    fat: 0,
    carbs: 0,
    proteins: 0,
    salt: 0,
    fiber: 0,
    averageProcessingScore: 0,
    entriesCount: 0,
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number, reverse = false) => {
    if (reverse) {
      // For processing score - lower is better
      if (percentage < 50) return "bg-green-500";
      if (percentage < 80) return "bg-yellow-500";
      return "bg-red-500";
    } else {
      // For nutrients - closer to target is better
      if (percentage < 50) return "bg-red-500";
      if (percentage < 80) return "bg-yellow-500";
      if (percentage <= 100) return "bg-green-500";
      return "bg-orange-500";
    }
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
                <p className="text-xs text-muted-foreground">Nutri Dashboard</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/nutri-dashboard" className="text-foreground font-medium">Dashboard</Link>
              <Link href="/nutri-diary" className="text-muted-foreground hover:text-foreground transition-colors">Diary</Link>
              <Link href="/nutri-progress" className="text-muted-foreground hover:text-foreground transition-colors">Progress</Link>
              <Link href="/nutri-profile" className="text-muted-foreground hover:text-foreground transition-colors">Profile</Link>
            </nav>

            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <HeaderDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName || user?.username}!</h2>
          <p className="text-muted-foreground">Here's your nutrition overview for today</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/nutri-diary">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Plus className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-medium">Add Food</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/product-lookup">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Utensils className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-medium">Scan Product</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/nutri-progress">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="font-medium">View Progress</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/nutri-profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="font-medium">Set Goals</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Today's Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calories Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Calories</span>
                  </CardTitle>
                  <Badge variant="outline">
                    {progress.calories} / {currentGoals.dailyCalories}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress 
                  value={getProgressPercentage(progress.calories, currentGoals.dailyCalories)} 
                  className="mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  {currentGoals.dailyCalories - progress.calories} calories remaining
                </p>
              </CardContent>
            </Card>

            {/* Macronutrients */}
            <Card>
              <CardHeader>
                <CardTitle>Macronutrients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Carbs</span>
                      <span>{progress.carbs}g / {currentGoals.dailyCarbs}g</span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(progress.carbs, currentGoals.dailyCarbs)}
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Protein</span>
                      <span>{progress.proteins}g / {currentGoals.dailyProteins}g</span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(progress.proteins, currentGoals.dailyProteins)}
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fat</span>
                      <span>{progress.fat}g / {currentGoals.dailyFat}g</span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(progress.fat, currentGoals.dailyFat)}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Food Processing Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span>Average Score Today</span>
                  <Badge variant={progress.averageProcessingScore <= currentGoals.maxProcessingScore ? "default" : "destructive"}>
                    {progress.averageProcessingScore.toFixed(1)} / {currentGoals.maxProcessingScore}
                  </Badge>
                </div>
                <Progress 
                  value={getProgressPercentage(progress.averageProcessingScore, 10)}
                  className="h-3"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {progress.averageProcessingScore <= currentGoals.maxProcessingScore 
                    ? "Great! You're eating minimally processed foods" 
                    : "Try to choose less processed foods"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weight Progress */}
            {weightProgress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Weight</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{weightProgress.currentWeight} kg</p>
                    <p className={`text-sm ${weightProgress.weightChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {weightProgress.weightChange >= 0 ? '+' : ''}{weightProgress.weightChange} kg this week
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last weighed: {new Date(weightProgress.lastWeighed).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Today's Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Meals logged:</span>
                    <span className="font-medium">{progress.entriesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fiber:</span>
                    <span className="font-medium">{progress.fiber}g / {currentGoals.dailyFiber}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salt:</span>
                    <span className="font-medium">{progress.salt}g / {currentGoals.dailySalt}g</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Entries */}
            {recentEntries && Array.isArray(recentEntries) && recentEntries.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Entries</CardTitle>
                    <Link href="/nutri-diary">
                      <Button variant="ghost" size="sm">
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentEntries.slice(0, 3).map((entry: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium">{entry.productName}</p>
                          <p className="text-muted-foreground">{entry.mealType}</p>
                        </div>
                        <Badge variant="outline">{entry.calories} cal</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}