import type { InsertProduct } from "@shared/schema";

interface FDCFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  gtinUpc?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients?: Array<{
    nutrientId: number;
    nutrientName: string;
    value: number;
    unitName: string;
  }>;
}

interface FDCSearchResponse {
  foods: FDCFood[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

export async function fetchProductFromFoodDataCentral(barcode: string): Promise<InsertProduct | null> {
  try {
    const apiKey = process.env.USDA_API_KEY;
    if (!apiKey) {
      console.log("USDA API key not found");
      return null;
    }

    const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${barcode}&api_key=${apiKey}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`FoodData Central API error: ${response.status}`);
    }

    const data: FDCSearchResponse = await response.json();

    if (!data.foods || data.foods.length === 0) {
      return null;
    }

    // Find food with matching GTIN/UPC or best match
    const matchedFood = data.foods.find(food => food.gtinUpc === barcode) || data.foods[0];

    const productData: InsertProduct = {
      barcode,
      productName: matchedFood.description,
      brands: matchedFood.brandOwner || matchedFood.brandName || null,
      ingredientsText: matchedFood.ingredients || null,
      imageUrl: null,
      dataSource: 'FoodData Central',
      lastUpdated: new Date().toISOString(),
      processingScore: null,
      processingExplanation: null
    };

    return productData;

  } catch (error) {
    console.error("Error fetching from FoodData Central:", error);
    return null;
  }
}