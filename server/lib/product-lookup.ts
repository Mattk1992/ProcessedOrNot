import { InsertProduct } from "@shared/schema";
import { fetchProductFromOpenFoodFacts } from "./openfoodfacts";
import { fetchProductFromUSDA } from "./usda";
import { fetchProductFromUPCDatabase } from "./upc";
import { fetchProductFromEFSA } from "./efsa";
import { fetchProductFromHealthCanada } from "./health-canada";
import { fetchProductFromAustralianFood } from "./australia-food";
import { fetchProductFromBarcodeSpider } from "./barcode-spider";
import { fetchProductFromEANSearch } from "./ean-search";
import { fetchProductFromProductAPI } from "./product-api";
import { analyzeIngredients } from "./openai";

interface ProductLookupResult {
  product: InsertProduct | null;
  source: string;
  error?: string;
}

export async function cascadingProductLookup(barcode: string): Promise<ProductLookupResult> {
  console.log(`Starting cascading lookup for barcode: ${barcode}`);

  // 1. Primary: OpenFoodFacts
  try {
    console.log('Trying OpenFoodFacts...');
    const openFoodFactsData = await fetchProductFromOpenFoodFacts(barcode);
    
    if (openFoodFactsData && openFoodFactsData.status === 1) {
      const product = openFoodFactsData.product;
      
      // Analyze ingredients if available
      let processingScore = 0;
      let processingExplanation = "No ingredients available for analysis";
      
      if (product.ingredients_text) {
        try {
          const analysis = await analyzeIngredients(
            product.ingredients_text,
            product.product_name || "Unknown Product"
          );
          processingScore = analysis.score;
          processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze ingredients:", error);
          processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      const productData: InsertProduct = {
        barcode,
        productName: product.product_name || null,
        brands: product.brands || null,
        imageUrl: product.image_url || null,
        ingredientsText: product.ingredients_text || null,
        nutriments: product.nutriments || null,
        processingScore,
        processingExplanation,
        dataSource: 'OpenFoodFacts'
      };

      console.log('Found product in OpenFoodFacts');
      return { product: productData, source: 'OpenFoodFacts' };
    }
  } catch (error) {
    console.error('OpenFoodFacts lookup failed:', error);
  }

  // 2. Secondary: USDA FoodData Central
  try {
    console.log('Trying USDA FoodData Central...');
    const usdaProduct = await fetchProductFromUSDA(barcode);
    
    if (usdaProduct) {
      // Analyze ingredients if available
      if (usdaProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            usdaProduct.ingredientsText,
            usdaProduct.productName || "Unknown Product"
          );
          usdaProduct.processingScore = analysis.score;
          usdaProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze USDA ingredients:", error);
          usdaProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in USDA FoodData Central');
      return { product: usdaProduct, source: 'USDA FoodData Central' };
    }
  } catch (error) {
    console.error('USDA lookup failed:', error);
  }

  // 3. Tertiary: UPC Database
  try {
    console.log('Trying UPC Database...');
    const upcProduct = await fetchProductFromUPCDatabase(barcode);
    
    if (upcProduct) {
      console.log('Found product in UPC Database');
      return { product: upcProduct, source: 'UPC Database' };
    }
  } catch (error) {
    console.error('UPC Database lookup failed:', error);
  }

  // 4. All lookups failed
  console.log('All database lookups failed for barcode:', barcode);
  return { 
    product: null, 
    source: 'none',
    error: 'Product not found in any database. You can add this product manually.'
  };
}