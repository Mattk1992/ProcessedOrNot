import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cascadingProductLookup } from "./lib/product-lookup";
import { analyzeIngredients } from "./lib/openai";
import { generateSearchSuggestions } from "./lib/search-suggestions";
import { getChatbotResponse } from "./lib/nutribot";
import { insertProductSchema } from "@shared/schema";
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

      // Use cascading fallback system
      const lookupResult = await cascadingProductLookup(barcode);
      
      if (!lookupResult.product) {
        return res.status(404).json({ 
          message: lookupResult.error || "Product not found in any database",
          source: lookupResult.source,
          allowManualEntry: true
        });
      }

      // Store in our database with current timestamp
      const productData = {
        ...lookupResult.product,
        lastUpdated: new Date().toISOString(),
      };

      const savedProduct = await storage.createProduct(productData);
      
      // Include source information in response
      res.json({
        ...savedProduct,
        lookupSource: lookupResult.source
      });

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

  // Manual product entry
  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);

      // Check if product already exists
      const existingProduct = await storage.getProductByBarcode(productData.barcode);
      if (existingProduct) {
        return res.status(409).json({ 
          message: "Product with this barcode already exists" 
        });
      }

      // Analyze ingredients if provided
      if (productData.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            productData.ingredientsText,
            productData.productName || "Unknown Product"
          );
          productData.processingScore = analysis.score;
          productData.processingExplanation = analysis.explanation;
        } catch (error) {
          console.error("Failed to analyze ingredients:", error);
          productData.processingExplanation = "Unable to analyze ingredients at this time";
        }
      }

      // Set data source and timestamp
      const finalProductData = {
        ...productData,
        dataSource: 'Manual Entry',
        lastUpdated: new Date().toISOString()
      };

      const createdProduct = await storage.createProduct(finalProductData);
      res.status(201).json(createdProduct);

    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid product data",
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        message: "Failed to create product" 
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

  // Get search suggestions for failed barcode lookups
  app.get("/api/products/:barcode/suggestions", async (req, res) => {
    try {
      const { barcode } = barcodeSchema.parse({ barcode: req.params.barcode });

      const suggestions = await generateSearchSuggestions(barcode);
      
      res.json({
        barcode,
        suggestions,
        externalSearchLinks: [
          {
            name: "Google Search",
            url: `https://www.google.com/search?q=${barcode}+barcode+product`,
            description: "Search Google for this barcode"
          },
          {
            name: "OpenFoodFacts",
            url: `https://world.openfoodfacts.org/product/${barcode}`,
            description: "Check OpenFoodFacts database"
          },
          {
            name: "UPC Database",
            url: `https://www.upcitemdb.com/upc/${barcode}`,
            description: "Look up in UPC database"
          }
        ]
      });

    } catch (error) {
      console.error("Error generating search suggestions:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid barcode format",
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        message: "Failed to generate search suggestions" 
      });
    }
  });

  // Chatbot conversation endpoint
  app.post("/api/chatbot", async (req, res) => {
    try {
      const messageSchema = z.object({
        message: z.string().min(1, "Message cannot be empty").max(1000, "Message too long")
      });

      const { message } = messageSchema.parse(req.body);

      const botResponse = await getChatbotResponse(message);
      
      res.json({
        message: botResponse,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("Error in chatbot endpoint:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid message format",
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        message: "Sorry, I'm having trouble responding right now. Please try again!" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
