import { InsertProduct } from "@shared/schema";

interface EANSearchProduct {
  ean: string;
  name: string;
  categoryPath: string;
  category: string;
  issuerCountry: string;
}

interface EANSearchResponse {
  product: EANSearchProduct;
  status: string;
}

export async function fetchProductFromEANSearch(barcode: string): Promise<InsertProduct | null> {
  const apiKey = process.env.EAN_SEARCH_API_KEY;
  
  if (!apiKey) {
    console.log('EAN Search API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.ean-search.org/api?token=${apiKey}&op=barcode-lookup&ean=${barcode}&format=json`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ProcessedOrNot-Scanner/1.0'
        }
      }
    );

    if (!response.ok) {
      console.log(`EAN Search API returned ${response.status}`);
      return null;
    }

    const data: EANSearchResponse = await response.json();

    if (!data.product || data.status !== 'OK') {
      console.log('No product found in EAN Search');
      return null;
    }

    const product = data.product;

    return {
      barcode,
      productName: product.name || null,
      brands: null,
      imageUrl: null,
      ingredientsText: null,
      nutriments: null,
      processingScore: 0,
      processingExplanation: "Processing analysis pending",
      dataSource: 'EAN Search'
    };

  } catch (error) {
    console.error('EAN Search API error:', error);
    return null;
  }
}