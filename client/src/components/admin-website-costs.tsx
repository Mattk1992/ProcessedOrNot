import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Database, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Calendar,
  Settings,
  BarChart3,
  Zap,
  AlertCircle,
  CheckCircle,
  Server,
  Clock
} from "lucide-react";
import AdminAICosts from "./admin-ai-costs";

interface WebsiteCostStats {
  totalMonthlyCost: number;
  aiCosts: number;
  hostingCosts: number;
  databaseCosts: number;
  thirdPartyCosts: number;
  bandwidthCosts: number;
  storageCosts: number;
  totalRequests: number;
  costPerRequest: number;
  monthlyGrowth: number;
}

export default function AdminWebsiteCosts() {
  const [activeCostTab, setActiveCostTab] = useState("overview");

  // Mock data - in real app this would come from API
  const { data: costStats } = useQuery<WebsiteCostStats>({
    queryKey: ["/api/admin/website-costs/stats"],
    queryFn: async () => {
      // Mock data for now
      return {
        totalMonthlyCost: 1247.83,
        aiCosts: 892.45,
        hostingCosts: 129.99,
        databaseCosts: 89.99,
        thirdPartyCosts: 67.50,
        bandwidthCosts: 45.90,
        storageCosts: 22.00,
        totalRequests: 156789,
        costPerRequest: 0.008,
        monthlyGrowth: 15.3
      } as WebsiteCostStats;
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

  const getCostBreakdown = () => [
    { name: "AI Services", amount: costStats?.aiCosts || 0, percentage: 71.5, color: "bg-blue-500" },
    { name: "Hosting", amount: costStats?.hostingCosts || 0, percentage: 10.4, color: "bg-green-500" },
    { name: "Database", amount: costStats?.databaseCosts || 0, percentage: 7.2, color: "bg-purple-500" },
    { name: "Third-party APIs", amount: costStats?.thirdPartyCosts || 0, percentage: 5.4, color: "bg-orange-500" },
    { name: "Bandwidth", amount: costStats?.bandwidthCosts || 0, percentage: 3.7, color: "bg-red-500" },
    { name: "Storage", amount: costStats?.storageCosts || 0, percentage: 1.8, color: "bg-gray-500" },
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeCostTab} onValueChange={setActiveCostTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-1 rounded-xl">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="ai-costs" 
            className="flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">AI Costs</span>
          </TabsTrigger>
          <TabsTrigger 
            value="infrastructure" 
            className="flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
          >
            <Server className="w-4 h-4" />
            <span className="hidden sm:inline">Infrastructure</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Website Costs Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Monthly Cost */}
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Monthly Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {formatCurrency(costStats?.totalMonthlyCost || 0)}
                </div>
                <div className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +{costStats?.monthlyGrowth || 0}% vs last month
                </div>
              </CardContent>
            </Card>

            {/* AI Costs */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(costStats?.aiCosts || 0)}
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  71.5% of total cost
                </p>
              </CardContent>
            </Card>

            {/* Total Requests */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Monthly Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatNumber(costStats?.totalRequests || 0)}
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  API & AI requests
                </p>
              </CardContent>
            </Card>

            {/* Cost Per Request */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Cost/Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  ${(costStats?.costPerRequest || 0).toFixed(4)}
                </div>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                  Average per request
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cost Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Cost Breakdown
                </CardTitle>
                <CardDescription>
                  Monthly spending by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getCostBreakdown().map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">
                          {item.percentage}%
                        </Badge>
                        <span className="font-semibold text-sm">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Cost Efficiency Metrics
                </CardTitle>
                <CardDescription>
                  Performance and optimization indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Growth</span>
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                      <TrendingUp className="w-3 h-3" />
                      <span className="font-semibold">+{costStats?.monthlyGrowth || 0}%</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cost per User</span>
                    <span className="font-semibold">$0.58</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Infrastructure Efficiency</span>
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      <span className="font-semibold">92%</span>
                    </div>
                  </div>

                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">AI Cost Optimization</span>
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <Activity className="w-3 h-3" />
                      <span className="font-semibold">85%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Costs Tab */}
        <TabsContent value="ai-costs" className="mt-6">
          <AdminAICosts />
        </TabsContent>

        {/* Infrastructure Tab */}
        <TabsContent value="infrastructure" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Infrastructure Costs
              </CardTitle>
              <CardDescription>
                Hosting, database, and infrastructure expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Server className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Infrastructure Management</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Infrastructure cost tracking and optimization tools will be implemented here.
                </p>
                <Button disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Cost Analytics
              </CardTitle>
              <CardDescription>
                Detailed cost analysis and forecasting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Cost Analytics</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Advanced analytics, cost forecasting, and optimization recommendations will be available here.
                </p>
                <Button disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}