import { InsertProduct } from "@shared/schema";

interface UPCDatabaseResponse {
  valid: string;
  number: string;
  itemname: string;
  alias: string;
  description: string;
  avg_price: string;
  rate_up: number;
  rate_down: number;
}

export async function fetchProductFromUPCDatabase(barcode: string): Promise<Product | null> {
  try {
    // UPC Database API endpoint
    const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
    
    if (!response.ok) {
      throw new Error(`UPC Database API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if product was found
    if (!data.items || data.items.length === 0) {
      return null;
    }

    const item = data.items[0];

    // Convert UPC Database data to our Product format
    return {
      barcode,
      productName: item.title || item.brand || 'Unknown Product',
      brands: item.brand || '',
      imageUrl: item.images?.[0] || '',
      ingredientsText: '', // UPC Database doesn't provide ingredients
      nutriments: {}, // UPC Database doesn't provide nutritional data
      processingScore: 0,
      processingExplanation: 'No ingredients available for processing analysis',
      dataSource: 'UPC Database',
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching from UPC Database:', error);
    return null;
  }
}