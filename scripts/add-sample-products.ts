import { db } from "../server/db";
import { products } from "../shared/schema";
import type { InsertProduct } from "../shared/schema";

// Sample products data for barcode search testing
const sampleProducts: InsertProduct[] = [
  {
    barcode: "7622210951045",
    productName: "Oreo Original Cookies",
    brands: "Oreo, Mondelez",
    imageUrl: "https://images.openfoodfacts.org/images/products/762/221/095/1045/front_en.jpg",
    ingredientsText: "Wheat flour, sugar, palm oil, rapeseed oil, fat reduced cocoa powder 4.5%, wheat starch, glucose-fructose syrup, raising agents (potassium hydrogen carbonate, ammonium hydrogen carbonate, sodium hydrogen carbonate), salt, emulsifiers (soya lecithin, sunflower lecithin), vanilla flavouring.",
    nutriments: {
      energy_100g: 2046,
      fat_100g: 20,
      saturated_fat_100g: 9.5,
      carbohydrates_100g: 67,
      sugars_100g: 36,
      proteins_100g: 6.9,
      salt_100g: 1.1,
      fiber_100g: 3.3
    },
    processingScore: 4,
    processingExplanation: "Ultra-processed food with multiple additives, artificial flavoring, and high sugar content.",
    glycemicIndex: 80,
    glycemicLoad: 54,
    glycemicExplanation: "High glycemic impact due to refined flour and high sugar content. May cause rapid blood sugar spikes.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "3017620422003",
    productName: "Nutella Hazelnut Spread",
    brands: "Nutella, Ferrero",
    imageUrl: "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.jpg",
    ingredientsText: "Sugar, palm oil, hazelnuts 13%, skimmed milk powder 8.7%, fat-reduced cocoa 7.4%, emulsifier: lecithins (soya), vanillin.",
    nutriments: {
      energy_100g: 2252,
      fat_100g: 30.9,
      saturated_fat_100g: 10.6,
      carbohydrates_100g: 57.5,
      sugars_100g: 56.3,
      proteins_100g: 6.3,
      salt_100g: 0.107,
      fiber_100g: 0
    },
    processingScore: 4,
    processingExplanation: "Ultra-processed spread with high sugar and palm oil content, multiple additives.",
    glycemicIndex: 85,
    glycemicLoad: 49,
    glycemicExplanation: "Very high glycemic impact due to extremely high sugar content. Can cause significant blood sugar spikes.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "4066600204404",
    productName: "Ben & Jerry's Cookie Dough Ice Cream",
    brands: "Ben & Jerry's, Unilever",
    imageUrl: "https://images.openfoodfacts.org/images/products/406/660/020/4404/front_en.jpg",
    ingredientsText: "Cream, skimmed milk, sugar, water, wheat flour, brown sugar, butter, egg yolk, vanilla extract, stabilizers (guar gum, carrageenan).",
    nutriments: {
      energy_100g: 1100,
      fat_100g: 14,
      saturated_fat_100g: 9,
      carbohydrates_100g: 24,
      sugars_100g: 22,
      proteins_100g: 4,
      salt_100g: 0.15,
      fiber_100g: 1
    },
    processingScore: 4,
    processingExplanation: "Ultra-processed frozen dessert with high fat, sugar content and multiple stabilizers.",
    glycemicIndex: 75,
    glycemicLoad: 18,
    glycemicExplanation: "High glycemic impact from refined sugars and flour. Moderate load due to portion size considerations.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "0012000161155",
    productName: "Coca-Cola Classic",
    brands: "Coca-Cola",
    imageUrl: "https://images.openfoodfacts.org/images/products/001/200/016/1155/front_en.jpg",
    ingredientsText: "Carbonated water, high fructose corn syrup, caramel color, phosphoric acid, natural flavors, caffeine.",
    nutriments: {
      energy_100g: 180,
      fat_100g: 0,
      saturated_fat_100g: 0,
      carbohydrates_100g: 10.6,
      sugars_100g: 10.6,
      proteins_100g: 0,
      salt_100g: 0.01,
      fiber_100g: 0
    },
    processingScore: 4,
    processingExplanation: "Ultra-processed beverage with high fructose corn syrup, artificial colors and flavors.",
    glycemicIndex: 90,
    glycemicLoad: 10,
    glycemicExplanation: "Very high glycemic index due to liquid sugar absorption, but moderate load per 100ml serving.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "8901030895559",
    productName: "Maggi 2-Minute Noodles Masala",
    brands: "Maggi, Nestlé",
    imageUrl: "https://images.openfoodfacts.org/images/products/890/103/089/5559/front_en.jpg",
    ingredientsText: "Wheat flour, palm oil, salt, mineral salts, thickeners, flavor enhancers, spices, onion powder, garlic powder.",
    nutriments: {
      energy_100g: 1900,
      fat_100g: 18,
      saturated_fat_100g: 9,
      carbohydrates_100g: 61,
      sugars_100g: 3,
      proteins_100g: 9,
      salt_100g: 3.1,
      fiber_100g: 2
    },
    processingScore: 4,
    processingExplanation: "Ultra-processed instant noodles with high sodium, palm oil, and multiple flavor enhancers.",
    glycemicIndex: 70,
    glycemicLoad: 43,
    glycemicExplanation: "High glycemic impact due to refined wheat flour. Significant load per serving.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "3068320115108",
    productName: "Activia Strawberry Yogurt",
    brands: "Activia, Danone",
    imageUrl: "https://images.openfoodfacts.org/images/products/306/832/011/5108/front_en.jpg",
    ingredientsText: "Milk, strawberry preparation 12% (strawberries, sugar, modified starch), sugar, milk proteins, lactic ferments including bifidus.",
    nutriments: {
      energy_100g: 385,
      fat_100g: 2.9,
      saturated_fat_100g: 1.9,
      carbohydrates_100g: 12.3,
      sugars_100g: 12.3,
      proteins_100g: 4.4,
      salt_100g: 0.13,
      fiber_100g: 0.5
    },
    processingScore: 3,
    processingExplanation: "Processed dairy product with added sugars and modified starch, but contains beneficial probiotics.",
    glycemicIndex: 45,
    glycemicLoad: 6,
    glycemicExplanation: "Moderate glycemic impact. Protein and fat content help slow sugar absorption.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "0036000291452",
    productName: "Pringles Original",
    brands: "Pringles, Kellogg's",
    imageUrl: "https://images.openfoodfacts.org/images/products/003/600/029/1452/front_en.jpg",
    ingredientsText: "Dehydrated potatoes, vegetable oils, wheat starch, corn flour, rice flour, maltodextrin, emulsifier, salt, sugar.",
    nutriments: {
      energy_100g: 2230,
      fat_100g: 34,
      saturated_fat_100g: 12,
      carbohydrates_100g: 49,
      sugars_100g: 2.4,
      proteins_100g: 4,
      salt_100g: 1.5,
      fiber_100g: 3
    },
    processingScore: 4,
    processingExplanation: "Ultra-processed snack with high fat content, multiple refined ingredients and additives.",
    glycemicIndex: 65,
    glycemicLoad: 32,
    glycemicExplanation: "Moderate-high glycemic impact due to processed starches and refined ingredients.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "5000169005477",
    productName: "Cadbury Dairy Milk Chocolate",
    brands: "Cadbury, Mondelez",
    imageUrl: "https://images.openfoodfacts.org/images/products/500/016/900/5477/front_en.jpg",
    ingredientsText: "Milk chocolate, sugar, cocoa butter, milk powder, cocoa mass, emulsifiers, flavorings.",
    nutriments: {
      energy_100g: 2200,
      fat_100g: 30,
      saturated_fat_100g: 18,
      carbohydrates_100g: 57,
      sugars_100g: 56,
      proteins_100g: 7.3,
      salt_100g: 0.24,
      fiber_100g: 2.1
    },
    processingScore: 4,
    processingExplanation: "Ultra-processed confectionery with very high sugar and saturated fat content.",
    glycemicIndex: 82,
    glycemicLoad: 47,
    glycemicExplanation: "High glycemic impact due to high sugar content. Can cause rapid blood sugar elevation.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "8901030795559",
    productName: "Britannia Good Day Butter Cookies",
    brands: "Britannia",
    imageUrl: "https://images.openfoodfacts.org/images/products/890/103/079/5559/front_en.jpg",
    ingredientsText: "Wheat flour, sugar, edible vegetable oil, butter, salt, raising agents, emulsifiers, artificial flavoring.",
    nutriments: {
      energy_100g: 2050,
      fat_100g: 19,
      saturated_fat_100g: 10,
      carbohydrates_100g: 68,
      sugars_100g: 22,
      proteins_100g: 7,
      salt_100g: 1.2,
      fiber_100g: 2
    },
    processingScore: 4,
    processingExplanation: "Ultra-processed baked goods with high sugar, refined flour, and artificial additives.",
    glycemicIndex: 75,
    glycemicLoad: 51,
    glycemicExplanation: "High glycemic impact from refined flour and sugar. Significant load per serving.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "8901030835285",
    productName: "Amul Butter",
    brands: "Amul",
    imageUrl: "https://images.openfoodfacts.org/images/products/890/103/083/5285/front_en.jpg",
    ingredientsText: "Fresh cream, salt.",
    nutriments: {
      energy_100g: 3000,
      fat_100g: 83,
      saturated_fat_100g: 54,
      carbohydrates_100g: 0.1,
      sugars_100g: 0.1,
      proteins_100g: 0.5,
      salt_100g: 1.5,
      fiber_100g: 0
    },
    processingScore: 2,
    processingExplanation: "Minimally processed dairy product made from cream and salt only.",
    glycemicIndex: 0,
    glycemicLoad: 0,
    glycemicExplanation: "No glycemic impact due to negligible carbohydrate content.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  }
];

async function addSampleProducts() {
  try {
    console.log("Adding sample products to database...");
    
    for (const product of sampleProducts) {
      try {
        // Check if product already exists
        const existingProduct = await db
          .select()
          .from(products)
          .where(eq(products.barcode, product.barcode))
          .limit(1);
        
        if (existingProduct.length > 0) {
          console.log(`Product ${product.barcode} (${product.productName}) already exists, skipping...`);
          continue;
        }
        
        // Insert new product
        await db.insert(products).values(product);
        console.log(`✓ Added: ${product.productName} (${product.barcode})`);
        
      } catch (error) {
        console.error(`✗ Failed to add ${product.productName}: ${error}`);
      }
    }
    
    console.log("Sample products addition completed!");
    
    // Show summary
    const totalProducts = await db.select({ count: sql`count(*)` }).from(products);
    console.log(`\nTotal products in database: ${totalProducts[0]?.count || 0}`);
    
  } catch (error) {
    console.error("Error adding sample products:", error);
  }
}

// Import required functions
import { eq, sql } from "drizzle-orm";

// Run the script
addSampleProducts().then(() => {
  console.log("Script completed");
  process.exit(0);
}).catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});