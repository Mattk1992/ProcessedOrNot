import { InsertProduct } from "@shared/schema";

// API Ninjas Barcode Lookup
export async function fetchProductFromAPINinjas(barcode: string): Promise<InsertProduct | null> {
  try {
    console.log(`Fetching product from API Ninjas for barcode: ${barcode}`);
    
    // API Ninjas requires an API key
    const apiKey = process.env.API_NINJAS_KEY;
    if (!apiKey) {
      console.log('API Ninjas API key not found in environment variables');
      return null;
    }
    
    // Query API Ninjas Barcode Lookup API
    const response = await fetch(`https://api.api-ninjas.com/v1/barcode?barcode=${barcode}`, {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.log(`API Ninjas returned ${response.status} for barcode ${barcode}`);
      return null;
    }

    const data = await response.json();
    
    if (!data || !data.product_name) {
      console.log(`No product data found in API Ninjas for barcode ${barcode}`);
      return null;
    }
    
    // API Ninjas provides basic product information, not detailed nutrition
    // Map API Ninjas data to our product structure
    const product: InsertProduct = {
      barcode,
      productName: data.product_name || null,
      brands: data.brand || data.manufacturer || null,
      imageUrl: null, // API Ninjas typically doesn't provide images
      ingredientsText: data.ingredients || null,
      nutriments: null, // API Ninjas doesn't provide detailed nutrition data
      processingScore: 0,
      processingExplanation: "No ingredients available for analysis",
      glycemicIndex: null,
      glycemicLoad: null,
      glycemicExplanation: "No nutrition data available for glycemic analysis",
      dataSource: 'API Ninjas'
    };

    console.log(`Successfully found product in API Ninjas: ${product.productName}`);
    return product;
    
  } catch (error) {
    console.error('Error fetching from API Ninjas:', error);
    return null;
  }
}