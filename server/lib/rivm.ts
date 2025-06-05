import type { InsertProduct } from "@shared/schema";

interface RIVMFood {
  id: string;
  description: string;
  brand?: string;
  ingredients?: string;
  category?: string;
  nutrients?: Array<{
    nutrient_id: string;
    nutrient_name: string;
    value: number;
    unit: string;
  }>;
}

interface RIVMResponse {
  data: RIVMFood[];
  total_results: number;
}

export async function fetchProductFromRIVM(barcode: string): Promise<InsertProduct | null> {
  try {
    const response = await fetch(`https://data.rivm.nl/api/foods/search?code=${barcode}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`RIVM API error: ${response.status}`);
    }

    const data: RIVMResponse = await response.json();

    if (!data.data || data.data.length === 0) {
      return null;
    }

    const food = data.data[0];

    const productData: InsertProduct = {
      barcode,
      productName: food.description,
      brands: food.brand || null,
      ingredientsText: food.ingredients || null,
      imageUrl: null,
      dataSource: 'RIVM',
      lastUpdated: new Date().toISOString(),
      processingScore: null,
      processingExplanation: null
    };

    return productData;

  } catch (error) {
    console.error("Error fetching from RIVM:", error);
    return null;
  }
}