import { db } from "../server/db";
import { products } from "../shared/schema";
import type { InsertProduct } from "../shared/schema";
import { eq, sql } from "drizzle-orm";

// International products with various barcode formats
const internationalProducts: InsertProduct[] = [
  {
    barcode: "0016000264502",
    productName: "Lay's Classic Potato Chips",
    brands: "Lay's, Frito-Lay",
    imageUrl: "https://images.openfoodfacts.org/images/products/001/600/026/4502/front_en.jpg",
    ingredientsText: "Potatoes, vegetable oil, salt.",
    nutriments: {
      energy_100g: 2220,
      fat_100g: 35,
      saturated_fat_100g: 5,
      carbohydrates_100g: 50,
      sugars_100g: 3,
      proteins_100g: 6,
      salt_100g: 1.5,
      fiber_100g: 4
    },
    processingScore: 3,
    processingExplanation: "Processed snack food with simple ingredients but high in oil and salt.",
    glycemicIndex: 75,
    glycemicLoad: 38,
    glycemicExplanation: "High glycemic impact due to processed potato starch.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "737628064502",
    productName: "Heinz Tomato Ketchup",
    brands: "Heinz",
    imageUrl: "https://images.openfoodfacts.org/images/products/737/628/064/502/front_en.jpg",
    ingredientsText: "Tomato concentrate, distilled vinegar, high fructose corn syrup, corn syrup, salt, spice, onion powder, natural flavoring.",
    nutriments: {
      energy_100g: 435,
      fat_100g: 0.1,
      saturated_fat_100g: 0,
      carbohydrates_100g: 25,
      sugars_100g: 22,
      proteins_100g: 1.2,
      salt_100g: 2.7,
      fiber_100g: 0.3
    },
    processingScore: 3,
    processingExplanation: "Processed condiment with high sugar content and corn syrup.",
    glycemicIndex: 65,
    glycemicLoad: 16,
    glycemicExplanation: "Moderate-high glycemic impact due to high fructose corn syrup.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "4000417025005",
    productName: "Haribo Goldbears Gummy Bears",
    brands: "Haribo",
    imageUrl: "https://images.openfoodfacts.org/images/products/400/041/702/5005/front_en.jpg",
    ingredientsText: "Glucose syrup, sugar, gelatine, dextrose, fruit juice, citric acid, flavoring, fruit concentrates, glazing agents, colors.",
    nutriments: {
      energy_100g: 1460,
      fat_100g: 0.2,
      saturated_fat_100g: 0.1,
      carbohydrates_100g: 77,
      sugars_100g: 46,
      proteins_100g: 6.9,
      salt_100g: 0.07,
      fiber_100g: 0
    },
    processingScore: 4,
    processingExplanation: "Ultra-processed confectionery with multiple artificial additives and very high sugar content.",
    glycemicIndex: 90,
    glycemicLoad: 69,
    glycemicExplanation: "Very high glycemic impact due to glucose syrup and sugar concentration.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "20054838",
    productName: "Bananas (Fresh)",
    brands: "Fresh Produce",
    imageUrl: "https://images.openfoodfacts.org/images/products/200/548/38/front_en.jpg",
    ingredientsText: "Fresh bananas.",
    nutriments: {
      energy_100g: 371,
      fat_100g: 0.3,
      saturated_fat_100g: 0.1,
      carbohydrates_100g: 23,
      sugars_100g: 12,
      proteins_100g: 1.1,
      salt_100g: 0.001,
      fiber_100g: 2.6
    },
    processingScore: 1,
    processingExplanation: "Unprocessed whole fruit with natural nutrients and fiber.",
    glycemicIndex: 52,
    glycemicLoad: 12,
    glycemicExplanation: "Moderate glycemic impact, fiber content helps slow sugar absorption.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "8712100854989",
    productName: "Unilever Ben & Jerry's Vanilla Ice Cream",
    brands: "Ben & Jerry's, Unilever",
    imageUrl: "https://images.openfoodfacts.org/images/products/871/210/085/4989/front_en.jpg",
    ingredientsText: "Cream, skim milk, liquid sugar, water, egg yolks, vanilla extract, guar gum, carrageenan.",
    nutriments: {
      energy_100g: 950,
      fat_100g: 13,
      saturated_fat_100g: 8,
      carbohydrates_100g: 20,
      sugars_100g: 19,
      proteins_100g: 4,
      salt_100g: 0.13,
      fiber_100g: 0
    },
    processingScore: 3,
    processingExplanation: "Processed frozen dessert with natural ingredients but high in sugar and saturated fat.",
    glycemicIndex: 70,
    glycemicLoad: 14,
    glycemicExplanation: "High glycemic index but moderate load due to portion considerations.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "87157215",
    productName: "Organic Avocado",
    brands: "Organic Produce",
    imageUrl: "https://images.openfoodfacts.org/images/products/871/572/15/front_en.jpg",
    ingredientsText: "Organic avocado.",
    nutriments: {
      energy_100g: 670,
      fat_100g: 15,
      saturated_fat_100g: 2.1,
      carbohydrates_100g: 9,
      sugars_100g: 0.7,
      proteins_100g: 2,
      salt_100g: 0.007,
      fiber_100g: 6.7
    },
    processingScore: 1,
    processingExplanation: "Unprocessed whole fruit, rich in healthy fats and fiber.",
    glycemicIndex: 15,
    glycemicLoad: 1,
    glycemicExplanation: "Very low glycemic impact due to high fiber and healthy fat content.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "5449000000996",
    productName: "Coca-Cola Zero Sugar",
    brands: "Coca-Cola",
    imageUrl: "https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.jpg",
    ingredientsText: "Carbonated water, caramel color, phosphoric acid, aspartame, potassium benzoate, natural flavors, potassium citrate, acesulfame potassium, caffeine.",
    nutriments: {
      energy_100g: 1.6,
      fat_100g: 0,
      saturated_fat_100g: 0,
      carbohydrates_100g: 0,
      sugars_100g: 0,
      proteins_100g: 0,
      salt_100g: 0.02,
      fiber_100g: 0
    },
    processingScore: 4,
    processingExplanation: "Ultra-processed beverage with artificial sweeteners and multiple additives.",
    glycemicIndex: 0,
    glycemicLoad: 0,
    glycemicExplanation: "No glycemic impact due to artificial sweeteners instead of sugar.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "7613287070703",
    productName: "Nestlé KitKat Chunky",
    brands: "KitKat, Nestlé",
    imageUrl: "https://images.openfoodfacts.org/images/products/761/328/707/0703/front_en.jpg",
    ingredientsText: "Sugar, wheat flour, cocoa butter, whole milk powder, cocoa mass, palm fat, lactose, whey powder, emulsifier, raising agent, salt, flavoring.",
    nutriments: {
      energy_100g: 2100,
      fat_100g: 26,
      saturated_fat_100g: 15,
      carbohydrates_100g: 58,
      sugars_100g: 47,
      proteins_100g: 7.2,
      salt_100g: 0.19,
      fiber_100g: 2.5
    },
    processingScore: 4,
    processingExplanation: "Ultra-processed confectionery with high sugar and saturated fat content.",
    glycemicIndex: 76,
    glycemicLoad: 44,
    glycemicExplanation: "High glycemic impact due to sugar and refined flour content.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  }
];

async function addInternationalProducts() {
  try {
    console.log("Adding international products to database...");
    
    for (const product of internationalProducts) {
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
    
    console.log("International products addition completed!");
    
    // Show summary
    const totalProducts = await db.select({ count: sql`count(*)` }).from(products);
    console.log(`\nTotal products in database: ${totalProducts[0]?.count || 0}`);
    
  } catch (error) {
    console.error("Error adding international products:", error);
  }
}

// Run the script
addInternationalProducts().then(() => {
  console.log("Script completed");
  process.exit(0);
}).catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});