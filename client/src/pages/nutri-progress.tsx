import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
}

export default function NutriProgress() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState("7"); // days
  const [progressType, setProgressType] = useState("weight");

  // Fetch progress statistics
  const { data: progressStats } = useQuery<ProgressStats>({
    queryKey: ["/api/nutrition/progress-stats", timeRange],
    enabled: isAuthenticated,
  });

  // Fetch weight entries
  const { data: weightEntries } = useQuery<WeightEntry[]>({
    queryKey: ["/api/nutrition/weight-entries", timeRange],
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
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src={logoPath} alt="ProcessedOrNot Scanner" className="w-10 h-10 rounded-full" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold gradient-text">ProcessedOrNot</h1>
                <p className="text-xs text-muted-foreground">Nutri Progress</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/nutri-dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/nutri-dashboard/diary" className="text-muted-foreground hover:text-foreground transition-colors">Diary</Link>
              <Link href="/nutri-dashboard/progress" className="text-foreground font-medium">Progress</Link>
              <Link href="/nutri-dashboard/profile" className="text-muted-foreground hover:text-foreground transition-colors">Profile</Link>
            </nav>

            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <HeaderDropdown />
            </div>
          </div>
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
                    <Link href="/nutri-profile">
                      <Button variant="outline" size="sm" className="mt-2">
                        Add Weight Entry
                      </Button>
                    </Link>
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

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/nutri-diary">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    Log Today's Food
                  </Button>
                </Link>
                
                <Link href="/nutri-profile">
                  <Button variant="outline" className="w-full justify-start">
                    <Scale className="w-4 h-4 mr-2" />
                    Record Weight
                  </Button>
                </Link>
                
                <Link href="/nutri-profile">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="w-4 h-4 mr-2" />
                    Update Goals
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}