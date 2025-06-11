import type { InsertProduct } from "@shared/schema";

interface RIVMFood {
  food_code: string;
  food_name: string;
  food_description?: string;
  ingredients?: string;
  nutrients: Array<{
    nutrient_code: string;
    nutrient_name: string;
    value: number;
    unit: string;
  }>;
}

interface RIVMResponse {
  foods: RIVMFood[];
  total_count: number;
}

export async function fetchProductFromRIVM(barcode: string): Promise<InsertProduct | null> {
  try {
    // RIVM (Dutch National Institute for Public Health and the Environment) API
    // Note: This is a conceptual implementation - actual API endpoints would need to be verified
    const response = await fetch(`https://api.rivm.nl/food/search?barcode=${barcode}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data: RIVMResponse = await response.json();

    if (!data.foods || data.foods.length === 0) {
      return null;
    }

    const food = data.foods[0];

    // Convert RIVM nutrients to our format
    const nutriments: Record<string, number> = {};
    
    food.nutrients.forEach(nutrient => {
      const code = nutrient.nutrient_code.toLowerCase();
      if (code.includes('energy') || code.includes('kcal')) {
        nutriments.energy_100g = nutrient.value;
      } else if (code.includes('protein')) {
        nutriments.proteins_100g = nutrient.value;
      } else if (code.includes('carbohydrate')) {
        nutriments.carbohydrates_100g = nutrient.value;
      } else if (code.includes('sugar')) {
        nutriments.sugars_100g = nutrient.value;
      } else if (code.includes('fat') && !code.includes('saturated')) {
        nutriments.fat_100g = nutrient.value;
      } else if (code.includes('saturated')) {
        nutriments.saturated_fat_100g = nutrient.value;
      } else if (code.includes('salt') || code.includes('sodium')) {
        if (code.includes('sodium')) {
          nutriments.salt_100g = nutrient.value * 2.5; // Convert sodium to salt
        } else {
          nutriments.salt_100g = nutrient.value;
        }
      }
    });

    const productData: InsertProduct = {
      barcode,
      productName: food.food_name,
      brands: null,
      imageUrl: null,
      ingredientsText: food.ingredients || null,
      nutriments: Object.keys(nutriments).length > 0 ? nutriments : null,
      processingScore: null,
      dataSource: 'RIVM'
    };

    return productData;
  } catch (error) {
    console.error('Error fetching from RIVM:', error);
    return null;
  }
}