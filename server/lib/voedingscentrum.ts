import type { InsertProduct } from "@shared/schema";

interface VoedingscentrumFood {
  product_id: string;
  product_name: string;
  brand?: string;
  category: string;
  ingredients?: string;
  nutrition_facts: {
    energy_kj?: number;
    energy_kcal?: number;
    protein_g?: number;
    carbohydrates_g?: number;
    sugars_g?: number;
    fat_g?: number;
    saturated_fat_g?: number;
    salt_g?: number;
    fiber_g?: number;
  };
}

interface VoedingscentrumResponse {
  products: VoedingscentrumFood[];
  total: number;
}

export async function fetchProductFromVoedingscentrum(barcode: string): Promise<InsertProduct | null> {
  try {
    // Voedingscentrum (Netherlands Nutrition Centre) API
    const response = await fetch(`https://api.voedingscentrum.nl/products/search?barcode=${barcode}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data: VoedingscentrumResponse = await response.json();

    if (!data.products || data.products.length === 0) {
      return null;
    }

    const product = data.products[0];

    // Convert nutrition facts to our format
    const nutriments: Record<string, number> = {};
    const nutrition = product.nutrition_facts;
    
    if (nutrition.energy_kcal) {
      nutriments.energy_100g = nutrition.energy_kcal;
    }
    if (nutrition.protein_g) {
      nutriments.proteins_100g = nutrition.protein_g;
    }
    if (nutrition.carbohydrates_g) {
      nutriments.carbohydrates_100g = nutrition.carbohydrates_g;
    }
    if (nutrition.sugars_g) {
      nutriments.sugars_100g = nutrition.sugars_g;
    }
    if (nutrition.fat_g) {
      nutriments.fat_100g = nutrition.fat_g;
    }
    if (nutrition.saturated_fat_g) {
      nutriments.saturated_fat_100g = nutrition.saturated_fat_g;
    }
    if (nutrition.salt_g) {
      nutriments.salt_100g = nutrition.salt_g;
    }
    if (nutrition.fiber_g) {
      nutriments.fiber_100g = nutrition.fiber_g;
    }

    const productData: InsertProduct = {
      barcode,
      productName: product.product_name,
      brands: product.brand || null,
      imageUrl: null,
      ingredientsText: product.ingredients || null,
      nutriments: Object.keys(nutriments).length > 0 ? nutriments : null,
      processingScore: null,
      dataSource: 'Voedingscentrum'
    };

    return productData;
  } catch (error) {
    console.error('Error fetching from Voedingscentrum:', error);
    return null;
  }
}