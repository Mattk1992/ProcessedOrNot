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
import { Shield, Users, BarChart3, Settings, UserCheck, UserX, Crown, ArrowLeft, History } from "lucide-react";
import { Link, useLocation } from "wouter";
import AdminSettings from "@/components/admin-settings";

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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                Admin Panel
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                System administration and user management
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            <Crown className="h-4 w-4 mr-1" />
            Admin Access
          </Badge>
        </div>

        {/* Quick Navigation */}
        <div className="mb-8">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                <div className="flex items-center gap-2">
                  <Link href="/admin-search-history">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Search History Analytics
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Admin Settings Section */}
        <div className="mb-8">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure application settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminSettings />
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users List */}
          <div className="lg:col-span-2">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
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
                <div className="space-y-4">
                  {users.map((listUser: User) => (
                    <div
                      key={listUser.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-white/50 dark:bg-gray-700/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{listUser.username}</h3>
                            <Badge
                              variant={listUser.accountType === 'Admin' ? 'default' : 'secondary'}
                              className={listUser.accountType === 'Admin' ? 'bg-blue-600' : ''}
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
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {listUser.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            Joined: {new Date(listUser.createdAt).toLocaleDateString()}
                            {listUser.lastLoginAt && (
                              <span className="ml-2">
                                Last login: {new Date(listUser.lastLoginAt).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(listUser)}
                        disabled={listUser.id === user?.id} // Can't modify own role
                      >
                        Manage
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role Management Panel */}
          <div>
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Role Management
                </CardTitle>
                <CardDescription>
                  Update user roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedUser ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Selected User</Label>
                      <div className="mt-1 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{selectedUser.username}</span>
                          <Badge variant="outline">{selectedUser.accountType}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {selectedUser.email}
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

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAccountTypeUpdate(selectedUser)}
                        disabled={updateAccountTypeMutation.isPending || !newAccountType}
                        className="flex-1"
                      >
                        {updateAccountTypeMutation.isPending ? "Updating..." : "Update Account Type"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(null);
                          setNewAccountType("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">
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
  );
}