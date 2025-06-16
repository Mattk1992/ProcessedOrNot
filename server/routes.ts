import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { smartProductLookup, cascadingProductLookup } from "./lib/product-lookup";
import { analyzeIngredients } from "./lib/openai";
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
  type ResetPassword
} from "@shared/schema";
import { generatePasswordResetToken, sendPasswordResetEmail, sendEmailVerification, sanitizeUser } from "./lib/auth";
import session from "express-session";
import { z } from "zod";

// Authentication middleware
interface AuthenticatedRequest extends Express.Request {
  session: session.Session & Partial<session.SessionData> & {
    userId?: number;
    user?: any;
  };
}

const isAuthenticated = (req: AuthenticatedRequest, res: Express.Response, next: Express.NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

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
      if (!currentUser || currentUser.role !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = parseInt(req.params.id);
      const { role } = req.body;

      if (!role || !['Admin', 'Regular'].includes(role)) {
        return res.status(400).json({ message: "Valid role required (Admin or Regular)" });
      }

      const updatedUser = await storage.updateUserRole(userId, role);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        message: "User role updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Role update error:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.get("/api/admin/users/role/:role", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      // Check if current user is admin
      const currentUser = await storage.getUserById(req.session.userId!);
      if (!currentUser || currentUser.role !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const role = req.params.role;
      if (!['Admin', 'Regular'].includes(role)) {
        return res.status(400).json({ message: "Valid role required (Admin or Regular)" });
      }

      const users = await storage.getUsersByRole(role);
      res.json({ users });
    } catch (error) {
      console.error("Get users by role error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

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
