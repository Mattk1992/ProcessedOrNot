import { db } from "../server/db";
import { products } from "../shared/schema";
import type { InsertProduct } from "../shared/schema";
import { eq, sql } from "drizzle-orm";

// Additional products for comprehensive barcode testing
const additionalProducts: InsertProduct[] = [
  {
    barcode: "4902777130200",
    productName: "KitKat Original Wafer",
    brands: "KitKat, Nestlé",
    imageUrl: "https://images.openfoodfacts.org/images/products/490/277/713/0200/front_en.jpg",
    ingredientsText: "Sugar, wheat flour, cocoa butter, milk powder, cocoa mass, vegetable oil, lactose, salt, emulsifier, raising agent, flavoring.",
    nutriments: {
      energy_100g: 2090,
      fat_100g: 25,
      saturated_fat_100g: 15,
      carbohydrates_100g: 59,
      sugars_100g: 47,
      proteins_100g: 8,
      salt_100g: 0.3,
      fiber_100g: 3
    },
    processingScore: 4,
    processingExplanation: "Ultra-processed confectionery with high sugar, refined ingredients and multiple additives.",
    glycemicIndex: 78,
    glycemicLoad: 46,
    glycemicExplanation: "High glycemic impact due to refined sugar and flour content.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "8901030854521",
    productName: "Parle-G Glucose Biscuits",
    brands: "Parle",
    imageUrl: "https://images.openfoodfacts.org/images/products/890/103/085/4521/front_en.jpg",
    ingredientsText: "Wheat flour, sugar, edible vegetable oil, invert syrup, raising agents, salt, milk solids, emulsifiers.",
    nutriments: {
      energy_100g: 1950,
      fat_100g: 13,
      saturated_fat_100g: 6,
      carbohydrates_100g: 75,
      sugars_100g: 20,
      proteins_100g: 8,
      salt_100g: 1.1,
      fiber_100g: 2
    },
    processingScore: 4,
    processingExplanation: "Ultra-processed biscuits with refined flour, sugar, and multiple processing aids.",
    glycemicIndex: 72,
    glycemicLoad: 54,
    glycemicExplanation: "High glycemic impact from refined wheat flour and added sugars.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "8904063206923",
    productName: "Haldiram's Bhujia Sev",
    brands: "Haldiram's",
    imageUrl: "https://images.openfoodfacts.org/images/products/890/406/320/6923/front_en.jpg",
    ingredientsText: "Gram flour, vegetable oil, salt, red chili powder, turmeric, asafoetida, spices.",
    nutriments: {
      energy_100g: 2200,
      fat_100g: 32,
      saturated_fat_100g: 15,
      carbohydrates_100g: 38,
      sugars_100g: 4,
      proteins_100g: 15,
      salt_100g: 2.5,
      fiber_100g: 8
    },
    processingScore: 3,
    processingExplanation: "Processed snack food with added spices and oil, but uses whole gram flour as base.",
    glycemicIndex: 45,
    glycemicLoad: 17,
    glycemicExplanation: "Moderate glycemic impact due to gram flour base and fiber content.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "8901030832574",
    productName: "Amul Milk Full Cream",
    brands: "Amul",
    imageUrl: "https://images.openfoodfacts.org/images/products/890/103/083/2574/front_en.jpg",
    ingredientsText: "Fresh cow milk, milk fat, milk solids.",
    nutriments: {
      energy_100g: 270,
      fat_100g: 4,
      saturated_fat_100g: 2.5,
      carbohydrates_100g: 4.8,
      sugars_100g: 4.8,
      proteins_100g: 3.2,
      salt_100g: 0.1,
      fiber_100g: 0
    },
    processingScore: 1,
    processingExplanation: "Minimally processed dairy product - pasteurized milk with no additives.",
    glycemicIndex: 30,
    glycemicLoad: 1,
    glycemicExplanation: "Low glycemic impact due to protein and fat content moderating lactose absorption.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "8906045490823",
    productName: "MTR Ready to Eat Pulao",
    brands: "MTR Foods",
    imageUrl: "https://images.openfoodfacts.org/images/products/890/604/549/0823/front_en.jpg",
    ingredientsText: "Basmati rice, vegetables, spices, salt, vegetable oil, natural flavoring.",
    nutriments: {
      energy_100g: 580,
      fat_100g: 8,
      saturated_fat_100g: 3,
      carbohydrates_100g: 22,
      sugars_100g: 3,
      proteins_100g: 4,
      salt_100g: 1.2,
      fiber_100g: 2
    },
    processingScore: 3,
    processingExplanation: "Processed ready meal with preserved vegetables and added spices.",
    glycemicIndex: 55,
    glycemicLoad: 12,
    glycemicExplanation: "Moderate glycemic impact due to basmati rice and added vegetables.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "8901030835292",
    productName: "Amul Cheese Slices",
    brands: "Amul",
    imageUrl: "https://images.openfoodfacts.org/images/products/890/103/083/5292/front_en.jpg",
    ingredientsText: "Milk, milk fat, salt, citric acid, natural cheese cultures, calcium chloride.",
    nutriments: {
      energy_100g: 1400,
      fat_100g: 25,
      saturated_fat_100g: 16,
      carbohydrates_100g: 4,
      sugars_100g: 4,
      proteins_100g: 20,
      salt_100g: 1.8,
      fiber_100g: 0
    },
    processingScore: 2,
    processingExplanation: "Processed dairy product with natural fermentation and minimal additives.",
    glycemicIndex: 0,
    glycemicLoad: 0,
    glycemicExplanation: "No significant glycemic impact due to low carbohydrate content.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "8901725001827",
    productName: "Patanjali Atta Noodles",
    brands: "Patanjali",
    imageUrl: "https://images.openfoodfacts.org/images/products/890/172/500/1827/front_en.jpg",
    ingredientsText: "Whole wheat flour, palm oil, salt, turmeric, spices, raising agents.",
    nutriments: {
      energy_100g: 1850,
      fat_100g: 16,
      saturated_fat_100g: 8,
      carbohydrates_100g: 62,
      sugars_100g: 2,
      proteins_100g: 12,
      salt_100g: 2.8,
      fiber_100g: 4
    },
    processingScore: 3,
    processingExplanation: "Processed instant noodles using whole wheat flour with natural spices.",
    glycemicIndex: 60,
    glycemicLoad: 37,
    glycemicExplanation: "Moderate-high glycemic impact, but better than refined flour noodles due to whole wheat.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "8902019001827",
    productName: "Real Fruit Juice Mango",
    brands: "Real, Dabur",
    imageUrl: "https://images.openfoodfacts.org/images/products/890/201/900/1827/front_en.jpg",
    ingredientsText: "Water, mango pulp 20%, sugar, citric acid, natural mango flavor, vitamin C.",
    nutriments: {
      energy_100g: 230,
      fat_100g: 0,
      saturated_fat_100g: 0,
      carbohydrates_100g: 14,
      sugars_100g: 13,
      proteins_100g: 0.2,
      salt_100g: 0.02,
      fiber_100g: 0.5
    },
    processingScore: 3,
    processingExplanation: "Processed fruit juice with added sugar and artificial flavoring.",
    glycemicIndex: 75,
    glycemicLoad: 11,
    glycemicExplanation: "High glycemic index due to liquid sugars, but moderate load per serving.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "8901030001827",
    productName: "Britannia Marie Gold Biscuits",
    brands: "Britannia",
    imageUrl: "https://images.openfoodfacts.org/images/products/890/103/000/1827/front_en.jpg",
    ingredientsText: "Wheat flour, sugar, edible vegetable oil, raising agents, salt, milk powder, emulsifiers.",
    nutriments: {
      energy_100g: 1980,
      fat_100g: 17,
      saturated_fat_100g: 8,
      carbohydrates_100g: 70,
      sugars_100g: 18,
      proteins_100g: 8,
      salt_100g: 1.3,
      fiber_100g: 2
    },
    processingScore: 4,
    processingExplanation: "Ultra-processed biscuits with refined flour, added sugars and emulsifiers.",
    glycemicIndex: 70,
    glycemicLoad: 49,
    glycemicExplanation: "High glycemic impact from refined wheat flour and sugar content.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  },
  {
    barcode: "8901030001834",
    productName: "Tata Tea Premium",
    brands: "Tata Tea",
    imageUrl: "https://images.openfoodfacts.org/images/products/890/103/000/1834/front_en.jpg",
    ingredientsText: "Black tea leaves.",
    nutriments: {
      energy_100g: 15,
      fat_100g: 0,
      saturated_fat_100g: 0,
      carbohydrates_100g: 0.3,
      sugars_100g: 0,
      proteins_100g: 0.2,
      salt_100g: 0,
      fiber_100g: 0
    },
    processingScore: 1,
    processingExplanation: "Minimally processed tea leaves with no additives.",
    glycemicIndex: 0,
    glycemicLoad: 0,
    glycemicExplanation: "No glycemic impact from plain tea leaves.",
    dataSource: "OpenFoodFacts",
    lastUpdated: new Date().toISOString()
  }
];

async function addAdditionalProducts() {
  try {
    console.log("Adding additional products to database...");
    
    for (const product of additionalProducts) {
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
    
    console.log("Additional products addition completed!");
    
    // Show summary
    const totalProducts = await db.select({ count: sql`count(*)` }).from(products);
    console.log(`\nTotal products in database: ${totalProducts[0]?.count || 0}`);
    
  } catch (error) {
    console.error("Error adding additional products:", error);
  }
}

// Run the script
addAdditionalProducts().then(() => {
  console.log("Script completed");
  process.exit(0);
}).catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});