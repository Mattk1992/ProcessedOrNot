
import { InsertProduct } from "@shared/schema";

interface LedaProduct {
  barcode: string;
  name: string;
  brand?: string;
  description?: string;
  ingredients?: string;
  nutritional_info?: {
    energy?: number;
    fat?: number;
    saturated_fat?: number;
    carbohydrates?: number;
    sugars?: number;
    protein?: number;
    salt?: number;
    sodium?: number;
    fiber?: number;
  };
  image_url?: string;
  category?: string;
}

interface LedaResponse {
  status: string;
  data?: LedaProduct;
  message?: string;
}

export async function fetchProductFromLeda(barcode: string): Promise<InsertProduct | null> {
  const apiKey = process.env.LEDA_API_KEY;
  
  if (!apiKey) {
    console.log('Leda API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.leda-nutrition.com/v1/products/${barcode}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'ProcessedOrNot-Scanner/1.0'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Product ${barcode} not found in Leda database`);
        return null;
      }
      console.log(`Leda API returned ${response.status}: ${response.statusText}`);
      return null;
    }

    const data: LedaResponse = await response.json();

    if (data.status !== 'success' || !data.data) {
      console.log('No product found in Leda database');
      return null;
    }

    const product = data.data;

    // Map Leda data to our product structure
    const insertProduct: InsertProduct = {
      barcode,
      productName: product.name || null,
      brands: product.brand || null,
      imageUrl: product.image_url || null,
      ingredientsText: product.ingredients || null,
      nutriments: product.nutritional_info ? {
        energy_100g: product.nutritional_info.energy || null,
        fat_100g: product.nutritional_info.fat || null,
        saturated_fat_100g: product.nutritional_info.saturated_fat || null,
        carbohydrates_100g: product.nutritional_info.carbohydrates || null,
        sugars_100g: product.nutritional_info.sugars || null,
        proteins_100g: product.nutritional_info.protein || null,
        salt_100g: product.nutritional_info.salt || 
                   (product.nutritional_info.sodium ? product.nutritional_info.sodium * 2.54 : null), // Convert sodium to salt
        fiber_100g: product.nutritional_info.fiber || null
      } : null,
      processingScore: 0,
      processingExplanation: "Analysis pending",
      glycemicIndex: null,
      glycemicLoad: null,
      glycemicExplanation: "Analysis pending",
      dataSource: 'Leda'
    };

    console.log(`Successfully found product in Leda: ${insertProduct.productName}`);
    return insertProduct;
    
  } catch (error) {
    console.error('Error fetching from Leda:', error);
    return null;
  }
}
