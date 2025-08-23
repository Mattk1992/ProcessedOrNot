import { Router } from 'express';
import { productLookup } from '../lib/product-lookup';

const router = Router();

// Advanced batch testing endpoint
router.post('/batch-test', async (req, res) => {
  try {
    const { barcode, databases } = req.body;

    if (!barcode || !databases || !Array.isArray(databases)) {
      return res.status(400).json({ 
        message: 'Invalid request: barcode and databases array required' 
      });
    }

    const startTime = Date.now();
    const databaseResults = [];

    // Test against each selected database
    for (const databaseId of databases) {
      const dbStartTime = Date.now();
      
      try {
        const result = await productLookup(barcode, databaseId);
        const dbEndTime = Date.now();
        
        databaseResults.push({
          databaseName: getDatabaseName(databaseId),
          responseTime: dbEndTime - dbStartTime,
          productFound: !!result && !!result.name,
          productData: result || null,
          error: null
        });
      } catch (error) {
        const dbEndTime = Date.now();
        
        databaseResults.push({
          databaseName: getDatabaseName(databaseId),
          responseTime: dbEndTime - dbStartTime,
          productFound: false,
          productData: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const totalTime = Date.now() - startTime;

    res.json({
      barcode,
      databaseResults,
      totalTime,
      testedDatabases: databases.length,
      foundInDatabases: databaseResults.filter(r => r.productFound).length
    });

  } catch (error) {
    console.error('Batch test error:', error);
    res.status(500).json({ 
      message: 'Internal server error during batch testing' 
    });
  }
});

// Helper function to get readable database names
function getDatabaseName(databaseId: string): string {
  const names: { [key: string]: string } = {
    'edamam': 'Edamam Food Database',
    'openfoodfacts': 'OpenFoodFacts',
    'agrifood_data': 'Agri-Food Data Portal',
    'spoonacular': 'Spoonacular',
    'usda_fdc': 'USDA Food Data Central',
    'fooddb_ca': 'FoodDB.ca',
    'upc_database': 'UPC Database',
    'efsa': 'EFSA Database',
    'health_canada': 'Health Canada',
    'australia_food': 'Australian Food Database',
    'barcode_spider': 'Barcode Spider',
    'ean_search': 'EAN Search',
    'product_api': 'Product API',
    'rivm': 'RIVM Database',
    'nevo': 'NEVO Database',
    'voedingscentrum': 'Voedingscentrum',
    'fooddata_central': 'FoodData Central Alternative',
    'kenniscentrum': 'Kenniscentrum Database',
    'usda_fdc_alt': 'USDA FDC Alternative',
    'open_nutrition': 'OpenNutrition',
    'nutritionix': 'Nutritionix',
    'api_ninjas': 'API Ninjas',
    'leda': 'LEDA Database'
  };
  
  return names[databaseId] || databaseId;
}

export default router;