import { InsertProduct } from "@shared/schema";

interface HealthCanadaFood {
  food_code: string;
  food_description: string;
  scientific_name?: string;
  ingredients_eng?: string;
  ingredients_fra?: string;
  nutrients: Array<{
    nutrient_name_id: number;
    nutrient_value: number;
    nutrient_name_eng: string;
    nutrient_unit: string;
  }>;
}

interface HealthCanadaResponse {
  foods: HealthCanadaFood[];
  total_count: number;
}

export async function fetchProductFromHealthCanada(barcode: string): Promise<InsertProduct | null> {
  try {
    // Health Canada Food and Nutrition Database API
    const response = await fetch(
      `https://food-nutrition.canada.ca/api/canadian-nutrient-file/food?upc=${barcode}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ProcessedOrNot-Scanner/1.0'
        }
      }
    );

    if (!response.ok) {
      console.log(`Health Canada API returned ${response.status}`);
      return null;
    }

    const data: HealthCanadaResponse = await response.json();

    if (!data.foods || data.foods.length === 0) {
      console.log('No products found in Health Canada database');
      return null;
    }

    const food = data.foods[0];

    // Transform nutrient data
    const nutriments: Record<string, number> = {};
    if (food.nutrients) {
      food.nutrients.forEach(nutrient => {
        const key = nutrient.nutrient_name_eng.toLowerCase().replace(/\s+/g, '_');
        nutriments[key] = nutrient.nutrient_value;
      });
    }

    return {
      barcode,
      productName: food.food_description || null,
      brands: null,
      imageUrl: null,
      ingredientsText: food.ingredients_eng || food.ingredients_fra || null,
      nutriments: Object.keys(nutriments).length > 0 ? nutriments : null,
      processingScore: 0,
      processingExplanation: "Processing analysis pending",
      dataSource: 'Health Canada'
    };

  } catch (error) {
    console.error('Health Canada API error:', error);
    return null;
  }
}