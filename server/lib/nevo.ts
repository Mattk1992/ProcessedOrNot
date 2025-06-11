import type { InsertProduct } from "@shared/schema";

interface NEVOFood {
  nevo_code: string;
  food_name: string;
  food_name_en?: string;
  food_group: string;
  ingredients?: string;
  nutrients: Array<{
    nutrient_id: string;
    nutrient_name: string;
    value: number;
    unit: string;
  }>;
}

interface NEVOResponse {
  foods: NEVOFood[];
  count: number;
}

export async function fetchProductFromNEVO(barcode: string): Promise<InsertProduct | null> {
  try {
    // NEVO (Nederlandse Voedingsstoffenbestand) - Dutch Food Composition Database
    const response = await fetch(`https://api.nevo-online.rivm.nl/api/v1/foods/search?barcode=${barcode}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data: NEVOResponse = await response.json();

    if (!data.foods || data.foods.length === 0) {
      return null;
    }

    const food = data.foods[0];

    // Convert NEVO nutrients to our format
    const nutriments: Record<string, number> = {};
    
    food.nutrients.forEach(nutrient => {
      const id = nutrient.nutrient_id.toLowerCase();
      const name = nutrient.nutrient_name.toLowerCase();
      
      if (id.includes('energy') || name.includes('energie')) {
        nutriments.energy_100g = nutrient.value;
      } else if (id.includes('protein') || name.includes('eiwit')) {
        nutriments.proteins_100g = nutrient.value;
      } else if (id.includes('carb') || name.includes('koolhydraten')) {
        nutriments.carbohydrates_100g = nutrient.value;
      } else if (id.includes('sugar') || name.includes('suiker')) {
        nutriments.sugars_100g = nutrient.value;
      } else if ((id.includes('fat') || name.includes('vet')) && !name.includes('verzadigd')) {
        nutriments.fat_100g = nutrient.value;
      } else if (name.includes('verzadigd') || id.includes('saturated')) {
        nutriments.saturated_fat_100g = nutrient.value;
      } else if (id.includes('salt') || name.includes('zout') || id.includes('sodium') || name.includes('natrium')) {
        if (id.includes('sodium') || name.includes('natrium')) {
          nutriments.salt_100g = nutrient.value * 2.5; // Convert sodium to salt
        } else {
          nutriments.salt_100g = nutrient.value;
        }
      }
    });

    const productData: InsertProduct = {
      barcode,
      productName: food.food_name_en || food.food_name,
      brands: null,
      imageUrl: null,
      ingredientsText: food.ingredients || null,
      nutriments: Object.keys(nutriments).length > 0 ? nutriments : null,
      processingScore: null,
      dataSource: 'NEVO'
    };

    return productData;
  } catch (error) {
    console.error('Error fetching from NEVO:', error);
    return null;
  }
}