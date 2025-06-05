import type { InsertProduct } from "@shared/schema";

interface BDAFood {
  id: string;
  name: string;
  code?: string;
  category?: string;
  nutrients?: Array<{
    nutrient_id: string;
    nutrient_name: string;
    value: number;
    unit: string;
  }>;
}

interface BDAResponse {
  data: BDAFood[];
  total: number;
}

export async function fetchProductFromBDAIEO(barcode: string): Promise<InsertProduct | null> {
  try {
    // Italian Food Composition Database (BDA-IEO)
    const response = await fetch(`https://www.alimentinutrizione.it/api/foods/search?code=${barcode}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`BDA-IEO API error: ${response.status}`);
    }

    const data: BDAResponse = await response.json();

    if (!data.data || data.data.length === 0) {
      return null;
    }

    const food = data.data[0];

    const productData: InsertProduct = {
      barcode,
      productName: food.name,
      brands: null,
      ingredientsText: null,
      imageUrl: null,
      dataSource: 'BDA-IEO (Italy)',
      lastUpdated: new Date().toISOString(),
      processingScore: null,
      processingExplanation: null
    };

    return productData;

  } catch (error) {
    console.error("Error fetching from BDA-IEO:", error);
    return null;
  }
}