import { InsertProduct } from "@shared/schema";
import { fetchProductFromAgrifoodData } from "./agri-food-data";
import { fetchProductFromOpenFoodFacts } from "./openfoodfacts";
import { fetchProductFromUSDA } from "./usda";
import { fetchProductFromEdamam } from "./edamam";
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
import { analyzeIngredients, analyzeGlycemicIndex, analyzeProductionProcess, getUserAIProvider } from "./openai";
import { isBarcode, searchProductByText } from "./text-search";

interface ProductLookupResult {
  product: InsertProduct | null;
  source: string;
  error?: string;
}

/**
 * Evaluates if product data is sufficient for user needs
 * Returns true if product has meaningful data, false if insufficient
 */
function isProductDataSufficient(product: InsertProduct): boolean {
  // Basic requirement: must have a product name or barcode
  if (!product.productName && !product.barcode) {
    console.log('Product rejected: No name or barcode');
    return false;
  }

  // Must have at least one of these data points to be considered sufficient:
  // 1. Ingredients text (for processing analysis)
  // 2. Nutriments data (for nutrition analysis) 
  // 3. Both product name and brands (for identification)
  const hasIngredients = product.ingredientsText && product.ingredientsText.trim().length > 10;
  const hasNutriments = product.nutriments && Object.keys(product.nutriments).length > 0;
  const hasBasicInfo = Boolean(product.productName && product.brands && typeof product.brands === 'string' && product.brands.trim().length > 0);
  
  const sufficientDataFound = hasIngredients || hasNutriments || hasBasicInfo;
  
  if (!sufficientDataFound) {
    console.log('Product rejected: Insufficient data - missing ingredients, nutrients, and basic info');
    console.log(`- Has ingredients (>10 chars): ${hasIngredients}`);
    console.log(`- Has nutriments: ${hasNutriments}`);
    console.log(`- Has basic info (name + brands): ${hasBasicInfo}`);
  }

  return sufficientDataFound;
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

  // 1. Edamam Food Database (Primary)
  try {
    console.log('1. Trying Edamam Food Database (Primary)...');
    const edamamProduct = await fetchProductFromEdamam(barcode);
    
    if (edamamProduct) {
      // Check if product data is sufficient
      if (!isProductDataSufficient(edamamProduct)) {
        console.log('Edamam product has insufficient data, continuing cascade...');
      } else {
        // Analyze ingredients if available
        if (edamamProduct.ingredientsText) {
          try {
            const analysis = await analyzeIngredients(
              edamamProduct.ingredientsText,
              edamamProduct.productName || "Unknown Product",
              'en',
              userAIProvider,
              userId
            );
            edamamProduct.processingScore = analysis.score;
            edamamProduct.processingExplanation = analysis.explanation;
          } catch (error) {
            console.error("Failed to analyze Edamam ingredients:", error);
            edamamProduct.processingExplanation = "Unable to analyze ingredients at this time";
          }

          // Analyze production process
          try {
            const productionProcess = await analyzeProductionProcess(
              edamamProduct.ingredientsText,
              edamamProduct.productName || "Unknown Product",
              edamamProduct.nutriments || {},
              'en',
              userAIProvider,
              userId
            );
            edamamProduct.productionProcess = productionProcess;
          } catch (error) {
            console.error("Failed to analyze Edamam production process:", error);
            edamamProduct.productionProcess = "Unable to analyze production process at this time";
          }
        }

        console.log('Found sufficient product data in Edamam Food Database');
        return { product: edamamProduct, source: 'Edamam' };
      }
    }
  } catch (error) {
    console.error('Edamam lookup failed:', error);
  }

  // 2. Agri-food Data (Secondary)
  try {
    console.log('2. Trying Agri-food Data (Secondary)...');
    const agrifoodProduct = await fetchProductFromAgrifoodData(barcode);
    
    if (agrifoodProduct) {
      // Check if product data is sufficient
      if (!isProductDataSufficient(agrifoodProduct)) {
        console.log('Agri-food Data product has insufficient data, continuing cascade...');
      } else {
        // Analyze ingredients if available
        if (agrifoodProduct.ingredientsText) {
          try {
            const analysis = await analyzeIngredients(
              agrifoodProduct.ingredientsText,
              agrifoodProduct.productName || "Unknown Product",
              'en',
              userAIProvider,
              userId
            );
            agrifoodProduct.processingScore = analysis.score;
            agrifoodProduct.processingExplanation = analysis.explanation;
          } catch (error) {
            console.error("Failed to analyze Agri-food Data ingredients:", error);
            agrifoodProduct.processingExplanation = "Unable to analyze ingredients at this time";
          }

          // Analyze production process
          try {
            const productionProcess = await analyzeProductionProcess(
              agrifoodProduct.ingredientsText,
              agrifoodProduct.productName || "Unknown Product",
              agrifoodProduct.nutriments || {},
              'en',
              userAIProvider,
              userId
            );
            agrifoodProduct.productionProcess = productionProcess;
          } catch (error) {
            console.error("Failed to analyze Agri-food Data production process:", error);
            agrifoodProduct.productionProcess = "Unable to analyze production process at this time";
          }
        }

        console.log('Found sufficient product data in Agri-food Data');
        return { product: agrifoodProduct, source: 'Agri-food Data' };
      }
    }
  } catch (error) {
    console.error('Agri-food Data lookup failed:', error);
  }

  // 3. Spoonacular (Tertiary)
  try {
    console.log('3. Trying Spoonacular (Tertiary)...');
    const spoonacularProduct = await fetchProductFromSpoonacular(barcode);
    
    if (spoonacularProduct) {
      // Check if product data is sufficient
      if (!isProductDataSufficient(spoonacularProduct)) {
        console.log('Spoonacular product has insufficient data, continuing cascade...');
      } else {
        // Analyze ingredients if available
        if (spoonacularProduct.ingredientsText) {
          try {
            const analysis = await analyzeIngredients(
              spoonacularProduct.ingredientsText,
              spoonacularProduct.productName || "Unknown Product",
              'en',
              userAIProvider,
              userId
            );
            spoonacularProduct.processingScore = analysis.score;
            spoonacularProduct.processingExplanation = analysis.explanation;
          } catch (error) {
            console.error("Failed to analyze Spoonacular ingredients:", error);
            spoonacularProduct.processingExplanation = "Unable to analyze ingredients at this time";
          }

          // Analyze production process
          try {
            const productionProcess = await analyzeProductionProcess(
              spoonacularProduct.ingredientsText,
              spoonacularProduct.productName || "Unknown Product",
              spoonacularProduct.nutriments || {},
              'en',
              userAIProvider,
              userId
            );
            spoonacularProduct.productionProcess = productionProcess;
          } catch (error) {
            console.error("Failed to analyze Spoonacular production process:", error);
            spoonacularProduct.productionProcess = "Unable to analyze production process at this time";
          }
        }

        console.log('Found sufficient product data in Spoonacular');
        return { product: spoonacularProduct, source: 'Spoonacular' };
      }
    }
  } catch (error) {
    console.error('Spoonacular lookup failed:', error);
  }

  // 4. USDA FoodData Central (Quaternary)
  try {
    console.log('4. Trying USDA FoodData Central (Quaternary)...');
    const usdaProduct = await fetchProductFromUSDA(barcode);
    
    if (usdaProduct) {
      // Check if product data is sufficient
      if (!isProductDataSufficient(usdaProduct)) {
        console.log('USDA product has insufficient data, continuing cascade...');
      } else {
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

          // Analyze production process
          try {
            const productionProcess = await analyzeProductionProcess(
              usdaProduct.ingredientsText,
              usdaProduct.productName || "Unknown Product",
              usdaProduct.nutriments || {},
              'en',
              userAIProvider
            );
            usdaProduct.productionProcess = productionProcess;
          } catch (error) {
            console.error("Failed to analyze USDA production process:", error);
            usdaProduct.productionProcess = "Unable to analyze production process at this time";
          }
        }

        console.log('Found sufficient product data in USDA FoodData Central');
        return { product: usdaProduct, source: 'USDA FoodData Central' };
      }
    }
  } catch (error) {
    console.error('USDA lookup failed:', error);
  }

  // 5. OpenFoodFacts (Quinary)
  try {
    console.log('5. Trying OpenFoodFacts (Quinary)...');
    const openFoodFactsData = await fetchProductFromOpenFoodFacts(barcode);
    
    if (openFoodFactsData && openFoodFactsData.status === 1) {
      const product = openFoodFactsData.product;
      
      // Create product data structure first
      // Process nutriments to ensure proper calories mapping
      let processedNutriments = null;
      if (product.nutriments) {
        processedNutriments = { ...product.nutriments };
        
        // OpenFoodFacts typically provides energy_100g in kJ, convert to kcal for consistency
        if (processedNutriments.energy_100g && !processedNutriments.energy_kcal_100g) {
          processedNutriments.energy_kcal_100g = processedNutriments.energy_100g / 4.184;
        }
      }
      
      const productData: InsertProduct = {
        barcode,
        productName: product.product_name || null,
        brands: product.brands || null,
        imageUrl: product.image_url || null,
        ingredientsText: product.ingredients_text || null,
        nutriments: processedNutriments,
        processingScore: 0,
        processingExplanation: "No ingredients available for analysis",
        glycemicIndex: null,
        glycemicLoad: null,
        glycemicExplanation: "No data available for glycemic analysis",
        productionProcess: "No production process analysis available",
        dataSource: 'OpenFoodFacts'
      };

      // Check if product data is sufficient
      if (!isProductDataSufficient(productData)) {
        console.log('OpenFoodFacts product has insufficient data, continuing cascade...');
      } else {
        // Analyze ingredients if available
        if (product.ingredients_text) {
          try {
            const analysis = await analyzeIngredients(
              product.ingredients_text,
              product.product_name || "Unknown Product",
              'en',
              userAIProvider
            );
            productData.processingScore = analysis.score;
            productData.processingExplanation = analysis.explanation;
          } catch (error) {
            console.error("Failed to analyze ingredients:", error);
            productData.processingExplanation = "Unable to analyze ingredients at this time";
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
            productData.glycemicIndex = glycemicAnalysis.glycemicIndex;
            productData.glycemicLoad = glycemicAnalysis.glycemicLoad;
            productData.glycemicExplanation = glycemicAnalysis.explanation;
          } catch (error) {
            console.error("Failed to analyze glycemic index:", error);
            productData.glycemicExplanation = "Unable to analyze glycemic impact at this time";
          }
        }

        // Analyze production process
        if (product.ingredients_text) {
          try {
            productData.productionProcess = await analyzeProductionProcess(
              product.ingredients_text,
              product.product_name || "Unknown Product",
              product.nutriments || {},
              'en',
              userAIProvider
            );
          } catch (error) {
            console.error("Failed to analyze production process:", error);
            productData.productionProcess = "Unable to analyze production process at this time";
          }
        }

        console.log('Found sufficient product data in OpenFoodFacts');
        return { product: productData, source: 'OpenFoodFacts' };
      }
    }
  } catch (error) {
    console.error('OpenFoodFacts lookup failed:', error);
  }

  // 6. FoodDB.ca
  try {
    console.log('6. Trying FoodDB.ca...');
    const foodDBCAProduct = await fetchProductFromFoodDBCA(barcode);
    
    if (foodDBCAProduct) {
      // Check if product data is sufficient
      if (!isProductDataSufficient(foodDBCAProduct)) {
        console.log('FoodDB.ca product has insufficient data, continuing cascade...');
      } else {
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

          // Analyze production process
          try {
            const productionProcess = await analyzeProductionProcess(
              foodDBCAProduct.ingredientsText,
              foodDBCAProduct.productName || "Unknown Product",
              foodDBCAProduct.nutriments || {},
              'en',
              userAIProvider
            );
            foodDBCAProduct.productionProcess = productionProcess;
          } catch (error) {
            console.error("Failed to analyze FoodDB.ca production process:", error);
            foodDBCAProduct.productionProcess = "Unable to analyze production process at this time";
          }
        }

        console.log('Found sufficient product data in FoodDB.ca');
        return { product: foodDBCAProduct, source: 'FoodDB.ca' };
      }
    }
  } catch (error) {
    console.error('FoodDB.ca lookup failed:', error);
  }

  // 7. USDA FDC
  try {
    console.log('7. Trying USDA FDC...');
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

  // 8. OpenNutrition
  try {
    console.log('8. Trying OpenNutrition...');
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

  // 9. Nutritionix
  try {
    console.log('9. Trying Nutritionix...');
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

  // 10. API Ninjas
  try {
    console.log('10. Trying API Ninjas...');
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

  // 11. FoodData Central (USDA)
  try {
    console.log('11. Trying FoodData Central (USDA)...');
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

  // 12. EFSA (European Food Safety Authority)
  try {
    console.log('12. Trying EFSA (European Food Safety Authority)...');
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

  // 13. Health Canada Food Database
  try {
    console.log('13. Trying Health Canada Food Database...');
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

  // 14. EAN Search
  try {
    console.log('14. Trying EAN Search...');
    const eanSearchProduct = await fetchProductFromEANSearch(barcode);
    
    if (eanSearchProduct) {
      console.log('Found product in EAN Search');
      return { product: eanSearchProduct, source: 'EAN Search' };
    }
  } catch (error) {
    console.error('EAN Search lookup failed:', error);
  }

  // 15. UPC Database
  try {
    console.log('15. Trying UPC Database...');
    const upcProduct = await fetchProductFromUPCDatabase(barcode);
    
    if (upcProduct) {
      console.log('Found product in UPC Database');
      return { product: upcProduct, source: 'UPC Database' };
    }
  } catch (error) {
    console.error('UPC Database lookup failed:', error);
  }

  // 16. All lookups failed
  console.log('All database lookups failed for barcode:', barcode);
  return { 
    product: null, 
    source: 'none',
    error: 'Product not found in any database. You can add this product manually.'
  };
}