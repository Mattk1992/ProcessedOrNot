import type { InsertProduct } from "@shared/schema";

interface BLSFood {
  id: string;
  name: string;
  group?: string;
  nutrients?: Array<{
    nutrient_id: string;
    nutrient_name: string;
    value: number;
    unit: string;
  }>;
}

interface BLSResponse {
  foods: BLSFood[];
  total: number;
}

export async function fetchProductFromBLS(barcode: string): Promise<InsertProduct | null> {
  try {
    // German Federal Food Code Database (BLS)
    const response = await fetch(`https://www.blsdb.de/api/foods/search?code=${barcode}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`BLS API error: ${response.status}`);
    }

    const data: BLSResponse = await response.json();

    if (!data.foods || data.foods.length === 0) {
      return null;
    }

    const food = data.foods[0];

    const productData: InsertProduct = {
      barcode,
      productName: food.name,
      brands: null,
      ingredientsText: null,
      imageUrl: null,
      dataSource: 'BLS (Germany)',
      lastUpdated: new Date().toISOString(),
      processingScore: null,
      processingExplanation: null
    };

    return productData;

  } catch (error) {
    console.error("Error fetching from BLS:", error);
    return null;
  }
}