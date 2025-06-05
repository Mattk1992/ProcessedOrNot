import type { InsertProduct } from "@shared/schema";

interface NEVOFood {
  code: string;
  description: string;
  group?: string;
  subgroup?: string;
  ingredients?: string;
  nutrients?: Array<{
    nutrient_code: string;
    nutrient_name: string;
    value: number;
    unit: string;
  }>;
}

interface NEVOResponse {
  foods: NEVOFood[];
  total: number;
}

export async function fetchProductFromNEVO(barcode: string): Promise<InsertProduct | null> {
  try {
    const response = await fetch(`https://nevo-online.rivm.nl/api/foods/search?barcode=${barcode}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`NEVO API error: ${response.status}`);
    }

    const data: NEVOResponse = await response.json();

    if (!data.foods || data.foods.length === 0) {
      return null;
    }

    const food = data.foods[0];

    const productData: InsertProduct = {
      barcode,
      productName: food.description,
      brands: null,
      ingredientsText: food.ingredients || null,
      imageUrl: null,
      dataSource: 'NEVO',
      lastUpdated: new Date().toISOString(),
      processingScore: null,
      processingExplanation: null
    };

    return productData;

  } catch (error) {
    console.error("Error fetching from NEVO:", error);
    return null;
  }
}