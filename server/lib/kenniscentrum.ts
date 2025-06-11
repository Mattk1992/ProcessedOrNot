import type { InsertProduct } from "@shared/schema";

interface KenniscentrumFood {
  product_id: string;
  product_name: string;
  brand_name?: string;
  category: string;
  barcode?: string;
  ingredients_list?: string;
  nutritional_info: {
    calories_per_100g?: number;
    protein_g?: number;
    carbs_g?: number;
    sugar_g?: number;
    fat_g?: number;
    saturated_fat_g?: number;
    salt_mg?: number;
    fiber_g?: number;
  };
  health_score?: number;
}

interface KenniscentrumResponse {
  products: KenniscentrumFood[];
  count: number;
}

export async function fetchProductFromKenniscentrum(barcode: string): Promise<InsertProduct | null> {
  try {
    // Kenniscentrum Gezond Gewicht (Knowledge Centre Healthy Weight) API
    const response = await fetch(`https://api.kenniscentrumgezondgewicht.nl/products/lookup?barcode=${barcode}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data: KenniscentrumResponse = await response.json();

    if (!data.products || data.products.length === 0) {
      return null;
    }

    const product = data.products[0];

    // Convert nutritional info to our format
    const nutriments: Record<string, number> = {};
    const nutrition = product.nutritional_info;
    
    if (nutrition.calories_per_100g) {
      nutriments.energy_100g = nutrition.calories_per_100g;
    }
    if (nutrition.protein_g) {
      nutriments.proteins_100g = nutrition.protein_g;
    }
    if (nutrition.carbs_g) {
      nutriments.carbohydrates_100g = nutrition.carbs_g;
    }
    if (nutrition.sugar_g) {
      nutriments.sugars_100g = nutrition.sugar_g;
    }
    if (nutrition.fat_g) {
      nutriments.fat_100g = nutrition.fat_g;
    }
    if (nutrition.saturated_fat_g) {
      nutriments.saturated_fat_100g = nutrition.saturated_fat_g;
    }
    if (nutrition.salt_mg) {
      nutriments.salt_100g = nutrition.salt_mg / 1000; // Convert mg to g
    }
    if (nutrition.fiber_g) {
      nutriments.fiber_100g = nutrition.fiber_g;
    }

    const productData: InsertProduct = {
      barcode,
      productName: product.product_name,
      brands: product.brand_name || null,
      imageUrl: null,
      ingredientsText: product.ingredients_list || null,
      nutriments: Object.keys(nutriments).length > 0 ? nutriments : null,
      processingScore: product.health_score || null,
      dataSource: 'Kenniscentrum Gezond Gewicht'
    };

    return productData;
  } catch (error) {
    console.error('Error fetching from Kenniscentrum Gezond Gewicht:', error);
    return null;
  }
}