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
    'openfoodfacts': 'OpenFoodFacts',
    'fooddb-ca': 'FoodDB.ca',
    'usda-fdc': 'USDA Food Data Central',
    'nutritionix': 'Nutritionix',
    'spoonacular': 'Spoonacular',
    'api-ninjas': 'API Ninjas',
    'upc-database': 'UPC Database',
    'australia-food': 'Australian Food Database',
    'health-canada': 'Health Canada',
    'efsa': 'EFSA Database'
  };
  
  return names[databaseId] || databaseId;
}

export default router;