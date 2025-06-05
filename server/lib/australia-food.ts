import { InsertProduct } from "@shared/schema";

interface AustralianFood {
  Food_ID: string;
  Food_Name: string;
  Survey_ID: string;
  Classification_Name?: string;
  ingredients?: string;
  nutrients: Array<{
    Nutrient_ID: number;
    Nutrient_Name: string;
    Nutrient_Value: number;
    Nutrient_Unit: string;
  }>;
}

interface AustralianFoodResponse {
  foods: AustralianFood[];
  count: number;
}

export async function fetchProductFromAustralianFood(barcode: string): Promise<InsertProduct | null> {
  try {
    // Australian Food Composition Database API
    const response = await fetch(
      `https://www.foodstandards.gov.au/api/foodcomposition/foods?barcode=${barcode}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ProcessedOrNot-Scanner/1.0'
        }
      }
    );

    if (!response.ok) {
      console.log(`Australian Food Database API returned ${response.status}`);
      return null;
    }

    const data: AustralianFoodResponse = await response.json();

    if (!data.foods || data.foods.length === 0) {
      console.log('No products found in Australian Food Database');
      return null;
    }

    const food = data.foods[0];

    // Transform nutrient data
    const nutriments: Record<string, number> = {};
    if (food.nutrients) {
      food.nutrients.forEach(nutrient => {
        const key = nutrient.Nutrient_Name.toLowerCase().replace(/\s+/g, '_');
        nutriments[key] = nutrient.Nutrient_Value;
      });
    }

    return {
      barcode,
      productName: food.Food_Name || null,
      brands: null,
      imageUrl: null,
      ingredientsText: food.ingredients || null,
      nutriments: Object.keys(nutriments).length > 0 ? nutriments : null,
      processingScore: 0,
      processingExplanation: "Processing analysis pending",
      dataSource: 'Australian Food Database'
    };

  } catch (error) {
    console.error('Australian Food Database API error:', error);
    return null;
  }
}