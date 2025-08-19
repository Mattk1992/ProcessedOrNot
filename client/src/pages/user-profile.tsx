import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import ChangePasswordDialog from "@/components/change-password-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Edit2, 
  Save, 
  X, 
  Heart,
  Activity,
  Target,
  Users,
  AlertCircle,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationWrapper from "@/components/navigation-wrapper";
import AccountTypeTester from "@/components/account-type-tester";
import { URLStatusDisplay } from "@/components/url-status-display";

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  dailyCaloriesGoal?: number;
}

interface OnboardingData {
  // Basic Information
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  
  // Health Status
  medicalConditions?: string[];
  allergies?: string[];
  medications?: string[];
  
  // Lifestyle Factors
  activityLevel?: string;
  occupation?: string;
  exerciseFrequency?: string;
  exerciseTypes?: string[];
  
  // Dietary Preferences
  foodPreferences?: string[];
  foodDislikes?: string[];
  dietaryRestrictions?: string[];
  
  // Goals
  weightGoals?: string;
  targetWeight?: number;
  healthGoals?: string[];
  
  // Eating Habits
  mealsPerDay?: number;
  snacksPerDay?: number;
  cookingSkill?: string;
  cookingFrequency?: string;
  
  // Support System
  familySupport?: boolean;
  friendsSupport?: boolean;
  professionalSupport?: boolean;
  
  // Additional Information
  sleepHours?: number;
  stressLevel?: string;
  waterIntake?: number;
  alcoholConsumption?: string;
  smokingStatus?: string;
}

