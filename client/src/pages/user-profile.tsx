import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Mail, Calendar, Shield, Edit2, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export default function UserProfile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || ""
      });
    }
  }, [user]);

  // Set page title
  useEffect(() => {
    document.title = "User Profile - ProcessedOrNot";
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserData) => {
      const response = await apiRequest("PUT", "/api/auth/profile", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      // Invalidate auth cache to refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || ""
      });
    }
    setIsEditing(false);
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Not available";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">User Profile</h1>
          <p className="text-lg text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your basic account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        placeholder="Enter first name"
                      />
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {user.firstName || "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        placeholder="Enter last name"
                      />
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {user.lastName || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  ) : (
                    <p className="py-2 px-3 bg-muted rounded-md">
                      {user.email || "Not set"}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  {isEditing ? (
                    <>
                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancel}
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      type="button" 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Details
              </CardTitle>
              <CardDescription>
                Your account status and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Username</Label>
                <p className="py-2 px-3 bg-muted rounded-md">
                  {user.username}
                </p>
              </div>

              <div>
                <Label>Account Type</Label>
                <div className="py-2">
                  <Badge variant={user.accountType === 'Admin' ? 'default' : 'secondary'}>
                    {user.accountType || 'User'}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Email Verified</Label>
                <div className="py-2">
                  <Badge variant={user.isEmailVerified ? 'default' : 'destructive'}>
                    {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </Label>
                <p className="py-2 px-3 bg-muted rounded-md text-sm">
                  {formatDate(user.createdAt)}
                </p>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Last Login
                </Label>
                <p className="py-2 px-3 bg-muted rounded-md text-sm">
                  {formatDate(user.lastLoginAt || null)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Two-Factor Authentication
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                These features are coming soon. For now, you can change your password by using the "Forgot Password" option on the login page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}