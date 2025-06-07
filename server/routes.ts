import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cascadingProductLookup } from "./lib/product-lookup";
import { analyzeIngredients } from "./lib/openai";
import { generateNutriBotResponse } from "./lib/nutribot";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

const inputSchema = z.object({
  input: z.string().min(1, "Input cannot be empty"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get product by input (barcode or text)
  app.get("/api/products/:input", async (req, res) => {
    try {
      const { input } = inputSchema.parse({ input: req.params.input });

      // Check if we have cached product data (for barcode inputs)
      const cachedProduct = await storage.getProductByBarcode(input);
      if (cachedProduct) {
        return res.json(cachedProduct);
      }

      // Use input detection and lookup system
      const lookupResult = await cascadingProductLookup(input);
      
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
  app.get("/api/products/:input/analysis", async (req, res) => {
    try {
      const { input } = inputSchema.parse({ input: req.params.input });

      const product = await storage.getProductByBarcode(input);
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

  // Chat endpoint for NutriBot
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, messages } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ 
          message: "Message is required" 
        });
      }

      // Convert messages to the expected format
      const previousMessages = messages?.slice(-6) || [];
      
      const response = await generateNutriBotResponse(message, previousMessages);
      
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        message: "Failed to generate chat response" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
