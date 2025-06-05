import type { InsertProduct } from "@shared/schema";
import { fetchProductFromOpenFoodFacts } from "./openfoodfacts";
import { fetchProductFromFoodDataCentral } from "./fooddata-central";
import { fetchProductFromNEVO } from "./nevo";
import { fetchProductFromRIVM } from "./rivm";
import { fetchProductFromVoedingscentrum } from "./voedingscentrum";
import { fetchProductFromKGG } from "./kenniscentrum-gezond-gewicht";
import { fetchProductFromCiqual } from "./ciqual";
import { fetchProductFromBDAIEO } from "./bda-ieo";
import { fetchProductFromFineli } from "./fineli";
import { fetchProductFromBLS } from "./bls";
import { fetchProductFromDTUFood } from "./dtu-food";
import { fetchProductFromUSDA } from "./usda";
import { fetchProductFromEFSA } from "./efsa";
import { fetchProductFromHealthCanada } from "./health-canada";
import { fetchProductFromAustralianFood } from "./australia-food";
import { analyzeIngredients } from "./openai";

interface SmartLookupResult {
  source: string;
  productName: string;
  brands?: string;
  ingredients?: string;
  found: boolean;
  error?: string;
}

interface SmartLookupResponse {
  results: SmartLookupResult[];
  product?: InsertProduct;
  foundInSource?: string;
}

// Modified fetch functions that search by name instead of barcode
async function searchOpenFoodFactsByName(productName: string): Promise<InsertProduct | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&search_simple=1&json=1&page_size=1`, {
      headers: {
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.products || data.products.length === 0) return null;

    const product = data.products[0];
    return {
      barcode: product.code || '',
      productName: product.product_name || null,
      brands: product.brands || null,
      imageUrl: product.image_url || null,
      ingredientsText: product.ingredients_text || null,
      nutriments: product.nutriments || null,
      processingScore: null,
      processingExplanation: null,
      dataSource: 'OpenFoodFacts',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error searching OpenFoodFacts by name:", error);
    return null;
  }
}

async function searchUSDAByName(productName: string): Promise<InsertProduct | null> {
  try {
    const apiKey = process.env.USDA_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(productName)}&api_key=${apiKey}&pageSize=1`);
    
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.foods || data.foods.length === 0) return null;

    const food = data.foods[0];
    return {
      barcode: food.gtinUpc || '',
      productName: food.description,
      brands: food.brandOwner || food.brandName || null,
      ingredientsText: food.ingredients || null,
      imageUrl: null,
      dataSource: 'USDA FoodData Central',
      lastUpdated: new Date().toISOString(),
      processingScore: null,
      processingExplanation: null
    };
  } catch (error) {
    console.error("Error searching USDA by name:", error);
    return null;
  }
}

const DATABASE_SEARCH_FUNCTIONS = [
  { name: 'OpenFoodFacts', search: searchOpenFoodFactsByName },
  { name: 'USDA FoodData Central', search: searchUSDAByName },
  { name: 'NEVO', search: async (name: string) => null }, // Placeholder - would need name search implementation
  { name: 'RIVM', search: async (name: string) => null },
  { name: 'Voedingscentrum', search: async (name: string) => null },
  { name: 'Kenniscentrum Gezond Gewicht', search: async (name: string) => null },
  { name: 'CIQUAL (ANSES)', search: async (name: string) => null },
  { name: 'BLS (Germany)', search: async (name: string) => null },
  { name: 'Fineli (Finland)', search: async (name: string) => null },
  { name: 'DTU Food (Denmark)', search: async (name: string) => null },
  { name: 'BDA-IEO (Italy)', search: async (name: string) => null },
  { name: 'EFSA', search: async (name: string) => null },
  { name: 'Health Canada', search: async (name: string) => null },
  { name: 'Australian Food Database', search: async (name: string) => null }
];

export async function performSmartLookup(productName: string, barcode: string): Promise<SmartLookupResponse> {
  const results: SmartLookupResult[] = [];
  let foundProduct: InsertProduct | null = null;
  let foundInSource: string | null = null;

  for (const database of DATABASE_SEARCH_FUNCTIONS) {
    try {
      console.log(`Searching ${database.name} for: ${productName}`);
      
      const product = await database.search(productName);
      
      if (product) {
        // Analyze ingredients if available
        if (product.ingredientsText) {
          try {
            const analysis = await analyzeIngredients(
              product.ingredientsText,
              product.productName || productName
            );
            product.processingScore = analysis.score;
            product.processingExplanation = analysis.explanation;
          } catch (error) {
            console.error(`Failed to analyze ingredients for ${database.name}:`, error);
            product.processingExplanation = "Unable to analyze ingredients at this time";
          }
        }

        // Use provided barcode or keep existing one
        product.barcode = barcode || product.barcode;
        
        foundProduct = product;
        foundInSource = database.name;
        
        results.push({
          source: database.name,
          productName: product.productName || '',
          brands: product.brands || undefined,
          ingredients: product.ingredientsText || undefined,
          found: true
        });
        
        // Stop searching once we find a match
        break;
      } else {
        results.push({
          source: database.name,
          productName: '',
          found: false
        });
      }
    } catch (error) {
      console.error(`Error searching ${database.name}:`, error);
      results.push({
        source: database.name,
        productName: '',
        found: false,
        error: error instanceof Error ? error.message : 'Search failed'
      });
    }
  }

  return {
    results,
    product: foundProduct || undefined,
    foundInSource: foundInSource || undefined
  };
}