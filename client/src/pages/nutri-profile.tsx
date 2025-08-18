import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  User, 
  Target, 
  Scale, 
  Activity, 
  Settings, 
  Save,
  Plus,
  Edit3,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import HeaderDropdown from "@/components/header-dropdown";
import LanguageSwitcher from "@/components/language-switcher";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  height: z.number().min(100, "Height must be at least 100cm").max(250, "Height cannot exceed 250cm"),
  weight: z.number().min(30, "Weight must be at least 30kg").max(300, "Weight cannot exceed 300kg"),
  bio: z.string().optional(),
  timezone: z.string().default("UTC"),
  units: z.enum(["metric", "imperial"]),
  privacyLevel: z.enum(["public", "friends", "private"]),
});

const goalsSchema = z.object({
  dailyCalories: z.number().min(1000).max(5000),
  dailyFat: z.number().min(20).max(200),
  dailyCarbs: z.number().min(50).max(800),
  dailyProteins: z.number().min(30).max(300),
  dailySalt: z.number().min(1).max(15),
  dailyFiber: z.number().min(10).max(80),
  maxProcessingScore: z.number().min(1).max(10),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  weightGoal: z.enum(["lose", "maintain", "gain"]),
  dietaryRestrictions: z.array(z.string()).optional(),
  healthConditions: z.array(z.string()).optional(),
});

const weightEntrySchema = z.object({
  weight: z.number().min(30).max(300),
  bodyFat: z.number().min(5).max(50).optional(),
  muscleMass: z.number().min(10).max(100).optional(),
  notes: z.string().optional(),
  recordedAt: z.string(),
});

type ProfileForm = z.infer<typeof profileSchema>;
type GoalsForm = z.infer<typeof goalsSchema>;
type WeightEntryForm = z.infer<typeof weightEntrySchema>;

interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  bio?: string;
  timezone: string;
  units: string;
  privacyLevel: string;
}

interface UserGoals {
  dailyCalories: number;
  dailyFat: number;
  dailyCarbs: number;
  dailyProteins: number;
  dailySalt: number;
  dailyFiber: number;
  maxProcessingScore: number;
  activityLevel: string;
  weightGoal: string;
  dietaryRestrictions?: string[];
  healthConditions?: string[];
}

export default function NutriProfile() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);

  // Fetch user profile
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/nutrition/profile"],
    enabled: isAuthenticated,
  });

  // Fetch user goals
  const { data: goals } = useQuery<UserGoals>({
    queryKey: ["/api/nutrition/goals"],
    enabled: isAuthenticated,
  });

  // Profile form
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      dateOfBirth: profile?.dateOfBirth || "",
      gender: profile?.gender || "",
      height: profile?.height || 170,
      weight: profile?.weight || 70,
      bio: profile?.bio || "",
      timezone: profile?.timezone || "UTC",
      units: (profile?.units as "metric" | "imperial") || "metric",
      privacyLevel: (profile?.privacyLevel as "public" | "friends" | "private") || "public",
    },
  });

  // Goals form
  const goalsForm = useForm<GoalsForm>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      dailyCalories: goals?.dailyCalories || 2000,
      dailyFat: goals?.dailyFat || 65,
      dailyCarbs: goals?.dailyCarbs || 300,
      dailyProteins: goals?.dailyProteins || 50,
      dailySalt: goals?.dailySalt || 6,
      dailyFiber: goals?.dailyFiber || 25,
      maxProcessingScore: goals?.maxProcessingScore || 5,
      activityLevel: (goals?.activityLevel as any) || "moderate",
      weightGoal: (goals?.weightGoal as any) || "maintain",
      dietaryRestrictions: goals?.dietaryRestrictions || [],
      healthConditions: goals?.healthConditions || [],
    },
  });

  // Weight entry form
  const weightForm = useForm<WeightEntryForm>({
    resolver: zodResolver(weightEntrySchema),
    defaultValues: {
      weight: profile?.weight || 70,
      bodyFat: undefined,
      muscleMass: undefined,
      notes: "",
      recordedAt: new Date().toISOString().slice(0, 16),
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const response = await apiRequest("PUT", "/api/nutrition/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition/profile"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Update goals mutation
  const updateGoalsMutation = useMutation({
    mutationFn: async (data: GoalsForm) => {
      const response = await apiRequest("PUT", "/api/nutrition/goals", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Goals Updated",
        description: "Your nutrition goals have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition/goals"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update goals",
        variant: "destructive",
      });
    },
  });

  // Add weight entry mutation
  const addWeightMutation = useMutation({
    mutationFn: async (data: WeightEntryForm) => {
      const response = await apiRequest("POST", "/api/nutrition/weight-entries", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Weight Recorded",
        description: "Your weight entry has been added",
      });
      setIsWeightDialogOpen(false);
      weightForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition/weight-entries"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record weight",
        variant: "destructive",
      });
    },
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
                  <p className="text-xs text-muted-foreground">Nutri Profile</p>
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
            <p className="text-muted-foreground">Please sign in to access your nutrition profile.</p>
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

  const onSubmitProfile = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitGoals = (data: GoalsForm) => {
    updateGoalsMutation.mutate(data);
  };

  const onSubmitWeight = (data: WeightEntryForm) => {
    addWeightMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Header */}
      <header className="backdrop-blur-md bg-background/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Profile & Settings</h2>
          <p className="text-muted-foreground">Manage your personal information and nutrition goals</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Personal Info</TabsTrigger>
            <TabsTrigger value="goals">Nutrition Goals</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>
                  Update your basic information and physical stats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Weight (kg)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                step="0.1"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about yourself..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition Goals Tab */}
          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Nutrition Goals</span>
                </CardTitle>
                <CardDescription>
                  Set your daily nutrition targets and health objectives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...goalsForm}>
                  <form onSubmit={goalsForm.handleSubmit(onSubmitGoals)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={goalsForm.control}
                        name="dailyCalories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Daily Calories</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={goalsForm.control}
                        name="maxProcessingScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Processing Score</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="1"
                                max="10"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField
                        control={goalsForm.control}
                        name="dailyFat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fat (g)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={goalsForm.control}
                        name="dailyCarbs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Carbs (g)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={goalsForm.control}
                        name="dailyProteins"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Protein (g)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={goalsForm.control}
                        name="dailyFiber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fiber (g)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={goalsForm.control}
                        name="activityLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activity Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="sedentary">Sedentary</SelectItem>
                                <SelectItem value="light">Light Activity</SelectItem>
                                <SelectItem value="moderate">Moderate Activity</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="very_active">Very Active</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={goalsForm.control}
                        name="weightGoal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight Goal</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="lose">Lose Weight</SelectItem>
                                <SelectItem value="maintain">Maintain Weight</SelectItem>
                                <SelectItem value="gain">Gain Weight</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" disabled={updateGoalsMutation.isPending}>
                      {updateGoalsMutation.isPending ? "Saving..." : "Save Goals"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>App Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Units</Label>
                      <p className="text-sm text-muted-foreground">Choose your preferred measurement system</p>
                    </div>
                    <Select defaultValue="metric">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metric">Metric</SelectItem>
                        <SelectItem value="imperial">Imperial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Privacy Level</Label>
                      <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                    </div>
                    <Select defaultValue="public">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dietary Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Dietary Restrictions</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo"].map((restriction) => (
                        <Badge key={restriction} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                          {restriction}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Health Conditions</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["Diabetes", "Hypertension", "Heart Disease", "High Cholesterol", "Food Allergies"].map((condition) => (
                        <Badge key={condition} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}