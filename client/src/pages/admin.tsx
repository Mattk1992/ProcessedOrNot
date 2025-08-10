import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Users, BarChart3, Settings, UserCheck, UserX, Crown, ArrowLeft, History, Database, Mic, Gift } from "lucide-react";
import { Link, useLocation } from "wouter";
import AdminSettings from "@/components/admin-settings";
import DebugCascadingDB from "@/components/debug-cascading-db";
import SpeechSettings from "@/components/speech-settings";
import ProductManagement from "@/components/product-management";
import AdminRewardingSystem from "@/components/admin-rewarding-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: number;
  username: string;
  email: string;
  accountType: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface AdminStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  verifiedUsers: number;
  totalProducts: number;
  recentRegistrations: number;
}

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newAccountType, setNewAccountType] = useState<string>("");

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated || user?.accountType !== 'Admin') {
      setLocation('/');
    }
  }, [isAuthenticated, user, setLocation]);

  // Fetch admin statistics
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: user?.accountType === 'Admin',
  });

  // Fetch all users
  const { data: usersData } = useQuery<{ users: User[] }>({
    queryKey: ["/api/admin/users"],
    enabled: user?.accountType === 'Admin',
  });

  // Update user account type mutation
  const updateAccountTypeMutation = useMutation({
    mutationFn: async ({ userId, accountType }: { userId: number; accountType: string }) => {
      return apiRequest("PUT", `/api/admin/users/${userId}/role`, { accountType });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedUser(null);
      setNewAccountType("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user account type",
        variant: "destructive",
      });
    },
  });

  const handleAccountTypeUpdate = (user: User) => {
    if (!newAccountType) {
      toast({
        title: "Error",
        description: "Please select an account type",
        variant: "destructive",
      });
      return;
    }

    updateAccountTypeMutation.mutate({ userId: user.id, accountType: newAccountType });
  };

  if (!isAuthenticated || user?.accountType !== 'Admin') {
    return null;
  }

  const users = usersData?.users || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="w-fit">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  Admin Panel
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                  System administration and user management
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm w-fit">
              <Crown className="h-4 w-4 mr-1" />
              Admin Access
            </Badge>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mb-6 md:mb-8">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-4 md:pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                
                {/* Mobile: 2x4 grid layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2 lg:gap-3">
                  <Link href="/admin-search-history" className="block">
                    <Button variant="outline" size="sm" className="w-full h-auto p-3 flex flex-col sm:flex-row items-center gap-2 text-left">
                      <History className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm leading-tight">Search History Analytics</span>
                    </Button>
                  </Link>
                  
                  <Link href="/admin-product-database" className="block">
                    <Button variant="outline" size="sm" className="w-full h-auto p-3 flex flex-col sm:flex-row items-center gap-2 text-left">
                      <Database className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm leading-tight">Product Database</span>
                    </Button>
                  </Link>
                  
                  <Link href="/admin-camera-config" className="block">
                    <Button variant="outline" size="sm" className="w-full h-auto p-3 flex flex-col sm:flex-row items-center gap-2 text-left">
                      <Settings className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm leading-tight">Camera Configuration</span>
                    </Button>
                  </Link>
                  

                  
                  <Link href="/admin-website-management" className="block">
                    <Button variant="outline" size="sm" className="w-full h-auto p-3 flex flex-col sm:flex-row items-center gap-2 text-left">
                      <Settings className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm leading-tight">Website Management</span>
                    </Button>
                  </Link>
                  
                  <Link href="/ad-placement-guidelines" className="block">
                    <Button variant="outline" size="sm" className="w-full h-auto p-3 flex flex-col sm:flex-row items-center gap-2 text-left">
                      <Shield className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm leading-tight">Ad Guidelines</span>
                    </Button>
                  </Link>
                  
                  <Link href="/user-consent-collection" className="block">
                    <Button variant="outline" size="sm" className="w-full h-auto p-3 flex flex-col sm:flex-row items-center gap-2 text-left">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm leading-tight">User Consent</span>
                    </Button>
                  </Link>
                  
                  <Link href="/ad-compliance-dashboard" className="block">
                    <Button variant="outline" size="sm" className="w-full h-auto p-3 flex flex-col sm:flex-row items-center gap-2 text-left">
                      <Shield className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm leading-tight">Ad Compliance</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 md:mb-8">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Registered accounts
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.adminUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Administrator accounts
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Email verified
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  In database
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Admin Panel with Tabs */}
        <div className="mb-6 md:mb-8">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
            <Tabs defaultValue="debug-db" className="w-full">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 p-1 m-4 mb-0 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-slate-200/50 dark:border-gray-600/50 shadow-inner">
                <TabsTrigger 
                  value="debug-db" 
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-700/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 font-medium"
                >
                  <Database className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline text-sm">Debug DB</span>
                  <span className="sm:hidden text-xs">DB</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-700/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 font-medium"
                >
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline text-sm">Settings</span>
                  <span className="sm:hidden text-xs">Set</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="speech-settings" 
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-700/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/25 font-medium"
                >
                  <Mic className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline text-sm">Speech</span>
                  <span className="sm:hidden text-xs">Mic</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="product-management" 
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-700/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/25 font-medium"
                >
                  <BarChart3 className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline text-sm">Products</span>
                  <span className="sm:hidden text-xs">Prod</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="user-management" 
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-700/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/25 font-medium"
                >
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline text-sm">Users</span>
                  <span className="sm:hidden text-xs">User</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="rewarding-system" 
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-700/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 font-medium"
                >
                  <Gift className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline text-sm">Rewards</span>
                  <span className="sm:hidden text-xs">Rew</span>
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                {/* Debug Cascading DB Tab */}
                <TabsContent value="debug-db" className="mt-0 animate-in fade-in-50 duration-200">
                  <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-xl p-1 border border-blue-200/30 dark:border-blue-700/30">
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 backdrop-blur-sm">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                          <Database className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Debug Cascading Database</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Test and monitor database connectivity and performance</p>
                        </div>
                      </div>
                      <DebugCascadingDB />
                    </div>
                  </div>
                </TabsContent>

                {/* System Settings Tab */}
                <TabsContent value="settings" className="mt-0 animate-in fade-in-50 duration-200">
                  <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-900/20 dark:to-teal-900/10 rounded-xl p-1 border border-emerald-200/30 dark:border-emerald-700/30">
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 backdrop-blur-sm">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                          <Settings className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Settings</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Configure application settings and preferences</p>
                        </div>
                      </div>
                      <AdminSettings />
                    </div>
                  </div>
                </TabsContent>

                {/* Speech-to-Text Settings Tab */}
                <TabsContent value="speech-settings" className="mt-0 animate-in fade-in-50 duration-200">
                  <div className="bg-gradient-to-br from-violet-50/50 to-purple-50/30 dark:from-violet-900/20 dark:to-purple-900/10 rounded-xl p-1 border border-violet-200/30 dark:border-violet-700/30">
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 backdrop-blur-sm">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                          <Mic className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Speech-to-Text Settings</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Configure voice search and transcription settings</p>
                        </div>
                      </div>
                      <SpeechSettings />
                    </div>
                  </div>
                </TabsContent>

                {/* Product Management Tab */}
                <TabsContent value="product-management" className="mt-0 animate-in fade-in-50 duration-200">
                  <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/30 dark:from-amber-900/20 dark:to-yellow-900/10 rounded-xl p-1 border border-amber-200/30 dark:border-amber-700/30">
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 backdrop-blur-sm">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-white">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Product Management</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Manage products database, search, edit, and delete products</p>
                        </div>
                      </div>
                      <ProductManagement />
                    </div>
                  </div>
                </TabsContent>

                {/* User Management Tab */}
                <TabsContent value="user-management" className="mt-0 animate-in fade-in-50 duration-200">
                  <div className="bg-gradient-to-br from-orange-50/50 to-red-50/30 dark:from-orange-900/20 dark:to-red-900/10 rounded-xl p-1 border border-orange-200/30 dark:border-orange-700/30">
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 backdrop-blur-sm">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Management</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Manage user accounts, roles, and permissions</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Users List */}
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            User Management
                          </CardTitle>
                          <CardDescription>
                            Manage user accounts and permissions
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {users.map((listUser: User) => (
                              <div
                                key={listUser.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg bg-white/50 dark:bg-gray-700/50 gap-3"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <h3 className="font-medium text-sm truncate">{listUser.username}</h3>
                                    <Badge
                                      variant={listUser.accountType === 'Admin' ? 'default' : 'secondary'}
                                      className={`text-xs ${listUser.accountType === 'Admin' ? 'bg-blue-600' : ''}`}
                                    >
                                      {listUser.accountType === 'Admin' && <Crown className="h-3 w-3 mr-1" />}
                                      {listUser.accountType}
                                    </Badge>
                                    {listUser.isEmailVerified ? (
                                      <UserCheck className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <UserX className="h-4 w-4 text-red-600" />
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate mb-1">
                                    {listUser.email}
                                  </p>
                                  <div className="text-xs text-gray-500">
                                    <div>Joined: {new Date(listUser.createdAt).toLocaleDateString()}</div>
                                    {listUser.lastLoginAt && (
                                      <div>Last login: {new Date(listUser.lastLoginAt).toLocaleDateString()}</div>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedUser(listUser)}
                                  disabled={listUser.id === user?.id}
                                  className="w-full sm:w-auto h-9 min-w-[80px]"
                                >
                                  Manage
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Selected User Details */}
                    <div className="lg:col-span-1">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            User Details
                          </CardTitle>
                          <CardDescription>
                            Modify user account settings
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {selectedUser ? (
                            <div className="space-y-4">
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-sm font-medium">Username</Label>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {selectedUser.username}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Email</Label>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {selectedUser.email}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Current Role</Label>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {selectedUser.accountType}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Email Verified</Label>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {selectedUser.isEmailVerified ? 'Yes' : 'No'}
                                  </p>
                                </div>
                              </div>

                              <Separator />

                              <div>
                                <Label htmlFor="account-type-select" className="text-sm font-medium">
                                  New Account Type
                                </Label>
                                <Select value={newAccountType} onValueChange={setNewAccountType}>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select new account type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Regular">Regular User</SelectItem>
                                    <SelectItem value="Admin">Administrator</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex flex-col gap-2">
                                <Button
                                  onClick={() => handleAccountTypeUpdate(selectedUser)}
                                  disabled={updateAccountTypeMutation.isPending || !newAccountType}
                                  className="w-full h-10"
                                >
                                  {updateAccountTypeMutation.isPending ? "Updating..." : "Update Role"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedUser(null);
                                    setNewAccountType("");
                                  }}
                                  className="w-full h-10"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                Select a user to manage their account type
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Rewarding System Tab */}
                <TabsContent value="rewarding-system" className="mt-0 animate-in fade-in-50 duration-200">
                  <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/30 dark:from-purple-900/20 dark:to-pink-900/10 rounded-xl p-1 border border-purple-200/30 dark:border-purple-700/30">
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 backdrop-blur-sm">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                          <Gift className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Rewarding System</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Configure points, rewards, and user engagement features</p>
                        </div>
                      </div>
                      <AdminRewardingSystem />
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}