import { InsertProduct } from "@shared/schema";

// USDA Food Data Central API
export async function fetchProductFromUSDAFDC(barcode: string): Promise<InsertProduct | null> {
  try {
    console.log(`Fetching product from USDA FDC for barcode: ${barcode}`);
    
    // USDA FDC requires an API key - check environment
    const apiKey = process.env.USDA_API_KEY;
    if (!apiKey) {
      console.log('USDA API key not found in environment variables');
      return null;
    }
    
    // Search for food by barcode (UPC)
    const searchResponse = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: barcode,
        dataType: ['Branded'],
        pageSize: 10,
        pageNumber: 1,
        searchField: 'gtinUpc'
      })
    });

    if (!searchResponse.ok) {
      console.log(`USDA FDC search API returned ${searchResponse.status} for barcode ${barcode}`);
      return null;
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.foods || searchData.foods.length === 0) {
      console.log(`No foods found in USDA FDC for barcode ${barcode}`);
      return null;
    }

    // Get the first matching food
    const food = searchData.foods[0];
    
    // Get detailed food data
    const detailResponse = await fetch(`https://api.nal.usda.gov/fdc/v1/food/${food.fdcId}?api_key=${apiKey}`);
    
    if (!detailResponse.ok) {
      console.log(`USDA FDC detail API returned ${detailResponse.status} for food ID ${food.fdcId}`);
      return null;
    }

    const detailData = await detailResponse.json();
    
    // Extract nutrition data
    const nutrients: any = {};
    if (detailData.foodNutrients) {
      detailData.foodNutrients.forEach((nutrient: any) => {
        const nutrientId = nutrient.nutrient.id;
        const value = nutrient.amount;
        
        // Map USDA nutrient IDs to our structure
        switch (nutrientId) {
          case 1008: // Energy (kcal)
            nutrients.energy_100g = value * 4.184; // Convert kcal to kJ
            break;
          case 1004: // Total lipid (fat)
            nutrients.fat_100g = value;
            break;
          case 1258: // Fatty acids, total saturated
            nutrients.saturated_fat_100g = value;
            break;
          case 1005: // Carbohydrate, by difference
            nutrients.carbohydrates_100g = value;
            break;
          case 2000: // Sugars, total including NLEA
            nutrients.sugars_100g = value;
            break;
          case 1003: // Protein
            nutrients.proteins_100g = value;
            break;
          case 1093: // Sodium, Na
            nutrients.salt_100g = value * 2.54 / 1000; // Convert mg sodium to g salt
            break;
          case 1079: // Fiber, total dietary
            nutrients.fiber_100g = value;
            break;
        }
      });
    }
    
    // Map USDA FDC data to our product structure
    const product: InsertProduct = {
      barcode,
      productName: detailData.description || food.description || null,
      brands: detailData.brandOwner || detailData.brandName || null,
      imageUrl: null, // USDA FDC doesn't typically provide images
      ingredientsText: detailData.ingredients || null,
      nutriments: Object.keys(nutrients).length > 0 ? nutrients : null,
      processingScore: 0,
      processingExplanation: "Analysis pending",
      glycemicIndex: null,
      glycemicLoad: null,
      glycemicExplanation: "Analysis pending",
      dataSource: 'USDA FDC'
    };

    console.log(`Successfully found product in USDA FDC: ${product.productName}`);
    return product;
    
  } catch (error) {
    console.error('Error fetching from USDA FDC:', error);
    return null;
  }
}