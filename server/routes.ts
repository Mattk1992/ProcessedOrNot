import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchProductFromOpenFoodFacts } from "./lib/openfoodfacts";
import { analyzeIngredients } from "./lib/openai";
import { z } from "zod";

const barcodeSchema = z.object({
  barcode: z.string().min(8, "Barcode must be at least 8 digits"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get product by barcode
  app.get("/api/products/:barcode", async (req, res) => {
    try {
      const { barcode } = barcodeSchema.parse({ barcode: req.params.barcode });

      // Check if we have cached product data
      const cachedProduct = await storage.getProductByBarcode(barcode);
      if (cachedProduct) {
        return res.json(cachedProduct);
      }

      // Fetch from OpenFoodFacts API
      const openFoodFactsData = await fetchProductFromOpenFoodFacts(barcode);
      if (!openFoodFactsData) {
        return res.status(404).json({ 
          message: "Product not found in OpenFoodFacts database" 
        });
      }

      const product = openFoodFactsData.product;

      // Analyze ingredients if available
      let processingScore = 0;
      let processingExplanation = "No ingredients available for analysis";
      
      if (product.ingredients_text) {
        try {
          const analysis = await analyzeIngredients(
            product.ingredients_text,
            product.product_name || "Unknown Product"
          );
          processingScore = analysis.score;
          processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze ingredients:", error);
          processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      // Store product data
      const productData = {
        barcode,
        productName: product.product_name || null,
        brands: product.brands || null,
        imageUrl: product.image_url || null,
        ingredientsText: product.ingredients_text || null,
        nutriments: product.nutriments || null,
        processingScore,
        processingExplanation,
      };

      const savedProduct = await storage.createProduct(productData);
      res.json(savedProduct);

    } catch (error) {
      console.error("Error fetching product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid barcode format",
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        message: "Failed to fetch product data" 
      });
    }
  });

  // Get detailed ingredient analysis
  app.get("/api/products/:barcode/analysis", async (req, res) => {
    try {
      const { barcode } = barcodeSchema.parse({ barcode: req.params.barcode });

      const product = await storage.getProductByBarcode(barcode);
      if (!product || !product.ingredientsText) {
        return res.status(404).json({ 
          message: "Product or ingredients not found" 
        });
      }

      const analysis = await analyzeIngredients(
        product.ingredientsText,
        product.productName || "Unknown Product"
      );

      res.json(analysis);

    } catch (error) {
      console.error("Error analyzing ingredients:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid barcode format",
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        message: "Failed to analyze ingredients" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
