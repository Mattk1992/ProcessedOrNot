import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Search,
  Crown,
  Shield,
  Zap,
  Users,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

interface Subscription {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'expired' | 'pending';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  createdAt: string;
  lastPayment: string;
}

export default function AdminSubscriptionManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");

  // Mock data - in real app this would come from API
  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/admin/subscriptions"],
    queryFn: async () => {
      // Mock data for now
      return [
        {
          id: "sub_1234567890",
          userId: 1,
          userName: "John Doe",
          userEmail: "john.doe@example.com",
          plan: "pro",
          status: "active",
          currentPeriodStart: "2024-01-01",
          currentPeriodEnd: "2024-02-01",
          amount: 9.99,
          currency: "USD",
          interval: "monthly",
          createdAt: "2024-01-01",
          lastPayment: "2024-01-15"
        },
        {
          id: "sub_0987654321",
          userId: 2,
          userName: "Jane Smith",
          userEmail: "jane.smith@example.com",
          plan: "enterprise",
          status: "active",
          currentPeriodStart: "2024-01-01",
          currentPeriodEnd: "2025-01-01",
          amount: 499.99,
          currency: "USD",
          interval: "yearly",
          createdAt: "2024-01-01",
          lastPayment: "2024-01-01"
        },
        {
          id: "sub_1122334455",
          userId: 3,
          userName: "Bob Johnson",
          userEmail: "bob.johnson@example.com",
          plan: "pro",
          status: "canceled",
          currentPeriodStart: "2024-01-01",
          currentPeriodEnd: "2024-02-01",
          amount: 99.99,
          currency: "USD",
          interval: "yearly",
          createdAt: "2023-12-01",
          lastPayment: "2024-01-01"
        }
      ] as Subscription[];
    },
  });

  // Mock mutation for updating subscription status
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ subscriptionId, action }: { subscriptionId: string; action: string }) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  const handleSubscriptionAction = (subscriptionId: string, action: string) => {
    updateSubscriptionMutation.mutate({ subscriptionId, action });
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free': return Shield;
      case 'pro': return Zap;
      case 'enterprise': return Crown;
      default: return Shield;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'pro': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'enterprise': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'canceled': return XCircle;
      case 'expired': return AlertTriangle;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'canceled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'expired': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredSubscriptions = subscriptions?.filter(sub => {
    const matchesSearch = !searchQuery || 
      sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesPlan = planFilter === 'all' || sub.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const subscriptionStats = {
    total: subscriptions?.length || 0,
    active: subscriptions?.filter(s => s.status === 'active').length || 0,
    canceled: subscriptions?.filter(s => s.status === 'canceled').length || 0,
    expired: subscriptions?.filter(s => s.status === 'expired').length || 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold mt-2">{subscriptionStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Active</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-green-600">{subscriptionStats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">Canceled</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-red-600">{subscriptionStats.canceled}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Expired</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-orange-600">{subscriptionStats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="plan-filter">Plan</Label>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setPlanFilter("all");
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Subscription Management
          </CardTitle>
          <CardDescription>
            Manage user subscriptions, view details, and perform actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions && filteredSubscriptions.length > 0 ? (
            <div className="space-y-4">
              {filteredSubscriptions.map((subscription) => {
                const PlanIcon = getPlanIcon(subscription.plan);
                const StatusIcon = getStatusIcon(subscription.status);
                
                return (
                  <div key={subscription.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                      {/* User Info */}
                      <div className="lg:col-span-2">
                        <div className="font-semibold text-sm">{subscription.userName}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{subscription.userEmail}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">{subscription.id}</div>
                      </div>
                      
                      {/* Plan & Status */}
                      <div className="flex flex-col gap-2">
                        <Badge className={getPlanColor(subscription.plan)}>
                          <PlanIcon className="w-3 h-3 mr-1" />
                          {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                        </Badge>
                        <Badge className={getStatusColor(subscription.status)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </Badge>
                      </div>
                      
                      {/* Billing Info */}
                      <div className="text-sm">
                        <div className="font-semibold">
                          {formatCurrency(subscription.amount, subscription.currency)}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          per {subscription.interval}
                        </div>
                      </div>
                      
                      {/* Dates */}
                      <div className="text-sm">
                        <div className="text-gray-600 dark:text-gray-400">Expires:</div>
                        <div className="font-medium">{formatDate(subscription.currentPeriodEnd)}</div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        {subscription.status === 'active' ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSubscriptionAction(subscription.id, 'cancel')}
                            disabled={updateSubscriptionMutation.isPending}
                          >
                            <XCircle className="w-3 h-3 text-red-500" />
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSubscriptionAction(subscription.id, 'reactivate')}
                            disabled={updateSubscriptionMutation.isPending}
                          >
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No subscriptions found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || statusFilter !== 'all' || planFilter !== 'all' 
                  ? "Try adjusting your filters to see more results."
                  : "No subscription data available at the moment."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}