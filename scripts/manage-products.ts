import { db } from "../server/db";
import { products } from "../shared/schema";
import { eq, sql, desc, asc, like } from "drizzle-orm";

// Product management utilities
async function listAllProducts() {
  try {
    const allProducts = await db
      .select({
        id: products.id,
        barcode: products.barcode,
        productName: products.productName,
        brands: products.brands,
        processingScore: products.processingScore,
        glycemicIndex: products.glycemicIndex,
        dataSource: products.dataSource
      })
      .from(products)
      .orderBy(asc(products.productName));
    
    console.log("\n=== ALL PRODUCTS IN DATABASE ===");
    console.log(`Total products: ${allProducts.length}\n`);
    
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.productName}`);
      console.log(`   Barcode: ${product.barcode}`);
      console.log(`   Brands: ${product.brands || 'N/A'}`);
      console.log(`   Processing Score: ${product.processingScore || 'N/A'}`);
      console.log(`   Glycemic Index: ${product.glycemicIndex || 'N/A'}`);
      console.log(`   Source: ${product.dataSource}`);
      console.log('');
    });
    
  } catch (error) {
    console.error("Error listing products:", error);
  }
}

async function searchProducts(query: string) {
  try {
    const searchResults = await db
      .select()
      .from(products)
      .where(like(products.productName, `%${query}%`))
      .orderBy(asc(products.productName));
    
    console.log(`\n=== SEARCH RESULTS FOR: "${query}" ===`);
    console.log(`Found ${searchResults.length} products\n`);
    
    searchResults.forEach((product, index) => {
      console.log(`${index + 1}. ${product.productName}`);
      console.log(`   Barcode: ${product.barcode}`);
      console.log(`   Brands: ${product.brands || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error("Error searching products:", error);
  }
}

async function getProductByBarcode(barcode: string) {
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.barcode, barcode));
    
    if (!product) {
      console.log(`\nNo product found with barcode: ${barcode}`);
      return;
    }
    
    console.log(`\n=== PRODUCT DETAILS ===`);
    console.log(`Name: ${product.productName}`);
    console.log(`Barcode: ${product.barcode}`);
    console.log(`Brands: ${product.brands || 'N/A'}`);
    console.log(`Image URL: ${product.imageUrl || 'N/A'}`);
    console.log(`Ingredients: ${product.ingredientsText || 'N/A'}`);
    console.log(`Processing Score: ${product.processingScore || 'N/A'}`);
    console.log(`Processing Explanation: ${product.processingExplanation || 'N/A'}`);
    console.log(`Glycemic Index: ${product.glycemicIndex || 'N/A'}`);
    console.log(`Glycemic Load: ${product.glycemicLoad || 'N/A'}`);
    console.log(`Glycemic Explanation: ${product.glycemicExplanation || 'N/A'}`);
    console.log(`Data Source: ${product.dataSource}`);
    console.log(`Last Updated: ${product.lastUpdated}`);
    
    if (product.nutriments) {
      console.log('\n--- Nutrition per 100g ---');
      const nutrients = product.nutriments as any;
      console.log(`Energy: ${nutrients.energy_100g || 'N/A'} kJ`);
      console.log(`Fat: ${nutrients.fat_100g || 'N/A'} g`);
      console.log(`Saturated Fat: ${nutrients.saturated_fat_100g || 'N/A'} g`);
      console.log(`Carbohydrates: ${nutrients.carbohydrates_100g || 'N/A'} g`);
      console.log(`Sugars: ${nutrients.sugars_100g || 'N/A'} g`);
      console.log(`Proteins: ${nutrients.proteins_100g || 'N/A'} g`);
      console.log(`Salt: ${nutrients.salt_100g || 'N/A'} g`);
      console.log(`Fiber: ${nutrients.fiber_100g || 'N/A'} g`);
    }
    
  } catch (error) {
    console.error("Error getting product:", error);
  }
}

async function getStatistics() {
  try {
    const totalCount = await db.select({ count: sql`count(*)` }).from(products);
    const total = Number(totalCount[0]?.count) || 0;
    
    const withGlycemicIndex = await db.select({ count: sql`count(*)` }).from(products)
      .where(sql`${products.glycemicIndex} IS NOT NULL`);
    const glycemicCount = Number(withGlycemicIndex[0]?.count) || 0;
    
    const withProcessingScore = await db.select({ count: sql`count(*)` }).from(products)
      .where(sql`${products.processingScore} IS NOT NULL`);
    const processingCount = Number(withProcessingScore[0]?.count) || 0;
    
    const bySource = await db.select({
      source: products.dataSource,
      count: sql`count(*)`
    }).from(products)
      .groupBy(products.dataSource)
      .orderBy(desc(sql`count(*)`));
    
    console.log("\n=== DATABASE STATISTICS ===");
    console.log(`Total Products: ${total}`);
    console.log(`Products with Glycemic Index: ${glycemicCount} (${((glycemicCount/total)*100).toFixed(1)}%)`);
    console.log(`Products with Processing Score: ${processingCount} (${((processingCount/total)*100).toFixed(1)}%)`);
    console.log('\n--- By Data Source ---');
    bySource.forEach(source => {
      console.log(`${source.source}: ${source.count} products`);
    });
    
  } catch (error) {
    console.error("Error getting statistics:", error);
  }
}

async function deleteProduct(barcode: string) {
  try {
    const result = await db
      .delete(products)
      .where(eq(products.barcode, barcode))
      .returning();
    
    if (result.length > 0) {
      console.log(`✓ Deleted product: ${result[0].productName} (${barcode})`);
    } else {
      console.log(`No product found with barcode: ${barcode}`);
    }
    
  } catch (error) {
    console.error("Error deleting product:", error);
  }
}

async function clearAllProducts() {
  try {
    const result = await db.delete(products).returning();
    console.log(`✓ Cleared all products. Deleted ${result.length} products.`);
  } catch (error) {
    console.error("Error clearing products:", error);
  }
}

// Main function to handle command line arguments
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'list':
      await listAllProducts();
      break;
    
    case 'search':
      if (!args[1]) {
        console.log("Usage: npm run manage-products search <query>");
        return;
      }
      await searchProducts(args[1]);
      break;
    
    case 'get':
      if (!args[1]) {
        console.log("Usage: npm run manage-products get <barcode>");
        return;
      }
      await getProductByBarcode(args[1]);
      break;
    
    case 'stats':
      await getStatistics();
      break;
    
    case 'delete':
      if (!args[1]) {
        console.log("Usage: npm run manage-products delete <barcode>");
        return;
      }
      await deleteProduct(args[1]);
      break;
    
    case 'clear':
      console.log("⚠️  WARNING: This will delete ALL products from the database!");
      console.log("Are you sure? (This script doesn't ask for confirmation)");
      // Uncomment the next line to enable clearing:
      // await clearAllProducts();
      console.log("Clear command disabled for safety. Modify script to enable.");
      break;
    
    default:
      console.log("Available commands:");
      console.log("  list              - List all products");
      console.log("  search <query>    - Search products by name");
      console.log("  get <barcode>     - Get detailed product info");
      console.log("  stats             - Show database statistics");
      console.log("  delete <barcode>  - Delete a specific product");
      console.log("  clear             - Clear all products (disabled)");
      console.log("\nExamples:");
      console.log("  npx tsx scripts/manage-products.ts list");
      console.log("  npx tsx scripts/manage-products.ts search 'oreo'");
      console.log("  npx tsx scripts/manage-products.ts get 7622210951045");
      console.log("  npx tsx scripts/manage-products.ts stats");
  }
}

// Run the script
main().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});