export default function UserProfile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingOnboarding, setIsEditingOnboarding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dailyCaloriesGoal: 2000
  });
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        email: user.email || "",
        dailyCaloriesGoal: user.dailyCaloriesGoal || 2000
      });
    }
  }, [user]);

  // Set page title
  useEffect(() => {
    document.title = "User Profile - ProcessedOrNot";
  }, []);

  // Fetch existing onboarding data
  const { data: existingOnboardingData } = useQuery({
    queryKey: ["/api/onboarding"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (existingOnboardingData) {
      setOnboardingData(existingOnboardingData);
    }
  }, [existingOnboardingData]);

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

  // Create weight entry mutation
  const createWeightEntryMutation = useMutation({
    mutationFn: async (data: { weight: number; notes?: string }) => {
      const response = await apiRequest("POST", "/api/weight-entries", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate weight entries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/weight-entries"] });
    },
    onError: (error: any) => {
      console.error("Failed to create weight entry:", error);
      // Don't show error toast for weight entry creation as it's secondary
    },
  });

  const updateOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      const response = await apiRequest("POST", "/api/onboarding", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      return await response.json();
    },
    onSuccess: (result, variables) => {
      setIsSaving(false);
      setLastSaved(new Date());
      setIsEditingOnboarding(false);
      
      // If weight was updated and is different from previous, create a weight entry
      if (variables.weight && existingOnboardingData?.weight !== variables.weight) {
        createWeightEntryMutation.mutate({
          weight: variables.weight,
          notes: "Updated from Basic Information"
        });
      }
      
      // Invalidate onboarding cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding"] });
    },
    onError: (error: any) => {
      setIsSaving(false);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update health profile",
        variant: "destructive",
      });
    },
  });

  // Auto-save function with debouncing for profile
  const autoSaveOnboarding = useCallback((data: OnboardingData) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      updateOnboardingMutation.mutate(data);
    }, 1500); // Save after 1.5 seconds of inactivity
  }, [updateOnboardingMutation]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save onboarding data
    updateOnboardingMutation.mutate(onboardingData);
    // Also save profile data (including dailyCaloriesGoal) if it has changed
    if (formData.dailyCaloriesGoal !== user.dailyCaloriesGoal) {
      updateProfileMutation.mutate({
        dailyCaloriesGoal: formData.dailyCaloriesGoal
      });
    }
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

  const handleOnboardingCancel = () => {
    if (existingOnboardingData) {
      setOnboardingData(existingOnboardingData);
    }
    setIsEditingOnboarding(false);
  };

  const updateOnboardingFormData = (field: keyof OnboardingData, value: any) => {
    const newData = { ...onboardingData, [field]: value };
    setOnboardingData(newData);
    // Trigger auto-save when not in editing mode (for seamless experience)
    if (!isEditingOnboarding) {
      autoSaveOnboarding(newData);
    }
  };

  const handleArrayToggle = (field: keyof OnboardingData, value: string) => {
    const currentArray = onboardingData[field] as string[] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateOnboardingFormData(field, newArray);
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
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Profile & Settings</h1>
          <p className="text-lg text-muted-foreground">
            Manage your account information, health profile, and preferences
          </p>
          
          {/* Auto-save Status */}
          <div className="mt-4 flex justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                  <span>Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <Save className="w-3 h-3 text-green-600" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </>
              ) : (
                <span>Changes save automatically</span>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Health
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Lifestyle
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Nutrition
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Goals
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
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
                  <Badge variant={
                    user.accountType === 'Admin' ? 'default' : 
                    user.accountType === 'Paid' ? 'outline' : 
                    'secondary'
                  }>
                    {user.accountType || 'User'}
                  </Badge>
                  {user.accountType === 'Paid' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Premium features enabled • URLs automatically include "?paiduser=true" parameter
                    </p>
                  )}
                  {user.accountType === 'Regular' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Standard account • URLs automatically include "?regularuser=true" parameter
                    </p>
                  )}
                  {user.accountType === 'Admin' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Administrator account • URLs automatically include "?adminuser=true" parameter
                    </p>
                  )}
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
                <ChangePasswordDialog>
                  <Button variant="outline" className="justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </ChangePasswordDialog>
                <Button variant="outline" className="justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Two-Factor Authentication
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                <strong>Change Password:</strong> Click the button above to securely change your password.<br />
                <strong>Two-Factor Authentication:</strong> This feature is coming soon for enhanced security.
              </p>
            </CardContent>
          </Card>
            </div>
          </TabsContent>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                  <div className="ml-auto">
                    {isEditingOnboarding ? (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleOnboardingSubmit}
                          disabled={updateOnboardingMutation.isPending}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {updateOnboardingMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleOnboardingCancel}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => setIsEditingOnboarding(true)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  Your basic physical and demographic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Age</Label>
                    {isEditingOnboarding ? (
                      <Input
                        type="number"
                        placeholder="25"
                        value={onboardingData.age || ""}
                        onChange={(e) => updateOnboardingFormData("age", parseInt(e.target.value) || undefined)}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {onboardingData.age || "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Gender</Label>
                    {isEditingOnboarding ? (
                      <Select value={onboardingData.gender || ""} onValueChange={(value) => updateOnboardingFormData("gender", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {onboardingData.gender === "prefer_not_to_say" ? "Prefer not to say" : 
                         (onboardingData.gender ? onboardingData.gender.charAt(0).toUpperCase() + onboardingData.gender.slice(1) : "Not set")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Height (cm)</Label>
                    {isEditingOnboarding ? (
                      <Input
                        type="number"
                        placeholder="170"
                        value={onboardingData.height || ""}
                        onChange={(e) => updateOnboardingFormData("height", parseFloat(e.target.value) || undefined)}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {onboardingData.height ? `${onboardingData.height} cm` : "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Weight (kg)</Label>
                    {isEditingOnboarding ? (
                      <Input
                        type="number"
                        placeholder="70"
                        value={onboardingData.weight || ""}
                        onChange={(e) => updateOnboardingFormData("weight", parseFloat(e.target.value) || undefined)}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {onboardingData.weight ? `${onboardingData.weight} kg` : "Not set"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Status Tab */}
          <TabsContent value="health" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Health Status
                  <div className="ml-auto">
                    {isEditingOnboarding ? (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleOnboardingSubmit}
                          disabled={updateOnboardingMutation.isPending}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {updateOnboardingMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleOnboardingCancel}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => setIsEditingOnboarding(true)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  Medical conditions, allergies, and medications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Medical Conditions</Label>
                  <p className="text-sm text-muted-foreground mb-2">Select all that apply</p>
                  {isEditingOnboarding ? (
                    <div className="grid grid-cols-2 gap-2">
                      {['diabetes', 'hypertension', 'heart_disease', 'thyroid', 'none'].map((condition) => (
                        <div key={condition} className="flex items-center space-x-2">
                          <Checkbox
                            id={`medical-${condition}`}
                            checked={onboardingData.medicalConditions?.includes(condition) || false}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleArrayToggle("medicalConditions", condition);
                              } else {
                                handleArrayToggle("medicalConditions", condition);
                              }
                            }}
                          />
                          <Label htmlFor={`medical-${condition}`}>
                            {condition.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-2 px-3 bg-muted rounded-md">
                      {onboardingData.medicalConditions?.length ? 
                        onboardingData.medicalConditions.map(condition => 
                          condition.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())
                        ).join(", ") : 
                        "Not specified"
                      }
                    </div>
                  )}
                </div>

                <div>
                  <Label>Allergies</Label>
                  <p className="text-sm text-muted-foreground mb-2">Select all that apply</p>
                  {isEditingOnboarding ? (
                    <div className="grid grid-cols-2 gap-2">
                      {['nuts', 'dairy', 'gluten', 'shellfish', 'eggs', 'soy', 'none'].map((allergy) => (
                        <div key={allergy} className="flex items-center space-x-2">
                          <Checkbox
                            id={`allergy-${allergy}`}
                            checked={onboardingData.allergies?.includes(allergy) || false}
                            onCheckedChange={() => handleArrayToggle("allergies", allergy)}
                          />
                          <Label htmlFor={`allergy-${allergy}`}>
                            {allergy.charAt(0).toUpperCase() + allergy.slice(1)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-2 px-3 bg-muted rounded-md">
                      {onboardingData.allergies?.length ? 
                        onboardingData.allergies.map(allergy => 
                          allergy.charAt(0).toUpperCase() + allergy.slice(1)
                        ).join(", ") : 
                        "None specified"
                      }
                    </div>
                  )}
                </div>

                <div>
                  <Label>Current Medications</Label>
                  <p className="text-sm text-muted-foreground mb-2">List any medications you're currently taking</p>
                  {isEditingOnboarding ? (
                    <Textarea
                      placeholder="List medications, one per line..."
                      value={onboardingData.medications?.join('\n') || ""}
                      onChange={(e) => updateOnboardingFormData("medications", e.target.value.split('\n').filter(m => m.trim()))}
                    />
                  ) : (
                    <div className="py-2 px-3 bg-muted rounded-md min-h-[80px]">
                      {onboardingData.medications?.length ? 
                        onboardingData.medications.join(", ") : 
                        "None specified"
                      }
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lifestyle Tab */}
          <TabsContent value="lifestyle" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Lifestyle & Activity
                  <div className="ml-auto">
                    {isEditingOnboarding ? (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleOnboardingSubmit}
                          disabled={updateOnboardingMutation.isPending}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {updateOnboardingMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleOnboardingCancel}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => setIsEditingOnboarding(true)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  Activity level, exercise habits, and work information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Activity Level</Label>
                    {isEditingOnboarding ? (
                      <Select value={onboardingData.activityLevel || ""} onValueChange={(value) => updateOnboardingFormData("activityLevel", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary</SelectItem>
                          <SelectItem value="lightly_active">Lightly Active</SelectItem>
                          <SelectItem value="moderately_active">Moderately Active</SelectItem>
                          <SelectItem value="very_active">Very Active</SelectItem>
                          <SelectItem value="extremely_active">Extremely Active</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {onboardingData.activityLevel?.replace('_', ' ').replace(/^\w/, c => c.toUpperCase()) || "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Exercise Frequency</Label>
                    {isEditingOnboarding ? (
                      <Select value={onboardingData.exerciseFrequency || ""} onValueChange={(value) => updateOnboardingFormData("exerciseFrequency", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="rarely">Rarely</SelectItem>
                          <SelectItem value="1-2_times_week">1-2 times per week</SelectItem>
                          <SelectItem value="3-4_times_week">3-4 times per week</SelectItem>
                          <SelectItem value="5-6_times_week">5-6 times per week</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {onboardingData.exerciseFrequency?.replace('_', ' ').replace(/^\w/, c => c.toUpperCase()) || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Exercise Types</Label>
                  <p className="text-sm text-muted-foreground mb-2">Select all that apply</p>
                  {isEditingOnboarding ? (
                    <div className="grid grid-cols-2 gap-2">
                      {['cardio', 'strength', 'yoga', 'sports', 'walking', 'cycling'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`exercise-${type}`}
                            checked={onboardingData.exerciseTypes?.includes(type) || false}
                            onCheckedChange={() => handleArrayToggle("exerciseTypes", type)}
                          />
                          <Label htmlFor={`exercise-${type}`}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-2 px-3 bg-muted rounded-md">
                      {onboardingData.exerciseTypes?.length ? 
                        onboardingData.exerciseTypes.map(type => 
                          type.charAt(0).toUpperCase() + type.slice(1)
                        ).join(", ") : 
                        "None specified"
                      }
                    </div>
                  )}
                </div>

                <div>
                  <Label>Occupation</Label>
                  {isEditingOnboarding ? (
                    <Input
                      placeholder="Your job or occupation..."
                      value={onboardingData.occupation || ""}
                      onChange={(e) => updateOnboardingFormData("occupation", e.target.value)}
                    />
                  ) : (
                    <p className="py-2 px-3 bg-muted rounded-md">
                      {onboardingData.occupation || "Not specified"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Nutrition & Diet Preferences
                  <div className="ml-auto">
                    {isEditingOnboarding ? (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleOnboardingSubmit}
                          disabled={updateOnboardingMutation.isPending}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {updateOnboardingMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleOnboardingCancel}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => setIsEditingOnboarding(true)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  Dietary restrictions, food preferences, and eating habits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="dailyCaloriesGoal">Daily Calories Goal</Label>
                  <p className="text-sm text-muted-foreground mb-2">Target daily calorie intake</p>
                  {isEditingOnboarding ? (
                    <Input
                      id="dailyCaloriesGoal"
                      type="number"
                      min="1200"
                      max="5000"
                      value={formData.dailyCaloriesGoal || ""}
                      onChange={(e) => setFormData({...formData, dailyCaloriesGoal: parseInt(e.target.value) || 2000})}
                      placeholder="2000"
                    />
                  ) : (
                    <p className="py-2 px-3 bg-muted rounded-md">
                      {formData.dailyCaloriesGoal ? `${formData.dailyCaloriesGoal} calories` : "2000 calories (default)"}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Dietary Restrictions</Label>
                  <p className="text-sm text-muted-foreground mb-2">Select all that apply</p>
                  {isEditingOnboarding ? (
                    <div className="grid grid-cols-2 gap-2">
                      {['vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'gluten_free', 'dairy_free'].map((restriction) => (
                        <div key={restriction} className="flex items-center space-x-2">
                          <Checkbox
                            id={`diet-${restriction}`}
                            checked={onboardingData.dietaryRestrictions?.includes(restriction) || false}
                            onCheckedChange={() => handleArrayToggle("dietaryRestrictions", restriction)}
                          />
                          <Label htmlFor={`diet-${restriction}`}>
                            {restriction.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-2 px-3 bg-muted rounded-md">
                      {onboardingData.dietaryRestrictions?.length ? 
                        onboardingData.dietaryRestrictions.map(restriction => 
                          restriction.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())
                        ).join(", ") : 
                        "None specified"
                      }
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Meals per Day</Label>
                    {isEditingOnboarding ? (
                      <Input
                        type="number"
                        min="3"
                        max="6"
                        value={onboardingData.mealsPerDay || ""}
                        onChange={(e) => updateOnboardingFormData("mealsPerDay", parseInt(e.target.value) || undefined)}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {onboardingData.mealsPerDay || "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Snacks per Day</Label>
                    {isEditingOnboarding ? (
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={onboardingData.snacksPerDay || ""}
                        onChange={(e) => updateOnboardingFormData("snacksPerDay", parseInt(e.target.value) || undefined)}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {onboardingData.snacksPerDay || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cooking Skill</Label>
                    {isEditingOnboarding ? (
                      <Select value={onboardingData.cookingSkill || ""} onValueChange={(value) => updateOnboardingFormData("cookingSkill", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select skill level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {onboardingData.cookingSkill ? onboardingData.cookingSkill.charAt(0).toUpperCase() + onboardingData.cookingSkill.slice(1) : "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Cooking Frequency</Label>
                    {isEditingOnboarding ? (
                      <Select value={onboardingData.cookingFrequency || ""} onValueChange={(value) => updateOnboardingFormData("cookingFrequency", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="How often do you cook?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="rarely">Rarely</SelectItem>
                          <SelectItem value="sometimes">Sometimes</SelectItem>
                          <SelectItem value="often">Often</SelectItem>
                          <SelectItem value="always">Always</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {onboardingData.cookingFrequency ? onboardingData.cookingFrequency.charAt(0).toUpperCase() + onboardingData.cookingFrequency.slice(1) : "Not set"}
                      </p>
                    )}
                  </div>
                </div>


              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Health & Wellness Goals
                  <div className="ml-auto">
                    {isEditingOnboarding ? (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleOnboardingSubmit}
                          disabled={updateOnboardingMutation.isPending}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {updateOnboardingMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleOnboardingCancel}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => setIsEditingOnboarding(true)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  Weight goals, health objectives, and wellness preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Weight Goals</Label>
                    {isEditingOnboarding ? (
                      <Select value={onboardingData.weightGoals || ""} onValueChange={(value) => updateOnboardingFormData("weightGoals", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select weight goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lose_weight">Lose Weight</SelectItem>
                          <SelectItem value="maintain_weight">Maintain Weight</SelectItem>
                          <SelectItem value="gain_weight">Gain Weight</SelectItem>
                          <SelectItem value="build_muscle">Build Muscle</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {onboardingData.weightGoals?.replace('_', ' ').replace(/^\w/, c => c.toUpperCase()) || "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Target Weight (kg)</Label>
                    {isEditingOnboarding ? (
                      <Input
                        type="number"
                        placeholder="70"
                        value={onboardingData.targetWeight || ""}
                        onChange={(e) => updateOnboardingFormData("targetWeight", parseFloat(e.target.value) || undefined)}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {onboardingData.targetWeight ? `${onboardingData.targetWeight} kg` : "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Health Goals</Label>
                  <p className="text-sm text-muted-foreground mb-2">Select all that apply</p>
                  {isEditingOnboarding ? (
                    <div className="grid grid-cols-2 gap-2">
                      {['lower_cholesterol', 'control_blood_sugar', 'reduce_blood_pressure', 'increase_energy', 'improve_digestion'].map((goal) => (
                        <div key={goal} className="flex items-center space-x-2">
                          <Checkbox
                            id={`health-${goal}`}
                            checked={onboardingData.healthGoals?.includes(goal) || false}
                            onCheckedChange={() => handleArrayToggle("healthGoals", goal)}
                          />
                          <Label htmlFor={`health-${goal}`}>
                            {goal.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-2 px-3 bg-muted rounded-md">
                      {onboardingData.healthGoals?.length ? 
                        onboardingData.healthGoals.map(goal => 
                          goal.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())
                        ).join(", ") : 
                        "None specified"
                      }
                    </div>
                  )}
                </div>

                <div>
                  <Label>Support System</Label>
                  <p className="text-sm text-muted-foreground mb-2">What support do you have for your health goals?</p>
                  {isEditingOnboarding ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="familySupport"
                          checked={onboardingData.familySupport || false}
                          onCheckedChange={(checked) => updateOnboardingFormData("familySupport", checked)}
                        />
                        <Label htmlFor="familySupport">
                          I have family support for my health and nutrition goals
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="friendsSupport"
                          checked={onboardingData.friendsSupport || false}
                          onCheckedChange={(checked) => updateOnboardingFormData("friendsSupport", checked)}
                        />
                        <Label htmlFor="friendsSupport">
                          I have friends who support my health and nutrition goals
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="professionalSupport"
                          checked={onboardingData.professionalSupport || false}
                          onCheckedChange={(checked) => updateOnboardingFormData("professionalSupport", checked)}
                        />
                        <Label htmlFor="professionalSupport">
                          I work with a nutritionist, dietitian, or health coach
                        </Label>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 px-3 bg-muted rounded-md">
                      {[
                        onboardingData.familySupport && "Family support",
                        onboardingData.friendsSupport && "Friends support", 
                        onboardingData.professionalSupport && "Professional support"
                      ].filter(Boolean).join(", ") || "No support specified"}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Sleep Hours</Label>
                    {isEditingOnboarding ? (
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        step="0.5"
                        placeholder="8"
                        value={onboardingData.sleepHours || ""}
                        onChange={(e) => updateOnboardingFormData("sleepHours", parseFloat(e.target.value) || undefined)}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {onboardingData.sleepHours ? `${onboardingData.sleepHours} hours` : "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Stress Level</Label>
                    {isEditingOnboarding ? (
                      <Select value={onboardingData.stressLevel || ""} onValueChange={(value) => updateOnboardingFormData("stressLevel", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="very_low">Very Low</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="very_high">Very High</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {onboardingData.stressLevel?.replace('_', ' ').replace(/^\w/, c => c.toUpperCase()) || "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Water Intake (glasses/day)</Label>
                    {isEditingOnboarding ? (
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        placeholder="8"
                        value={onboardingData.waterIntake || ""}
                        onChange={(e) => updateOnboardingFormData("waterIntake", parseFloat(e.target.value) || undefined)}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {onboardingData.waterIntake ? `${onboardingData.waterIntake} glasses` : "Not set"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* URL Modification Demonstration - Hidden for Regular Users */}
        {user?.accountType !== 'Regular' && (
          <div className="mt-8 space-y-6">
            <URLStatusDisplay />
            <AccountTypeTester />
            <NavigationWrapper className="max-w-4xl">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Additional URL Modification Examples</h2>
                <p className="text-sm text-muted-foreground">
                  More examples of how URLs are automatically modified for paid users.
                </p>
              </div>
            </NavigationWrapper>
          </div>
        )}
      </div>
    </div>
  );
}