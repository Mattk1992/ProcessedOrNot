#!/usr/bin/env tsx

import { fetchProductFromOpenFoodFacts } from "../server/lib/openfoodfacts";
import { fetchProductFromUSDA } from "../server/lib/usda";
import { fetchProductFromUPCDatabase } from "../server/lib/upc";
import { fetchProductFromEFSA } from "../server/lib/efsa";
import { fetchProductFromHealthCanada } from "../server/lib/health-canada";
import { fetchProductFromBarcodeSpider } from "../server/lib/barcode-spider";
import { fetchProductFromEANSearch } from "../server/lib/ean-search";
import { fetchProductFromFoodDataCentral } from "../server/lib/fooddata-central";
import { fetchProductFromFoodDBCA } from "../server/lib/fooddb-ca";
import { fetchProductFromUSDAFDC } from "../server/lib/usda-fdc";
import { fetchProductFromOpenNutrition } from "../server/lib/opennutrition";
import { fetchProductFromNutritionix } from "../server/lib/nutritionix";
import { fetchProductFromSpoonacular } from "../server/lib/spoonacular";
import { fetchProductFromAPINinjas } from "../server/lib/api-ninjas";
import { fetchProductFromLeda } from "../server/lib/leda";

interface DatabaseTest {
  name: string;
  testFunction: (barcode: string) => Promise<any>;
  priority: number;
}

// Test barcodes - mix of common products that should exist in various databases
const testBarcodes = [
  "7622210995292", // Oreo cookies (common international product)
  "0012000161155", // Coca Cola (very common US/global product)
  "3017620422003", // Nutella (global product)
  "8901030835661", // Maggi noodles (Asian product)
  "4902430573546", // Kit Kat (Japanese/global product)
  "0888109110239", // Clif Bar (US health food)
  "1234567890123", // Test barcode (should fail everywhere)
];

// All databases in the cascading system
const databases: DatabaseTest[] = [
  { name: "OpenFoodFacts (Primary)", testFunction: fetchProductFromOpenFoodFacts, priority: 1 },
  { name: "USDA FoodData Central (Secondary)", testFunction: fetchProductFromUSDA, priority: 2 },
  { name: "FoodDB.ca", testFunction: fetchProductFromFoodDBCA, priority: 3 },
  { name: "USDA FDC", testFunction: fetchProductFromUSDAFDC, priority: 4 },
  { name: "OpenNutrition", testFunction: fetchProductFromOpenNutrition, priority: 5 },
  { name: "Nutritionix", testFunction: fetchProductFromNutritionix, priority: 6 },
  { name: "Spoonacular", testFunction: fetchProductFromSpoonacular, priority: 7 },
  { name: "API Ninjas", testFunction: fetchProductFromAPINinjas, priority: 8 },
  { name: "FoodData Central (USDA)", testFunction: fetchProductFromFoodDataCentral, priority: 9 },
  { name: "EFSA", testFunction: fetchProductFromEFSA, priority: 10 },
  { name: "Health Canada", testFunction: fetchProductFromHealthCanada, priority: 11 },
  { name: "Barcode Spider", testFunction: fetchProductFromBarcodeSpider, priority: 12 },
  { name: "EAN Search", testFunction: fetchProductFromEANSearch, priority: 13 },
  { name: "UPC Database", testFunction: fetchProductFromUPCDatabase, priority: 14 },
  { name: "Leda", testFunction: fetchProductFromLeda, priority: 15 },
];

interface TestResult {
  database: string;
  barcode: string;
  success: boolean;
  hasData: boolean;
  productName?: string;
  error?: string;
  responseTime: number;
}

async function testDatabase(db: DatabaseTest, barcode: string): Promise<TestResult> {
  const startTime = Date.now();

  try {
    console.log(`Testing ${db.name} with barcode ${barcode}...`);

    const result = await db.testFunction(barcode);
    const responseTime = Date.now() - startTime;

    // Check if we got meaningful data
    let hasData = false;
    let productName = undefined;

    if (result) {
      // OpenFoodFacts has a different structure
      if (db.name.includes("OpenFoodFacts")) {
        hasData = result.status === 1 && result.product;
        productName = result.product?.product_name;
      } else {
        // Other databases return product data directly
        hasData = !!result.productName || !!result.name;
        productName = result.productName || result.name;
      }
    }

    return {
      database: db.name,
      barcode,
      success: true,
      hasData,
      productName,
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      database: db.name,
      barcode,
      success: false,
      hasData: false,
      error: error instanceof Error ? error.message : String(error),
      responseTime
    };
  }
}

