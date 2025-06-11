import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { smartProductLookup, cascadingProductLookup } from "./lib/product-lookup";
import { analyzeIngredients } from "./lib/openai";
import { getNutriBotResponse, generateProductNutritionInsight, generateFunFacts, generateNutritionSpotlightInsights } from "./lib/nutribot";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

const inputSchema = z.object({
  input: z.string().min(1, "Input cannot be empty"),
});

const barcodeSchema = z.object({
  barcode: z.string().min(1, "Input cannot be empty"),
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

      // Use smart lookup system (auto-detects barcode vs text)
      const lookupResult = await smartProductLookup(barcode);
      
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
      const { language, ...productDataInput } = req.body;
      const productData = insertProductSchema.parse(productDataInput);

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
            productData.productName || "Unknown Product",
            language || 'en'
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
      const barcode = decodeURIComponent(req.params.barcode);
      const { language } = req.query;

      const product = await storage.getProductByBarcode(barcode);
      if (!product || !product.ingredientsText) {
        return res.status(404).json({ 
          message: "Product or ingredients not found" 
        });
      }

      const analysis = await analyzeIngredients(
        product.ingredientsText,
        product.productName || "Unknown Product",
        (language as string) || 'en'
      );

      res.json(analysis);

    } catch (error) {
      console.error("Error analyzing ingredients:", error);
      res.status(500).json({ 
        message: "Failed to analyze ingredients" 
      });
    }
  });

  // NutriBot Chat API
  app.post("/api/nutribot/chat", async (req, res) => {
    try {
      const { message, history, language } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ 
          message: "Invalid message format" 
        });
      }

      const response = await getNutriBotResponse(message.trim(), history || [], language || 'en');
      res.json({ response });

    } catch (error) {
      console.error("Error in NutriBot chat:", error);
      res.status(500).json({ 
        message: "Failed to get response from NutriBot" 
      });
    }
  });

  // Generate product nutrition insight
  app.get("/api/products/:barcode/nutribot-insight", async (req, res) => {
    try {
      const barcode = decodeURIComponent(req.params.barcode);
      const { language } = req.query;

      const product = await storage.getProductByBarcode(barcode);
      if (!product) {
        return res.status(404).json({ 
          message: "Product not found" 
        });
      }

      const insight = await generateProductNutritionInsight(
        product.productName || "Unknown Product",
        product.ingredientsText || "No ingredients available",
        product.processingScore || 0,
        (language as string) || 'en'
      );

      res.json({ insight });

    } catch (error) {
      console.error("Error generating product insight:", error);
      res.status(500).json({ 
        message: "Failed to generate product insight" 
      });
    }
  });

  // Generate fun facts
  app.get("/api/products/:barcode/fun-facts", async (req, res) => {
    try {
      const barcode = decodeURIComponent(req.params.barcode);
      const { language } = req.query;

      const product = await storage.getProductByBarcode(barcode);
      if (!product) {
        return res.status(404).json({ 
          message: "Product not found" 
        });
      }

      const facts = await generateFunFacts(
        product.productName || "Unknown Product",
        product.ingredientsText || "No ingredients available",
        product.nutriments || null,
        product.processingScore || 0,
        (language as string) || 'en'
      );

      res.json({ facts });

    } catch (error) {
      console.error("Error generating fun facts:", error);
      res.status(500).json({ 
        message: "Failed to generate fun facts" 
      });
    }
  });

  // Generate nutrition spotlight insights
  app.get("/api/products/:barcode/nutrition-spotlight", async (req, res) => {
    try {
      const barcode = decodeURIComponent(req.params.barcode);
      const { language } = req.query;

      const product = await storage.getProductByBarcode(barcode);
      if (!product || !product.nutriments) {
        return res.status(404).json({ 
          message: "Product or nutrition data not found" 
        });
      }

      // Generate AI-powered nutrition insights
      const insights = await generateNutritionSpotlightInsights(
        product.productName || "Unknown Product",
        product.nutriments,
        product.processingScore || 0,
        (language as string) || 'en'
      );

      res.json(insights);

    } catch (error) {
      console.error("Error generating nutrition spotlight:", error);
      res.status(500).json({ 
        message: "Failed to generate nutrition insights" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
