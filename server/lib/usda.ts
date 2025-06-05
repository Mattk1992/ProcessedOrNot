import { InsertProduct } from "@shared/schema";

interface USDASearchResponse {
  foods: USDAFood[];
  totalHits: number;
}

interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  gtinUpc?: string;
  ingredients?: string;
  foodNutrients: USDANutrient[];
}

interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
}

export async function fetchProductFromUSDA(barcode: string): Promise<InsertProduct | null> {
  try {
    const apiKey = process.env.USDA_API_KEY;
    
    // First, search by UPC/GTIN
    const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey || 'DEMO_KEY'}&query=${barcode}&dataType=Branded&pageSize=25`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    const data: USDASearchResponse = await response.json();
    
    // Look for exact UPC match
    const exactMatch = data.foods.find(food => 
      food.gtinUpc === barcode || 
      food.gtinUpc === barcode.padStart(12, '0') ||
      food.gtinUpc === barcode.padStart(13, '0') ||
      food.gtinUpc === barcode.padStart(14, '0')
    );

    if (!exactMatch) {
      return null;
    }

    // Convert USDA data to our Product format
    const nutrients = exactMatch.foodNutrients.reduce((acc, nutrient) => {
      switch (nutrient.nutrientId) {
        case 1008: // Energy
          acc.energy_100g = nutrient.value * 4.184; // Convert kcal to kJ
          break;
        case 1004: // Total lipid (fat)
          acc.fat_100g = nutrient.value;
          break;
        case 1258: // Saturated fatty acids
          acc.saturated_fat_100g = nutrient.value;
          break;
        case 1005: // Carbohydrate
          acc.carbohydrates_100g = nutrient.value;
          break;
        case 2000: // Total sugars
          acc.sugars_100g = nutrient.value;
          break;
        case 1003: // Protein
          acc.proteins_100g = nutrient.value;
          break;
        case 1293: // Sodium
          acc.salt_100g = nutrient.value * 0.00254; // Convert mg sodium to g salt
          break;
      }
      return acc;
    }, {} as any);

    return {
      barcode,
      productName: exactMatch.description,
      brands: exactMatch.brandOwner || '',
      imageUrl: '', // USDA doesn't provide images
      ingredientsText: exactMatch.ingredients || '',
      nutriments: nutrients,
      processingScore: 0,
      processingExplanation: 'Processing analysis pending',
      dataSource: 'USDA FoodData Central',
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching from USDA:', error);
    return null;
  }
}