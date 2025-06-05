import type { InsertProduct } from "@shared/schema";

interface DTUFood {
  FoodID: string;
  FoodName: string;
  FoodNameDK?: string;
  MainFoodGroupID?: string;
  SubFoodGroupID?: string;
  nutrients?: Array<{
    NutrID: string;
    NutrName: string;
    ResVal: number;
    Unit: string;
  }>;
}

interface DTUResponse {
  foods: DTUFood[];
  count: number;
}

export async function fetchProductFromDTUFood(barcode: string): Promise<InsertProduct | null> {
  try {
    // DTU Food Database (Denmark)
    const response = await fetch(`https://frida.fooddata.dk/api/foods/search?q=${barcode}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`DTU Food API error: ${response.status}`);
    }

    const data: DTUResponse = await response.json();

    if (!data.foods || data.foods.length === 0) {
      return null;
    }

    const food = data.foods[0];

    const productData: InsertProduct = {
      barcode,
      productName: food.FoodName,
      brands: null,
      ingredientsText: null,
      imageUrl: null,
      dataSource: 'DTU Food (Denmark)',
      lastUpdated: new Date().toISOString(),
      processingScore: null,
      processingExplanation: null
    };

    return productData;

  } catch (error) {
    console.error("Error fetching from DTU Food:", error);
    return null;
  }
}