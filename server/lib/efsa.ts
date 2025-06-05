import { InsertProduct } from "@shared/schema";

interface EFSAFood {
  foodId: string;
  foodName: string;
  scientificName?: string;
  ingredients?: string;
  nutrients?: Array<{
    nutrientId: string;
    nutrientName: string;
    value: number;
    unit: string;
  }>;
}

interface EFSASearchResponse {
  foods: EFSAFood[];
  totalResults: number;
}

export async function fetchProductFromEFSA(barcode: string): Promise<InsertProduct | null> {
  try {
    // EFSA provides public food composition data but requires proper API access
    // Using their public food composition database endpoint
    const response = await fetch(
      `https://www.efsa.europa.eu/en/data/food-composition-nutritional-data?search=${barcode}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ProcessedOrNot-Scanner/1.0'
        }
      }
    );

    if (!response.ok) {
      console.log(`EFSA API returned ${response.status} - may require authentication`);
      return null;
    }

    const data: EFSASearchResponse = await response.json();

    if (!data.foods || data.foods.length === 0) {
      console.log('No products found in EFSA database');
      return null;
    }

    const food = data.foods[0];

    // Transform EFSA data to our product format
    const nutriments: Record<string, number> = {};
    if (food.nutrients) {
      food.nutrients.forEach(nutrient => {
        const key = nutrient.nutrientName.toLowerCase().replace(/\s+/g, '_');
        nutriments[key] = nutrient.value;
      });
    }

    return {
      barcode,
      productName: food.foodName || null,
      brands: null, // EFSA doesn't typically include brand information
      imageUrl: null,
      ingredientsText: food.ingredients || null,
      nutriments: Object.keys(nutriments).length > 0 ? nutriments : null,
      processingScore: 0,
      processingExplanation: "Processing analysis pending",
      dataSource: 'EFSA'
    };

  } catch (error) {
    console.error('EFSA API error:', error);
    return null;
  }
}