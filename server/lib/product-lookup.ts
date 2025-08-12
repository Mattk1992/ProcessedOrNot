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
import { fetchProductFromRIVM } from "./rivm";
import { fetchProductFromNEVO } from "./nevo";
import { fetchProductFromVoedingscentrum } from "./voedingscentrum";
import { fetchProductFromFoodDataCentral } from "./fooddata-central";
import { fetchProductFromKenniscentrum } from "./kenniscentrum";
import { fetchProductFromFoodDBCA } from "./fooddb-ca";
import { fetchProductFromUSDAFDC } from "./usda-fdc";
import { fetchProductFromOpenNutrition } from "./opennutrition";
import { fetchProductFromNutritionix } from "./nutritionix";
import { fetchProductFromSpoonacular } from "./spoonacular";
import { fetchProductFromAPINinjas } from "./api-ninjas";
import { analyzeIngredients, analyzeGlycemicIndex, getUserAIProvider } from "./openai";
import { isBarcode, searchProductByText } from "./text-search";

interface ProductLookupResult {
  product: InsertProduct | null;
  source: string;
  error?: string;
}

export async function smartProductLookup(input: string, filters?: { includeBrands?: string[], excludeBrands?: string[] }, userId?: number): Promise<ProductLookupResult> {
  console.log(`Starting smart lookup for input: ${input}`);

  // Check if input is a barcode or text
  if (isBarcode(input)) {
    console.log('Input detected as barcode, using cascading fallback system');
    return cascadingProductLookup(input, userId);
  } else {
    console.log('Input detected as text, using text search');
    return searchProductByText(input, filters, userId);
  }
}

