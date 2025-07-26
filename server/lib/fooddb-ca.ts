import { InsertProduct } from "@shared/schema";

// FoodDB.ca - Canadian Food Database
export async function fetchProductFromFoodDBCA(barcode: string): Promise<InsertProduct | null> {
  try {
    console.log(`Fetching product from FoodDB.ca for barcode: ${barcode}`);
    
    // FoodDB.ca API endpoint (hypothetical - would need actual API documentation)
    const response = await fetch(`https://fooddb.ca/api/v1/foods/${barcode}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NutritionApp/1.0'
      }
    });

    if (!response.ok) {
      console.log(`FoodDB.ca API returned ${response.status} for barcode ${barcode}`);
      return null;
    }

    const data = await response.json();
    
    if (!data || !data.food) {
      console.log(`No food data found in FoodDB.ca for barcode ${barcode}`);
      return null;
    }

    const food = data.food;
    
    // Map FoodDB.ca data to our product structure
    const product: InsertProduct = {
      barcode,
      productName: food.name || food.description || null,
      brands: food.brand || food.manufacturer || null,
      imageUrl: food.image_url || null,
      ingredientsText: food.ingredients || null,
      nutriments: food.nutrition ? {
        energy_100g: food.nutrition.energy || null,
        fat_100g: food.nutrition.fat || null,
        saturated_fat_100g: food.nutrition.saturated_fat || null,
        carbohydrates_100g: food.nutrition.carbohydrates || null,
        sugars_100g: food.nutrition.sugars || null,
        proteins_100g: food.nutrition.protein || null,
        salt_100g: food.nutrition.sodium ? (food.nutrition.sodium * 2.54) : null, // Convert sodium to salt
        fiber_100g: food.nutrition.fiber || null
      } : null,
      processingScore: 0,
      processingExplanation: "Analysis pending",
      glycemicIndex: null,
      glycemicLoad: null,
      glycemicExplanation: "Analysis pending",
      dataSource: 'FoodDB.ca'
    };

    console.log(`Successfully found product in FoodDB.ca: ${product.productName}`);
    return product;
    
  } catch (error) {
    console.error('Error fetching from FoodDB.ca:', error);
    return null;
  }
}