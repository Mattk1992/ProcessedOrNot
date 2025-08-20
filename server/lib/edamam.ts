import { InsertProduct } from "@shared/schema";

export interface EdamamProduct {
  foodId?: string;
  label?: string;
  brand?: string;
  image?: string;
  nutrients?: {
    ENERC_KCAL?: number;
    FAT?: number;
    FASAT?: number;
    CHOCDF?: number;
    SUGAR?: number;
    PROCNT?: number;
    NA?: number;
    FIBTG?: number;
  };
  category?: string;
  categoryLabel?: string;
  foodContentsLabel?: string;
}

export interface EdamamResponse {
  text?: string;
  parsed?: Array<{
    food: EdamamProduct;
  }>;
  hints?: Array<{
    food: EdamamProduct;
    measures?: Array<{
      uri: string;
      label: string;
      weight: number;
    }>;
  }>;
}

export async function fetchProductFromEdamam(barcode: string): Promise<InsertProduct | null> {
  try {
    console.log(`Fetching product ${barcode} from Edamam Food Database...`);
    
    // Configuration for Edamam Food Database API
    const EDAMAM_APP_KEY = 'd9f869d648e5c6edb512b028ee876545';
    const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID || 'edamam_app'; // Default app_id if not set
    
    // Make request to Edamam Food Database API
    const response = await fetch(
      `https://api.edamam.com/api/food-database/v2/parser?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&upc=${barcode}&nutrition-type=logging`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ProcessedOrNot-Scanner/1.0'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Product ${barcode} not found in Edamam`);
        return null;
      }
      if (response.status === 401 || response.status === 403) {
        console.log(`Edamam API authentication failed - check app_id and app_key`);
        return null;
      }
      throw new Error(`Edamam API error: ${response.status} ${response.statusText}`);
    }

    const data: EdamamResponse = await response.json();
    
    if (!data || (!data.parsed?.length && !data.hints?.length)) {
      console.log(`No product data returned from Edamam for ${barcode}`);
      return null;
    }

    // Get the first available product from parsed results or hints
    let product: EdamamProduct | null = null;
    if (data.parsed && data.parsed.length > 0) {
      product = data.parsed[0].food;
    } else if (data.hints && data.hints.length > 0) {
      product = data.hints[0].food;
    }

    if (!product) {
      console.log(`No valid product found in Edamam response for ${barcode}`);
      return null;
    }
    
    // Transform Edamam response to our product format
    const transformedProduct: InsertProduct = {
      barcode,
      productName: product.label || null,
      brands: product.brand || null,
      imageUrl: product.image || null,
      ingredientsText: product.foodContentsLabel || null,
      nutriments: product.nutrients ? {
        // Energy values - Edamam provides kcal directly
        energy_kcal: product.nutrients.ENERC_KCAL || undefined,
        energy_kcal_100g: product.nutrients.ENERC_KCAL || undefined,
        
        // Macronutrients
        fat: product.nutrients.FAT || undefined,
        fat_100g: product.nutrients.FAT || undefined,
        saturated_fat: product.nutrients.FASAT || undefined,
        saturated_fat_100g: product.nutrients.FASAT || undefined,
        carbohydrates: product.nutrients.CHOCDF || undefined,
        carbohydrates_100g: product.nutrients.CHOCDF || undefined,
        sugars: product.nutrients.SUGAR || undefined,
        sugars_100g: product.nutrients.SUGAR || undefined,
        proteins: product.nutrients.PROCNT || undefined,
        proteins_100g: product.nutrients.PROCNT || undefined,
        
        // Other nutrients
        sodium: product.nutrients.NA || undefined,
        sodium_100g: product.nutrients.NA || undefined,
        // Convert sodium to salt (sodium * 2.5)
        salt: product.nutrients.NA ? product.nutrients.NA * 2.5 / 1000 : undefined,
        salt_100g: product.nutrients.NA ? product.nutrients.NA * 2.5 / 1000 : undefined,
        fiber: product.nutrients.FIBTG || undefined,
        fiber_100g: product.nutrients.FIBTG || undefined
      } : null,
      processingScore: null,
      processingExplanation: null,
      glycemicIndex: null,
      glycemicLoad: null,
      glycemicExplanation: null,
      productionProcess: null,
      dataSource: 'Edamam'
    };

    console.log(`Successfully fetched product ${barcode} from Edamam: ${transformedProduct.productName}`);
    return transformedProduct;

  } catch (error) {
    console.error(`Edamam API error for barcode ${barcode}:`, error);
    return null;
  }
}