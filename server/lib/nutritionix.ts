import { InsertProduct } from "@shared/schema";

// Nutritionix API
export async function fetchProductFromNutritionix(barcode: string): Promise<InsertProduct | null> {
  try {
    console.log(`Fetching product from Nutritionix for barcode: ${barcode}`);
    
    // Nutritionix requires API credentials
    const appId = process.env.NUTRITIONIX_APP_ID;
    const appKey = process.env.NUTRITIONIX_APP_KEY;
    
    if (!appId || !appKey) {
      console.log('Nutritionix API credentials not found in environment variables');
      return null;
    }
    
    // Search for product by UPC/barcode
    const response = await fetch(`https://trackapi.nutritionix.com/v2/search/item?upc=${barcode}`, {
      method: 'GET',
      headers: {
        'x-app-id': appId,
        'x-app-key': appKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.log(`Nutritionix API returned ${response.status} for barcode ${barcode}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.foods || data.foods.length === 0) {
      console.log(`No foods found in Nutritionix for barcode ${barcode}`);
      return null;
    }

    const food = data.foods[0];
    
    // Map Nutritionix data to our product structure
    const product: InsertProduct = {
      barcode,
      productName: food.food_name || food.brand_name || null,
      brands: food.brand_name || null,
      imageUrl: food.photo ? food.photo.thumb || food.photo.highres : null,
      ingredientsText: food.nf_ingredient_statement || null,
      nutriments: {
        energy_100g: food.nf_calories ? (food.nf_calories * 4.184 * 100 / food.serving_weight_grams) : null, // Convert kcal to kJ per 100g
        fat_100g: food.nf_total_fat ? (food.nf_total_fat * 100 / food.serving_weight_grams) : null,
        saturated_fat_100g: food.nf_saturated_fat ? (food.nf_saturated_fat * 100 / food.serving_weight_grams) : null,
        carbohydrates_100g: food.nf_total_carbohydrate ? (food.nf_total_carbohydrate * 100 / food.serving_weight_grams) : null,
        sugars_100g: food.nf_sugars ? (food.nf_sugars * 100 / food.serving_weight_grams) : null,
        proteins_100g: food.nf_protein ? (food.nf_protein * 100 / food.serving_weight_grams) : null,
        salt_100g: food.nf_sodium ? (food.nf_sodium * 2.54 * 100 / food.serving_weight_grams / 1000) : null, // Convert mg sodium to g salt per 100g
        fiber_100g: food.nf_dietary_fiber ? (food.nf_dietary_fiber * 100 / food.serving_weight_grams) : null
      },
      processingScore: 0,
      processingExplanation: "Analysis pending",
      glycemicIndex: null,
      glycemicLoad: null,
      glycemicExplanation: "Analysis pending",
      dataSource: 'Nutritionix'
    };

    console.log(`Successfully found product in Nutritionix: ${product.productName}`);
    return product;
    
  } catch (error) {
    console.error('Error fetching from Nutritionix:', error);
    return null;
  }
}