import { InsertProduct } from "@shared/schema";

interface BarcodeSpiderProduct {
  item_name: string;
  item_attributes: {
    brand?: string;
    category?: string;
    description?: string;
    ingredients?: string;
    size?: string;
  };
  images: string[];
  gtins: string[];
}

interface BarcodeSpiderResponse {
  item_response: {
    item: BarcodeSpiderProduct;
  };
}

export async function fetchProductFromBarcodeSpider(barcode: string): Promise<InsertProduct | null> {
  const apiKey = process.env.BARCODE_SPIDER_API_KEY;
  
  if (!apiKey) {
    console.log('Barcode Spider API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.barcodespider.com/v1/lookup?token=${apiKey}&upc=${barcode}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ProcessedOrNot-Scanner/1.0'
        }
      }
    );

    if (!response.ok) {
      console.log(`Barcode Spider API returned ${response.status}`);
      return null;
    }

    const data: BarcodeSpiderResponse = await response.json();

    if (!data.item_response?.item) {
      console.log('No product found in Barcode Spider');
      return null;
    }

    const item = data.item_response.item;

    return {
      barcode,
      productName: item.item_name || null,
      brands: item.item_attributes?.brand || null,
      imageUrl: item.images?.[0] || null,
      ingredientsText: item.item_attributes?.ingredients || null,
      nutriments: null,
      processingScore: 0,
      processingExplanation: "Processing analysis pending",
      dataSource: 'Barcode Spider'
    };

  } catch (error) {
    console.error('Barcode Spider API error:', error);
    return null;
  }
}