import type { InsertProduct } from "@shared/schema";

interface CiqualFood {
  alim_code: string;
  alim_nom_fr: string;
  alim_nom_eng?: string;
  alim_grp_code: string;
  alim_grp_nom_fr: string;
  constituants?: Array<{
    const_code: number;
    const_nom_fr: string;
    teneur: number;
    code_unite: string;
  }>;
}

interface CiqualResponse {
  foods: CiqualFood[];
  count: number;
}

export async function fetchProductFromCiqual(barcode: string): Promise<InsertProduct | null> {
  try {
    // ANSES CIQUAL French food composition database
    const response = await fetch(`https://ciqual.anses.fr/api/aliments/search?q=${barcode}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ProcessedOrNot-Scanner/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Ciqual API error: ${response.status}`);
    }

    const data: CiqualResponse = await response.json();

    if (!data.foods || data.foods.length === 0) {
      return null;
    }

    const food = data.foods[0];

    const productData: InsertProduct = {
      barcode,
      productName: food.alim_nom_eng || food.alim_nom_fr,
      brands: null,
      ingredientsText: null,
      imageUrl: null,
      dataSource: 'CIQUAL (ANSES)',
      lastUpdated: new Date().toISOString(),
      processingScore: null,
      processingExplanation: null
    };

    return productData;

  } catch (error) {
    console.error("Error fetching from CIQUAL:", error);
    return null;
  }
}