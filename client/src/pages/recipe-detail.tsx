import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Clock, Users, ChefHat, ExternalLink, Heart, CalendarPlus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RecipeShare from "@/components/recipe-share";

interface Recipe {
  id: string;
  title: string;
  description?: string;
  image?: string;
  cookingTime?: string;
  servings?: string;
  difficulty?: string;
  ingredients?: string[];
  instructions?: string[];
  source: string;
  sourceUrl?: string;
  category?: string;
  cuisine?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [calendarDate, setCalendarDate] = useState("");
  const [calendarTime, setCalendarTime] = useState("");
  const [calendarServings, setCalendarServings] = useState<number>(1);
  const [isSaved, setIsSaved] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  // Fetch recipe details
  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ['/api/recipes', id],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/recipes/${id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Recipe not found');
          }
          throw new Error(`Failed to fetch recipe: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('Raw response:', text); // Debug log
        
        if (!text) {
          throw new Error('Empty response from server');
        }
        
        const data = JSON.parse(text);
        console.log('Recipe data received:', data); // Debug log
        return data as Recipe;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    },
    enabled: !!id,
    retry: false, // Don't retry on 404
  });

  // Save recipe mutation
  const saveRecipeMutation = useMutation({
    mutationFn: async (recipe: Recipe) => {
      const response = await apiRequest('POST', '/api/recipes/save', { recipe });
      return response;
    },
    onSuccess: () => {
      setIsSaved(true);
      toast({
        title: "Recipe Saved",
        description: `"${recipe?.title}" has been saved to your recipe collection.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recipes/saved'] });
    },
    onError: (error: any) => {
      if (error.status === 409) {
        toast({
          title: "Already Saved",
          description: `"${recipe?.title}" is already in your saved recipes.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Save Failed",
          description: error.message || "Failed to save recipe. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Add to Calendar mutation
  const addToCalendarMutation = useMutation({
    mutationFn: async ({ recipe, date, time, servings }: { recipe: Recipe, date: string, time: string, servings: number }) => {
      const response = await apiRequest('POST', '/api/calendar/add-recipe', {
        recipe,
        date,
        time,
        servings
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Added to Calendar",
        description: `"${recipe?.title}" has been scheduled for ${calendarDate} at ${calendarTime}.`,
      });
      setShowCalendarDialog(false);
      setCalendarDate("");
      setCalendarTime("");
      setCalendarServings(1);
      queryClient.invalidateQueries({ queryKey: ['/api/calendar'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding to Calendar",
        description: error.message || "Failed to add recipe to calendar.",
        variant: "destructive",
      });
    },
  });

  const handleSaveRecipe = () => {
    if (!recipe) return;
    
    if (user?.accountType === 'Regular') {
      toast({
        title: "Premium Feature",
        description: "Saving recipes is available for Paid and Admin users.",
        variant: "destructive",
      });
      return;
    }

    if (isSaved) {
      toast({
        title: "Already Saved",
        description: "This recipe is already in your collection.",
      });
      return;
    }

    saveRecipeMutation.mutate(recipe);
  };

  const handleAddToCalendar = () => {
    if (!recipe) return;
    
    setShowCalendarDialog(true);
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setCalendarDate(today);
    // Set default time to current time
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setCalendarTime(currentTime);
    setCalendarServings(1);
  };

  const handleCalendarSubmit = () => {
    if (!recipe || !calendarDate || !calendarTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time.",
        variant: "destructive",
      });
      return;
    }

    addToCalendarMutation.mutate({
      recipe,
      date: calendarDate,
      time: calendarTime,
      servings: calendarServings
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading recipe...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Recipe fetch error:', error); // Debug log
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/recipes')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Recipes
            </Button>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Recipe Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The recipe you're looking for doesn't exist or has been removed.
              </p>
              <p className="text-sm text-gray-500">
                Error: {error.message}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!recipe && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/recipes')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Recipes
            </Button>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Recipe Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400">
                The recipe you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/recipes')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Recipes
          </Button>
          
          <div className="flex items-center gap-2">
            <RecipeShare recipe={recipe} />
            <Button
              variant="outline"
              onClick={handleAddToCalendar}
              className="flex items-center gap-2"
            >
              <CalendarPlus className="w-4 h-4" />
              Add to Calendar
            </Button>
            <Button
              variant={isSaved ? "default" : "secondary"}
              onClick={handleSaveRecipe}
              disabled={saveRecipeMutation.isPending}
              className="flex items-center gap-2"
            >
              {saveRecipeMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              )}
              {isSaved ? 'Saved' : 'Save Recipe'}
            </Button>
          </div>
        </div>

        {/* Recipe Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl mb-2">{recipe.title}</CardTitle>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{recipe.source}</Badge>
              {recipe.category && (
                <Badge variant="outline">{recipe.category}</Badge>
              )}
              {recipe.cuisine && (
                <Badge variant="outline">{recipe.cuisine}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recipe Image */}
              {recipe.image && (
                <div className="lg:col-span-1">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              {/* Recipe Info */}
              <div className={recipe.image ? "lg:col-span-2" : "lg:col-span-3"}>
                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {recipe.cookingTime && (
                    <div className="text-center">
                      <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                      <div className="text-sm font-medium">{recipe.cookingTime}</div>
                      <div className="text-xs text-gray-500">Cook Time</div>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="text-center">
                      <Users className="w-5 h-5 mx-auto mb-1 text-green-500" />
                      <div className="text-sm font-medium">{recipe.servings}</div>
                      <div className="text-xs text-gray-500">Servings</div>
                    </div>
                  )}
                  {recipe.difficulty && (
                    <div className="text-center">
                      <ChefHat className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                      <div className="text-sm font-medium">{recipe.difficulty}</div>
                      <div className="text-xs text-gray-500">Difficulty</div>
                    </div>
                  )}
                  {recipe.calories && (
                    <div className="text-center">
                      <div className="w-5 h-5 mx-auto mb-1 bg-red-500 text-white rounded text-xs flex items-center justify-center font-bold">cal</div>
                      <div className="text-sm font-medium">{recipe.calories}</div>
                      <div className="text-xs text-gray-500">Calories</div>
                    </div>
                  )}
                </div>

                {/* Nutrition Info */}
                {(recipe.protein || recipe.carbs || recipe.fat) && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Nutrition (per serving)</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {recipe.protein && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{recipe.protein}g</div>
                          <div className="text-sm text-gray-500">Protein</div>
                        </div>
                      )}
                      {recipe.carbs && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">{recipe.carbs}g</div>
                          <div className="text-sm text-gray-500">Carbs</div>
                        </div>
                      )}
                      {recipe.fat && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{recipe.fat}g</div>
                          <div className="text-sm text-gray-500">Fat</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {recipe.description && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-gray-700 dark:text-gray-300">{recipe.description}</p>
                  </div>
                )}

                {/* Ingredients */}
                {recipe.ingredients && recipe.ingredients.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Ingredients</h4>
                    <ul className="space-y-1">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-gray-700 dark:text-gray-300">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Instructions */}
                {recipe.instructions && recipe.instructions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Instructions</h4>
                    <ol className="space-y-3">
                      {recipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full text-sm flex items-center justify-center font-bold flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Source Link */}
                {recipe.sourceUrl && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => window.open(recipe.sourceUrl, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Original Recipe
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add to Calendar Dialog */}
        <Dialog open={showCalendarDialog} onOpenChange={setShowCalendarDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add to Calendar</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="calendar-date">Date</Label>
                <Input
                  id="calendar-date"
                  type="date"
                  value={calendarDate}
                  onChange={(e) => setCalendarDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="calendar-time">Time</Label>
                <Input
                  id="calendar-time"
                  type="time"
                  value={calendarTime}
                  onChange={(e) => setCalendarTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="calendar-servings">Servings</Label>
                <Input
                  id="calendar-servings"
                  type="number"
                  min="1"
                  max="20"
                  value={calendarServings}
                  onChange={(e) => setCalendarServings(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCalendarDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCalendarSubmit}
                  disabled={addToCalendarMutation.isPending}
                >
                  {addToCalendarMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add to Calendar'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}