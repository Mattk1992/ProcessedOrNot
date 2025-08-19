import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Award, 
  Crown,
  ArrowLeft,
  Users,
  ChevronRight,
  Zap
} from "lucide-react";

interface UserLevel {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  levelTitle: string;
  achievements: string[];
  rank: string;
}

interface LevelReward {
  level: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  unlocked: boolean;
}

export default function LevelingPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Set page title
  useEffect(() => {
    document.title = "User Leveling - ProcessedOrNot";
  }, []);

  // Mock data for now - this would come from API in real implementation
  const mockUserLevel: UserLevel = {
    currentLevel: 7,
    currentXP: 2340,
    nextLevelXP: 3000,
    totalXP: 12340,
    levelTitle: "Nutrition Explorer",
    achievements: ["First Scan", "Weekly Warrior", "Health Conscious"],
    rank: "Advanced"
  };

  const levelRewards: LevelReward[] = [
    {
      level: 1,
      title: "Scanner Novice",
      description: "Complete your first product scan",
      icon: Target,
      unlocked: true
    },
    {
      level: 5,
      title: "Health Seeker", 
      description: "Scan 50 different products",
      icon: TrendingUp,
      unlocked: true
    },
    {
      level: 10,
      title: "Nutrition Expert",
      description: "Analyze ingredients for 100 products",
      icon: Award,
      unlocked: false
    },
    {
      level: 15,
      title: "Wellness Guru",
      description: "Maintain healthy eating streak for 30 days", 
      icon: Crown,
      unlocked: false
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading leveling data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  const progressPercentage = (mockUserLevel.currentXP / mockUserLevel.nextLevelXP) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/profile')}
            className="flex items-center gap-2 hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Your Leveling Progress
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your nutrition journey and unlock achievements
          </p>
        </div>

        <div className="grid gap-6">
          {/* Current Level Card */}
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200 dark:border-blue-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Crown className="w-6 h-6 text-yellow-500" />
                    Level {mockUserLevel.currentLevel}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {mockUserLevel.levelTitle}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {mockUserLevel.rank}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* XP Progress */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Experience Points</span>
                  <span className="text-sm text-muted-foreground">
                    {mockUserLevel.currentXP} / {mockUserLevel.nextLevelXP} XP
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {mockUserLevel.nextLevelXP - mockUserLevel.currentXP} XP until next level
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{mockUserLevel.totalXP.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total XP</div>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{mockUserLevel.achievements.length}</div>
                  <div className="text-sm text-muted-foreground">Achievements</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Recent Achievements
              </CardTitle>
              <CardDescription>
                Your latest accomplishments in your nutrition journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockUserLevel.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Award className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      {achievement}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Level Rewards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                Level Rewards & Milestones
              </CardTitle>
              <CardDescription>
                Unlock new titles and features as you progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {levelRewards.map((reward) => (
                  <div 
                    key={reward.level}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      reward.unlocked 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        reward.unlocked 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                      }`}>
                        <reward.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          Level {reward.level}: {reward.title}
                          {reward.unlocked && <Badge variant="outline" className="text-xs">Unlocked</Badge>}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {reward.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${
                      reward.unlocked ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* How to Earn XP */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                How to Earn XP
              </CardTitle>
              <CardDescription>
                Different activities earn you experience points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    +10
                  </div>
                  <span className="text-sm">Scanning a new product</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    +25
                  </div>
                  <span className="text-sm">Analyzing ingredients</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    +50
                  </div>
                  <span className="text-sm">Daily nutrition tracking</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    +100
                  </div>
                  <span className="text-sm">Completing weekly goals</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}