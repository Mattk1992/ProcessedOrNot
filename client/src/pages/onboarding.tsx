import { useState, useEffect, useCallback, useRef } from "react";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Heart, 
  Activity, 
  Target, 
  Users, 
  ChevronRight, 
  ChevronLeft,
  Check,
  AlertCircle,
  Save
} from "lucide-react";

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

export default function Onboarding() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Check if onboarding is already completed
  useEffect(() => {
    if (user?.onboardingCompleted) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Set page title
  useEffect(() => {
    document.title = "Complete Your Profile - ProcessedOrNot";
  }, []);

  // Fetch existing onboarding data if any
  const { data: existingData } = useQuery({
    queryKey: ["/api/onboarding"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (existingData) {
      setFormData(existingData);
    }
  }, [existingData]);

  const saveOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData & { isCompleted?: boolean }) => {
      const response = await apiRequest("POST", "/api/onboarding", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      return await response.json();
    },
    onSuccess: () => {
      setIsSaving(false);
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding"] });
    },
    onError: () => {
      setIsSaving(false);
    },
  });

  // Auto-save function with debouncing
  const autoSave = useCallback((data: OnboardingData) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      saveOnboardingMutation.mutate(data);
    }, 1500); // Save after 1.5 seconds of inactivity
  }, [saveOnboardingMutation]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleNext = () => {
    // Save current data
    saveOnboardingMutation.mutate(formData);
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const completeData = { ...formData, isCompleted: true };
    saveOnboardingMutation.mutate(completeData, {
      onSuccess: () => {
        toast({
          title: "Profile completed!",
          description: "Your health profile has been saved successfully.",
        });
        setLocation("/");
      },
    });
  };

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    // Trigger auto-save
    autoSave(newData);
  };

  const handleArrayToggle = (field: keyof OnboardingData, value: string) => {
    const currentArray = formData[field] as string[] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFormData(field, newArray);
  };

  const steps = [
    { number: 1, title: "Basic Information", icon: User },
    { number: 2, title: "Health Status", icon: Heart },
    { number: 3, title: "Lifestyle", icon: Activity },
    { number: 4, title: "Diet Preferences", icon: Target },
    { number: 5, title: "Goals", icon: Target },
    { number: 6, title: "Eating Habits", icon: Target },
    { number: 7, title: "Support System", icon: Users },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.onboardingCompleted) {
    return null;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Tell us about yourself to personalize your nutrition plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age || ""}
                    onChange={(e) => updateFormData("age", parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender || ""} onValueChange={(value) => updateFormData("gender", value)}>
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
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={formData.height || ""}
                    onChange={(e) => updateFormData("height", parseFloat(e.target.value) || undefined)}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={formData.weight || ""}
                    onChange={(e) => updateFormData("weight", parseFloat(e.target.value) || undefined)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Health Status
              </CardTitle>
              <CardDescription>
                Help us understand your health conditions and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Medical Conditions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['diabetes', 'hypertension', 'heart_disease', 'thyroid', 'none'].map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={condition}
                        checked={formData.medicalConditions?.includes(condition) || false}
                        onCheckedChange={() => handleArrayToggle('medicalConditions', condition)}
                      />
                      <Label htmlFor={condition} className="text-sm capitalize">
                        {condition.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Food Allergies</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['nuts', 'dairy', 'gluten', 'shellfish', 'eggs', 'soy', 'none'].map((allergy) => (
                    <div key={allergy} className="flex items-center space-x-2">
                      <Checkbox
                        id={allergy}
                        checked={formData.allergies?.includes(allergy) || false}
                        onCheckedChange={() => handleArrayToggle('allergies', allergy)}
                      />
                      <Label htmlFor={allergy} className="text-sm capitalize">
                        {allergy}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="medications">Current Medications (optional)</Label>
                <Textarea
                  id="medications"
                  placeholder="List any medications you're currently taking, one per line"
                  value={formData.medications?.join('\n') || ""}
                  onChange={(e) => updateFormData("medications", e.target.value.split('\n').filter(m => m.trim()))}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Lifestyle Factors
              </CardTitle>
              <CardDescription>
                Tell us about your daily activity and work life
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="activityLevel">Activity Level</Label>
                <Select value={formData.activityLevel || ""} onValueChange={(value) => updateFormData("activityLevel", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                    <SelectItem value="lightly_active">Lightly Active (light exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (hard exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="extremely_active">Extremely Active (very hard exercise, physical job)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  placeholder="e.g., Software Developer, Teacher, etc."
                  value={formData.occupation || ""}
                  onChange={(e) => updateFormData("occupation", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="exerciseFrequency">Exercise Frequency</Label>
                <Select value={formData.exerciseFrequency || ""} onValueChange={(value) => updateFormData("exerciseFrequency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="How often do you exercise?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="rarely">Rarely (less than once a week)</SelectItem>
                    <SelectItem value="1-2_times_week">1-2 times per week</SelectItem>
                    <SelectItem value="3-4_times_week">3-4 times per week</SelectItem>
                    <SelectItem value="5-6_times_week">5-6 times per week</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Types of Exercise (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['cardio', 'strength', 'yoga', 'sports', 'walking', 'cycling'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={formData.exerciseTypes?.includes(type) || false}
                        onCheckedChange={() => handleArrayToggle('exerciseTypes', type)}
                      />
                      <Label htmlFor={type} className="text-sm capitalize">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Dietary Preferences
              </CardTitle>
              <CardDescription>
                Tell us about your food preferences and restrictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Dietary Restrictions (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'gluten_free', 'dairy_free'].map((restriction) => (
                    <div key={restriction} className="flex items-center space-x-2">
                      <Checkbox
                        id={restriction}
                        checked={formData.dietaryRestrictions?.includes(restriction) || false}
                        onCheckedChange={() => handleArrayToggle('dietaryRestrictions', restriction)}
                      />
                      <Label htmlFor={restriction} className="text-sm capitalize">
                        {restriction.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="foodPreferences">Foods You Enjoy (optional)</Label>
                <Textarea
                  id="foodPreferences"
                  placeholder="List foods you particularly enjoy, one per line"
                  value={formData.foodPreferences?.join('\n') || ""}
                  onChange={(e) => updateFormData("foodPreferences", e.target.value.split('\n').filter(f => f.trim()))}
                />
              </div>

              <div>
                <Label htmlFor="foodDislikes">Foods You Dislike (optional)</Label>
                <Textarea
                  id="foodDislikes"
                  placeholder="List foods you want to avoid, one per line"
                  value={formData.foodDislikes?.join('\n') || ""}
                  onChange={(e) => updateFormData("foodDislikes", e.target.value.split('\n').filter(f => f.trim()))}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Your Goals
              </CardTitle>
              <CardDescription>
                What are you hoping to achieve with your nutrition plan?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="weightGoals">Weight Goals</Label>
                <Select value={formData.weightGoals || ""} onValueChange={(value) => updateFormData("weightGoals", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your weight goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose_weight">Lose Weight</SelectItem>
                    <SelectItem value="maintain_weight">Maintain Current Weight</SelectItem>
                    <SelectItem value="gain_weight">Gain Weight</SelectItem>
                    <SelectItem value="build_muscle">Build Muscle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.weightGoals !== 'maintain_weight' && (
                <div>
                  <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    placeholder="65"
                    value={formData.targetWeight || ""}
                    onChange={(e) => updateFormData("targetWeight", parseFloat(e.target.value) || undefined)}
                  />
                </div>
              )}

              <div>
                <Label>Health Goals (select all that apply)</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {[
                    'lower_cholesterol',
                    'control_blood_sugar',
                    'reduce_blood_pressure',
                    'increase_energy',
                    'improve_digestion'
                  ].map((goal) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={formData.healthGoals?.includes(goal) || false}
                        onCheckedChange={() => handleArrayToggle('healthGoals', goal)}
                      />
                      <Label htmlFor={goal} className="text-sm">
                        {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Eating Habits
              </CardTitle>
              <CardDescription>
                Tell us about your current eating patterns and cooking habits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mealsPerDay">Meals per Day</Label>
                  <Select value={formData.mealsPerDay?.toString() || ""} onValueChange={(value) => updateFormData("mealsPerDay", parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Number of meals" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 meal</SelectItem>
                      <SelectItem value="2">2 meals</SelectItem>
                      <SelectItem value="3">3 meals</SelectItem>
                      <SelectItem value="4">4 meals</SelectItem>
                      <SelectItem value="5">5+ meals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="snacksPerDay">Snacks per Day</Label>
                  <Select value={formData.snacksPerDay?.toString() || ""} onValueChange={(value) => updateFormData("snacksPerDay", parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Number of snacks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No snacks</SelectItem>
                      <SelectItem value="1">1 snack</SelectItem>
                      <SelectItem value="2">2 snacks</SelectItem>
                      <SelectItem value="3">3 snacks</SelectItem>
                      <SelectItem value="4">4+ snacks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="cookingSkill">Cooking Skill Level</Label>
                <Select value={formData.cookingSkill || ""} onValueChange={(value) => updateFormData("cookingSkill", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your cooking skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (can make basic meals)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (comfortable with most recipes)</SelectItem>
                    <SelectItem value="advanced">Advanced (skilled home cook)</SelectItem>
                    <SelectItem value="expert">Expert (professional level)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cookingFrequency">How often do you cook?</Label>
                <Select value={formData.cookingFrequency || ""} onValueChange={(value) => updateFormData("cookingFrequency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cooking frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="rarely">Rarely (eat out/order most meals)</SelectItem>
                    <SelectItem value="sometimes">Sometimes (cook a few times a week)</SelectItem>
                    <SelectItem value="often">Often (cook most meals)</SelectItem>
                    <SelectItem value="always">Always (cook all meals)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sleepHours">Hours of Sleep per Night</Label>
                  <Input
                    id="sleepHours"
                    type="number"
                    step="0.5"
                    placeholder="8"
                    value={formData.sleepHours || ""}
                    onChange={(e) => updateFormData("sleepHours", parseFloat(e.target.value) || undefined)}
                  />
                </div>

                <div>
                  <Label htmlFor="waterIntake">Glasses of Water per Day</Label>
                  <Input
                    id="waterIntake"
                    type="number"
                    placeholder="8"
                    value={formData.waterIntake || ""}
                    onChange={(e) => updateFormData("waterIntake", parseFloat(e.target.value) || undefined)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stressLevel">Stress Level</Label>
                  <Select value={formData.stressLevel || ""} onValueChange={(value) => updateFormData("stressLevel", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rate your stress" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very_low">Very Low</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="very_high">Very High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="alcoholConsumption">Alcohol Consumption</Label>
                  <Select value={formData.alcoholConsumption || ""} onValueChange={(value) => updateFormData("alcoholConsumption", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="rarely">Rarely</SelectItem>
                      <SelectItem value="occasionally">Occasionally</SelectItem>
                      <SelectItem value="regularly">Regularly</SelectItem>
                      <SelectItem value="frequently">Frequently</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="smokingStatus">Smoking Status</Label>
                <Select value={formData.smokingStatus || ""} onValueChange={(value) => updateFormData("smokingStatus", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select smoking status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never smoked</SelectItem>
                    <SelectItem value="former">Former smoker</SelectItem>
                    <SelectItem value="current">Current smoker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 7:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Support System
              </CardTitle>
              <CardDescription>
                Having support can make a big difference in achieving your health goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familySupport"
                    checked={formData.familySupport || false}
                    onCheckedChange={(checked) => updateFormData("familySupport", checked)}
                  />
                  <Label htmlFor="familySupport">
                    I have family support for my health and nutrition goals
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="friendsSupport"
                    checked={formData.friendsSupport || false}
                    onCheckedChange={(checked) => updateFormData("friendsSupport", checked)}
                  />
                  <Label htmlFor="friendsSupport">
                    I have friends who support my health and nutrition goals
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="professionalSupport"
                    checked={formData.professionalSupport || false}
                    onCheckedChange={(checked) => updateFormData("professionalSupport", checked)}
                  />
                  <Label htmlFor="professionalSupport">
                    I work with a nutritionist, dietitian, or health coach
                  </Label>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  You're almost done!
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This information will help us create a personalized nutrition plan that fits your lifestyle, 
                  preferences, and goals. You can always update these details later in your profile settings.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Complete Your Profile</h1>
          <p className="text-lg text-muted-foreground">
            Help us create a personalized nutrition plan just for you
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {steps.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% complete</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8 overflow-x-auto">
          {steps.map((step) => {
            const StepIcon = step.icon;
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            
            return (
              <div
                key={step.number}
                className={`flex flex-col items-center min-w-0 flex-1 ${
                  isCurrent ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-muted'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                </div>
                <span className="text-xs text-center font-medium hidden sm:block">{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* Auto-save Status */}
        <div className="mb-4 flex justify-center">
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

        {/* Current Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep === steps.length ? (
            <Button
              onClick={handleComplete}
              disabled={saveOnboardingMutation.isPending}
              className="flex items-center gap-2"
            >
              {saveOnboardingMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Check className="w-4 h-4" />
              )}
              Complete Profile
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={saveOnboardingMutation.isPending}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip for now - I'll complete this later
          </Button>
        </div>
      </div>
    </div>
  );
}