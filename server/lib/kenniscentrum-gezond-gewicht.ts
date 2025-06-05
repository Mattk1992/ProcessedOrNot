import type { InsertProduct } from "@shared/schema";

interface KGGFood {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  ingredients?: string;
  nutritionalInfo?: {
    energy?: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    fiber?: number;
    sodium?: number;
  };
}

interface KGGResponse {
  foods: KGGFood[];
  total: number;
}

export async function fetchProductFromKGG(barcode: string): Promise<InsertProduct | null> {
  try {
    // Note: This is a placeholder URL - actual API endpoint would need to be provided
    const response = await fetch(`https://api.kenniscentrumgezondgewicht.nl/foods/search?barcode=${barcode}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`KGG API error: ${response.status}`);
    }

    const data: KGGResponse = await response.json();

    if (!data.foods || data.foods.length === 0) {
      return null;
    }

    const food = data.foods[0];

    const productData: InsertProduct = {
      barcode,
      productName: food.name,
      brands: food.brand || null,
      ingredientsText: food.ingredients || null,
      imageUrl: null,
      dataSource: 'Kenniscentrum Gezond Gewicht',
      lastUpdated: new Date().toISOString(),
      processingScore: null,
      processingExplanation: null
    };

    return productData;

  } catch (error) {
    console.error("Error fetching from Kenniscentrum Gezond Gewicht:", error);
    return null;
  }
}