async function testAllDatabases(): Promise<void> {
  const allResults: TestResult[] = [];

  console.log("🧪 Starting comprehensive database testing...");
  console.log(`📊 Testing ${databases.length} databases with ${testBarcodes.length} barcodes\n`);

  // Test each database with each barcode
  for (const barcode of testBarcodes) {
    console.log(`\n🔍 Testing barcode: ${barcode}`);
    console.log("=" .repeat(50));

    for (const db of databases) {
      const result = await testDatabase(db, barcode);
      allResults.push(result);

      // Log result
      const status = result.success ? 
        (result.hasData ? "✅ SUCCESS" : "⚠️  NO DATA") : 
        "❌ ERROR";

      const name = result.productName ? ` (${result.productName})` : "";
      const time = `${result.responseTime}ms`;
      const error = result.error ? ` - ${result.error}` : "";

      console.log(`  ${db.priority.toString().padStart(2)}. ${db.name.padEnd(35)} ${status} ${time}${name}${error}`);
    }
  }

  // Generate summary report
  console.log("\n" + "=".repeat(80));
  console.log("📈 COMPREHENSIVE TEST SUMMARY");
  console.log("=".repeat(80));

  // Database performance summary
  const dbStats = databases.map(db => {
    const dbResults = allResults.filter(r => r.database === db.name);
    const successCount = dbResults.filter(r => r.success).length;
    const dataCount = dbResults.filter(r => r.hasData).length;
    const avgTime = Math.round(dbResults.reduce((sum, r) => sum + r.responseTime, 0) / dbResults.length);

    return {
      name: db.name,
      priority: db.priority,
      successRate: (successCount / dbResults.length * 100).toFixed(1),
      dataRate: (dataCount / dbResults.length * 100).toFixed(1),
      avgResponseTime: avgTime
    };
  });

  console.log("\n🎯 Database Performance (sorted by priority):");
  console.log("-".repeat(80));
  console.log("Priority | Database Name                    | Success Rate | Data Rate | Avg Time");
  console.log("-".repeat(80));

  dbStats.forEach(stat => {
    console.log(
      `${stat.priority.toString().padStart(8)} | ${stat.name.padEnd(32)} | ${stat.successRate.padStart(11)}% | ${stat.dataRate.padStart(8)}% | ${stat.avgResponseTime.toString().padStart(7)}ms`
    );
  });

  // Barcode coverage summary
  console.log("\n🎯 Barcode Coverage Analysis:");
  console.log("-".repeat(80));

  testBarcodes.forEach(barcode => {
    const barcodeResults = allResults.filter(r => r.barcode === barcode);
    const foundInDbs = barcodeResults.filter(r => r.hasData);
    const firstFound = foundInDbs.length > 0 ? foundInDbs[0] : null;

    console.log(`📦 ${barcode}:`);
    if (firstFound) {
      const dbPriority = databases.find(db => db.name === firstFound.database)?.priority || "?";
      console.log(`   ✅ Found in ${foundInDbs.length} database(s), first hit: ${firstFound.database} (Priority ${dbPriority})`);
      console.log(`   📝 Product: ${firstFound.productName}`);
    } else {
      console.log(`   ❌ Not found in any database`);
    }
    console.log("");
  });

  // Overall statistics
  const totalTests = allResults.length;
  const successfulTests = allResults.filter(r => r.success).length;
  const testsWithData = allResults.filter(r => r.hasData).length;
  const avgResponseTime = Math.round(allResults.reduce((sum, r) => sum + r.responseTime, 0) / totalTests);

  console.log("📊 Overall Statistics:");
  console.log("-".repeat(40));
  console.log(`Total API calls made: ${totalTests}`);
  console.log(`Successful connections: ${successfulTests} (${(successfulTests/totalTests*100).toFixed(1)}%)`);
  console.log(`Calls returning data: ${testsWithData} (${(testsWithData/totalTests*100).toFixed(1)}%)`);
  console.log(`Average response time: ${avgResponseTime}ms`);

  // Recommendations
  console.log("\n💡 Recommendations:");
  console.log("-".repeat(40));

  const topPerformers = dbStats
    .filter(stat => parseFloat(stat.dataRate) > 0)
    .sort((a, b) => parseFloat(b.dataRate) - parseFloat(a.dataRate))
    .slice(0, 3);

  if (topPerformers.length > 0) {
    console.log("🌟 Top performing databases:");
    topPerformers.forEach((db, i) => {
      console.log(`   ${i + 1}. ${db.name} - ${db.dataRate}% data rate, ${db.avgResponseTime}ms avg`);
    });
  }

  const slowDatabases = dbStats
    .filter(stat => stat.avgResponseTime > 3000)
    .sort((a, b) => b.avgResponseTime - a.avgResponseTime);

  if (slowDatabases.length > 0) {
    console.log("⚠️  Slow responding databases (>3s):");
    slowDatabases.forEach(db => {
      console.log(`   - ${db.name}: ${db.avgResponseTime}ms average`);
    });
  }

  const failingDatabases = dbStats
    .filter(stat => parseFloat(stat.successRate) < 50)
    .sort((a, b) => parseFloat(a.successRate) - parseFloat(b.successRate));

  if (failingDatabases.length > 0) {
    console.log("❌ Databases with low success rates (<50%):");
    failingDatabases.forEach(db => {
      console.log(`   - ${db.name}: ${db.successRate}% success rate`);
    });
  }

  console.log("\n✅ Database testing completed!");
  console.log(`📄 Full results saved to: DATABASE_TEST_REPORT_${new Date().toISOString().split('T')[0]}.md`);

  // Save detailed report to file
  await saveDetailedReport(allResults, dbStats);
}

