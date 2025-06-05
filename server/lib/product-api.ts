import { InsertProduct } from "@shared/schema";

interface ProductAPIResult {
  barcode: string;
  product: {
    title: string;
    brand?: string;
    description?: string;
    ingredients?: string;
    images?: string[];
    category?: string;
  };
}

interface ProductAPIResponse {
  status: string;
  product: ProductAPIResult;
}

export async function fetchProductFromProductAPI(barcode: string): Promise<InsertProduct | null> {
  const apiKey = process.env.PRODUCT_API_KEY;
  
  if (!apiKey) {
    console.log('Product API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.productapi.io/product/${barcode}?apikey=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ProcessedOrNot-Scanner/1.0'
        }
      }
    );

    if (!response.ok) {
      console.log(`Product API returned ${response.status}`);
      return null;
    }

    const data: ProductAPIResponse = await response.json();

    if (!data.product || data.status !== 'success') {
      console.log('No product found in Product API');
      return null;
    }

    const product = data.product.product;

    return {
      barcode,
      productName: product.title || null,
      brands: product.brand || null,
      imageUrl: product.images?.[0] || null,
      ingredientsText: product.ingredients || null,
      nutriments: null,
      processingScore: 0,
      processingExplanation: "Processing analysis pending",
      dataSource: 'Product API'
    };

  } catch (error) {
    console.error('Product API error:', error);
    return null;
  }
}