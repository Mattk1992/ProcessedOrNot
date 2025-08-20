import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Calendar,
  Settings,
  BarChart3,
  Zap,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Clock,
  MessageSquare,
  Cpu,
  Database
} from "lucide-react";

interface AIModelCosts {
  model: string;
  totalCost: number;
  tokensUsed: number;
  requestCount: number;
  averageCostPerRequest: number;
  inputCost: number;
  outputCost: number;
  percentage: number;
}

interface AIFeatureCosts {
  feature: string;
  displayName: string;
  totalCost: number;
  requestCount: number;
  averageTokens: number;
  percentage: number;
  color: string;
}

interface AICostStats {
  totalMonthlyCost: number;
  totalTokensUsed: number;
  totalRequests: number;
  averageCostPerRequest: number;
  averageCostPerToken: number;
  monthlyGrowth: number;
  modelCosts: AIModelCosts[];
  featureCosts: AIFeatureCosts[];
  dailyCosts: { date: string; cost: number; requests: number }[];
}

export default function AdminAICosts() {
  const [dateFilter, setDateFilter] = useState("30days");
  const [modelFilter, setModelFilter] = useState("all");
  const [featureFilter, setFeatureFilter] = useState("all");

  // Query AI cost data from prompt history
  const { data: aiCostData, isLoading } = useQuery<AICostStats>({
    queryKey: ["/api/admin/ai-costs", { dateFilter, modelFilter, featureFilter }],
    queryFn: async () => {
      // This would normally query the prompt history database to calculate costs
      // Mock data based on realistic AI usage patterns
      return {
        totalMonthlyCost: 892.45,
        totalTokensUsed: 12847593,
        totalRequests: 45678,
        averageCostPerRequest: 0.0195,
        averageCostPerToken: 0.0000695,
        monthlyGrowth: 23.7,
        modelCosts: [
          {
            model: "gpt-4o",
            totalCost: 567.23,
            tokensUsed: 4235891,
            requestCount: 18934,
            averageCostPerRequest: 0.0299,
            inputCost: 341.45,
            outputCost: 225.78,
            percentage: 63.6
          },
          {
            model: "gpt-4o-mini",
            totalCost: 234.12,
            tokensUsed: 6789123,
            requestCount: 21456,
            averageCostPerRequest: 0.0109,
            inputCost: 140.67,
            outputCost: 93.45,
            percentage: 26.2
          },
          {
            model: "gpt-4-turbo",
            totalCost: 78.45,
            tokensUsed: 1456789,
            requestCount: 4123,
            averageCostPerRequest: 0.0190,
            inputCost: 47.12,
            outputCost: 31.33,
            percentage: 8.8
          },
          {
            model: "gpt-3.5-turbo",
            totalCost: 12.65,
            tokensUsed: 365890,
            requestCount: 1165,
            averageCostPerRequest: 0.0109,
            inputCost: 7.59,
            outputCost: 5.06,
            percentage: 1.4
          }
        ],
        featureCosts: [
          {
            feature: "ingredient_analysis",
            displayName: "Ingredient Analysis",
            totalCost: 423.67,
            requestCount: 18234,
            averageTokens: 1250,
            percentage: 47.5,
            color: "bg-blue-500"
          },
          {
            feature: "nutribot",
            displayName: "NutriBot Chat",
            totalCost: 267.89,
            requestCount: 12456,
            averageTokens: 890,
            percentage: 30.0,
            color: "bg-green-500"
          },
          {
            feature: "nutrition_analysis",
            displayName: "Nutrition Analysis",
            totalCost: 145.23,
            requestCount: 8901,
            averageTokens: 675,
            percentage: 16.3,
            color: "bg-purple-500"
          },
          {
            feature: "schedule_generation",
            displayName: "Schedule Generation",
            totalCost: 34.78,
            requestCount: 3456,
            averageTokens: 1450,
            percentage: 3.9,
            color: "bg-orange-500"
          },
          {
            feature: "production_process",
            displayName: "Production Process",
            totalCost: 20.88,
            requestCount: 2631,
            averageTokens: 445,
            percentage: 2.3,
            color: "bg-red-500"
          }
        ],
        dailyCosts: [
          // Mock daily data for last 30 days
          { date: "2024-01-20", cost: 28.45, requests: 1456 },
          { date: "2024-01-19", cost: 31.23, requests: 1678 },
          // ... more daily data would be here
        ]
      } as AICostStats;
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            AI Cost Filters
          </CardTitle>
          <CardDescription>
            Filter AI cost data by time period, model, and features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date-filter">Time Period</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="1year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="model-filter">AI Model</Label>
              <Select value={modelFilter} onValueChange={setModelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All models" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="feature-filter">Feature</Label>
              <Select value={featureFilter} onValueChange={setFeatureFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All features" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Features</SelectItem>
                  <SelectItem value="ingredient_analysis">Ingredient Analysis</SelectItem>
                  <SelectItem value="nutribot">NutriBot</SelectItem>
                  <SelectItem value="nutrition_analysis">Nutrition Analysis</SelectItem>
                  <SelectItem value="schedule_generation">Schedule Generation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total AI Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(aiCostData?.totalMonthlyCost || 0)}
            </div>
            <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 mt-1">
              <TrendingUp className="w-3 h-3" />
              +{aiCostData?.monthlyGrowth || 0}% vs last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Tokens Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatTokens(aiCostData?.totalTokensUsed || 0)}
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Total tokens processed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              AI Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {formatNumber(aiCostData?.totalRequests || 0)}
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
              Total AI API calls
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Avg Cost/Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {formatCurrency(aiCostData?.averageCostPerRequest || 0)}
            </div>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
              Per AI request
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Model Costs Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Cost by AI Model
            </CardTitle>
            <CardDescription>
              Spending breakdown by OpenAI models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiCostData?.modelCosts.map((model, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="font-mono">
                        {model.model}
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatNumber(model.requestCount)} requests
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {formatCurrency(model.totalCost)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {model.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Tokens: {formatTokens(model.tokensUsed)}</span>
                    <span>Avg: {formatCurrency(model.averageCostPerRequest)}/req</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${model.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Cost by Feature
            </CardTitle>
            <CardDescription>
              Spending breakdown by application features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiCostData?.featureCosts.map((feature, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${feature.color}`}></div>
                    <div>
                      <div className="text-sm font-medium">{feature.displayName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatNumber(feature.requestCount)} requests • Avg {feature.averageTokens} tokens
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">
                      {formatCurrency(feature.totalCost)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {feature.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Optimization Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Cost Optimization Insights
          </CardTitle>
          <CardDescription>
            Analysis and recommendations from prompt history data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium text-sm">High Efficiency</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                GPT-4o Mini usage increased by 45%, reducing costs by $156/month while maintaining quality.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-sm">Optimization Opportunity</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ingredient analysis prompts average 1,250 tokens. Optimization could reduce by 20%.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-sm">Usage Pattern</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Peak usage between 2-4 PM EST. Consider rate limiting for cost control.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}