import type { InsertProduct } from "@shared/schema";

interface VoedingscentrumFood {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  ingredients?: string;
  nutritionalValues?: {
    energy?: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    fiber?: number;
    salt?: number;
  };
}

interface VoedingscentrumResponse {
  products: VoedingscentrumFood[];
  totalResults: number;
}

export async function fetchProductFromVoedingscentrum(barcode: string): Promise<InsertProduct | null> {
  try {
    const response = await fetch(`https://api.voedingscentrum.nl/products/search?barcode=${barcode}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Voedingscentrum API error: ${response.status}`);
    }

    const data: VoedingscentrumResponse = await response.json();

    if (!data.products || data.products.length === 0) {
      return null;
    }

    const product = data.products[0];

    const productData: InsertProduct = {
      barcode,
      productName: product.name,
      brands: product.brand || null,
      ingredientsText: product.ingredients || null,
      imageUrl: null,
      dataSource: 'Voedingscentrum',
      lastUpdated: new Date().toISOString(),
      processingScore: null,
      processingExplanation: null
    };

    return productData;

  } catch (error) {
    console.error("Error fetching from Voedingscentrum:", error);
    return null;
  }
}