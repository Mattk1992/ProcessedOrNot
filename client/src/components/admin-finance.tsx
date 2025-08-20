import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Settings,
  BarChart3,
  Crown,
  AlertCircle,
  CheckCircle,
  Server
} from "lucide-react";
import AdminSubscriptionManagement from "./admin-subscription-management";
import AdminWebsiteCosts from "./admin-website-costs";

interface FinanceStats {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  totalCustomers: number;
  freeUsers: number;
  proUsers: number;
  enterpriseUsers: number;
  revenueGrowth: number;
  subscriptionGrowth: number;
}

export default function AdminFinance() {
  const [activeFinanceTab, setActiveFinanceTab] = useState("overview");

  // Mock data - in real app this would come from API
  const { data: financeStats } = useQuery<FinanceStats>({
    queryKey: ["/api/admin/finance/stats"],
    queryFn: async () => {
      // Mock data for now
      return {
        totalRevenue: 45890.50,
        monthlyRevenue: 12350.75,
        activeSubscriptions: 1847,
        churnRate: 3.2,
        averageRevenuePerUser: 24.85,
        totalCustomers: 2156,
        freeUsers: 1234,
        proUsers: 789,
        enterpriseUsers: 133,
        revenueGrowth: 18.5,
        subscriptionGrowth: 12.3
      } as FinanceStats;
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeFinanceTab} onValueChange={setActiveFinanceTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-1 rounded-xl">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="subscriptions" 
            className="flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            <Crown className="w-4 h-4" />
            <span className="hidden sm:inline">Subscriptions</span>
          </TabsTrigger>
          <TabsTrigger 
            value="payments" 
            className="flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger 
            value="website-costs" 
            className="flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white"
          >
            <Server className="w-4 h-4" />
            <span className="hidden sm:inline">Costs</span>
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-gray-600 data-[state=active]:text-white"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Finance Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(financeStats?.totalRevenue || 0)}
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +{financeStats?.revenueGrowth || 0}% vs last month
                </div>
              </CardContent>
            </Card>

            {/* Monthly Revenue */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(financeStats?.monthlyRevenue || 0)}
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Current month
                </p>
              </CardContent>
            </Card>

            {/* Active Subscriptions */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Active Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {financeStats?.activeSubscriptions?.toLocaleString() || 0}
                </div>
                <div className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +{financeStats?.subscriptionGrowth || 0}% growth
                </div>
              </CardContent>
            </Card>

            {/* Average Revenue Per User */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  ARPU
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {formatCurrency(financeStats?.averageRevenuePerUser || 0)}
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  Average revenue per user
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of users by subscription plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-sm">Free Users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{financeStats?.freeUsers?.toLocaleString() || 0}</span>
                      <Badge variant="secondary">
                        {((financeStats?.freeUsers || 0) / (financeStats?.totalCustomers || 1) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Pro Users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{financeStats?.proUsers?.toLocaleString() || 0}</span>
                      <Badge variant="secondary">
                        {((financeStats?.proUsers || 0) / (financeStats?.totalCustomers || 1) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Enterprise Users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{financeStats?.enterpriseUsers?.toLocaleString() || 0}</span>
                      <Badge variant="secondary">
                        {((financeStats?.enterpriseUsers || 0) / (financeStats?.totalCustomers || 1) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Key Metrics
                </CardTitle>
                <CardDescription>
                  Important financial indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{financeStats?.churnRate || 0}%</span>
                      {(financeStats?.churnRate || 0) < 5 ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Customers</span>
                    <span className="font-semibold">{financeStats?.totalCustomers?.toLocaleString() || 0}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Revenue Growth</span>
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <TrendingUp className="w-3 h-3" />
                      <span className="font-semibold">+{financeStats?.revenueGrowth || 0}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription Management Tab */}
        <TabsContent value="subscriptions" className="mt-6">
          <AdminSubscriptionManagement />
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Management
              </CardTitle>
              <CardDescription>
                View and manage payment transactions and methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Payment Management</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Payment processing and transaction management features will be implemented here.
                </p>
                <Button disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Website Costs Tab */}
        <TabsContent value="website-costs" className="mt-6">
          <AdminWebsiteCosts />
        </TabsContent>

        {/* Finance Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Finance Settings
              </CardTitle>
              <CardDescription>
                Configure billing, payment methods, and financial preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Finance Settings</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Financial configuration and billing settings will be available here.
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