import { InsertProduct } from "@shared/schema";

export interface AgrifoodDataProduct {
  barcode?: string;
  product_name?: string;
  brands?: string;
  image_url?: string;
  ingredients_text?: string;
  nutriments?: {
    energy_kcal?: number;
    energy_kcal_100g?: number;
    fat?: number;
    fat_100g?: number;
    saturated_fat?: number;
    saturated_fat_100g?: number;
    carbohydrates?: number;
    carbohydrates_100g?: number;
    sugars?: number;
    sugars_100g?: number;
    proteins?: number;
    proteins_100g?: number;
    salt?: number;
    salt_100g?: number;
    fiber?: number;
    fiber_100g?: number;
    sodium?: number;
    sodium_100g?: number;
  };
  nutrition_grade?: string;
  processing_score?: number;
  glycemic_index?: number;
  glycemic_load?: number;
}

export async function fetchProductFromAgrifoodData(barcode: string): Promise<InsertProduct | null> {
  try {
    console.log(`Fetching product ${barcode} from Agri-food Data API...`);
    
    // Configuration for the Agri-food Data API
    const AGRIFOOD_API_BASE = process.env.AGRIFOOD_API_BASE || 'https://api.agrifood-data.com/v1';
    const AGRIFOOD_API_KEY = process.env.AGRIFOOD_API_KEY;
    
    if (!AGRIFOOD_API_KEY) {
      console.log('Agri-food Data API key not configured, skipping...');
      return null;
    }

    // Make request to Agri-food Data API
    const response = await fetch(`${AGRIFOOD_API_BASE}/products/${barcode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AGRIFOOD_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Product ${barcode} not found in Agri-food Data`);
        return null;
      }
      throw new Error(`Agri-food Data API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data || !data.product) {
      console.log(`No product data returned from Agri-food Data for ${barcode}`);
      return null;
    }

    const product = data.product as AgrifoodDataProduct;
    
    // Transform Agri-food Data response to our product format
    const transformedProduct: InsertProduct = {
      barcode,
      productName: product.product_name || null,
      brands: product.brands || null,
      imageUrl: product.image_url || null,
      ingredientsText: product.ingredients_text || null,
      nutriments: product.nutriments ? {
        // Energy values
        energy_kcal: product.nutriments.energy_kcal || product.nutriments.energy_kcal_100g || undefined,
        energy_kcal_100g: product.nutriments.energy_kcal_100g || product.nutriments.energy_kcal || undefined,
        
        // Macronutrients
        fat: product.nutriments.fat || product.nutriments.fat_100g || undefined,
        fat_100g: product.nutriments.fat_100g || product.nutriments.fat || undefined,
        saturated_fat: product.nutriments.saturated_fat || product.nutriments.saturated_fat_100g || undefined,
        saturated_fat_100g: product.nutriments.saturated_fat_100g || product.nutriments.saturated_fat || undefined,
        carbohydrates: product.nutriments.carbohydrates || product.nutriments.carbohydrates_100g || undefined,
        carbohydrates_100g: product.nutriments.carbohydrates_100g || product.nutriments.carbohydrates || undefined,
        sugars: product.nutriments.sugars || product.nutriments.sugars_100g || undefined,
        sugars_100g: product.nutriments.sugars_100g || product.nutriments.sugars || undefined,
        proteins: product.nutriments.proteins || product.nutriments.proteins_100g || undefined,
        proteins_100g: product.nutriments.proteins_100g || product.nutriments.proteins || undefined,
        
        // Other nutrients
        salt: product.nutriments.salt || product.nutriments.salt_100g || undefined,
        salt_100g: product.nutriments.salt_100g || product.nutriments.salt || undefined,
        fiber: product.nutriments.fiber || product.nutriments.fiber_100g || undefined,
        fiber_100g: product.nutriments.fiber_100g || product.nutriments.fiber || undefined,
        sodium: product.nutriments.sodium || product.nutriments.sodium_100g || undefined,
        sodium_100g: product.nutriments.sodium_100g || product.nutriments.sodium || undefined
      } : null,
      processingScore: product.processing_score || null,
      processingExplanation: null,
      glycemicIndex: product.glycemic_index || null,
      glycemicLoad: product.glycemic_load || null,
      glycemicExplanation: null,
      productionProcess: null,
      dataSource: 'Agri-food Data'
    };

    console.log(`Successfully fetched product ${barcode} from Agri-food Data`);
    return transformedProduct;

  } catch (error) {
    console.error(`Agri-food Data API error for barcode ${barcode}:`, error);
    return null;
  }
}