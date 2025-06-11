import type { InsertProduct } from "@shared/schema";

interface FoodDataCentralFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  gtinUpc?: string;
  ingredients?: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    value: number;
    unitName: string;
  }>;
}

interface FoodDataCentralResponse {
  foods: FoodDataCentralFood[];
  totalHits: number;
}

export async function fetchProductFromFoodDataCentral(barcode: string): Promise<InsertProduct | null> {
  try {
    // FoodData Central - USDA's primary food composition data system
    const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${barcode}&api_key=DEMO_KEY`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data: FoodDataCentralResponse = await response.json();

    if (!data.foods || data.foods.length === 0) {
      return null;
    }

    // Find exact barcode match first
    let food = data.foods.find(f => f.gtinUpc === barcode);
    if (!food) {
      food = data.foods[0]; // Fallback to first result
    }

    // Convert FoodData Central nutrients to our format
    const nutriments: Record<string, number> = {};
    
    food.foodNutrients.forEach(nutrient => {
      const name = nutrient.nutrientName.toLowerCase();
      const id = nutrient.nutrientId;
      
      // Energy (208 = Energy, 1008 = Energy in kcal)
      if (id === 208 || id === 1008 || name.includes('energy')) {
        if (nutrient.unitName.toLowerCase() === 'kcal') {
          nutriments.energy_100g = nutrient.value;
        }
      }
      // Protein (203)
      else if (id === 203 || name.includes('protein')) {
        nutriments.proteins_100g = nutrient.value;
      }
      // Carbohydrates (205)
      else if (id === 205 || name.includes('carbohydrate')) {
        nutriments.carbohydrates_100g = nutrient.value;
      }
      // Sugars (269)
      else if (id === 269 || name.includes('sugars')) {
        nutriments.sugars_100g = nutrient.value;
      }
      // Total fat (204)
      else if (id === 204 || (name.includes('fat') && !name.includes('saturated'))) {
        nutriments.fat_100g = nutrient.value;
      }
      // Saturated fat (606)
      else if (id === 606 || name.includes('saturated')) {
        nutriments.saturated_fat_100g = nutrient.value;
      }
      // Sodium (307)
      else if (id === 307 || name.includes('sodium')) {
        nutriments.salt_100g = nutrient.value * 2.5 / 1000; // Convert mg sodium to g salt
      }
      // Fiber (291)
      else if (id === 291 || name.includes('fiber')) {
        nutriments.fiber_100g = nutrient.value;
      }
    });

    const productData: InsertProduct = {
      barcode,
      productName: food.description,
      brands: food.brandOwner || null,
      imageUrl: null,
      ingredientsText: food.ingredients || null,
      nutriments: Object.keys(nutriments).length > 0 ? nutriments : null,
      processingScore: null,
      dataSource: 'FoodData Central'
    };

    return productData;
  } catch (error) {
    console.error('Error fetching from FoodData Central:', error);
    return null;
  }
}