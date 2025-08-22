import OpenAI from 'openai';
import { getUserAIProvider } from './openai';

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

interface RecipeLookupResult {
  recipes: Recipe[];
  source: string;
  error?: string;
}

/**
 * Search for recipes using The Meal DB API
 */
async function searchTheMealDB(query: string): Promise<RecipeLookupResult> {
  console.log(`Searching The Meal DB for: ${query}`);
  
  try {
    // Search by recipe name
    const searchUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`The Meal DB API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.meals || !Array.isArray(data.meals)) {
      console.log(`No recipes found in The Meal DB for: ${query}`);
      return { recipes: [], source: "The Meal DB" };
    }

    const recipes: Recipe[] = data.meals.map((meal: any) => {
      // Extract ingredients with measurements
      const ingredients: string[] = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        
        if (ingredient && ingredient.trim()) {
          const fullIngredient = measure && measure.trim() 
            ? `${measure.trim()} ${ingredient.trim()}`
            : ingredient.trim();
          ingredients.push(fullIngredient);
        }
      }

      // Split instructions into steps
      const instructions = meal.strInstructions
        ? meal.strInstructions
            .split(/\r?\n/)
            .map((step: string) => step.trim())
            .filter((step: string) => step.length > 0)
        : [];

      return {
        id: meal.idMeal,
        title: meal.strMeal,
        description: `${meal.strCategory} from ${meal.strArea} cuisine`,
        image: meal.strMealThumb,
        cookingTime: undefined, // The Meal DB doesn't provide cooking time
        servings: undefined, // The Meal DB doesn't provide servings
        difficulty: undefined, // The Meal DB doesn't provide difficulty
        ingredients,
        instructions,
        source: "The Meal DB",
        sourceUrl: meal.strSource || undefined,
        category: meal.strCategory,
        cuisine: meal.strArea,
        calories: undefined, // The Meal DB doesn't provide nutritional info
        protein: undefined,
        carbs: undefined,
        fat: undefined,
      };
    });

    console.log(`Found ${recipes.length} recipes from The Meal DB`);
    return { recipes, source: "The Meal DB" };

  } catch (error) {
    console.error("Error searching The Meal DB:", error);
    return {
      recipes: [],
      source: "The Meal DB",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Search for recipes by ingredient using The Meal DB API
 */
async function searchTheMealDBByIngredient(ingredient: string): Promise<RecipeLookupResult> {
  console.log(`Searching The Meal DB by ingredient: ${ingredient}`);
  
  try {
    // Search by main ingredient
    const searchUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`The Meal DB API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.meals || !Array.isArray(data.meals)) {
      console.log(`No recipes found in The Meal DB for ingredient: ${ingredient}`);
      return { recipes: [], source: "The Meal DB" };
    }

    // Get detailed information for each recipe (limited to first 10 for performance)
    const detailedRecipes: Recipe[] = [];
    const recipesToFetch = data.meals.slice(0, 10);

    for (const meal of recipesToFetch) {
      try {
        const detailUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`;
        const detailResponse = await fetch(detailUrl);
        
        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          if (detailData.meals && detailData.meals[0]) {
            const detailedMeal = detailData.meals[0];
            
            // Extract ingredients with measurements
            const ingredients: string[] = [];
            for (let i = 1; i <= 20; i++) {
              const ing = detailedMeal[`strIngredient${i}`];
              const measure = detailedMeal[`strMeasure${i}`];
              
              if (ing && ing.trim()) {
                const fullIngredient = measure && measure.trim() 
                  ? `${measure.trim()} ${ing.trim()}`
                  : ing.trim();
                ingredients.push(fullIngredient);
              }
            }

            // Split instructions into steps
            const instructions = detailedMeal.strInstructions
              ? detailedMeal.strInstructions
                  .split(/\r?\n/)
                  .map((step: string) => step.trim())
                  .filter((step: string) => step.length > 0)
              : [];

            detailedRecipes.push({
              id: detailedMeal.idMeal,
              title: detailedMeal.strMeal,
              description: `${detailedMeal.strCategory} from ${detailedMeal.strArea} cuisine`,
              image: detailedMeal.strMealThumb,
              cookingTime: undefined,
              servings: undefined,
              difficulty: undefined,
              ingredients,
              instructions,
              source: "The Meal DB",
              sourceUrl: detailedMeal.strSource || undefined,
              category: detailedMeal.strCategory,
              cuisine: detailedMeal.strArea,
              calories: undefined,
              protein: undefined,
              carbs: undefined,
              fat: undefined,
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch details for recipe ${meal.idMeal}:`, error);
        // Add basic recipe info if detailed fetch fails
        detailedRecipes.push({
          id: meal.idMeal,
          title: meal.strMeal,
          description: undefined,
          image: meal.strMealThumb,
          cookingTime: undefined,
          servings: undefined,
          difficulty: undefined,
          ingredients: [],
          instructions: [],
          source: "The Meal DB",
          sourceUrl: undefined,
          category: undefined,
          cuisine: undefined,
          calories: undefined,
          protein: undefined,
          carbs: undefined,
          fat: undefined,
        });
      }
    }

    console.log(`Found ${detailedRecipes.length} detailed recipes from The Meal DB by ingredient`);
    return { recipes: detailedRecipes, source: "The Meal DB" };

  } catch (error) {
    console.error("Error searching The Meal DB by ingredient:", error);
    return {
      recipes: [],
      source: "The Meal DB",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Generate recipes using AI when database search fails
 */
async function generateRecipesWithAI(query: string, userId?: number): Promise<RecipeLookupResult> {
  console.log(`Generating recipes with AI for: ${query}`);
  
  try {
    // Get user's AI provider setting
    const userAIProvider = await getUserAIProvider(userId);
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `Generate 3-5 recipe suggestions for "${query}". Return a JSON array of recipes with the following structure for each recipe:

{
  "id": "unique_id",
  "title": "Recipe Name",
  "description": "Brief description",
  "image": null,
  "cookingTime": "30 minutes",
  "servings": "4 servings",
  "difficulty": "Easy/Medium/Hard",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "source": "AI Generated",
  "sourceUrl": null,
  "category": "Main Course/Dessert/etc",
  "cuisine": "Italian/Asian/etc",
  "calories": 400,
  "protein": 25,
  "carbs": 45,
  "fat": 12
}

Focus on practical, achievable recipes with clear instructions. Include estimated nutritional values per serving.`;

    const completion = await openai.chat.completions.create({
      model: userAIProvider === 'gpt-4o' ? 'gpt-4o' : 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional chef and nutritionist. Generate practical, detailed recipes with accurate nutritional estimates. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated from AI');
    }

    // Parse the JSON response
    let recipes: Recipe[];
    try {
      recipes = JSON.parse(content);
      if (!Array.isArray(recipes)) {
        throw new Error('AI response is not an array');
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error('Failed to parse AI recipe response');
    }

    // Validate and clean up recipes
    const validRecipes = recipes
      .filter(recipe => recipe.title && recipe.ingredients && recipe.instructions)
      .map((recipe, index) => ({
        ...recipe,
        id: recipe.id || `ai_recipe_${Date.now()}_${index}`,
        source: "AI Generated",
        sourceUrl: undefined,
      }));

    console.log(`Generated ${validRecipes.length} recipes with AI`);
    return { recipes: validRecipes, source: "AI Generated" };

  } catch (error) {
    console.error("Error generating recipes with AI:", error);
    return {
      recipes: [],
      source: "AI Generated",
      error: error instanceof Error ? error.message : "Failed to generate recipes"
    };
  }
}

/**
 * Main recipe search function with cascading database fallback
 */
export async function cascadingRecipeSearch(query: string, userId?: number): Promise<RecipeLookupResult> {
  console.log(`Starting cascading recipe search for: ${query}`);

  // Step 1: Search The Meal DB by recipe name
  const mealDBResult = await searchTheMealDB(query);
  if (mealDBResult.recipes.length > 0) {
    console.log(`Found recipes in The Meal DB, returning ${mealDBResult.recipes.length} results`);
    return mealDBResult;
  }

  // Step 2: Search The Meal DB by ingredient if it looks like an ingredient
  const words = query.toLowerCase().split(' ');
  const commonIngredients = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'pasta', 'rice', 'potato', 'tomato', 'cheese', 'egg', 'milk', 'flour', 'sugar', 'onion', 'garlic', 'pepper', 'mushroom', 'lemon', 'carrot'];
  
  const hasIngredient = words.some(word => commonIngredients.includes(word));
  if (hasIngredient) {
    const ingredientResult = await searchTheMealDBByIngredient(query);
    if (ingredientResult.recipes.length > 0) {
      console.log(`Found recipes by ingredient in The Meal DB, returning ${ingredientResult.recipes.length} results`);
      return ingredientResult;
    }
  }

  // Step 3: Generate recipes with AI
  const aiResult = await generateRecipesWithAI(query, userId);
  if (aiResult.recipes.length > 0) {
    console.log(`Generated recipes with AI, returning ${aiResult.recipes.length} results`);
    return aiResult;
  }

  // Step 4: No results found
  console.log(`No recipes found for: ${query}`);
  return {
    recipes: [],
    source: "No results",
    error: `No recipes found for "${query}". Try different search terms or ingredients.`
  };
}