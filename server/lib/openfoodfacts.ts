import { OpenFoodFactsProduct } from "@shared/schema";

export async function fetchProductFromOpenFoodFacts(barcode: string): Promise<OpenFoodFactsProduct | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    
    if (!response.ok) {
      throw new Error(`OpenFoodFacts API error: ${response.status}`);
    }

    const data: OpenFoodFactsProduct = await response.json();
    
    // Check if product was found
    if (data.status === 0) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching from OpenFoodFacts:', error);
    throw new Error('Failed to fetch product from OpenFoodFacts API');
  }
}
