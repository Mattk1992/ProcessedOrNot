import type { InsertProduct } from "@shared/schema";

interface FineliFood {
  id: number;
  name: {
    fi: string;
    sv?: string;
    en?: string;
  };
  foodGroupId?: number;
  nutrients?: Array<{
    id: number;
    name: string;
    value: number;
    unit: string;
  }>;
}

interface FineliResponse {
  foods: FineliFood[];
  count: number;
}

export async function fetchProductFromFineli(barcode: string): Promise<InsertProduct | null> {
  try {
    // Finnish Food Authority's Fineli database
    const response = await fetch(`https://fineli.fi/fineli/api/v1/foods?q=${barcode}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Fineli API error: ${response.status}`);
    }

    const data: FineliResponse = await response.json();

    if (!data.foods || data.foods.length === 0) {
      return null;
    }

    const food = data.foods[0];
    const productName = food.name.en || food.name.fi;

    const productData: InsertProduct = {
      barcode,
      productName,
      brands: null,
      ingredientsText: null,
      imageUrl: null,
      dataSource: 'Fineli (Finland)',
      lastUpdated: new Date().toISOString(),
      processingScore: null,
      processingExplanation: null
    };

    return productData;

  } catch (error) {
    console.error("Error fetching from Fineli:", error);
    return null;
  }
}