async function saveDetailedReport(results: TestResult[], stats: any[]): Promise<void> {
  const date = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toLocaleString();

  let report = `# Database Connection Test Report\n\n`;
  report += `**Date:** ${timestamp}  \n`;
  report += `**Status:** ${stats.some(s => parseFloat(s.dataRate) > 0) ? '✅ PASSED' : '❌ FAILED'} - ${stats.filter(s => parseFloat(s.dataRate) > 0).length} of ${stats.length} databases returning data\n\n`;

  report += `## Test Summary\n\n`;
  report += `### Environment\n`;
  report += `- **Total Databases Tested:** ${stats.length}\n`;
  report += `- **Test Barcodes:** ${testBarcodes.length}\n`;
  report += `- **Total API Calls:** ${results.length}\n\n`;

  report += `### Database Performance\n\n`;
  report += `| Priority | Database Name | Success Rate | Data Rate | Avg Response Time |\n`;
  report += `|----------|---------------|--------------|-----------|-------------------|\n`;

  stats.forEach(stat => {
    report += `| ${stat.priority} | ${stat.name} | ${stat.successRate}% | ${stat.dataRate}% | ${stat.avgResponseTime}ms |\n`;
  });

  report += `\n### Detailed Results\n\n`;

  testBarcodes.forEach(barcode => {
    report += `#### Barcode: ${barcode}\n\n`;
    const barcodeResults = results.filter(r => r.barcode === barcode);

    barcodeResults.forEach(result => {
      const status = result.success ? 
        (result.hasData ? '✅ SUCCESS' : '⚠️ NO DATA') : 
        '❌ ERROR';

      report += `- **${result.database}**: ${status}`;
      if (result.productName) report += ` - ${result.productName}`;
      if (result.error) report += ` - Error: ${result.error}`;
      report += ` (${result.responseTime}ms)\n`;
    });

    report += `\n`;
  });

  // Write report to file
  const fs = await import('fs');
  const filename = `DATABASE_TEST_REPORT_${date}.md`;
  fs.writeFileSync(filename, report);
}

// Run the test
testAllDatabases()
  .then(() => {
    console.log("\n🎉 All tests completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Test execution failed:", error);
    process.exit(1);
  });

export { testAllDatabases };