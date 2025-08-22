import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Clock, 
  Users, 
  ChefHat, 
  ExternalLink, 
  ArrowLeft, 
  Heart, 
  Trash2,
  BookmarkPlus,
  Filter,
  Star
} from "lucide-react";

interface SavedRecipe {
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
  savedAt: string;
  rating?: number;
  notes?: string;
}

export default function SavedRecipes() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch saved recipes
  const { data: savedRecipesData, isLoading, error } = useQuery({
    queryKey: ['/api/recipes/saved'],
    enabled: isAuthenticated && user?.accountType !== 'Regular',
  });
  
  const savedRecipes = savedRecipesData?.savedRecipes || [];

  // Delete saved recipe mutation
  const deleteRecipeMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      const response = await apiRequest('DELETE', `/api/recipes/saved/${recipeId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes/saved'] });
      toast({
        title: "Recipe removed",
        description: "Recipe has been removed from your saved list.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove recipe.",
        variant: "destructive",
      });
    },
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  // Check if user has access (Admin or Paid only)
  if (user?.accountType === 'Regular') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/nutri-dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Saved Recipes</h1>
          </div>

          <Card className="text-center p-8">
            <CardContent>
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Premium Feature</h2>
              <p className="text-muted-foreground mb-4">
                Save your favorite recipes for easy access. This feature is available for Paid and Admin users.
              </p>
              <Button onClick={() => setLocation('/subscription')}>
                Upgrade to Access Saved Recipes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const filteredRecipes = savedRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveRecipe = (recipeId: string) => {
    deleteRecipeMutation.mutate(recipeId);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating}/5)</span>
      </div>
    );
  };

  if (selectedRecipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedRecipe(null)}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Saved Recipes
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                {selectedRecipe.image && (
                  <img 
                    src={selectedRecipe.image} 
                    alt={selectedRecipe.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
                <h1 className="text-2xl font-bold mb-2">{selectedRecipe.title}</h1>
                {selectedRecipe.description && (
                  <p className="text-muted-foreground mb-4">{selectedRecipe.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedRecipe.category && (
                    <Badge variant="secondary">{selectedRecipe.category}</Badge>
                  )}
                  {selectedRecipe.cuisine && (
                    <Badge variant="outline">{selectedRecipe.cuisine}</Badge>
                  )}
                  {selectedRecipe.difficulty && (
                    <Badge className={getDifficultyColor(selectedRecipe.difficulty)}>
                      {selectedRecipe.difficulty}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {selectedRecipe.cookingTime && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedRecipe.cookingTime}</span>
                    </div>
                  )}
                  {selectedRecipe.servings && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedRecipe.servings}</span>
                    </div>
                  )}
                </div>

                {selectedRecipe.rating && (
                  <div className="mb-4">
                    {renderStars(selectedRecipe.rating)}
                  </div>
                )}

                {selectedRecipe.notes && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">My Notes</h3>
                    <p className="text-sm text-muted-foreground">{selectedRecipe.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ingredients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          <span className="text-sm">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {selectedRecipe.instructions && selectedRecipe.instructions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3">
                      {selectedRecipe.instructions.map((step, index) => (
                        <li key={index} className="flex space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {(selectedRecipe.calories || selectedRecipe.protein || selectedRecipe.carbs || selectedRecipe.fat) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Nutrition Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedRecipe.calories && (
                        <div>
                          <span className="text-sm font-medium">Calories</span>
                          <p className="text-lg">{selectedRecipe.calories}</p>
                        </div>
                      )}
                      {selectedRecipe.protein && (
                        <div>
                          <span className="text-sm font-medium">Protein</span>
                          <p className="text-lg">{selectedRecipe.protein}g</p>
                        </div>
                      )}
                      {selectedRecipe.carbs && (
                        <div>
                          <span className="text-sm font-medium">Carbs</span>
                          <p className="text-lg">{selectedRecipe.carbs}g</p>
                        </div>
                      )}
                      {selectedRecipe.fat && (
                        <div>
                          <span className="text-sm font-medium">Fat</span>
                          <p className="text-lg">{selectedRecipe.fat}g</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/nutri-dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold flex items-center">
              <Heart className="w-8 h-8 mr-3 text-red-500" />
              Saved Recipes
            </h1>
          </div>
          <Button onClick={() => setLocation('/recipes')}>
            <BookmarkPlus className="w-4 h-4 mr-2" />
            Find More Recipes
          </Button>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search saved recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {savedRecipes.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Saved Recipes Yet</h2>
              <p className="text-muted-foreground mb-6">
                Save your favorite recipes from the Recipe Search to access them quickly here.
              </p>
              <Button onClick={() => setLocation('/recipes')}>
                <ChefHat className="w-4 h-4 mr-2" />
                Explore Recipes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Search Results Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground">
                {filteredRecipes.length} saved recipe{filteredRecipes.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>

            {/* Recipe Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {recipe.image && (
                      <div className="relative">
                        <img 
                          src={recipe.image} 
                          alt={recipe.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveRecipe(recipe.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{recipe.title}</h3>
                      
                      {recipe.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {recipe.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1 mb-3">
                        {recipe.category && (
                          <Badge variant="secondary" className="text-xs">{recipe.category}</Badge>
                        )}
                        {recipe.cuisine && (
                          <Badge variant="outline" className="text-xs">{recipe.cuisine}</Badge>
                        )}
                        {recipe.difficulty && (
                          <Badge className={`text-xs ${getDifficultyColor(recipe.difficulty)}`}>
                            {recipe.difficulty}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        {recipe.cookingTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{recipe.cookingTime}</span>
                          </div>
                        )}
                        {recipe.servings && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{recipe.servings}</span>
                          </div>
                        )}
                      </div>

                      {recipe.rating && (
                        <div className="mb-3">
                          {renderStars(recipe.rating)}
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRecipe(recipe)}
                        >
                          View Recipe
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          Saved {new Date(recipe.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}