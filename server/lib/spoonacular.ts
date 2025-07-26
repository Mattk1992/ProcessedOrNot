import { InsertProduct } from "@shared/schema";

// Spoonacular API
export async function fetchProductFromSpoonacular(barcode: string): Promise<InsertProduct | null> {
  try {
    console.log(`Fetching product from Spoonacular for barcode: ${barcode}`);
    
    // Spoonacular requires an API key
    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey) {
      console.log('Spoonacular API key not found in environment variables');
      return null;
    }
    
    // Search for product by UPC
    const response = await fetch(`https://api.spoonacular.com/food/products/upc/${barcode}?apiKey=${apiKey}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.log(`Spoonacular API returned ${response.status} for barcode ${barcode}`);
      return null;
    }

    const data = await response.json();
    
    if (!data || data.status === 'failure') {
      console.log(`No product data found in Spoonacular for barcode ${barcode}`);
      return null;
    }
    
    // Extract nutrition data from Spoonacular format
    const nutrients: any = {};
    if (data.nutrition && data.nutrition.nutrients) {
      data.nutrition.nutrients.forEach((nutrient: any) => {
        switch (nutrient.name?.toLowerCase()) {
          case 'calories':
            nutrients.energy_100g = nutrient.amount * 4.184; // Convert kcal to kJ
            break;
          case 'fat':
            nutrients.fat_100g = nutrient.amount;
            break;
          case 'saturated fat':
            nutrients.saturated_fat_100g = nutrient.amount;
            break;
          case 'carbohydrates':
            nutrients.carbohydrates_100g = nutrient.amount;
            break;
          case 'sugar':
            nutrients.sugars_100g = nutrient.amount;
            break;
          case 'protein':
            nutrients.proteins_100g = nutrient.amount;
            break;
          case 'sodium':
            nutrients.salt_100g = nutrient.amount * 2.54 / 1000; // Convert mg sodium to g salt
            break;
          case 'fiber':
            nutrients.fiber_100g = nutrient.amount;
            break;
        }
      });
    }
    
    // Map Spoonacular data to our product structure
    const product: InsertProduct = {
      barcode,
      productName: data.title || data.name || null,
      brands: data.brand || null,
      imageUrl: data.image || null,
      ingredientsText: data.ingredientList || null,
      nutriments: Object.keys(nutrients).length > 0 ? nutrients : null,
      processingScore: 0,
      processingExplanation: "Analysis pending",
      glycemicIndex: null,
      glycemicLoad: null,
      glycemicExplanation: "Analysis pending",
      dataSource: 'Spoonacular'
    };

    console.log(`Successfully found product in Spoonacular: ${product.productName}`);
    return product;
    
  } catch (error) {
    console.error('Error fetching from Spoonacular:', error);
    return null;
  }
}