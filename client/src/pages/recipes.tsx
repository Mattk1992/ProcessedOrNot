import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, Clock, Users, ChefHat, ExternalLink, ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";

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

export default function Recipes() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a recipe name or ingredient to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setSelectedRecipe(null);

    try {
      const response = await fetch('/api/recipes/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('Failed to search recipes');
      }

      const data = await response.json();
      setSearchResults(data.recipes || []);

      if (!data.recipes || data.recipes.length === 0) {
        toast({
          title: "No Recipes Found",
          description: `No recipes found for "${searchQuery}". Try searching for different ingredients or recipe names.`,
        });
      }
    } catch (error) {
      console.error('Recipe search error:', error);
      toast({
        title: "Search Failed",
        description: "Failed to search recipes. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/nutri-dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Recipe Database
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Search for recipes from multiple culinary databases
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Recipe Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">
                  Search for recipes
                </Label>
                <Input
                  id="search"
                  placeholder="Search for recipes by name, ingredient, or cuisine (e.g., 'chicken pasta', 'vegetarian', 'chocolate cake')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSearching}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !searchQuery.trim()}
                className="min-w-[100px]"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Powered by cascading recipe databases including The Meal DB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recipe Details View */}
        {selectedRecipe && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{selectedRecipe.title}</CardTitle>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{selectedRecipe.source}</Badge>
                    {selectedRecipe.category && (
                      <Badge variant="outline">{selectedRecipe.category}</Badge>
                    )}
                    {selectedRecipe.cuisine && (
                      <Badge variant="outline">{selectedRecipe.cuisine}</Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedRecipe(null)}
                  className="text-gray-500"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recipe Image */}
                {selectedRecipe.image && (
                  <div className="lg:col-span-1">
                    <img
                      src={selectedRecipe.image}
                      alt={selectedRecipe.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {/* Recipe Info */}
                <div className={selectedRecipe.image ? "lg:col-span-2" : "lg:col-span-3"}>
                  {/* Quick Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {selectedRecipe.cookingTime && (
                      <div className="text-center">
                        <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                        <div className="text-sm font-medium">{selectedRecipe.cookingTime}</div>
                        <div className="text-xs text-gray-500">Cook Time</div>
                      </div>
                    )}
                    {selectedRecipe.servings && (
                      <div className="text-center">
                        <Users className="w-5 h-5 mx-auto mb-1 text-green-500" />
                        <div className="text-sm font-medium">{selectedRecipe.servings}</div>
                        <div className="text-xs text-gray-500">Servings</div>
                      </div>
                    )}
                    {selectedRecipe.difficulty && (
                      <div className="text-center">
                        <ChefHat className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                        <div className="text-sm font-medium">{selectedRecipe.difficulty}</div>
                        <div className="text-xs text-gray-500">Difficulty</div>
                      </div>
                    )}
                    {selectedRecipe.calories && (
                      <div className="text-center">
                        <div className="w-5 h-5 mx-auto mb-1 bg-red-500 text-white rounded text-xs flex items-center justify-center font-bold">cal</div>
                        <div className="text-sm font-medium">{selectedRecipe.calories}</div>
                        <div className="text-xs text-gray-500">Calories</div>
                      </div>
                    )}
                  </div>

                  {/* Nutrition Info */}
                  {(selectedRecipe.protein || selectedRecipe.carbs || selectedRecipe.fat) && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Nutrition (per serving)</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {selectedRecipe.protein && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{selectedRecipe.protein}g</div>
                            <div className="text-sm text-gray-500">Protein</div>
                          </div>
                        )}
                        {selectedRecipe.carbs && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">{selectedRecipe.carbs}g</div>
                            <div className="text-sm text-gray-500">Carbs</div>
                          </div>
                        )}
                        {selectedRecipe.fat && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">{selectedRecipe.fat}g</div>
                            <div className="text-sm text-gray-500">Fat</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {selectedRecipe.description && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-gray-700 dark:text-gray-300">{selectedRecipe.description}</p>
                    </div>
                  )}

                  {/* Ingredients */}
                  {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Ingredients</h4>
                      <ul className="space-y-1">
                        {selectedRecipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-gray-700 dark:text-gray-300">{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Instructions */}
                  {selectedRecipe.instructions && selectedRecipe.instructions.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Instructions</h4>
                      <ol className="space-y-3">
                        {selectedRecipe.instructions.map((instruction, index) => (
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
                  {selectedRecipe.sourceUrl && (
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedRecipe.sourceUrl, '_blank')}
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
        )}

        {/* Search Results */}
        {hasSearched && !selectedRecipe && (
          <div>
            {searchResults.length > 0 && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Search Results ({searchResults.length})
                </h2>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  {recipe.image && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{recipe.title}</h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">{recipe.source}</Badge>
                      {recipe.category && (
                        <Badge variant="outline" className="text-xs">{recipe.category}</Badge>
                      )}
                    </div>

                    {recipe.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        {recipe.cookingTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {recipe.cookingTime}
                          </span>
                        )}
                        {recipe.servings && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {recipe.servings}
                          </span>
                        )}
                      </div>
                      {recipe.calories && (
                        <span className="font-medium">{recipe.calories} cal</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {hasSearched && searchResults.length === 0 && !isSearching && (
              <Card>
                <CardContent className="p-8 text-center">
                  <ChefHat className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Recipes Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No recipes found for "{searchQuery}". Try searching for different ingredients or recipe names.
                  </p>
                  <Button onClick={() => setSearchQuery("")} variant="outline">
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Welcome Message */}
        {!hasSearched && (
          <Card>
            <CardContent className="p-8 text-center">
              <ChefHat className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-semibold mb-2">Welcome to Recipe Database</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                Discover delicious recipes from our cascading database system. Search by recipe name, 
                ingredients, or cuisine type to find the perfect meal for any occasion.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  The Meal DB
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Multiple Recipe Sources
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}