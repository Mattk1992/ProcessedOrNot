import type { InsertProduct } from "@shared/schema";

// Based on the NEVO API structure from GitHub repository
interface NEVOFood {
  nevoCode: string;
  foodName: string;
  englishFoodName?: string;
  synonyms?: string[];
  foodGroup?: string;
  scientificName?: string;
  traceConstituents?: string[];
  nutrients: NEVONutrient[];
}

interface NEVONutrient {
  nevoCode: string;
  nutrientName: string;
  englishNutrientName?: string;
  amount: number;
  unit: string;
}

interface NEVOSearchResponse {
  data: NEVOFood[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// Function to search by barcode (approximating with food name search)
export async function fetchProductFromNEVO(barcode: string): Promise<InsertProduct | null> {
  try {
    // Since NEVO is primarily a food composition database without barcode support,
    // we'll try to extract a product name hint from the barcode and search
    const productHints = extractProductNameFromBarcode(barcode);
    
    if (!productHints.length) {
      return null;
    }

    // Try searching with the most likely product name
    for (const hint of productHints) {
      const result = await searchNEVOByName(hint);
      if (result) {
        // Use the provided barcode for consistency
        result.barcode = barcode;
        return result;
      }
    }

    return null;

  } catch (error) {
    console.error("Error fetching from NEVO:", error);
    return null;
  }
}

// Search NEVO database by product name
export async function searchNEVOByName(productName: string): Promise<InsertProduct | null> {
  try {
    // Using the NEVO API endpoint structure from the GitHub repository
    const response = await fetch(`https://nevo-api.azurewebsites.net/api/foods/search?q=${encodeURIComponent(productName)}&limit=1`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`NEVO API error: ${response.status}`);
    }

    const data: NEVOSearchResponse = await response.json();

    if (!data.data || data.data.length === 0) {
      return null;
    }

    const food = data.data[0];

    // Convert NEVO nutrients to our format
    const nutriments: Record<string, number> = {};
    food.nutrients.forEach(nutrient => {
      // Map common nutrients to standardized keys
      const key = mapNEVONutrientToStandard(nutrient.nevoCode, nutrient.nutrientName);
      if (key) {
        nutriments[key] = nutrient.amount;
      }
    });

    const productData: InsertProduct = {
      barcode: '', // Will be set by caller
      productName: food.englishFoodName || food.foodName,
      brands: null,
      ingredientsText: food.traceConstituents?.join(', ') || null,
      imageUrl: null,
      nutriments,
      dataSource: 'NEVO (Dutch Food Composition Database)',
      lastUpdated: new Date().toISOString(),
      processingScore: null,
      processingExplanation: null
    };

    return productData;

  } catch (error) {
    console.error("Error searching NEVO by name:", error);
    return null;
  }
}

// Helper function to extract potential product names from barcode
function extractProductNameFromBarcode(barcode: string): string[] {
  // This is a basic implementation - in practice, barcode to product name
  // mapping would require additional databases or manual input
  const hints: string[] = [];
  
  // Try common Dutch food terms based on barcode patterns
  if (barcode.startsWith('87')) hints.push('brood', 'kaas', 'melk');
  if (barcode.startsWith('84')) hints.push('vlees', 'worst', 'ham');
  if (barcode.startsWith('20')) hints.push('groente', 'fruit');
  
  return hints;
}

// Map NEVO nutrient codes to standardized keys
function mapNEVONutrientToStandard(nevoCode: string, nutrientName: string): string | null {
  const nutrientMap: Record<string, string> = {
    'ENER': 'energy-kj',
    'ENERK': 'energy-kcal', 
    'PROT': 'proteins',
    'CHOAVL': 'carbohydrates',
    'FAT': 'fat',
    'FASAT': 'saturated-fat',
    'SUGAR': 'sugars',
    'FIBTG': 'fiber',
    'NA': 'sodium',
    'SALTEQ': 'salt'
  };

  return nutrientMap[nevoCode] || null;
}