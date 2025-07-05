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
import { analyzeIngredients, analyzeGlycemicIndex } from "./openai";
import { isBarcode, searchProductByText } from "./text-search";

interface ProductLookupResult {
  product: InsertProduct | null;
  source: string;
  error?: string;
}

export async function smartProductLookup(input: string, filters?: { includeBrands?: string[], excludeBrands?: string[] }): Promise<ProductLookupResult> {
  console.log(`Starting smart lookup for input: ${input}`);

  // Check if input is a barcode or text
  if (isBarcode(input)) {
    console.log('Input detected as barcode, using cascading fallback system');
    return cascadingProductLookup(input);
  } else {
    console.log('Input detected as text, using text search');
    return searchProductByText(input, filters);
  }
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
      let glycemicIndex = null;
      let glycemicLoad = null;
      let glycemicExplanation = "No data available for glycemic analysis";
      
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

        // Analyze glycemic index if we have nutrition data (ingredients not required)
        if (product.nutriments) {
          try {
            const glycemicAnalysis = await analyzeGlycemicIndex(
              product.ingredients_text || "",
              product.product_name || "Unknown Product",
              product.nutriments
            );
            glycemicIndex = glycemicAnalysis.glycemicIndex;
            glycemicLoad = glycemicAnalysis.glycemicLoad;
            glycemicExplanation = glycemicAnalysis.explanation;
          } catch (error) {
            console.error("Failed to analyze glycemic index:", error);
            glycemicExplanation = "Unable to analyze glycemic impact at this time";
          }
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

  // 3. Kenniscentrum Gezond Gewicht (Knowledge Centre Healthy Weight)
  try {
    console.log('Trying Kenniscentrum Gezond Gewicht...');
    const kenniscentrumProduct = await fetchProductFromKenniscentrum(barcode);
    
    if (kenniscentrumProduct) {
      // Analyze ingredients if available
      if (kenniscentrumProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            kenniscentrumProduct.ingredientsText,
            kenniscentrumProduct.productName || "Unknown Product"
          );
          kenniscentrumProduct.processingScore = analysis.score;
          kenniscentrumProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze Kenniscentrum ingredients:", error);
          kenniscentrumProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in Kenniscentrum Gezond Gewicht');
      return { product: kenniscentrumProduct, source: 'Kenniscentrum Gezond Gewicht' };
    }
  } catch (error) {
    console.error('Kenniscentrum lookup failed:', error);
  }

  // 4. NEVO (Nederlandse Voedingsstoffenbestand)
  try {
    console.log('Trying NEVO...');
    const nevoProduct = await fetchProductFromNEVO(barcode);
    
    if (nevoProduct) {
      // Analyze ingredients if available
      if (nevoProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            nevoProduct.ingredientsText,
            nevoProduct.productName || "Unknown Product"
          );
          nevoProduct.processingScore = analysis.score;
          nevoProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze NEVO ingredients:", error);
          nevoProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in NEVO');
      return { product: nevoProduct, source: 'NEVO' };
    }
  } catch (error) {
    console.error('NEVO lookup failed:', error);
  }

  // 5. RIVM (Rijksinstituut voor Volksgezondheid en Milieu)
  try {
    console.log('Trying RIVM...');
    const rivmProduct = await fetchProductFromRIVM(barcode);
    
    if (rivmProduct) {
      // Analyze ingredients if available
      if (rivmProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            rivmProduct.ingredientsText,
            rivmProduct.productName || "Unknown Product"
          );
          rivmProduct.processingScore = analysis.score;
          rivmProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze RIVM ingredients:", error);
          rivmProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in RIVM');
      return { product: rivmProduct, source: 'RIVM' };
    }
  } catch (error) {
    console.error('RIVM lookup failed:', error);
  }

  // 6. Voedingscentrum (Netherlands Nutrition Centre)
  try {
    console.log('Trying Voedingscentrum...');
    const voedingscentrumProduct = await fetchProductFromVoedingscentrum(barcode);
    
    if (voedingscentrumProduct) {
      // Analyze ingredients if available
      if (voedingscentrumProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            voedingscentrumProduct.ingredientsText,
            voedingscentrumProduct.productName || "Unknown Product"
          );
          voedingscentrumProduct.processingScore = analysis.score;
          voedingscentrumProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze Voedingscentrum ingredients:", error);
          voedingscentrumProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in Voedingscentrum');
      return { product: voedingscentrumProduct, source: 'Voedingscentrum' };
    }
  } catch (error) {
    console.error('Voedingscentrum lookup failed:', error);
  }

  // 7. FoodData Central (USDA)
  try {
    console.log('Trying FoodData Central...');
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

  // 8. EFSA (European Food Safety Authority)
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

  // 9. Health Canada Food Database
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