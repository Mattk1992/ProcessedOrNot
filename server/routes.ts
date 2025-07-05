import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { smartProductLookup, cascadingProductLookup } from "./lib/product-lookup";
import { analyzeIngredients, analyzeGlycemicIndex } from "./lib/openai";
import { getNutriBotResponse, generateProductNutritionInsight, generateFunFacts, generateNutritionSpotlightInsights } from "./lib/nutribot";
import { 
  insertProductSchema,
  registerUserSchema,
  loginUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterUser,
  type LoginUser,
  type ForgotPassword,
  type ResetPassword,
  type InsertSearchHistory
} from "@shared/schema";
import { generatePasswordResetToken, sendPasswordResetEmail, sendEmailVerification, sanitizeUser, generateSearchId } from "./lib/auth";
import session from "express-session";
import { z } from "zod";



const inputSchema = z.object({
  input: z.string().min(1, "Input cannot be empty"),
});

const barcodeSchema = z.object({
  barcode: z.string().min(1, "Input cannot be empty"),
});

// Configure session middleware
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    user?: any;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // User registration endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ 
          message: "Username already exists",
          field: "username"
        });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ 
          message: "Email already exists",
          field: "email"
        });
      }

      // Create new user
      const user = await storage.createUser(validatedData);
      
      // Send email verification
      if (user.emailVerificationToken) {
        await sendEmailVerification(user.email, user.emailVerificationToken);
      }

      // Start session
      req.session.userId = user.id;
      req.session.user = sanitizeUser(user);

      res.status(201).json({
        message: "Registration successful",
        user: sanitizeUser(user)
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // User login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      const user = await storage.verifyUserCredentials(validatedData.username, validatedData.password);
      if (!user) {
        return res.status(401).json({ 
          message: "Invalid username or password"
        });
      }

      // Start session
      req.session.userId = user.id;
      req.session.user = sanitizeUser(user);

      // Set session duration based on "Keep logged in" checkbox
      if (validatedData.keepLoggedIn) {
        // Keep logged in for 30 days
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
      } else {
        // Standard session duration (24 hours)
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
      }

      res.json({
        message: "Login successful",
        user: sanitizeUser(user)
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user endpoint
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }

      res.json({
        user: sanitizeUser(user)
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Forgot password endpoint
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        // Don't reveal if email exists for security
        return res.json({ 
          message: "If the email exists, a password reset link has been sent"
        });
      }

      const resetToken = generatePasswordResetToken();
      await storage.setPasswordResetToken(validatedData.email, resetToken);
      await sendPasswordResetEmail(validatedData.email, resetToken);

      res.json({ 
        message: "If the email exists, a password reset link has been sent"
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Password reset failed" });
    }
  });

  // Reset password endpoint
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      
      const success = await storage.resetPassword(validatedData.token, validatedData.password);
      if (!success) {
        return res.status(400).json({ 
          message: "Invalid or expired reset token"
        });
      }

      res.json({ 
        message: "Password reset successful"
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Password reset failed" });
    }
  });

  // Email verification endpoint
  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const token = req.query.token as string;
      if (!token) {
        return res.status(400).json({ message: "Verification token required" });
      }

      const success = await storage.verifyEmail(token);
      if (!success) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Email verification failed" });
    }
  });

  // Admin role management endpoints
  app.put("/api/admin/users/:id/role", requireAuth, async (req: any, res) => {
    try {
      // Check if current user is admin
      const currentUser = await storage.getUserById(req.session.userId!);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = parseInt(req.params.id);
      const { accountType } = req.body;

      if (!accountType || !['Admin', 'Regular'].includes(accountType)) {
        return res.status(400).json({ message: "Valid account type required (Admin or Regular)" });
      }

      const updatedUser = await storage.updateUserAccountType(userId, accountType);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        message: "User account type updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Role update error:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.get("/api/admin/users/account-type/:accountType", requireAuth, async (req: any, res) => {
    try {
      // Check if current user is admin
      const currentUser = await storage.getUserById(req.session.userId!);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const accountType = req.params.accountType;
      if (!['Admin', 'Regular'].includes(accountType)) {
        return res.status(400).json({ message: "Valid account type required (Admin or Regular)" });
      }

      const users = await storage.getUsersByAccountType(accountType);
      res.json({ users });
    } catch (error) {
      console.error("Get users by account type error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get all users (admin only)
  app.get("/api/admin/users", requireAuth, async (req: any, res) => {
    try {
      // Check if current user is admin
      const currentUser = await storage.getUserById(req.session.userId!);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const allUsers = await storage.getAllUsers();
      res.json({ users: allUsers });
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get admin statistics
  app.get("/api/admin/stats", requireAuth, async (req: any, res) => {
    try {
      // Check if current user is admin
      const currentUser = await storage.getUserById(req.session.userId!);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Search products with filters (for text searches)
  app.post("/api/products/search", async (req, res) => {
    try {
      const { query, filters } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query is required" });
      }

      // Check if we have cached product data
      const cachedProduct = await storage.getProductByBarcode(query);
      if (cachedProduct) {
        // Track search history for cached results
        const isBarcode = /^[0-9]{8,14}$/.test(query.trim());
        const searchInputType = isBarcode ? 'BarcodeInput' : 'TextInput';
        try {
          await storage.createSearchHistoryWithResult(query, searchInputType, cachedProduct, undefined, 'Cached');
        } catch (historyError) {
          console.warn("Failed to track search history for cached product:", historyError);
        }
        return res.json(cachedProduct);
      }

      // Use smart lookup system with filters
      const lookupResult = await smartProductLookup(query, filters);
      
      // Determine search input type
      const isBarcode = /^[0-9]{8,14}$/.test(query.trim());
      const searchInputType = isBarcode ? 'BarcodeInput' : 'TextInput';
      
      if (!lookupResult.product) {
        // Track failed search history
        try {
          await storage.createSearchHistoryWithResult(
            query, 
            searchInputType, 
            null, 
            lookupResult.error || "Product not found",
            lookupResult.source
          );
        } catch (historyError) {
          console.warn("Failed to track search history for failed lookup:", historyError);
        }
        
        return res.status(404).json({ 
          message: lookupResult.error || "Product not found",
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
      
      // Track successful search history with complete product data
      try {
        await storage.createSearchHistoryWithResult(
          query, 
          searchInputType, 
          savedProduct, 
          undefined,
          lookupResult.source
        );
      } catch (historyError) {
        console.warn("Failed to track search history for successful lookup:", historyError);
      }
      
      // Include source information in response
      res.json({
        ...savedProduct,
        lookupSource: lookupResult.source
      });

    } catch (error) {
      console.error("Search product error:", error);
      res.status(500).json({ 
        message: "Failed to search for product" 
      });
    }
  });

  // Get product by barcode
  app.get("/api/products/:barcode", async (req, res) => {
    try {
      const { barcode } = barcodeSchema.parse({ barcode: req.params.barcode });

      // Check if we have cached product data
      const cachedProduct = await storage.getProductByBarcode(barcode);
      if (cachedProduct) {
        // Track search history for cached results
        const isBarcode = /^[0-9]{8,14}$/.test(barcode.trim());
        const searchInputType = isBarcode ? 'BarcodeInput' : 'TextInput';
        try {
          await storage.createSearchHistoryWithResult(barcode, searchInputType, cachedProduct, undefined, 'Cached');
        } catch (historyError) {
          console.warn("Failed to track search history for cached product:", historyError);
        }
        return res.json(cachedProduct);
      }

      // Use smart lookup system (auto-detects barcode vs text)
      const lookupResult = await smartProductLookup(barcode);
      
      // Determine search input type
      const isBarcode = /^[0-9]{8,14}$/.test(barcode.trim());
      const searchInputType = isBarcode ? 'BarcodeInput' : 'TextInput';
      
      if (!lookupResult.product) {
        // Track failed search history
        try {
          await storage.createSearchHistoryWithResult(
            barcode, 
            searchInputType, 
            null, 
            lookupResult.error || "Product not found in any database",
            lookupResult.source
          );
        } catch (historyError) {
          console.warn("Failed to track search history for failed lookup:", historyError);
        }
        
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
      
      // Track successful search history with complete product data
      try {
        await storage.createSearchHistoryWithResult(
          barcode, 
          searchInputType, 
          savedProduct, 
          undefined,
          lookupResult.source
        );
      } catch (historyError) {
        console.warn("Failed to track search history for successful lookup:", historyError);
      }
      
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

        // Analyze glycemic index if we have nutrition data
        if (productData.nutriments) {
          try {
            const glycemicAnalysis = await analyzeGlycemicIndex(
              productData.ingredientsText,
              productData.productName || "Unknown Product",
              productData.nutriments,
              language || 'en'
            );
            productData.glycemicIndex = glycemicAnalysis.glycemicIndex;
            productData.glycemicLoad = glycemicAnalysis.glycemicLoad;
            productData.glycemicExplanation = glycemicAnalysis.explanation;
          } catch (error) {
            console.error("Failed to analyze glycemic index:", error);
            productData.glycemicExplanation = "Unable to analyze glycemic impact at this time";
          }
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

  // Get detailed glycemic index analysis
  app.get("/api/products/:barcode/glycemic", async (req, res) => {
    try {
      const barcode = decodeURIComponent(req.params.barcode);
      const { language } = req.query;

      const product = await storage.getProductByBarcode(barcode);
      if (!product || !product.ingredientsText) {
        return res.status(404).json({ 
          message: "Product or ingredients not found" 
        });
      }

      const glycemicAnalysis = await analyzeGlycemicIndex(
        product.ingredientsText,
        product.productName || "Unknown Product",
        product.nutriments,
        (language as string) || 'en'
      );

      res.json(glycemicAnalysis);

    } catch (error) {
      console.error("Error analyzing glycemic index:", error);
      res.status(500).json({ 
        message: "Failed to analyze glycemic index" 
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

  // Search History API Routes
  
  // Get all search history
  app.get("/api/search-history", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const searchHistory = await storage.getRecentSearchHistory(limit);
      res.json(searchHistory);
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({ 
        message: "Failed to fetch search history" 
      });
    }
  });

  // Get search history statistics (must come before the :searchId route)
  app.get("/api/search-history/stats", async (req, res) => {
    try {
      const allHistory = await storage.getAllSearchHistory();
      const barcodeSearches = allHistory.filter(record => record.searchInputType === 'BarcodeInput');
      const textSearches = allHistory.filter(record => record.searchInputType === 'TextInput');
      
      const stats = {
        totalSearches: allHistory.length,
        barcodeSearches: barcodeSearches.length,
        textSearches: textSearches.length,
        recentSearches: allHistory.slice(0, 10) // Last 10 searches
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching search history stats:", error);
      res.status(500).json({ 
        message: "Failed to fetch search history statistics" 
      });
    }
  });

  // Get search history by search ID
  app.get("/api/search-history/:searchId", async (req, res) => {
    try {
      const { searchId } = req.params;
      const searchRecord = await storage.getSearchHistoryBySearchId(searchId);
      
      if (!searchRecord) {
        return res.status(404).json({ 
          message: "Search record not found" 
        });
      }
      
      res.json(searchRecord);
    } catch (error) {
      console.error("Error fetching search record:", error);
      res.status(500).json({ 
        message: "Failed to fetch search record" 
      });
    }
  });

  // Re-analyze products missing glycemic index data
  app.post("/api/admin/reanalyze-products", requireAuth, async (req, res) => {
    try {
      // Check if user is admin
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUserById(req.session.userId);
      if (!user || user.accountType !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get products without glycemic index data but with nutrition data
      const products = await storage.getProductsWithoutGlycemicIndex();
      let analyzed = 0;
      let failed = 0;

      for (const product of products) {
        try {
          if (product.nutriments) {
            const glycemicAnalysis = await analyzeGlycemicIndex(
              product.ingredientsText || "",
              product.productName || "Unknown Product", 
              product.nutriments
            );
            
            await storage.updateProduct(product.barcode, {
              glycemicIndex: glycemicAnalysis.glycemicIndex,
              glycemicLoad: glycemicAnalysis.glycemicLoad,
              glycemicExplanation: glycemicAnalysis.explanation
            });
            analyzed++;
          }
        } catch (error) {
          console.error(`Failed to analyze glycemic index for ${product.barcode}:`, error);
          failed++;
        }
      }

      res.json({
        message: `Re-analysis complete: ${analyzed} products analyzed, ${failed} failed`,
        analyzed,
        failed,
        total: products.length
      });
    } catch (error) {
      console.error("Error re-analyzing products:", error);
      res.status(500).json({ message: "Failed to re-analyze products" });
    }
  });

  // Admin settings routes
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user || user.role !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const settings = await storage.getAllAdminSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      res.status(500).json({ message: "Failed to fetch admin settings" });
    }
  });

  // Admin search history routes
  app.get("/api/admin/search-history", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user || user.role !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const searchHistory = await storage.getAllSearchHistory();
      res.json(searchHistory);
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({ message: "Failed to fetch search history" });
    }
  });

  app.get("/api/admin/search-history/stats", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user || user.role !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const searchHistory = await storage.getAllSearchHistory();
      
      // Calculate statistics
      const totalSearches = searchHistory.length;
      const successfulSearches = searchHistory.filter(s => s.resultFound).length;
      const failedSearches = totalSearches - successfulSearches;
      const barcodeSearches = searchHistory.filter(s => s.searchInputType === 'BarcodeInput').length;
      const textSearches = searchHistory.filter(s => s.searchInputType === 'TextInput').length;
      
      // Calculate average processing score
      const scoresWithValues = searchHistory.filter(s => s.processingScore !== null && s.processingScore !== undefined);
      const averageProcessingScore = scoresWithValues.length > 0 
        ? scoresWithValues.reduce((sum, s) => sum + (s.processingScore || 0), 0) / scoresWithValues.length 
        : 0;

      // Most searched products (group by search input)
      const searchCounts: Record<string, number> = {};
      searchHistory.forEach(s => {
        const key = s.searchInput;
        searchCounts[key] = (searchCounts[key] || 0) + 1;
      });
      
      const mostSearchedProducts = Object.entries(searchCounts)
        .map(([searchInput, count]) => ({ searchInput, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      // Searches by date (last 30 days)
      const dateCounts: Record<string, number> = {};
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      
      searchHistory
        .filter(s => new Date(s.createdAt) >= last30Days)
        .forEach(s => {
          const date = new Date(s.createdAt).toISOString().split('T')[0];
          dateCounts[date] = (dateCounts[date] || 0) + 1;
        });
      
      const searchesByDate = Object.entries(dateCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Searches by data source
      const sourceCounts: Record<string, number> = {};
      searchHistory
        .filter(s => s.resultFound && s.dataSource)
        .forEach(s => {
          const source = s.dataSource || 'Unknown';
          sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });
      
      const searchesBySource = Object.entries(sourceCounts)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);

      const stats = {
        totalSearches,
        successfulSearches,
        failedSearches,
        barcodeSearches,
        textSearches,
        averageProcessingScore,
        mostSearchedProducts,
        searchesByDate,
        searchesBySource,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error calculating search history stats:", error);
      res.status(500).json({ message: "Failed to calculate search statistics" });
    }
  });

  app.delete("/api/admin/search-history/clear", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user || user.role !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.clearAllSearchHistory();
      res.json({ message: "Search history cleared successfully" });
    } catch (error) {
      console.error("Error clearing search history:", error);
      res.status(500).json({ message: "Failed to clear search history" });
    }
  });

  app.get("/api/admin/search-history/export", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user || user.role !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const searchHistory = await storage.getAllSearchHistory();
      
      // Create CSV content
      const headers = [
        'Search ID', 'Search Input', 'Search Type', 'Result Found', 'Product Name', 
        'Product Brands', 'Processing Score', 'Glycemic Index', 'Data Source', 
        'Lookup Source', 'Error Message', 'Created At'
      ];
      
      const csvRows = [
        headers.join(','),
        ...searchHistory.map(item => [
          item.searchId,
          `"${(item.searchInput || '').replace(/"/g, '""')}"`,
          item.searchInputType,
          item.resultFound,
          `"${(item.productName || '').replace(/"/g, '""')}"`,
          `"${(item.productBrands || '').replace(/"/g, '""')}"`,
          item.processingScore || '',
          item.glycemicIndex || '',
          `"${(item.dataSource || '').replace(/"/g, '""')}"`,
          `"${(item.lookupSource || '').replace(/"/g, '""')}"`,
          `"${(item.errorMessage || '').replace(/"/g, '""')}"`,
          item.createdAt
        ].join(','))
      ];
      
      const csvContent = csvRows.join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="search-history-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting search history:", error);
      res.status(500).json({ message: "Failed to export search history" });
    }
  });

  app.get("/api/admin/settings/:key", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user || user.role !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const setting = await storage.getAdminSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }

      res.json(setting);
    } catch (error) {
      console.error("Error fetching admin setting:", error);
      res.status(500).json({ message: "Failed to fetch admin setting" });
    }
  });

  app.post("/api/admin/settings", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user || user.role !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { settingKey, settingValue, settingType, description, category } = req.body;

      const newSetting = await storage.createAdminSetting({
        settingKey,
        settingValue,
        settingType,
        description,
        category
      });

      res.json(newSetting);
    } catch (error) {
      console.error("Error creating admin setting:", error);
      res.status(500).json({ message: "Failed to create admin setting" });
    }
  });

  app.put("/api/admin/settings/:key", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user || user.role !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { settingValue } = req.body;
      const updatedSetting = await storage.updateAdminSetting(req.params.key, settingValue);

      if (!updatedSetting) {
        return res.status(404).json({ message: "Setting not found" });
      }

      res.json(updatedSetting);
    } catch (error) {
      console.error("Error updating admin setting:", error);
      res.status(500).json({ message: "Failed to update admin setting" });
    }
  });

  app.delete("/api/admin/settings/:key", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user || user.role !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const success = await storage.deleteAdminSetting(req.params.key);
      if (!success) {
        return res.status(404).json({ message: "Setting not found" });
      }

      res.json({ message: "Setting deleted successfully" });
    } catch (error) {
      console.error("Error deleting admin setting:", error);
      res.status(500).json({ message: "Failed to delete admin setting" });
    }
  });

  // Initialize default settings
  app.post("/api/admin/settings/initialize", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user || user.role !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.initializeDefaultSettings();
      res.json({ message: "Default settings initialized successfully" });
    } catch (error) {
      console.error("Error initializing default settings:", error);
      res.status(500).json({ message: "Failed to initialize default settings" });
    }
  });

  // Public endpoint for camera timeout setting (no auth required)
  app.get("/api/settings/camera-timeout", async (req, res) => {
    try {
      const setting = await storage.getAdminSetting('camera_timeout');
      const timeoutValue = setting?.settingValue || '40'; // Default 40 seconds
      res.json({ 
        timeout: parseInt(timeoutValue),
        source: setting ? 'database' : 'default'
      });
    } catch (error) {
      console.error("Error fetching camera timeout:", error);
      res.json({ 
        timeout: 40,
        source: 'fallback'
      });
    }
  });

  // Public endpoint for tutorial overlay setting (no auth required)
  app.get("/api/settings/tutorial-overlay", async (req, res) => {
    try {
      const setting = await storage.getAdminSetting('tutorial_overlay_enabled');
      const enabled = setting?.settingValue === 'true';
      res.json({ 
        enabled,
        source: setting ? 'database' : 'default'
      });
    } catch (error) {
      console.error("Error fetching tutorial overlay setting:", error);
      res.json({ 
        enabled: false, // Default disabled
        source: 'fallback'
      });
    }
  });

  // Debug endpoint for glycemic index testing
  app.post("/api/debug/glycemic", async (req, res) => {
    try {
      const { ingredientsText, productName, nutriments } = req.body;
      
      if (!ingredientsText && !productName && !nutriments) {
        return res.status(400).json({ error: "Need at least one of: ingredientsText, productName, or nutriments" });
      }

      const glycemicAnalysis = await analyzeGlycemicIndex(
        ingredientsText || "",
        productName || "Test Product",
        nutriments || {}
      );

      res.json({
        success: true,
        analysis: glycemicAnalysis,
        input: { ingredientsText, productName, nutriments }
      });
    } catch (error) {
      console.error("Glycemic index debug error:", error);
      res.status(500).json({ 
        error: "Failed to analyze glycemic index", 
        details: (error as Error).message 
      });
    }
  });

  // Debug endpoint to fix glycemic analysis for existing products (no auth required for debugging)
  app.post("/api/debug/fix-glycemic", async (req, res) => {
    try {
      const products = await storage.getProductsWithoutGlycemicIndex();
      
      let analyzed = 0;
      let failed = 0;

      for (const product of products) {
        try {
          if (product.nutriments) {
            const glycemicAnalysis = await analyzeGlycemicIndex(
              product.ingredientsText || "",
              product.productName || "Unknown Product", 
              product.nutriments
            );
            
            await storage.updateProduct(product.barcode, {
              glycemicIndex: glycemicAnalysis.glycemicIndex,
              glycemicLoad: glycemicAnalysis.glycemicLoad,
              glycemicExplanation: glycemicAnalysis.explanation
            });
            analyzed++;
          }
        } catch (error) {
          console.error(`Failed to analyze glycemic index for ${product.barcode}:`, error);
          failed++;
        }
      }

      res.json({
        message: `Glycemic analysis complete: ${analyzed} products analyzed, ${failed} failed`,
        analyzed,
        failed,
        total: products.length
      });
    } catch (error) {
      console.error("Error fixing glycemic analysis:", error);
      res.status(500).json({ message: "Failed to fix glycemic analysis" });
    }
  });

  // User settings routes (requires authentication)
  app.get("/api/user/settings", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const settings = await storage.getUserSettings(user.id);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });

  app.get("/api/user/settings/:key", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const setting = await storage.getUserSetting(user.id, req.params.key);
      if (!setting) {
        // Return default value based on setting key
        let defaultValue = '';
        if (req.params.key === 'ai_provider') {
          const adminSetting = await storage.getAdminSetting('default_ai_provider');
          defaultValue = adminSetting?.settingValue || 'ChatGPT';
        }
        
        return res.json({ 
          settingKey: req.params.key,
          settingValue: defaultValue,
          isDefault: true
        });
      }

      res.json(setting);
    } catch (error) {
      console.error("Error fetching user setting:", error);
      res.status(500).json({ message: "Failed to fetch user setting" });
    }
  });

  app.post("/api/user/settings", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { settingKey, settingValue } = req.body;
      
      if (!settingKey || !settingValue) {
        return res.status(400).json({ message: "Setting key and value are required" });
      }

      const newSetting = await storage.upsertUserSetting(user.id, settingKey, settingValue);
      res.json(newSetting);
    } catch (error) {
      console.error("Error creating/updating user setting:", error);
      res.status(500).json({ message: "Failed to save user setting" });
    }
  });

  app.put("/api/user/settings/:key", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { settingValue } = req.body;
      const updatedSetting = await storage.upsertUserSetting(user.id, req.params.key, settingValue);

      res.json(updatedSetting);
    } catch (error) {
      console.error("Error updating user setting:", error);
      res.status(500).json({ message: "Failed to update user setting" });
    }
  });

  app.delete("/api/user/settings/:key", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const success = await storage.deleteUserSetting(user.id, req.params.key);
      if (!success) {
        return res.status(404).json({ message: "Setting not found" });
      }

      res.json({ message: "Setting deleted successfully" });
    } catch (error) {
      console.error("Error deleting user setting:", error);
      res.status(500).json({ message: "Failed to delete user setting" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
