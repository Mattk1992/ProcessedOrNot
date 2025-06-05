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
import { broadcastSearchProgress } from "./search-progress";

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

  // 3. Tertiary: EFSA (European Food Safety Authority)
  try {
    console.log('Trying EFSA...');
    const efsaProduct = await fetchProductFromEFSA(barcode);
    
    if (efsaProduct) {
      // Analyze ingredients if available
      if (efsaProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            efsaProduct.ingredientsText,
            efsaProduct.productName || "Unknown Product"
          );
          efsaProduct.processingScore = analysis.score;
          efsaProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze EFSA ingredients:", error);
          efsaProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in EFSA');
      return { product: efsaProduct, source: 'EFSA' };
    }
  } catch (error) {
    console.error('EFSA lookup failed:', error);
  }

  // 4. Health Canada Food Database
  try {
    console.log('Trying Health Canada...');
    const healthCanadaProduct = await fetchProductFromHealthCanada(barcode);
    
    if (healthCanadaProduct) {
      // Analyze ingredients if available
      if (healthCanadaProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            healthCanadaProduct.ingredientsText,
            healthCanadaProduct.productName || "Unknown Product"
          );
          healthCanadaProduct.processingScore = analysis.score;
          healthCanadaProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze Health Canada ingredients:", error);
          healthCanadaProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in Health Canada');
      return { product: healthCanadaProduct, source: 'Health Canada' };
    }
  } catch (error) {
    console.error('Health Canada lookup failed:', error);
  }

  // 5. Australian Food Composition Database
  try {
    console.log('Trying Australian Food Database...');
    const australianProduct = await fetchProductFromAustralianFood(barcode);
    
    if (australianProduct) {
      // Analyze ingredients if available
      if (australianProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            australianProduct.ingredientsText,
            australianProduct.productName || "Unknown Product"
          );
          australianProduct.processingScore = analysis.score;
          australianProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze Australian Food ingredients:", error);
          australianProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in Australian Food Database');
      return { product: australianProduct, source: 'Australian Food Database' };
    }
  } catch (error) {
    console.error('Australian Food Database lookup failed:', error);
  }

  // 6. Barcode Spider
  try {
    console.log('Trying Barcode Spider...');
    const barcodeSpiderProduct = await fetchProductFromBarcodeSpider(barcode);
    
    if (barcodeSpiderProduct) {
      // Analyze ingredients if available
      if (barcodeSpiderProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            barcodeSpiderProduct.ingredientsText,
            barcodeSpiderProduct.productName || "Unknown Product"
          );
          barcodeSpiderProduct.processingScore = analysis.score;
          barcodeSpiderProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze Barcode Spider ingredients:", error);
          barcodeSpiderProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in Barcode Spider');
      return { product: barcodeSpiderProduct, source: 'Barcode Spider' };
    }
  } catch (error) {
    console.error('Barcode Spider lookup failed:', error);
  }

  // 7. EAN Search
  try {
    console.log('Trying EAN Search...');
    const eanSearchProduct = await fetchProductFromEANSearch(barcode);
    
    if (eanSearchProduct) {
      console.log('Found product in EAN Search');
      return { product: eanSearchProduct, source: 'EAN Search' };
    }
  } catch (error) {
    console.error('EAN Search lookup failed:', error);
  }

  // 8. Product API
  try {
    console.log('Trying Product API...');
    const productAPIProduct = await fetchProductFromProductAPI(barcode);
    
    if (productAPIProduct) {
      // Analyze ingredients if available
      if (productAPIProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            productAPIProduct.ingredientsText,
            productAPIProduct.productName || "Unknown Product"
          );
          productAPIProduct.processingScore = analysis.score;
          productAPIProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze Product API ingredients:", error);
          productAPIProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in Product API');
      return { product: productAPIProduct, source: 'Product API' };
    }
  } catch (error) {
    console.error('Product API lookup failed:', error);
  }

  // 9. UPC Database (fallback)
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

  // 10. All lookups failed
  console.log('All database lookups failed for barcode:', barcode);
  return { 
    product: null, 
    source: 'none',
    error: 'Product not found in any database. You can add this product manually.'
  };
}