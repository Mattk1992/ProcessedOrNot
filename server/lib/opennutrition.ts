import { InsertProduct } from "@shared/schema";

// OpenNutrition API
export async function fetchProductFromOpenNutrition(barcode: string): Promise<InsertProduct | null> {
  try {
    console.log(`Fetching product from OpenNutrition for barcode: ${barcode}`);
    
    // OpenNutrition API endpoint (hypothetical - would need actual API documentation)
    const response = await fetch(`https://api.opennutrition.org/v1/products/${barcode}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NutritionApp/1.0'
      }
    });

    if (!response.ok) {
      console.log(`OpenNutrition API returned ${response.status} for barcode ${barcode}`);
      return null;
    }

    const data = await response.json();
    
    if (!data || !data.product) {
      console.log(`No product data found in OpenNutrition for barcode ${barcode}`);
      return null;
    }

    const product_data = data.product;
    
    // Map OpenNutrition data to our product structure
    const product: InsertProduct = {
      barcode,
      productName: product_data.name || product_data.title || null,
      brands: product_data.brand || product_data.manufacturer || null,
      imageUrl: product_data.image || product_data.image_url || null,
      ingredientsText: product_data.ingredients || product_data.ingredient_list || null,
      nutriments: product_data.nutrition ? {
        energy_100g: product_data.nutrition.energy_kj || (product_data.nutrition.energy_kcal * 4.184) || null,
        fat_100g: product_data.nutrition.fat || null,
        saturated_fat_100g: product_data.nutrition.saturated_fat || null,
        carbohydrates_100g: product_data.nutrition.carbohydrates || null,
        sugars_100g: product_data.nutrition.sugars || null,
        proteins_100g: product_data.nutrition.protein || null,
        salt_100g: product_data.nutrition.salt || (product_data.nutrition.sodium ? product_data.nutrition.sodium * 2.54 / 1000 : null),
        fiber_100g: product_data.nutrition.fiber || null
      } : null,
      processingScore: 0,
      processingExplanation: "Analysis pending",
      glycemicIndex: null,
      glycemicLoad: null,
      glycemicExplanation: "Analysis pending",
      dataSource: 'OpenNutrition'
    };

    console.log(`Successfully found product in OpenNutrition: ${product.productName}`);
    return product;
    
  } catch (error) {
    console.error('Error fetching from OpenNutrition:', error);
    return null;
  }
}