export async function cascadingProductLookup(barcode: string, userId?: number): Promise<ProductLookupResult> {
  console.log(`Starting cascading lookup for barcode: ${barcode}`);

  // Get user's AI provider setting
  const userAIProvider = await getUserAIProvider(userId);

  // 1. USDA FoodData Central (Primary)
  try {
    console.log('1. Trying USDA FoodData Central (Primary)...');
    const usdaProduct = await fetchProductFromUSDA(barcode);
    
    if (usdaProduct) {
      // Analyze ingredients if available
      if (usdaProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            usdaProduct.ingredientsText,
            usdaProduct.productName || "Unknown Product",
            'en',
            userAIProvider
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

  // 2. OpenFoodFacts (Secondary)
  try {
    console.log('2. Trying OpenFoodFacts (Secondary)...');
    const openFoodFactsData = await fetchProductFromOpenFoodFacts(barcode);
    
    if (openFoodFactsData && openFoodFactsData.status === 1) {
      const product = openFoodFactsData.product;
      
      // Analyze ingredients if available
      let processingScore = 0;
      let processingExplanation = "No ingredients available for analysis";
      let glycemicIndex = null;
      let glycemicLoad = null;
      let glycemicExplanation = "No data available for glycemic analysis";
      
      if (product.ingredients_text) {
        try {
          const analysis = await analyzeIngredients(
            product.ingredients_text,
            product.product_name || "Unknown Product",
            'en',
            userAIProvider
          );
          processingScore = analysis.score;
          processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze ingredients:", error);
          processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      // Analyze glycemic index if we have nutrition data (ingredients not required)
      if (product.nutriments) {
        try {
          const glycemicAnalysis = await analyzeGlycemicIndex(
            product.ingredients_text || "",
            product.product_name || "Unknown Product",
            product.nutriments,
            'en',
            userAIProvider
          );
          glycemicIndex = glycemicAnalysis.glycemicIndex;
          glycemicLoad = glycemicAnalysis.glycemicLoad;
          glycemicExplanation = glycemicAnalysis.explanation;
        } catch (error) {
          console.error("Failed to analyze glycemic index:", error);
          glycemicExplanation = "Unable to analyze glycemic impact at this time";
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
        glycemicIndex,
        glycemicLoad,
        glycemicExplanation,
        dataSource: 'OpenFoodFacts'
      };

      console.log('Found product in OpenFoodFacts');
      return { product: productData, source: 'OpenFoodFacts' };
    }
  } catch (error) {
    console.error('OpenFoodFacts lookup failed:', error);
  }

  // 3. FoodDB.ca
  try {
    console.log('3. Trying FoodDB.ca...');
    const foodDBCAProduct = await fetchProductFromFoodDBCA(barcode);
    
    if (foodDBCAProduct) {
      // Analyze ingredients if available
      if (foodDBCAProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            foodDBCAProduct.ingredientsText,
            foodDBCAProduct.productName || "Unknown Product",
            'en',
            userAIProvider
          );
          foodDBCAProduct.processingScore = analysis.score;
          foodDBCAProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze FoodDB.ca ingredients:", error);
          foodDBCAProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in FoodDB.ca');
      return { product: foodDBCAProduct, source: 'FoodDB.ca' };
    }
  } catch (error) {
    console.error('FoodDB.ca lookup failed:', error);
  }

  // 4. USDA FDC
  try {
    console.log('4. Trying USDA FDC...');
    const usdaFDCProduct = await fetchProductFromUSDAFDC(barcode);
    
    if (usdaFDCProduct) {
      // Analyze ingredients if available
      if (usdaFDCProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            usdaFDCProduct.ingredientsText,
            usdaFDCProduct.productName || "Unknown Product"
          );
          usdaFDCProduct.processingScore = analysis.score;
          usdaFDCProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze USDA FDC ingredients:", error);
          usdaFDCProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in USDA FDC');
      return { product: usdaFDCProduct, source: 'USDA FDC' };
    }
  } catch (error) {
    console.error('USDA FDC lookup failed:', error);
  }

  // 5. OpenNutrition
  try {
    console.log('5. Trying OpenNutrition...');
    const openNutritionProduct = await fetchProductFromOpenNutrition(barcode);
    
    if (openNutritionProduct) {
      // Analyze ingredients if available
      if (openNutritionProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            openNutritionProduct.ingredientsText,
            openNutritionProduct.productName || "Unknown Product"
          );
          openNutritionProduct.processingScore = analysis.score;
          openNutritionProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze OpenNutrition ingredients:", error);
          openNutritionProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in OpenNutrition');
      return { product: openNutritionProduct, source: 'OpenNutrition' };
    }
  } catch (error) {
    console.error('OpenNutrition lookup failed:', error);
  }

  // 6. Nutritionix
  try {
    console.log('6. Trying Nutritionix...');
    const nutritionixProduct = await fetchProductFromNutritionix(barcode);
    
    if (nutritionixProduct) {
      // Analyze ingredients if available
      if (nutritionixProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            nutritionixProduct.ingredientsText,
            nutritionixProduct.productName || "Unknown Product"
          );
          nutritionixProduct.processingScore = analysis.score;
          nutritionixProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze Nutritionix ingredients:", error);
          nutritionixProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in Nutritionix');
      return { product: nutritionixProduct, source: 'Nutritionix' };
    }
  } catch (error) {
    console.error('Nutritionix lookup failed:', error);
  }

  // 7. Spoonacular
  try {
    console.log('7. Trying Spoonacular...');
    const spoonacularProduct = await fetchProductFromSpoonacular(barcode);
    
    if (spoonacularProduct) {
      // Analyze ingredients if available
      if (spoonacularProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            spoonacularProduct.ingredientsText,
            spoonacularProduct.productName || "Unknown Product"
          );
          spoonacularProduct.processingScore = analysis.score;
          spoonacularProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze Spoonacular ingredients:", error);
          spoonacularProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in Spoonacular');
      return { product: spoonacularProduct, source: 'Spoonacular' };
    }
  } catch (error) {
    console.error('Spoonacular lookup failed:', error);
  }

  // 8. API Ninjas
  try {
    console.log('8. Trying API Ninjas...');
    const apiNinjasProduct = await fetchProductFromAPINinjas(barcode);
    
    if (apiNinjasProduct) {
      // Analyze ingredients if available
      if (apiNinjasProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            apiNinjasProduct.ingredientsText,
            apiNinjasProduct.productName || "Unknown Product"
          );
          apiNinjasProduct.processingScore = analysis.score;
          apiNinjasProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze API Ninjas ingredients:", error);
          apiNinjasProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in API Ninjas');
      return { product: apiNinjasProduct, source: 'API Ninjas' };
    }
  } catch (error) {
    console.error('API Ninjas lookup failed:', error);
  }

  // 9. FoodData Central (USDA)
  try {
    console.log('9. Trying FoodData Central (USDA)...');
    const foodDataCentralProduct = await fetchProductFromFoodDataCentral(barcode);
    
    if (foodDataCentralProduct) {
      // Analyze ingredients if available
      if (foodDataCentralProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            foodDataCentralProduct.ingredientsText,
            foodDataCentralProduct.productName || "Unknown Product"
          );
          foodDataCentralProduct.processingScore = analysis.score;
          foodDataCentralProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze FoodData Central ingredients:", error);
          foodDataCentralProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in FoodData Central');
      return { product: foodDataCentralProduct, source: 'FoodData Central' };
    }
  } catch (error) {
    console.error('FoodData Central lookup failed:', error);
  }

  // 10. EFSA (European Food Safety Authority)
  try {
    console.log('10. Trying EFSA (European Food Safety Authority)...');
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

  // 11. Health Canada Food Database
  try {
    console.log('11. Trying Health Canada Food Database...');
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

  // 12. Barcode Spider
  try {
    console.log('12. Trying Barcode Spider...');
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

  // 13. EAN Search
  try {
    console.log('13. Trying EAN Search...');
    const eanSearchProduct = await fetchProductFromEANSearch(barcode);
    
    if (eanSearchProduct) {
      console.log('Found product in EAN Search');
      return { product: eanSearchProduct, source: 'EAN Search' };
    }
  } catch (error) {
    console.error('EAN Search lookup failed:', error);
  }

  // 14. UPC Database
  try {
    console.log('14. Trying UPC Database...');
    const upcProduct = await fetchProductFromUPCDatabase(barcode);
    
    if (upcProduct) {
      console.log('Found product in UPC Database');
      return { product: upcProduct, source: 'UPC Database' };
    }
  } catch (error) {
    console.error('UPC Database lookup failed:', error);
  }

  // 15. All lookups failed
  console.log('All database lookups failed for barcode:', barcode);
  return { 
    product: null, 
    source: 'none',
    error: 'Product not found in any database. You can add this product manually.'
  };
}