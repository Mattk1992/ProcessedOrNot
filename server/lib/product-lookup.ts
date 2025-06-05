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
import { fetchProductFromKGG } from "./kenniscentrum-gezond-gewicht";
import { fetchProductFromRIVM } from "./rivm";
import { fetchProductFromFoodDataCentral } from "./fooddata-central";
import { fetchProductFromNEVO } from "./nevo";
import { fetchProductFromVoedingscentrum } from "./voedingscentrum";
import { fetchProductFromCiqual } from "./ciqual";
import { fetchProductFromBDAIEO } from "./bda-ieo";
import { fetchProductFromFineli } from "./fineli";
import { fetchProductFromBLS } from "./bls";
import { fetchProductFromDTUFood } from "./dtu-food";
import { analyzeIngredients } from "./openai";
import { broadcastSearchProgress } from "./search-progress";

interface ProductLookupResult {
  product: InsertProduct | null;
  source: string;
  error?: string;
}

export async function cascadingProductLookup(barcode: string): Promise<ProductLookupResult> {
  console.log(`Starting cascading lookup for barcode: ${barcode}`);
  
  const completedSources: string[] = [];
  const totalSources = 19;

  const updateProgress = (currentSource: string, found: boolean = false, error?: string) => {
    if (!found && !error) {
      // Mark previous source as completed
      if (completedSources.length > 0 || currentSource !== 'OpenFoodFacts') {
        const prevSource = completedSources.length === 0 ? '' : completedSources[completedSources.length - 1];
        if (prevSource && !completedSources.includes(prevSource)) {
          completedSources.push(prevSource);
        }
      }
    }
    
    const update = {
      type: (found ? 'complete' : (error ? 'error' : 'progress')) as 'progress' | 'error' | 'complete',
      currentSource,
      completedSources: [...completedSources],
      found,
      totalSources,
      error
    };
    broadcastSearchProgress(barcode, update);
  };

  // 1. Primary: OpenFoodFacts
  try {
    console.log('Trying OpenFoodFacts...');
    updateProgress('OpenFoodFacts');
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

  // 2. Secondary: FoodData Central (USDA)
  try {
    console.log('Trying FoodData Central...');
    const fdcProduct = await fetchProductFromFoodDataCentral(barcode);
    
    if (fdcProduct) {
      // Analyze ingredients if available
      if (fdcProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            fdcProduct.ingredientsText,
            fdcProduct.productName || "Unknown Product"
          );
          fdcProduct.processingScore = analysis.score;
          fdcProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze FoodData Central ingredients:", error);
          fdcProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in FoodData Central');
      return { product: fdcProduct, source: 'FoodData Central' };
    }
  } catch (error) {
    console.error('FoodData Central lookup failed:', error);
  }

  // 3. NEVO (Dutch Food Database)
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

  // 4. RIVM
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

  // 5. Voedingscentrum
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

  // 6. Kenniscentrum Gezond Gewicht
  try {
    console.log('Trying Kenniscentrum Gezond Gewicht...');
    const kggProduct = await fetchProductFromKGG(barcode);
    
    if (kggProduct) {
      // Analyze ingredients if available
      if (kggProduct.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            kggProduct.ingredientsText,
            kggProduct.productName || "Unknown Product"
          );
          kggProduct.processingScore = analysis.score;
          kggProduct.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze KGG ingredients:", error);
          kggProduct.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      console.log('Found product in Kenniscentrum Gezond Gewicht');
      return { product: kggProduct, source: 'Kenniscentrum Gezond Gewicht' };
    }
  } catch (error) {
    console.error('Kenniscentrum Gezond Gewicht lookup failed:', error);
  }

  // 7. CIQUAL (French ANSES)
  try {
    console.log('Trying CIQUAL...');
    const ciqualProduct = await fetchProductFromCiqual(barcode);
    
    if (ciqualProduct) {
      console.log('Found product in CIQUAL');
      return { product: ciqualProduct, source: 'CIQUAL (ANSES)' };
    }
  } catch (error) {
    console.error('CIQUAL lookup failed:', error);
  }

  // 8. BLS (German Federal Food Code)
  try {
    console.log('Trying BLS...');
    const blsProduct = await fetchProductFromBLS(barcode);
    
    if (blsProduct) {
      console.log('Found product in BLS');
      return { product: blsProduct, source: 'BLS (Germany)' };
    }
  } catch (error) {
    console.error('BLS lookup failed:', error);
  }

  // 9. Fineli (Finnish Food Authority)
  try {
    console.log('Trying Fineli...');
    const fineliProduct = await fetchProductFromFineli(barcode);
    
    if (fineliProduct) {
      console.log('Found product in Fineli');
      return { product: fineliProduct, source: 'Fineli (Finland)' };
    }
  } catch (error) {
    console.error('Fineli lookup failed:', error);
  }

  // 10. DTU Food (Denmark)
  try {
    console.log('Trying DTU Food...');
    const dtuProduct = await fetchProductFromDTUFood(barcode);
    
    if (dtuProduct) {
      console.log('Found product in DTU Food');
      return { product: dtuProduct, source: 'DTU Food (Denmark)' };
    }
  } catch (error) {
    console.error('DTU Food lookup failed:', error);
  }

  // 11. BDA-IEO (Italian Food Database)
  try {
    console.log('Trying BDA-IEO...');
    const bdaProduct = await fetchProductFromBDAIEO(barcode);
    
    if (bdaProduct) {
      console.log('Found product in BDA-IEO');
      return { product: bdaProduct, source: 'BDA-IEO (Italy)' };
    }
  } catch (error) {
    console.error('BDA-IEO lookup failed:', error);
  }

  // 12. Legacy USDA (for backwards compatibility)
  try {
    console.log('Trying Legacy USDA...');
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

      console.log('Found product in Legacy USDA');
      return { product: usdaProduct, source: 'USDA' };
    }
  } catch (error) {
    console.error('Legacy USDA lookup failed:', error);
  }

  // 13. EFSA (European Food Safety Authority)
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

  // 14. Health Canada Food Database
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

  // 15. Australian Food Composition Database
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

  // 16. Barcode Spider
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

  // 17. EAN Search
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

  // 18. Product API
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

  // 19. UPC Database (fallback)
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

  // 20. All lookups failed
  console.log('All database lookups failed for barcode:', barcode);
  return { 
    product: null, 
    source: 'none',
    error: 'Product not found in any database. You can add this product manually.'
  };
}