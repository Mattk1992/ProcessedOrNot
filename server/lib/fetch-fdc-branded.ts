import { InsertProduct } from "@shared/schema";
import { storage } from "../storage";

/**
 * Fetches product from FoodData Central branded foods database by barcode
 * @param barcode - Product barcode/GTIN/UPC
 * @returns Product data in standard format or null if not found
 */
export async function fetchProductFromFdcBranded(barcode: string): Promise<InsertProduct | null> {
  try {
    console.log(`Searching FDC branded foods database for barcode: ${barcode}`);
    
    // Search FDC database by GTIN/UPC
    const fdcProduct = await storage.getFoodDataCentralBrandedFoodByGtinUpc(barcode);
    
    if (!fdcProduct) {
      console.log('Product not found in FDC branded foods database');
      return null;
    }

    console.log(`Found product in FDC database: ${fdcProduct.description}`);

    // Convert FDC product to standard product format
    const product: InsertProduct = {
      barcode: fdcProduct.gtinUpc || barcode,
      productName: fdcProduct.description,
      brands: fdcProduct.brandOwner || fdcProduct.brandName || 'Unknown Brand',
      ingredientsText: fdcProduct.ingredients || '',
      // Convert serving size to per 100g if available
      nutriments: fdcProduct.servingSize ? {
        'serving-size': fdcProduct.servingSize,
        'serving-size-unit': fdcProduct.servingSizeUnit || 'g'
      } : {},
      // Additional metadata
      dataSource: 'USDA FoodData Central'
    };

    // Add nutritional data if available in the nutrients field
    if (fdcProduct.nutrients && typeof fdcProduct.nutrients === 'object') {
      const nutrients = fdcProduct.nutrients as Record<string, any>;
      
      if (!product.nutriments) {
        product.nutriments = {};
      }
      
      const nutrimentData = product.nutriments as Record<string, any>;
      
      // Map common nutrient fields
      if (nutrients.energy) nutrimentData['energy-kcal'] = nutrients.energy;
      if (nutrients.protein) nutrimentData.proteins = nutrients.protein;
      if (nutrients.fat) nutrimentData.fat = nutrients.fat;
      if (nutrients.carbohydrates) nutrimentData.carbohydrates = nutrients.carbohydrates;
      if (nutrients.fiber) nutrimentData.fiber = nutrients.fiber;
      if (nutrients.sugar) nutrimentData.sugars = nutrients.sugar;
      if (nutrients.sodium) nutrimentData.sodium = nutrients.sodium;
      
      // Add all other nutrients
      Object.keys(nutrients).forEach(key => {
        if (!nutrimentData[key]) {
          nutrimentData[key] = nutrients[key];
        }
      });
    }

    return product;
    
  } catch (error) {
    console.error('Error fetching from FDC branded foods database:', error);
    return null;
  }
}