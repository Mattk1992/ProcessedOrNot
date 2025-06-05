import type { InsertProduct } from "@shared/schema";

// Import all database search functions
import { fetchProductFromOpenFoodFacts } from "./openfoodfacts";
import { fetchProductFromFoodDataCentral } from "./fooddata-central";
import { fetchProductFromNEVO } from "./nevo";
import { fetchProductFromRIVM } from "./rivm";
import { fetchProductFromVoedingscentrum } from "./voedingscentrum";
import { fetchProductFromKGG } from "./kenniscentrum-gezond-gewicht";
import { fetchProductFromCiqual } from "./ciqual";
import { fetchProductFromBLS } from "./bls";
import { fetchProductFromFineli } from "./fineli";
import { fetchProductFromDTUFood } from "./dtu-food";
import { fetchProductFromBDAIEO } from "./bda-ieo";
import { fetchProductFromUSDA } from "./usda";
import { fetchProductFromEFSA } from "./efsa";
import { fetchProductFromHealthCanada } from "./health-canada";
import { fetchProductFromAustralianFood } from "./australia-food";
import { fetchProductFromBarcodeSpider } from "./barcode-spider";
import { fetchProductFromEANSearch } from "./ean-search";
import { fetchProductFromProductAPI } from "./product-api";
import { fetchProductFromUPCDatabase } from "./upc";

interface NameSearchResult {
  product: InsertProduct | null;
  source: string;
  searchedSources: string[];
  error?: string;
}

// List of all search functions with their names
const searchFunctions = [
  { name: "OpenFoodFacts", fn: searchOpenFoodFactsByName },
  { name: "FoodData Central (USDA)", fn: searchFoodDataCentralByName },
  { name: "NEVO (Netherlands)", fn: searchNEVOByName },
  { name: "RIVM (Netherlands)", fn: searchRIVMByName },
  { name: "Voedingscentrum (Netherlands)", fn: searchVoedingscentrumByName },
  { name: "Kenniscentrum Gezond Gewicht (Netherlands)", fn: searchKGGByName },
  { name: "CIQUAL (France)", fn: searchCiqualByName },
  { name: "BLS (Germany)", fn: searchBLSByName },
  { name: "Fineli (Finland)", fn: searchFineliByName },
  { name: "DTU Food (Denmark)", fn: searchDTUFoodByName },
  { name: "BDA-IEO (Italy)", fn: searchBDAIEOByName },
  { name: "Legacy USDA", fn: searchUSDAByName },
  { name: "EFSA (EU)", fn: searchEFSAByName },
  { name: "Health Canada", fn: searchHealthCanadaByName },
  { name: "Australian Food Database", fn: searchAustralianFoodByName },
];

export async function searchProductByName(productName: string): Promise<NameSearchResult> {
  console.log(`Starting name-based search for product: ${productName}`);
  const searchedSources: string[] = [];
  
  for (const { name, fn } of searchFunctions) {
    try {
      console.log(`Searching ${name} for product name: ${productName}...`);
      searchedSources.push(name);
      
      const product = await fn(productName);
      if (product) {
        console.log(`Product found in ${name}!`);
        return {
          product,
          source: name,
          searchedSources
        };
      }
    } catch (error) {
      console.error(`Error searching ${name}:`, error);
    }
  }

  console.log(`All name-based database searches failed for product: ${productName}`);
  return {
    product: null,
    source: "none",
    searchedSources,
    error: `Product "${productName}" not found in any database`
  };
}

// Search functions for each database by name
async function searchOpenFoodFactsByName(productName: string): Promise<InsertProduct | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&search_simple=1&action=process&json=1`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.products && data.products.length > 0) {
      const product = data.products[0];
      return {
        barcode: "manual-search",
        productName: product.product_name || productName,
        brands: product.brands || null,
        ingredientsText: product.ingredients_text || null,
        imageUrl: product.image_url || null,
        lastUpdated: new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.error("OpenFoodFacts name search error:", error);
    return null;
  }
}

async function searchFoodDataCentralByName(productName: string): Promise<InsertProduct | null> {
  try {
    const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(productName)}&dataType=Branded&pageSize=1&api_key=${process.env.USDA_API_KEY || 'DEMO_KEY'}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.foods && data.foods.length > 0) {
      const food = data.foods[0];
      return {
        barcode: "manual-search",
        productName: food.description || productName,
        brands: food.brandOwner || null,
        ingredientsText: food.ingredients || null,
        imageUrl: null,
        lastUpdated: new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.error("FoodData Central name search error:", error);
    return null;
  }
}

// For other databases, we'll implement simplified name searches
async function searchNEVOByName(productName: string): Promise<InsertProduct | null> {
  // NEVO typically requires exact product codes, so name search is limited
  return null;
}

async function searchRIVMByName(productName: string): Promise<InsertProduct | null> {
  // RIVM name search would require their specific API endpoints
  return null;
}

async function searchVoedingscentrumByName(productName: string): Promise<InsertProduct | null> {
  // Voedingscentrum name search would require their specific API
  return null;
}

async function searchKGGByName(productName: string): Promise<InsertProduct | null> {
  // KGG name search would require their specific API
  return null;
}

async function searchCiqualByName(productName: string): Promise<InsertProduct | null> {
  // CIQUAL name search would require their specific API
  return null;
}

async function searchBLSByName(productName: string): Promise<InsertProduct | null> {
  // BLS name search would require their specific API
  return null;
}

async function searchFineliByName(productName: string): Promise<InsertProduct | null> {
  // Fineli name search would require their specific API
  return null;
}

async function searchDTUFoodByName(productName: string): Promise<InsertProduct | null> {
  // DTU Food name search would require their specific API
  return null;
}

async function searchBDAIEOByName(productName: string): Promise<InsertProduct | null> {
  // BDA-IEO name search would require their specific API
  return null;
}

async function searchUSDAByName(productName: string): Promise<InsertProduct | null> {
  // Legacy USDA search similar to FoodData Central
  return searchFoodDataCentralByName(productName);
}

async function searchEFSAByName(productName: string): Promise<InsertProduct | null> {
  // EFSA name search would require their specific API
  return null;
}

async function searchHealthCanadaByName(productName: string): Promise<InsertProduct | null> {
  // Health Canada name search would require their specific API
  return null;
}

async function searchAustralianFoodByName(productName: string): Promise<InsertProduct | null> {
  // Australian Food Database name search would require their specific API
  return null;
}