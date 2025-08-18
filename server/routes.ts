import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { transcribeAudio, isVoiceTranscriptionAvailable } from "./lib/voice-transcription";
import { smartProductLookup, cascadingProductLookup } from "./lib/product-lookup";
import { analyzeIngredients, analyzeGlycemicIndex, analyzeProductionProcess, getUserAIProvider } from "./lib/openai";
import { getNutriBotResponse, generateProductNutritionInsight, generateFunFacts, generateNutritionSpotlightInsights } from "./lib/nutribot";
import { AIScheduleGenerator } from "./lib/ai-schedule-generator";
import { 
  insertProductSchema,
  registerUserSchema,
  loginUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  insertDiaryEntrySchema,
  type RegisterUser,
  type LoginUser,
  type ForgotPassword,
  type ResetPassword,
  type InsertSearchHistory,
  type InsertDiaryEntry
} from "@shared/schema";
import { generatePasswordResetToken, sendPasswordResetEmail, sendEmailVerification, sanitizeUser, generateSearchId } from "./lib/auth";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./db";
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
    reward_count?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve ads.txt file for Google AdSense verification
  app.get('/ads.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.sendFile('ads.txt', { root: '.' });
  });

  // Initialize PostgreSQL session store
  const PgSession = pgSession(session);
  
  // Configure basic session middleware
  app.use(session({
    store: new PgSession({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'secure-session-key-change-in-production-2024',
    resave: false,
    saveUninitialized: false,
  }));

  // Helper functions for reward tracking (works for both logged-in and anonymous users)
  function incrementRewardCount(req: any): number {
    // Reward system disabled - do not increment counter
    return 0;
  }

  function resetRewardCount(req: any): void {
    // Ensure session exists
    if (!req.session) {
      req.session = {};
    }
    req.session.reward_count = 0;
    
    // Save session to database immediately
    req.session.save((err: any) => {
      if (err) {
        console.warn("Failed to save session for reward reset:", err);
      }
    });
  }

  function getRewardCount(req: any): number {
    // Reward system disabled - always return 0
    return 0;
  }

  // Configure multer for voice file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept audio files
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed'));
      }
    },
  });

  // Middleware to ensure session exists for anonymous users
  const ensureSession = (req: any, res: any, next: any) => {
    // This middleware ensures that anonymous users get a session for reward tracking
    if (!req.session) {
      req.session = {};
    }
    next();
  };

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Helper function to detect if a user's message would benefit from nutrition history context
  function isNutritionHistoryRelevant(message: string): boolean {
    const lowercaseMessage = message.toLowerCase();
    const historyKeywords = [
      'my nutrition', 'my diet', 'my eating', 'my food', 'what i ate', 'what i eat',
      'my meals', 'my intake', 'analyze my', 'track my', 'my progress', 'my habits',
      'my history', 'my diary', 'my consumption', 'my calories', 'my daily',
      'yesterday', 'last week', 'this week', 'recently', 'lately', 'past',
      'compare', 'trend', 'pattern', 'improvement', 'average', 'typical',
      'usually eat', 'normally eat', 'been eating', 'eating pattern',
      'how am i doing', 'am i eating well', 'my eating habits', 'my food choices',
      'recommend based on', 'suggest based on', 'considering my', 'given my',
      'nutrition summary', 'food log', 'meal log', 'eating log'
    ];
    
    return historyKeywords.some(keyword => lowercaseMessage.includes(keyword));
  }

  // Admin access middleware
  const requireAdmin = async (req: any, res: any, next: any) => {
    try {
      const user = (req.session as any).user;
      if (!user || user.accountType !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: "Authentication check failed" });
    }
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

      // Send notification to all Admin users about new registration
      try {
        const adminUsers = await storage.getUsersByAccountType('Admin');
        for (const admin of adminUsers) {
          await storage.createNotification({
            userId: admin.id,
            type: 'info',
            title: 'New User Registration',
            message: `A new user "${user.username}" (${user.firstName} ${user.lastName}) has registered on the platform.`,
            actionUrl: '/admin',
            actionText: 'View Admin Panel',
            isRead: false,
            isArchived: false,
            metadata: {
              newUserId: user.id,
              newUserUsername: user.username,
              newUserEmail: user.email,
              registrationDate: new Date().toISOString()
            }
          });
        }
        console.log(`Notifications sent to ${adminUsers.length} admin user(s) for new registration: ${user.username}`);
      } catch (notificationError) {
        console.error("Failed to send admin notifications for new user registration:", notificationError);
        // Don't fail the registration if notification fails
      }

      // Start session
      req.session.userId = user.id;
      req.session.user = sanitizeUser(user);

      // Force session save to ensure persistence
      req.session.save((err) => {
        if (err) {
          console.error("Session save error after registration:", err);
          return res.status(500).json({ message: "Registration session creation failed" });
        }
        
        console.log("Registration successful for user:", user.id, "Session saved:", req.session.id);
        res.status(201).json({
          message: "Registration successful",
          user: sanitizeUser(user),
          redirectTo: "/onboarding" // Direct new users to onboarding
        });
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
      console.log("Login attempt for username:", validatedData.username);
      
      const user = await storage.verifyUserCredentials(validatedData.username, validatedData.password);
      console.log("User verification result:", user ? `User ${user.id} found` : "User not found or invalid password");
      
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
        // Keep logged in indefinitely (10 years)
        req.session.cookie.maxAge = 10 * 365 * 24 * 60 * 60 * 1000;
      } else {
        // Standard session duration (24 hours)
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
      }

      // Force session save to ensure persistence
      req.session.save((err) => {
        if (err) {
          console.error("Session save error after login:", err);
          return res.status(500).json({ message: "Login session creation failed" });
        }
        
        console.log("Login successful for user:", user.id, "Session saved:", req.session.id);
        res.json({
          message: "Login successful",
          user: sanitizeUser(user)
        });
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

  // User logout endpoint with secure cleanup (POST)
  app.post("/api/auth/logout", (req, res) => {
    console.log("Logout request - Session ID:", req.session.id, "User ID:", req.session.userId);
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      // Session destroyed
      console.log("Logout successful - Session destroyed");
      res.json({ message: "Logout successful" });
    });
  });

  // User logout endpoint with secure cleanup (GET) - for browser redirects
  app.get("/api/logout", (req, res) => {
    console.log("Logout GET request - Session ID:", req.session.id, "User ID:", req.session.userId);
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error (GET):", err);
        return res.status(500).send("Logout failed");
      }
      // Session destroyed
      console.log("Logout GET successful - Session destroyed and redirecting to home");
      // Redirect to home page after logout
      res.redirect('/');
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
      
      // Update user's last login time to maintain session activity (throttled to once per 5 minutes)
      // Temporarily disabled to prevent errors
      // const now = new Date();
      // const lastUpdate = (req.session as any).lastLoginUpdate;
      // if (!lastUpdate || (Date.now() - new Date(lastUpdate).getTime()) > 5 * 60 * 1000) {
      //   await storage.updateUser(user.id, { lastLoginAt: new Date() });
      //   (req.session as any).lastLoginUpdate = Date.now();
      // }

      console.log("Auth check successful for user:", user.id);
      res.json({
        user: sanitizeUser(user)
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Update user profile endpoint
  app.put("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const { firstName, lastName, email } = req.body;
      const userId = req.session.userId;

      // Basic validation
      if (email && !email.includes('@')) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }

      // Update user data
      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      updateData.updatedAt = new Date();

      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        message: "Profile updated successfully",
        user: sanitizeUser(updatedUser)
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Update user account type endpoint
  app.put("/api/auth/account-type", requireAuth, async (req: any, res) => {
    try {
      const { accountType } = req.body;
      const userId = req.session.userId;

      // Validate account type
      if (!accountType || !['Admin', 'Regular', 'Paid'].includes(accountType)) {
        return res.status(400).json({ 
          message: "Valid account type required (Admin, Regular, or Paid)" 
        });
      }

      // Update user account type
      const updatedUser = await storage.updateUser(userId, { 
        accountType,
        updatedAt: new Date()
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update session user data
      req.session.user = sanitizeUser(updatedUser);

      res.json({
        message: "Account type updated successfully",
        user: sanitizeUser(updatedUser)
      });
    } catch (error) {
      console.error("Update account type error:", error);
      res.status(500).json({ message: "Failed to update account type" });
    }
  });

  // Session debug endpoint (development only)
  if (process.env.NODE_ENV === 'development') {
    app.get("/api/debug/session", (req, res) => {
      res.json({
        sessionId: req.session.id,
        userId: req.session.userId,
        user: req.session.user ? sanitizeUser(req.session.user) : null,
        cookie: req.session.cookie,
        rewardCount: req.session.reward_count || 0
      });
    });
  }

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

  // Admin Product Management endpoints
  app.get("/api/admin/products", requireAuth, async (req: any, res) => {
    try {
      // Check if current user is admin
      const currentUser = await storage.getUserById(req.session.userId!);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;
      const search = req.query.search as string;

      let products;
      if (search && search.trim()) {
        products = await storage.searchProducts(search.trim(), limit);
      } else {
        products = await storage.getAllProducts(limit, offset);
      }

      const totalCount = await storage.getProductCount();
      
      res.json({
        products,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error("Get admin products error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/admin/products/:barcode", requireAuth, async (req: any, res) => {
    try {
      // Check if current user is admin
      const currentUser = await storage.getUserById(req.session.userId!);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const barcode = req.params.barcode;
      const product = await storage.getProductByBarcode(barcode);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ product });
    } catch (error) {
      console.error("Get admin product error:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.put("/api/admin/products/:barcode", requireAuth, async (req: any, res) => {
    try {
      // Check if current user is admin
      const currentUser = await storage.getUserById(req.session.userId!);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const barcode = req.params.barcode;
      const updates = req.body;

      // Validate the updates using insertProductSchema (partial)
      const partialSchema = insertProductSchema.partial();
      const validatedUpdates = partialSchema.parse(updates);

      const updatedProduct = await storage.updateProduct(barcode, validatedUpdates);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ 
        message: "Product updated successfully",
        product: updatedProduct 
      });
    } catch (error) {
      console.error("Update admin product error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:barcode", requireAuth, async (req: any, res) => {
    try {
      // Check if current user is admin
      const currentUser = await storage.getUserById(req.session.userId!);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const barcode = req.params.barcode;
      const deleted = await storage.deleteProduct(barcode);
      
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Delete admin product error:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.post("/api/admin/products", requireAuth, async (req: any, res) => {
    try {
      // Check if current user is admin
      const currentUser = await storage.getUserById(req.session.userId!);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Validate the product data
      const validatedProduct = insertProductSchema.parse(req.body);

      const newProduct = await storage.createProduct(validatedProduct);
      
      res.status(201).json({ 
        message: "Product created successfully",
        product: newProduct 
      });
    } catch (error) {
      console.error("Create admin product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Search products with filters (for text searches)
  app.post("/api/products/search", ensureSession, async (req: any, res) => {
    try {
      const { query, filters } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query is required" });
      }

      // Reward system is disabled - no longer blocking searches

      // Check if we have cached product data
      const cachedProduct = await storage.getProductByBarcode(query);
      if (cachedProduct) {
        // Track search history for cached results
        const isBarcode = /^[0-9]{8,14}$/.test(query.trim());
        const searchInputType = isBarcode ? 'BarcodeInput' : 'TextInput';
        try {
          await storage.createSearchHistoryWithResult(query, searchInputType, cachedProduct, undefined, 'Cached', req.session.userId);
        } catch (historyError) {
          console.warn("Failed to track search history for cached product:", historyError);
        }
        return res.json(cachedProduct);
      }

      // Use smart lookup system with filters
      const user = (req.session as any).user;
      const lookupResult = await smartProductLookup(query, filters, user?.id);
      
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
            lookupResult.source,
            req.session.userId
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
          lookupResult.source,
          req.session.userId
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
  app.get("/api/products/:barcode", ensureSession, async (req: any, res) => {
    try {
      const { barcode } = barcodeSchema.parse({ barcode: req.params.barcode });

      // Reward system is disabled - no longer blocking scans

      // Check if we have cached product data
      const cachedProduct = await storage.getProductByBarcode(barcode);
      if (cachedProduct) {
        // Track search history for cached results
        const isBarcode = /^[0-9]{8,14}$/.test(barcode.trim());
        const searchInputType = isBarcode ? 'BarcodeInput' : 'TextInput';
        try {
          await storage.createSearchHistoryWithResult(barcode, searchInputType, cachedProduct, undefined, 'Cached', req.session.userId);
        } catch (historyError) {
          console.warn("Failed to track search history for cached product:", historyError);
        }
        return res.json(cachedProduct);
      }

      // Use smart lookup system (auto-detects barcode vs text)
      const user = (req.session as any).user;
      const lookupResult = await smartProductLookup(barcode, undefined, user?.id);
      
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
            lookupResult.source,
            req.session.userId
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
          lookupResult.source,
          req.session.userId
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

      // Get user's AI provider setting
      const user = (req.session as any).user;
      const userAIProvider = await getUserAIProvider(user?.id);

      // Analyze ingredients if provided
      if (productData.ingredientsText) {
        try {
          const analysis = await analyzeIngredients(
            productData.ingredientsText,
            productData.productName || "Unknown Product",
            language || 'en',
            userAIProvider
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
              language || 'en',
              userAIProvider
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

      // Automatically save processing analysis and ingredient categories to products database
      try {
        const insightsToSave: any = {};
        if (analysis.explanation) {
          insightsToSave.processingAnalysis = analysis.explanation;
        }
        if (analysis.categories) {
          insightsToSave.ingredientCategories = JSON.stringify(analysis.categories);
        }
        
        if (Object.keys(insightsToSave).length > 0) {
          await storage.updateProductWithAIInsights(barcode, insightsToSave);
          console.log(`Processing analysis saved to product database for barcode: ${barcode}`);
        }
      } catch (saveError) {
        console.warn("Failed to save processing analysis to product database:", saveError);
        // Continue without failing the request
      }

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

      // Automatically save glycemic impact to products database
      try {
        const glycemicInsight = {
          glycemicIndex: glycemicAnalysis.glycemicIndex,
          glycemicLoad: glycemicAnalysis.glycemicLoad,
          explanation: glycemicAnalysis.explanation,
          category: glycemicAnalysis.category,
          impactDescription: glycemicAnalysis.impactDescription
        };
        await storage.updateProductWithAIInsights(barcode, { glycemicImpact: JSON.stringify(glycemicInsight) });
        console.log(`Glycemic impact saved to product database for barcode: ${barcode}`);
      } catch (saveError) {
        console.warn("Failed to save glycemic impact to product database:", saveError);
        // Continue without failing the request
      }

      res.json(glycemicAnalysis);

    } catch (error) {
      console.error("Error analyzing glycemic index:", error);
      res.status(500).json({ 
        message: "Failed to analyze glycemic index" 
      });
    }
  });

  // NutriBot Chat API
  app.post("/api/nutribot/chat", async (req: any, res) => {
    try {
      const { message, history, language } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ 
          message: "Invalid message format" 
        });
      }

      let extraInfo = '';
      
      // If user is authenticated, fetch their profile data for personalization
      if (req.session?.userId) {
        try {
          const userId = req.session.userId;
          
          // Check if the user's message indicates they need nutrition history context
          const needsNutritionHistory = isNutritionHistoryRelevant(message);
          
          const dataPromises = [
            storage.getUserGoals(userId),
            storage.getUserProfile(userId),
            storage.getUserOnboarding(userId)
          ];
          
          // Add nutrition diary fetch if relevant
          if (needsNutritionHistory) {
            dataPromises.push(storage.getDiaryEntries(userId, undefined, 15));
          }
          
          const [userGoals, userProfile, userOnboarding, nutritionDiary] = await Promise.all(dataPromises);
          
          // Build extra info string from user data (excluding name, username, email, password)
          const infoItems = [];
          
          // Add nutrition diary history if relevant and available
          if (needsNutritionHistory && nutritionDiary && nutritionDiary.length > 0) {
            const recentEntries = nutritionDiary.slice(0, 10); // Last 10 entries for context
            const diaryInfo = recentEntries.map(entry => {
              const serving = entry.servingSize || 1;
              return `${entry.date}: ${entry.productName} (${serving} serving${serving !== 1 ? 's' : ''}) - ${Math.round((entry.calories || 0) * serving)}cal, ${Math.round((entry.fat || 0) * serving)}g fat, ${Math.round((entry.carbohydrates || 0) * serving)}g carbs, ${Math.round((entry.proteins || 0) * serving)}g protein${entry.processingScore ? `, processing: ${entry.processingScore}/10` : ''}`;
            }).join('\n');
            infoItems.push(`RECENT NUTRITION DIARY:\n${diaryInfo}`);
          }
          
          if (userGoals) {
            infoItems.push(`Health Goals: Daily calories ${userGoals.dailyCalories}, fat ${userGoals.dailyFat}g, carbs ${userGoals.dailyCarbs}g, proteins ${userGoals.dailyProteins}g, salt ${userGoals.dailySalt}g, fiber ${userGoals.dailyFiber}g`);
            infoItems.push(`Activity Level: ${userGoals.activityLevel}`);
            infoItems.push(`Weight Goal: ${userGoals.weightGoal}`);
            if (userGoals.dietaryRestrictions?.length) {
              infoItems.push(`Dietary Restrictions: ${userGoals.dietaryRestrictions.join(', ')}`);
            }
            if (userGoals.healthConditions?.length) {
              infoItems.push(`Health Conditions: ${userGoals.healthConditions.join(', ')}`);
            }
          }
          
          if (userProfile) {
            if (userProfile.gender) infoItems.push(`Gender: ${userProfile.gender}`);
            if (userProfile.height) infoItems.push(`Height: ${userProfile.height}cm`);
            if (userProfile.weight) infoItems.push(`Weight: ${userProfile.weight}kg`);
            if (userProfile.units) infoItems.push(`Preferred Units: ${userProfile.units}`);
          }
          
          if (userOnboarding) {
            if (userOnboarding.age) infoItems.push(`Age: ${userOnboarding.age}`);
            if (userOnboarding.medicalConditions?.length) {
              infoItems.push(`Medical Conditions: ${userOnboarding.medicalConditions.join(', ')}`);
            }
            if (userOnboarding.allergies?.length) {
              infoItems.push(`Allergies: ${userOnboarding.allergies.join(', ')}`);
            }
            if (userOnboarding.dietaryRestrictions?.length) {
              infoItems.push(`Dietary Restrictions: ${userOnboarding.dietaryRestrictions.join(', ')}`);
            }
            if (userOnboarding.activityLevel) infoItems.push(`Activity Level: ${userOnboarding.activityLevel}`);
            if (userOnboarding.healthGoals?.length) {
              infoItems.push(`Health Goals: ${userOnboarding.healthGoals.join(', ')}`);
            }
            if (userOnboarding.cookingSkill) infoItems.push(`Cooking Skill: ${userOnboarding.cookingSkill}`);
            if (userOnboarding.weightGoals) infoItems.push(`Weight Goals: ${userOnboarding.weightGoals}`);
            if (userOnboarding.exerciseTypes?.length) {
              infoItems.push(`Exercise Types: ${userOnboarding.exerciseTypes.join(', ')}`);
            }
            if (userOnboarding.foodPreferences?.length) {
              infoItems.push(`Food Preferences: ${userOnboarding.foodPreferences.join(', ')}`);
            }
            if (userOnboarding.foodDislikes?.length) {
              infoItems.push(`Food Dislikes: ${userOnboarding.foodDislikes.join(', ')}`);
            }
          }
          
          extraInfo = infoItems.join('\n');
        } catch (error) {
          console.log('Could not fetch user profile data for NutriBot personalization:', error);
          // Continue without personalization
        }
      }

      const response = await getNutriBotResponse(message.trim(), history || [], language || 'en', extraInfo);
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

      // Automatically save NutriBot insight to products database
      try {
        await storage.updateProductWithAIInsights(barcode, { nutriBotInsight: JSON.stringify(insight) });
        console.log(`NutriBot insight saved to product database for barcode: ${barcode}`);
      } catch (saveError) {
        console.warn("Failed to save NutriBot insight to product database:", saveError);
        // Continue without failing the request
      }

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

      // Automatically save fun facts to products database
      try {
        await storage.updateProductWithAIInsights(barcode, { funFacts: JSON.stringify(facts) });
        console.log(`Fun facts saved to product database for barcode: ${barcode}`);
      } catch (saveError) {
        console.warn("Failed to save fun facts to product database:", saveError);
        // Continue without failing the request
      }

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

      // Automatically save nutrition spotlight to products database
      try {
        await storage.updateProductWithAIInsights(barcode, { nutritionSpotlight: JSON.stringify(insights) });
        console.log(`Nutrition spotlight saved to product database for barcode: ${barcode}`);
      } catch (saveError) {
        console.warn("Failed to save nutrition spotlight to product database:", saveError);
        // Continue without failing the request
      }

      res.json(insights);

    } catch (error) {
      console.error("Error generating nutrition spotlight:", error);
      res.status(500).json({ 
        message: "Failed to generate nutrition insights" 
      });
    }
  });

  // Generate production process analysis
  app.get("/api/products/:barcode/production-process", async (req, res) => {
    try {
      const barcode = decodeURIComponent(req.params.barcode);
      const { language } = req.query;

      const product = await storage.getProductByBarcode(barcode);
      if (!product || !product.ingredientsText) {
        return res.status(404).json({ 
          message: "Product or ingredients not found" 
        });
      }

      // Get user's AI provider setting
      const user = (req.session as any).user;
      const userAIProvider = await getUserAIProvider(user?.id);

      const processAnalysis = await analyzeProductionProcess(
        product.ingredientsText,
        product.productName || "Unknown Product",
        product.nutriments || {},
        (language as string) || 'en',
        userAIProvider
      );

      // Automatically save production process to products database
      try {
        await storage.updateProductWithAIInsights(barcode, { productionProcess: processAnalysis });
        console.log(`Production process saved to product database for barcode: ${barcode}`);
      } catch (saveError) {
        console.warn("Failed to save production process to product database:", saveError);
        // Continue without failing the request
      }

      res.json({ process: processAnalysis });

    } catch (error) {
      console.error("Error generating production process analysis:", error);
      res.status(500).json({ 
        message: "Failed to generate production process analysis" 
      });
    }
  });

  // Search History API Routes
  
  // Get search history for authenticated user
  app.get("/api/search-history", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const searchHistory = await storage.getUserSearchHistory(userId, limit);
      res.json(searchHistory);
    } catch (error) {
      console.error("Error fetching user search history:", error);
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

  // Get search history by database ID
  app.get("/api/search-history/by-id/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const historyId = parseInt(req.params.id);
      if (isNaN(historyId)) {
        return res.status(400).json({ message: "Invalid history ID" });
      }

      const searchRecord = await storage.getSearchHistoryById(historyId, userId);
      
      if (!searchRecord) {
        return res.status(404).json({ 
          message: "Search record not found" 
        });
      }
      
      res.json(searchRecord);
    } catch (error) {
      console.error("Error fetching search record by ID:", error);
      res.status(500).json({ 
        message: "Failed to fetch search record" 
      });
    }
  });

  // Update search history with AI insights by barcode
  app.put("/api/search-history/:barcode/ai-insights", async (req, res) => {
    try {
      const { barcode } = req.params;
      const insights = req.body;

      // Validate insights data structure
      const validInsightKeys = [
        'nutriBotInsight', 'funFacts', 'nutritionSpotlight', 'ingredientsList',
        'glycemicImpact', 'nutritionFact', 'processingAnalysis', 'ingredientCategories'
      ];

      const filteredInsights: any = {};
      for (const [key, value] of Object.entries(insights)) {
        if (validInsightKeys.includes(key) && value !== null && value !== undefined) {
          filteredInsights[key] = value;
        }
      }

      if (Object.keys(filteredInsights).length === 0) {
        return res.status(400).json({ error: "No valid insights provided" });
      }

      const updated = await storage.updateSearchHistoryWithAIInsights(barcode, filteredInsights);
      
      if (!updated) {
        return res.status(404).json({ error: "Search history record not found for barcode" });
      }

      res.json({ 
        success: true, 
        message: "AI insights saved to search history",
        barcode,
        updatedFields: Object.keys(filteredInsights)
      });
    } catch (error) {
      console.error("Error saving AI insights to search history:", error);
      res.status(500).json({ error: "Failed to save AI insights to search history" });
    }
  });

  // Update search history with AI insights
  app.post("/api/search-history/:searchId/ai-insights", async (req, res) => {
    try {
      const { searchId } = req.params;
      const insights = req.body;

      // Validate insights data structure
      const validInsightKeys = [
        'nutriBotInsight', 'funFacts', 'nutritionSpotlight', 'ingredientsList',
        'glycemicImpact', 'nutritionFact', 'processingAnalysis', 'ingredientCategories'
      ];

      const filteredInsights: any = {};
      for (const [key, value] of Object.entries(insights)) {
        if (validInsightKeys.includes(key) && value !== null && value !== undefined) {
          filteredInsights[key] = value;
        }
      }

      if (Object.keys(filteredInsights).length === 0) {
        return res.status(400).json({ error: "No valid insights provided" });
      }

      const updatedRecord = await storage.updateSearchHistoryWithAIInsights(searchId, filteredInsights);
      
      if (!updatedRecord) {
        return res.status(404).json({ error: "Search history record not found" });
      }

      res.json({ 
        success: true, 
        message: "AI insights saved successfully",
        searchId,
        updatedFields: Object.keys(filteredInsights)
      });
    } catch (error) {
      console.error("Error saving AI insights:", error);
      res.status(500).json({ error: "Failed to save AI insights" });
    }
  });

  // Update product with AI insights
  app.post("/api/products/:barcode/ai-insights", async (req, res) => {
    try {
      const { barcode } = req.params;
      const insights = req.body;

      // Validate insights data structure
      const validInsightKeys = [
        'nutriBotInsight', 'funFacts', 'nutritionSpotlight', 'ingredientsList',
        'glycemicImpact', 'nutritionFact', 'processingAnalysis', 'ingredientCategories'
      ];

      const filteredInsights: any = {};
      for (const [key, value] of Object.entries(insights)) {
        if (validInsightKeys.includes(key) && value !== null && value !== undefined) {
          filteredInsights[key] = value;
        }
      }

      if (Object.keys(filteredInsights).length === 0) {
        return res.status(400).json({ error: "No valid insights provided" });
      }

      const updatedProduct = await storage.updateProductWithAIInsights(barcode, filteredInsights);
      
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json({ 
        success: true, 
        message: "AI insights saved to product successfully",
        barcode,
        updatedFields: Object.keys(filteredInsights),
        product: updatedProduct
      });
    } catch (error) {
      console.error("Error saving AI insights to product:", error);
      res.status(500).json({ error: "Failed to save AI insights to product" });
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
      if (!user || user.accountType !== 'Admin') {
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
      if (!user || user.accountType !== 'Admin') {
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
      if (!user || user.accountType !== 'Admin') {
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
      if (!user || user.accountType !== 'Admin') {
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
      if (!user || user.accountType !== 'Admin') {
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
      if (!user || user.accountType !== 'Admin') {
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
      if (!user || user.accountType !== 'Admin') {
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
      if (!user || user.accountType !== 'Admin') {
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
      if (!user || user.accountType !== 'Admin') {
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
      if (!user || user.accountType !== 'Admin') {
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

  // Public endpoint for Google Ads setting (no auth required)
  app.get("/api/settings/google-ads-enabled", async (req, res) => {
    try {
      const setting = await storage.getAdminSetting('google_ads_enabled');
      const enabled = setting?.settingValue === 'true';
      res.json({ 
        enabled,
        source: setting ? 'database' : 'default'
      });
    } catch (error) {
      console.error("Error fetching Google Ads setting:", error);
      res.json({ 
        enabled: false, // Default disabled
        source: 'fallback'
      });
    }
  });

  // Admin endpoint to get rewarding system settings
  app.get("/api/admin/rewarding-system", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const user = await storage.getUserById(req.session.userId);
      if (!user || user.accountType !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const settings = await storage.getRewardingSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching rewarding system settings:", error);
      res.status(500).json({ error: "Failed to fetch rewarding system settings" });
    }
  });

  // Admin endpoint to update rewarding system settings
  app.put("/api/admin/rewarding-system", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const user = await storage.getUserById(req.session.userId);
      if (!user || user.accountType !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const updates = req.body;
      const settings = await storage.updateRewardingSystemSettings(updates);
      res.json(settings);
    } catch (error) {
      console.error("Error updating rewarding system settings:", error);
      res.status(500).json({ error: "Failed to update rewarding system settings" });
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

  // Notification API routes (requires authentication)
  app.get("/api/notifications", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const notifications = await storage.getNotificationsByUser(user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const count = await storage.getUnreadNotificationCount(user.id);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      res.status(500).json({ message: "Failed to fetch unread notification count" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { type, title, message, actionUrl, actionText, metadata } = req.body;
      
      if (!type || !title || !message) {
        return res.status(400).json({ message: "Type, title, and message are required" });
      }

      const notification = await storage.createNotification({
        userId: user.id,
        type,
        title,
        message,
        actionUrl,
        actionText,
        metadata,
        isRead: false,
        isArchived: false
      });

      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const notificationId = parseInt(req.params.id);
      const notification = await storage.getNotificationById(notificationId);

      if (!notification || notification.userId !== user.id) {
        return res.status(404).json({ message: "Notification not found" });
      }

      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      res.json(updatedNotification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put("/api/notifications/mark-all-read", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      await storage.markAllNotificationsAsRead(user.id);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.put("/api/notifications/:id/archive", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const notificationId = parseInt(req.params.id);
      const notification = await storage.getNotificationById(notificationId);

      if (!notification || notification.userId !== user.id) {
        return res.status(404).json({ message: "Notification not found" });
      }

      const updatedNotification = await storage.archiveNotification(notificationId);
      res.json(updatedNotification);
    } catch (error) {
      console.error("Error archiving notification:", error);
      res.status(500).json({ message: "Failed to archive notification" });
    }
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const notificationId = parseInt(req.params.id);
      const notification = await storage.getNotificationById(notificationId);

      if (!notification || notification.userId !== user.id) {
        return res.status(404).json({ message: "Notification not found" });
      }

      const success = await storage.deleteNotification(notificationId);
      if (!success) {
        return res.status(404).json({ message: "Failed to delete notification" });
      }

      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Blog API routes
  app.get("/api/blog", async (req, res) => {
    try {
      const blogPosts = await storage.getPublishedBlogPosts();
      res.json(blogPosts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const blogPost = await storage.getBlogPostById(id);
      
      if (!blogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      // Increment view count
      await storage.incrementViewCount(id);
      
      res.json(blogPost);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.get("/api/blog/slug/:slug", async (req, res) => {
    try {
      const blogPost = await storage.getBlogPostBySlug(req.params.slug);
      
      if (!blogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      // Increment view count
      await storage.incrementViewCount(blogPost.id);
      
      res.json(blogPost);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { title, content, author, tags, excerpt, slug, isPublished } = req.body;
      
      if (!title || !content || !author) {
        return res.status(400).json({ message: "Title, content, and author are required" });
      }

      // Parse tags if provided as string
      const parsedTags = typeof tags === 'string' ? 
        tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : 
        (Array.isArray(tags) ? tags : []);

      const blogPost = await storage.createBlogPost({
        title,
        content,
        author,
        tags: parsedTags,
        excerpt,
        slug,
        isPublished: isPublished !== false, // Default to true
        authorId: user.id,
      });

      res.status(201).json(blogPost);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.put("/api/blog/:id", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const id = parseInt(req.params.id);
      const existingPost = await storage.getBlogPostById(id);
      
      if (!existingPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      // Check if user is the author or admin
      if (existingPost.authorId !== user.id && user.accountType !== 'Admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { title, content, author, tags, excerpt, slug, isPublished } = req.body;
      
      // Parse tags if provided as string
      const parsedTags = typeof tags === 'string' ? 
        tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : 
        (Array.isArray(tags) ? tags : undefined);

      const updatedPost = await storage.updateBlogPost(id, {
        title,
        content,
        author,
        tags: parsedTags,
        excerpt,
        slug,
        isPublished,
      });

      if (!updatedPost) {
        return res.status(404).json({ message: "Failed to update blog post" });
      }

      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/blog/:id", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const id = parseInt(req.params.id);
      const existingPost = await storage.getBlogPostById(id);
      
      if (!existingPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      // Check if user is the author or admin
      if (existingPost.authorId !== user.id && user.accountType !== 'Admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const success = await storage.deleteBlogPost(id);
      
      if (!success) {
        return res.status(404).json({ message: "Failed to delete blog post" });
      }

      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  app.get("/api/blog/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const blogPosts = await storage.searchBlogPosts(query);
      res.json(blogPosts);
    } catch (error) {
      console.error("Error searching blog posts:", error);
      res.status(500).json({ message: "Failed to search blog posts" });
    }
  });

  app.get("/api/blog/tag/:tag", async (req, res) => {
    try {
      const tag = req.params.tag;
      const blogPosts = await storage.getBlogPostsByTag(tag);
      res.json(blogPosts);
    } catch (error) {
      console.error("Error fetching blog posts by tag:", error);
      res.status(500).json({ message: "Failed to fetch blog posts by tag" });
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

  // Voice transcription endpoint
  app.post("/api/voice/transcribe", upload.single('audio'), async (req, res) => {
    try {
      const available = await isVoiceTranscriptionAvailable();
      if (!available) {
        return res.status(503).json({ 
          message: "Voice transcription service is not available",
          error: "Speech-to-Text service disabled or ASSEMBLYAI_API_KEY not configured"
        });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      // Transcribe the audio using Assembly AI
      const transcript = await transcribeAudio(req.file.buffer);
      
      res.json({ 
        transcript,
        success: true,
        message: "Audio transcribed successfully"
      });

    } catch (error) {
      console.error("Voice transcription error:", error);
      res.status(500).json({ 
        message: "Failed to transcribe audio",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Voice availability check endpoint
  app.get("/api/voice/status", (req, res) => {
    res.json({
      available: isVoiceTranscriptionAvailable(),
      message: isVoiceTranscriptionAvailable() 
        ? "Voice transcription is available"
        : "Voice transcription requires ASSEMBLYAI_API_KEY configuration"
    });
  });

  // Reward system endpoints
  // Get current reward count
  app.get("/api/rewards/count", ensureSession, (req: any, res) => {
    // Reward system disabled
    res.json({ 
      rewardCount: 0,
      maxCount: 6,
      needsReward: false 
    });
  });

  // Reset reward count when reward URL is visited
  app.post("/api/rewards/reset", ensureSession, (req: any, res) => {
    const { rewardParam } = req.body;
    
    // Verify the reward parameter matches expected value
    if (rewardParam === "product-search") {
      resetRewardCount(req);
      res.json({ 
        message: "Reward count reset successfully",
        newCount: 0
      });
    } else {
      res.status(400).json({ 
        message: "Invalid reward parameter" 
      });
    }
  });

  // Check if reward is needed (for frontend to check without incrementing)
  app.get("/api/rewards/status", ensureSession, (req: any, res) => {
    // Reward system is disabled - always return no reward needed
    res.json({
      currentCount: 0,
      maxCount: 6,
      needsReward: false,
      rewardUrl: null
    });
  });

  // ===== NUTRITION TRACKING API ROUTES =====

  // Diary entries
  app.get("/api/nutrition/diary", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { date } = req.query;
      const userId = req.session.userId;

      if (date) {
        const entries = await storage.getDiaryEntriesByUserAndDate(userId, date as string);
        res.json(entries);
      } else {
        const entries = await storage.getDiaryEntriesByUser(userId);
        res.json(entries);
      }
    } catch (error) {
      console.error("Error fetching diary entries:", error);
      res.status(500).json({ message: "Failed to fetch diary entries" });
    }
  });

  app.post("/api/nutrition/diary", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const userId = req.session.userId;
      const entry = { ...req.body, userId };
      
      const created = await storage.createDiaryEntry(entry);
      res.status(201).json(created);
    } catch (error) {
      console.error("Error creating diary entry:", error);
      res.status(500).json({ message: "Failed to create diary entry" });
    }
  });

  app.put("/api/nutrition/diary/:id", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateDiaryEntry(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating diary entry:", error);
      res.status(500).json({ message: "Failed to update diary entry" });
    }
  });

  app.delete("/api/nutrition/diary/:id", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDiaryEntry(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting diary entry:", error);
      res.status(500).json({ message: "Failed to delete diary entry" });
    }
  });

  // User goals
  app.get("/api/nutrition/goals", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const userId = req.session.userId;
      const goals = await storage.getUserGoals(userId);
      
      if (!goals) {
        // Return default goals if none exist
        return res.json({
          dailyCalories: 2000,
          dailyFat: 65,
          dailyCarbs: 300,
          dailyProteins: 50,
          dailySalt: 6,
          dailyFiber: 25,
          maxProcessingScore: 5,
          activityLevel: 'moderate',
          weightGoal: 'maintain'
        });
      }
      
      res.json(goals);
    } catch (error) {
      console.error("Error fetching user goals:", error);
      res.status(500).json({ message: "Failed to fetch user goals" });
    }
  });

  app.post("/api/nutrition/goals", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const userId = req.session.userId;
      const goals = { ...req.body, userId };
      
      const created = await storage.createUserGoals(goals);
      res.status(201).json(created);
    } catch (error) {
      console.error("Error creating user goals:", error);
      res.status(500).json({ message: "Failed to create user goals" });
    }
  });

  app.put("/api/nutrition/goals", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const userId = req.session.userId;
      const updated = await storage.updateUserGoals(userId, req.body);
      
      if (!updated) {
        return res.status(404).json({ message: "Goals not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating user goals:", error);
      res.status(500).json({ message: "Failed to update user goals" });
    }
  });

  // User profile
  app.get("/api/nutrition/profile", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const userId = req.session.userId;
      const profile = await storage.getUserProfile(userId);
      res.json(profile || {});
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.post("/api/nutrition/profile", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const userId = req.session.userId;
      const profile = { ...req.body, userId };
      
      const created = await storage.createUserProfile(profile);
      res.status(201).json(created);
    } catch (error) {
      console.error("Error creating user profile:", error);
      res.status(500).json({ message: "Failed to create user profile" });
    }
  });

  app.put("/api/nutrition/profile", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const userId = req.session.userId;
      const updated = await storage.updateUserProfile(userId, req.body);
      
      if (!updated) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Weight entries
  app.get("/api/nutrition/weight", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const userId = req.session.userId;
      const { limit } = req.query;
      
      if (limit) {
        const entries = await storage.getRecentWeightEntries(userId, parseInt(limit as string));
        res.json(entries);
      } else {
        const entries = await storage.getWeightEntriesByUser(userId);
        res.json(entries);
      }
    } catch (error) {
      console.error("Error fetching weight entries:", error);
      res.status(500).json({ message: "Failed to fetch weight entries" });
    }
  });

  app.post("/api/nutrition/weight", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const userId = req.session.userId;
      const entry = { ...req.body, userId };
      
      const created = await storage.createWeightEntry(entry);
      res.status(201).json(created);
    } catch (error) {
      console.error("Error creating weight entry:", error);
      res.status(500).json({ message: "Failed to create weight entry" });
    }
  });

  // Nutrition progress
  app.get("/api/nutrition/progress", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const userId = req.session.userId;
      const { date } = req.query;
      const targetDate = date ? date as string : new Date().toISOString().split('T')[0];
      
      const progress = await storage.getDailyNutritionProgress(userId, targetDate);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching nutrition progress:", error);
      res.status(500).json({ message: "Failed to fetch nutrition progress" });
    }
  });

  // Recent entries for dashboard
  app.get("/api/nutrition/recent", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const userId = req.session.userId;
      const limit = parseInt(req.query.limit as string) || 5;
      
      const entries = await storage.getRecentDiaryEntries(userId, limit);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching recent entries:", error);
      res.status(500).json({ message: "Failed to fetch recent entries" });
    }
  });

  // Daily nutrition statistics
  app.get("/api/nutrition/daily-stats/:date?", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const userId = req.session.userId;
      const date = req.params.date || new Date().toISOString().split('T')[0];
      
      const dailyStats = await storage.getDailyNutritionStats(userId, date);
      res.json(dailyStats);
    } catch (error) {
      console.error("Error fetching daily stats:", error);
      res.status(500).json({ message: "Failed to fetch daily statistics" });
    }
  });

  // User meal times endpoints
  app.get("/api/nutrition/meal-times", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const userId = req.session.userId;
      const mealTimes = await storage.getUserMealTimes(userId);
      
      if (!mealTimes) {
        // Create default meal times if they don't exist
        const defaultMealTimes = await storage.createUserMealTimes({
          userId,
          breakfastTime: "08:00",
          lunchTime: "13:00",
          dinnerTime: "18:00",
          snackTime: "20:00"
        });
        return res.json(defaultMealTimes);
      }
      
      res.json(mealTimes);
    } catch (error) {
      console.error("Error fetching meal times:", error);
      res.status(500).json({ message: "Failed to fetch meal times" });
    }
  });

  app.post("/api/nutrition/meal-times", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const userId = req.session.userId;
      const { breakfastTime, lunchTime, dinnerTime, snackTime } = req.body;

      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (breakfastTime && !timeRegex.test(breakfastTime)) {
        return res.status(400).json({ message: "Invalid breakfast time format" });
      }
      if (lunchTime && !timeRegex.test(lunchTime)) {
        return res.status(400).json({ message: "Invalid lunch time format" });
      }
      if (dinnerTime && !timeRegex.test(dinnerTime)) {
        return res.status(400).json({ message: "Invalid dinner time format" });
      }
      if (snackTime && !timeRegex.test(snackTime)) {
        return res.status(400).json({ message: "Invalid snack time format" });
      }

      // Check if user meal times exist
      const existingMealTimes = await storage.getUserMealTimes(userId);
      
      let mealTimes;
      if (existingMealTimes) {
        // Update existing meal times
        mealTimes = await storage.updateUserMealTimes(userId, {
          breakfastTime,
          lunchTime,
          dinnerTime,
          snackTime
        });
      } else {
        // Create new meal times
        mealTimes = await storage.createUserMealTimes({
          userId,
          breakfastTime,
          lunchTime,
          dinnerTime,
          snackTime
        });
      }
      
      res.json(mealTimes);
    } catch (error) {
      console.error("Error saving meal times:", error);
      res.status(500).json({ message: "Failed to save meal times" });
    }
  });

  const httpServer = createServer(app);
  // ==================== PRODUCT DATABASE MANAGEMENT ROUTES ====================

  // Get all product databases
  app.get("/api/admin/product-databases", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const databases = await storage.getAllProductDatabases();
      res.json(databases);
    } catch (error) {
      console.error("Error fetching product databases:", error);
      res.status(500).json({ message: "Failed to fetch product databases" });
    }
  });

  // Update product database configuration
  app.put("/api/admin/product-databases/:id", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updatedDatabase = await storage.updateProductDatabase(parseInt(id), req.body);
      res.json(updatedDatabase);
    } catch (error) {
      console.error("Error updating product database:", error);
      res.status(500).json({ message: "Failed to update product database" });
    }
  });

  // Reorder product databases (update priorities)
  app.put("/api/admin/product-databases/reorder", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { databases } = req.body; // Array of { id, priority } objects
      const updatedDatabases = await storage.reorderProductDatabases(databases);
      res.json(updatedDatabases);
    } catch (error) {
      console.error("Error reordering product databases:", error);
      res.status(500).json({ message: "Failed to reorder product databases" });
    }
  });

  // Test a specific database
  app.post("/api/admin/product-databases/:id/test", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { testBarcode } = req.body;
      const testResult = await storage.testProductDatabase(parseInt(id), testBarcode || "7622210995292");
      res.json(testResult);
    } catch (error) {
      console.error("Error testing product database:", error);
      res.status(500).json({ message: "Failed to test product database" });
    }
  });

  // Test all databases
  app.post("/api/admin/product-databases/test-all", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { testBarcode } = req.body;
      const testResults = await storage.testAllProductDatabases(testBarcode || "7622210995292");
      res.json(testResults);
    } catch (error) {
      console.error("Error testing all product databases:", error);
      res.status(500).json({ message: "Failed to test all product databases" });
    }
  });

  // Initialize default database configurations
  app.post("/api/admin/product-databases/initialize", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const initializedDatabases = await storage.initializeDefaultProductDatabases();
      res.json(initializedDatabases);
    } catch (error) {
      console.error("Error initializing product databases:", error);
      res.status(500).json({ message: "Failed to initialize product databases" });
    }
  });

  // ==================== DEVICE IDENTIFIER ROUTES ====================

  // Log device identifier
  app.post("/api/device/identify", async (req: any, res) => {
    try {
      const deviceData = req.body;
      const deviceIdentifier = await storage.logDeviceIdentifier(deviceData);
      res.json({ success: true, deviceId: deviceIdentifier.id });
    } catch (error) {
      console.error("Error logging device identifier:", error);
      res.status(500).json({ message: "Failed to log device identifier" });
    }
  });

  // Get device analytics (admin only)
  app.get("/api/admin/device-analytics", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const analytics = await storage.getDeviceAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching device analytics:", error);
      res.status(500).json({ message: "Failed to fetch device analytics" });
    }
  });

  // ==================== CAMERA SETTINGS ROUTES ====================
  
  // Get camera settings
  app.get("/api/admin/camera-settings", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const settings = await storage.getCameraSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching camera settings:", error);
      res.status(500).json({ message: "Failed to fetch camera settings" });
    }
  });

  // Update camera settings
  app.put("/api/admin/camera-settings", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const settings = req.body;
      const updatedSettings = await storage.updateCameraSettings(settings);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating camera settings:", error);
      res.status(500).json({ message: "Failed to update camera settings" });
    }
  });

  // Reset camera settings to defaults
  app.post("/api/admin/camera-settings/reset", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const defaultSettings = await storage.resetCameraSettingsToDefaults();
      res.json(defaultSettings);
    } catch (error) {
      console.error("Error resetting camera settings:", error);
      res.status(500).json({ message: "Failed to reset camera settings" });
    }
  });

  // ==================== USER CAMERA SETTINGS ROUTES ====================
  
  // Get user-specific camera settings
  app.get("/api/user/camera-settings", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const settings = await storage.getUserCameraSettings(userId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching user camera settings:", error);
      res.status(500).json({ message: "Failed to fetch camera settings" });
    }
  });

  // Update user-specific camera settings
  app.put("/api/user/camera-settings", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const settings = req.body;
      const updatedSettings = await storage.updateUserCameraSettings(userId, settings);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating user camera settings:", error);
      res.status(500).json({ message: "Failed to update camera settings" });
    }
  });

  // Reset user-specific camera settings to defaults
  app.post("/api/user/camera-settings/reset", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const defaultSettings = await storage.resetUserCameraSettingsToDefaults(userId);
      res.json(defaultSettings);
    } catch (error) {
      console.error("Error resetting user camera settings:", error);
      res.status(500).json({ message: "Failed to reset camera settings" });
    }
  });

  // ==================== DEBUG ROUTES ====================
  
  // Debug Routes for cascading database testing
  app.post("/api/debug/cascading-test", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { barcode } = req.body;

      if (!barcode) {
        return res.status(400).json({ message: "Barcode is required" });
      }

      const result = await storage.testAllProductDatabases(barcode);
      res.json(result);
    } catch (error) {
      console.error("Error testing cascading system:", error);
      res.status(500).json({ message: "Failed to test cascading system" });
    }
  });

  // ==================== MENU ITEMS MANAGEMENT ROUTES ====================

  // Get all menu items
  app.get("/api/admin/menu-items", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const menuItems = await storage.getAllMenuItems();
      res.json(menuItems);
    } catch (error: any) {
      console.error('Error fetching menu items:', error);
      res.status(500).json({ message: "Failed to fetch menu items", error: error.message });
    }
  });

  // Create new menu item
  app.post("/api/admin/menu-items", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const menuItem = await storage.createMenuItem(req.body);
      res.json(menuItem);
    } catch (error: any) {
      console.error('Error creating menu item:', error);
      res.status(500).json({ message: "Failed to create menu item", error: error.message });
    }
  });

  // Update menu item
  app.put("/api/admin/menu-items/:id", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.updateMenuItem(id, req.body);
      
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json(menuItem);
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      res.status(500).json({ message: "Failed to update menu item", error: error.message });
    }
  });

  // Delete menu item
  app.delete("/api/admin/menu-items/:id", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMenuItem(id);
      res.json({ message: "Menu item deleted successfully" });
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      res.status(500).json({ message: "Failed to delete menu item", error: error.message });
    }
  });

  // Reorder menu items
  app.put("/api/admin/menu-items/reorder", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { items } = req.body;
      const reorderedItems = await storage.reorderMenuItems(items);
      res.json(reorderedItems);
    } catch (error: any) {
      console.error('Error reordering menu items:', error);
      res.status(500).json({ message: "Failed to reorder menu items", error: error.message });
    }
  });

  // ==================== WEBSITE SETTINGS ROUTES ====================

  // Get website settings
  app.get("/api/admin/website-settings", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const settings = await storage.getWebsiteSettings();
      res.json(settings);
    } catch (error: any) {
      console.error('Error fetching website settings:', error);
      res.status(500).json({ message: "Failed to fetch website settings", error: error.message });
    }
  });

  // Update website settings
  app.put("/api/admin/website-settings", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const settings = await storage.updateWebsiteSettings(req.body);
      res.json(settings);
    } catch (error: any) {
      console.error('Error updating website settings:', error);
      res.status(500).json({ message: "Failed to update website settings", error: error.message });
    }
  });

  // Speech-to-Text Settings API routes
  app.get("/api/admin/speech-settings", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const settings = await storage.getSpeechSettings();
      res.json(settings);
    } catch (error: any) {
      console.error("Error fetching speech settings:", error);
      res.status(500).json({ message: "Failed to fetch speech settings", error: error.message });
    }
  });

  app.put("/api/admin/speech-settings", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const updates = req.body;
      const settings = await storage.updateSpeechSettings(updates);
      res.json(settings);
    } catch (error: any) {
      console.error("Error updating speech settings:", error);
      res.status(500).json({ message: "Failed to update speech settings", error: error.message });
    }
  });

  app.get("/api/admin/speech-status", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const settings = await storage.getSpeechSettings();
      
      let status = 'error';
      let message = 'Service unavailable';
      
      if (settings.enabled && settings.apiKey) {
        try {
          // Simple check if AssemblyAI service is available
          const available = await isVoiceTranscriptionAvailable();
          if (available) {
            status = 'healthy';
            message = 'AssemblyAI service is operational';
          } else {
            status = 'degraded';
            message = 'AssemblyAI API key not configured or invalid';
          }
        } catch (error) {
          status = 'error';
          message = 'Failed to connect to AssemblyAI service';
        }
      } else if (!settings.enabled) {
        status = 'degraded';
        message = 'Speech-to-Text service is disabled';
      } else {
        status = 'error';
        message = 'AssemblyAI API key is required';
      }

      res.json({
        status,
        message,
        lastChecked: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error checking speech status:", error);
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to check service status',
        lastChecked: new Date().toISOString(),
        error: error.message
      });
    }
  });

  app.post("/api/admin/speech-test", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const settings = await storage.getSpeechSettings();
      
      if (!settings.enabled) {
        return res.status(400).json({ message: "Speech-to-Text service is disabled" });
      }

      if (!settings.apiKey) {
        return res.status(400).json({ message: "AssemblyAI API key is required" });
      }

      // Test the connection
      const available = await isVoiceTranscriptionAvailable();
      
      if (available) {
        res.json({ 
          message: "Connection test successful! AssemblyAI service is working correctly.",
          status: 'healthy'
        });
      } else {
        res.status(500).json({ 
          message: "Connection test failed. Please check your API key.",
          status: 'error'
        });
      }
    } catch (error: any) {
      console.error("Error testing speech connection:", error);
      res.status(500).json({ 
        message: `Connection test failed: ${error.message || 'Unknown error'}`,
        status: 'error'
      });
    }
  });

  // Webcal (iCal) endpoints
  app.get("/api/webcal/:userId/:token.ics", async (req, res) => {
    try {
      const { userId, token } = req.params;
      
      // Basic token validation (in production, use proper JWT or similar)
      if (!userId || !token) {
        return res.status(400).json({ message: 'Invalid webcal URL' });
      }

      // Get nutrition data for the user (using sample data for now)
      // In production, fetch from diary_entries table
      const nutritionEntries = [
        {
          date: '2025-01-10',
          calories: 2150,
          protein: 120,
          carbohydrates: 280,
          fat: 75,
          meals: [
            { name: 'Oatmeal with Berries', type: 'breakfast', time: '08:00', calories: 350 },
            { name: 'Grilled Chicken Salad', type: 'lunch', time: '12:30', calories: 450 },
            { name: 'Salmon with Quinoa', type: 'dinner', time: '19:00', calories: 650 },
            { name: 'Greek Yogurt', type: 'snack', time: '15:30', calories: 150 }
          ]
        },
        {
          date: '2025-01-09',
          calories: 1980,
          protein: 110,
          carbohydrates: 240,
          fat: 68,
          meals: [
            { name: 'Smoothie Bowl', type: 'breakfast', time: '08:15', calories: 320 },
            { name: 'Turkey Sandwich', type: 'lunch', time: '13:00', calories: 420 },
            { name: 'Pasta with Vegetables', type: 'dinner', time: '18:30', calories: 580 },
            { name: 'Apple with Almonds', type: 'snack', time: '16:00', calories: 180 }
          ]
        }
      ];

      const { generateWebcalFeed } = await import('./lib/webcal');
      const icalContent = generateWebcalFeed(nutritionEntries, parseInt(userId));

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="nutrition-calendar.ics"');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.send(icalContent);
    } catch (error) {
      console.error('Error generating webcal feed:', error);
      res.status(500).json({ message: 'Failed to generate calendar feed' });
    }
  });

  // Get webcal URL for authenticated user
  app.get("/api/webcal/url", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      const { generateWebcalUrl, generateHttpsWebcalUrl } = await import('./lib/webcal');
      
      res.json({
        webcalUrl: generateWebcalUrl(userId, baseUrl),
        httpsUrl: generateHttpsWebcalUrl(userId, baseUrl),
        instructions: {
          ios: 'Tap the webcal link to automatically add to your iOS Calendar app',
          android: 'Copy the HTTPS URL and import it into Google Calendar or your preferred calendar app',
          desktop: 'Copy the webcal link and add it as a calendar subscription in your calendar application'
        }
      });
    } catch (error) {
      console.error('Error generating webcal URL:', error);
      res.status(500).json({ message: 'Failed to generate webcal URL' });
    }
  });

  // NutriBot Report endpoints
  app.post("/api/nutribot/report", requireAuth, async (req: any, res) => {
    try {
      const { type, description, messageId, messageContent, language, timestamp } = req.body;
      const userId = req.session.userId;

      if (!type || !description) {
        return res.status(400).json({ 
          message: 'Report type and description are required' 
        });
      }

      const report = {
        id: Date.now().toString(),
        userId,
        type,
        description: description.trim(),
        messageId,
        messageContent,
        language,
        timestamp,
        createdAt: new Date(),
      };

      console.log('NutriBot Report Submitted:', {
        reportId: report.id,
        userId: report.userId,
        type: report.type,
        description: report.description.substring(0, 100) + (report.description.length > 100 ? '...' : ''),
        messageId: report.messageId,
        language: report.language
      });

      res.json({ 
        message: 'Report submitted successfully',
        reportId: report.id 
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      res.status(500).json({ 
        message: 'Failed to submit report' 
      });
    }
  });

  // Onboarding endpoints
  // Get user onboarding data
  app.get("/api/onboarding", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const onboarding = await storage.getUserOnboarding(userId);
      res.json(onboarding || {});
    } catch (error) {
      console.error("Error fetching onboarding:", error);
      res.status(500).json({ message: "Failed to fetch onboarding data" });
    }
  });

  // Create or update onboarding data
  app.post("/api/onboarding", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { insertUserOnboardingSchema } = await import("@shared/schema");
      
      console.log('Onboarding request body:', JSON.stringify(req.body, null, 2));
      
      // Remove database-only fields that shouldn't be validated
      const { id, createdAt, updatedAt, ...requestData } = req.body;
      
      const validatedData = insertUserOnboardingSchema.parse(requestData);

      // Check if onboarding already exists
      const existing = await storage.getUserOnboarding(userId);

      let result;
      if (existing) {
        // Update existing onboarding
        result = await storage.updateUserOnboarding(userId, validatedData);
      } else {
        // Create new onboarding
        result = await storage.createUserOnboarding({ ...validatedData, userId });
      }

      // If this is the completion request, mark as complete
      if (req.body.isCompleted) {
        await storage.markOnboardingComplete(userId);
      }

      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        console.error("Onboarding validation error:", error.errors);
        console.error("Request body that failed:", JSON.stringify(req.body, null, 2));
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors,
          details: error.errors.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
            received: e.received
          }))
        });
      }
      console.error("Error saving onboarding:", error);
      res.status(500).json({ message: "Failed to save onboarding data" });
    }
  });

  // Add to nutrition diary endpoint
  app.post("/api/nutrition-diary", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Validate request body with proper timestamp conversion
      const validatedData = insertDiaryEntrySchema.parse({
        ...req.body,
        userId: userId,
        consumedAt: req.body.consumedAt ? new Date(req.body.consumedAt) : new Date(),
      });

      const diaryEntry = await storage.createDiaryEntry(validatedData);
      
      res.status(201).json({
        message: "Product added to nutrition diary successfully",
        entry: diaryEntry
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        console.error("Diary entry validation error:", error.errors);
        console.error("Request body:", req.body);
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors,
          receivedData: req.body
        });
      }
      console.error("Add to diary error:", error);
      res.status(500).json({ message: "Failed to add product to diary" });
    }
  });

  // Get nutrition diary entries for a user
  app.get("/api/nutrition-diary", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { date, limit = '50' } = req.query;
      const entries = await storage.getDiaryEntries(userId, date as string, parseInt(limit as string));
      
      res.json(entries);
    } catch (error) {
      console.error("Get diary entries error:", error);
      res.status(500).json({ message: "Failed to get diary entries" });
    }
  });

  // Delete nutrition diary entry
  app.delete("/api/nutrition-diary/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const entryId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const success = await storage.deleteDiaryEntry(entryId, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Diary entry not found or unauthorized" });
      }
      
      res.json({ message: "Diary entry deleted successfully" });
    } catch (error) {
      console.error("Delete diary entry error:", error);
      res.status(500).json({ message: "Failed to delete diary entry" });
    }
  });

  // Data Change Requests API endpoints
  app.post("/api/data-change-requests", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const request = await storage.createDataChangeRequest({
        ...req.body,
        userId: user.id
      });

      // Send notification to all admin users
      const adminUsers = await storage.getAdminUsers();
      for (const admin of adminUsers) {
        await storage.createNotification({
          userId: admin.id,
          type: 'info',
          title: `New ${req.body.requestType === 'report_error' ? 'Error Report' : 'Data Change Request'}`,
          message: `User ${user.username} has submitted a ${req.body.requestType === 'report_error' ? 'product error report' : 'data change request'} for ${req.body.productName}`,
          actionUrl: `/admin/data-requests/${request.id}`,
          actionText: 'Review Request',
          metadata: { requestId: request.id, requestType: req.body.requestType },
          isRead: false,
          isArchived: false
        });
      }

      res.json(request);
    } catch (error) {
      console.error("Error creating data change request:", error);
      res.status(500).json({ message: "Failed to create data change request" });
    }
  });

  app.get("/api/data-change-requests", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const requests = await storage.getDataChangeRequestsByUser(user.id);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching data change requests:", error);
      res.status(500).json({ message: "Failed to fetch data change requests" });
    }
  });

  app.put("/api/data-change-requests/:id/approve", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user || user.accountType !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { reviewComments } = req.body;
      const request = await storage.approveDataChangeRequest(
        parseInt(req.params.id),
        user.id,
        reviewComments
      );

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      // Apply the changes to the product if approved
      if (request.proposedChanges && request.productBarcode) {
        try {
          await storage.updateProductByBarcode(request.productBarcode, request.proposedChanges as any);
          // Note: appliedAt would need to be added to schema if tracking application time is needed
        } catch (error) {
          console.error("Error applying data changes:", error);
        }
      }

      res.json(request);
    } catch (error) {
      console.error("Error approving data change request:", error);
      res.status(500).json({ message: "Failed to approve request" });
    }
  });

  app.put("/api/data-change-requests/:id/reject", async (req, res) => {
    try {
      const user = (req.session as any).user;
      if (!user || user.accountType !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { reviewComments } = req.body;
      const request = await storage.rejectDataChangeRequest(
        parseInt(req.params.id),
        user.id,
        reviewComments
      );

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json(request);
    } catch (error) {
      console.error("Error rejecting data change request:", error);
      res.status(500).json({ message: "Failed to reject request" });
    }
  });

  // Calendar Entries routes
  // Get calendar entries for current user
  app.get('/api/calendar/entries', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const entries = await storage.getCalendarEntriesByUser(req.session.userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching calendar entries:", error);
      res.status(500).json({ message: "Failed to fetch calendar entries" });
    }
  });

  // Get calendar entries for a date range
  app.get('/api/calendar/entries/range', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const entries = await storage.getCalendarEntriesByUserAndDateRange(
        req.session.userId,
        startDate as string,
        endDate as string
      );
      res.json(entries);
    } catch (error) {
      console.error("Error fetching calendar entries by range:", error);
      res.status(500).json({ message: "Failed to fetch calendar entries" });
    }
  });

  // Create new calendar entry
  app.post('/api/calendar/entries', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const entryData = {
        ...req.body,
        userId: req.session.userId
      };

      const entry = await storage.createCalendarEntry(entryData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating calendar entry:", error);
      res.status(500).json({ message: "Failed to create calendar entry" });
    }
  });

  // Update a calendar entry
  app.put('/api/calendar/entries/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      // Verify entry belongs to the user
      const existingEntry = await storage.getCalendarEntryById(entryId);
      if (!existingEntry) {
        return res.status(404).json({ message: "Calendar entry not found" });
      }
      if (existingEntry.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedEntry = await storage.updateCalendarEntry(entryId, req.body);
      if (!updatedEntry) {
        return res.status(404).json({ message: "Calendar entry not found" });
      }

      res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating calendar entry:", error);
      res.status(500).json({ message: "Failed to update calendar entry" });
    }
  });

  // Delete a calendar entry
  app.delete('/api/calendar/entries/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      // Verify entry belongs to the user
      const existingEntry = await storage.getCalendarEntryById(entryId);
      if (!existingEntry) {
        return res.status(404).json({ message: "Calendar entry not found" });
      }
      if (existingEntry.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const deleted = await storage.deleteCalendarEntry(entryId, req.session.userId);
      if (!deleted) {
        return res.status(404).json({ message: "Calendar entry not found" });
      }

      res.json({ success: true, message: "Calendar entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting calendar entry:", error);
      res.status(500).json({ message: "Failed to delete calendar entry" });
    }
  });

  // Update calendar entry
  app.patch('/api/calendar/entries/:id', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const entryId = parseInt(req.params.id);
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      // Verify ownership
      const existingEntry = await storage.getCalendarEntryById(entryId);
      if (!existingEntry || existingEntry.userId !== req.session.userId) {
        return res.status(404).json({ message: "Calendar entry not found" });
      }

      const updatedEntry = await storage.updateCalendarEntry(entryId, req.body);
      if (!updatedEntry) {
        return res.status(404).json({ message: "Failed to update calendar entry" });
      }

      res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating calendar entry:", error);
      res.status(500).json({ message: "Failed to update calendar entry" });
    }
  });


  // AI-powered schedule generation
  app.post('/api/calendar/generate-schedule', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Validate required fields
      const { goal, startDate, duration, caloriesTarget } = req.body;
      if (!goal || !startDate || !duration || !caloriesTarget) {
        return res.status(400).json({ 
          message: "Missing required fields: goal, startDate, duration, caloriesTarget" 
        });
      }

      // Get user profile data for AI analysis
      const userProfile = await storage.getUserOnboarding(req.session.userId);
      if (!userProfile) {
        return res.status(400).json({ 
          message: "User profile not found. Please complete your profile first." 
        });
      }

      // Get user meal times
      const userMealTimes = await storage.getUserMealTimes(req.session.userId);
      
      // Include meal times in form data
      const formDataWithMealTimes = {
        ...req.body,
        mealTimes: userMealTimes ? {
          breakfastTime: userMealTimes.breakfastTime,
          lunchTime: userMealTimes.lunchTime,
          dinnerTime: userMealTimes.dinnerTime,
          snackTime: userMealTimes.snackTime
        } : undefined
      };

      // Generate AI schedule
      // Generate the AI schedule with prompt history logging
      const sessionId = req.sessionID || `session_${Date.now()}`;
      const generationResult = await AIScheduleGenerator.generateSchedule(
        formDataWithMealTimes,
        userProfile,
        req.session.userId,
        sessionId,
        req.ip,
        req.get('User-Agent')
      );
      
      // Create calendar entry from generated schedule
      const calendarEntry = await storage.createCalendarEntry({
        userId: req.session.userId,
        title: generationResult.schedule.title,
        description: generationResult.schedule.description,
        type: 'schedule',
        goal: generationResult.schedule.goal,
        duration: generationResult.schedule.duration,
        startDate: generationResult.schedule.startDate,
        endDate: generationResult.schedule.endDate,
        dailyCalories: generationResult.schedule.dailyCalories,
        dailyProtein: generationResult.schedule.dailyProtein,
        dailyCarbs: generationResult.schedule.dailyCarbs,
        dailyFat: generationResult.schedule.dailyFat,
        specialNotes: generationResult.schedule.specialNotes
      });

      // Save generation history
      await storage.createScheduleGenHistory({
        userId: req.session.userId,
        requestData: {
          formData: formDataWithMealTimes,
          userProfile: userProfile
        },
        aiModel: formDataWithMealTimes.aiModel || "gpt-4o",
        prompt: generationResult.prompt,
        aiResponse: generationResult.aiResponse,
        generatedSchedule: generationResult.schedule,
        calendarEntryId: calendarEntry.id,
        generationTimeMs: generationResult.generationTimeMs,
        tokensUsed: generationResult.tokensUsed,
        status: "success"
      });

      res.json({
        success: true,
        calendarEntry,
        schedule: generationResult.schedule,
        generationTimeMs: generationResult.generationTimeMs
      });

    } catch (error) {
      console.error("Error generating AI schedule:", error);
      
      // Save failed generation attempt if we have user ID
      if (req.session.userId) {
        try {
          await storage.createScheduleGenHistory({
            userId: req.session.userId,
            requestData: { formData: req.body },
            aiModel: req.body.aiModel || "gpt-4o",
            prompt: "Generation failed before prompt creation",
            aiResponse: "",
            generatedSchedule: {},
            generationTimeMs: 0,
            status: "failed",
            errorMessage: error instanceof Error ? error.message : "Unknown error"
          });
        } catch (historyError) {
          console.error("Error saving failed generation history:", historyError);
        }
      }

      res.status(500).json({ 
        message: "Failed to generate AI schedule",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get active calendar entries for current user
  app.get('/api/calendar/active', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const entries = await storage.getActiveCalendarEntries(req.session.userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching active calendar entries:", error);
      res.status(500).json({ message: "Failed to fetch active calendar entries" });
    }
  });

  // AI Management & Configuration endpoints
  
  // Get AI configuration
  app.get('/api/admin/ai-config', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user || user.accountType !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const config = await storage.getOrCreateAiConfiguration();
      
      // Transform database format to frontend format
      const response = {
        analysisAI: {
          model: config.analysisAiModel,
          temperature: config.analysisAiTemperature,
          maxTokens: config.analysisAiMaxTokens,
          systemPrompt: config.analysisAiSystemPrompt,
          enabled: config.analysisAiEnabled
        }
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching AI configuration:", error);
      res.status(500).json({ message: "Failed to fetch AI configuration" });
    }
  });

  // Update AI configuration
  app.post('/api/admin/ai-config', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user || user.accountType !== 'Admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { analysisAI } = req.body;
      
      if (!analysisAI) {
        return res.status(400).json({ message: "Invalid configuration data" });
      }

      // Transform frontend format to database format
      const updates = {
        analysisAiModel: analysisAI.model,
        analysisAiTemperature: analysisAI.temperature,
        analysisAiMaxTokens: analysisAI.maxTokens,
        analysisAiSystemPrompt: analysisAI.systemPrompt,
        analysisAiEnabled: analysisAI.enabled
      };

      const updatedConfig = await storage.updateAiConfiguration(updates, req.session.userId);
      
      if (!updatedConfig) {
        return res.status(500).json({ message: "Failed to update configuration" });
      }

      res.json({ message: "Configuration updated successfully", config: updatedConfig });
    } catch (error) {
      console.error("Error updating AI configuration:", error);
      res.status(500).json({ message: "Failed to update AI configuration" });
    }
  });

  // Test AI connection
  app.post('/api/admin/ai-test', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { model } = req.body;
      
      if (!model) {
        return res.status(400).json({ message: "Model parameter is required" });
      }

      const startTime = Date.now();
      
      // Test the AI model with a simple request
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a test assistant. Respond with exactly: 'Connection successful'"
          },
          {
            role: "user",
            content: "Test connection"
          }
        ],
        max_tokens: 10,
        temperature: 0
      });

      const responseTime = Date.now() - startTime;
      
      if (response.choices[0].message.content?.includes('Connection successful')) {
        res.json({
          success: true,
          model: model,
          responseTime: responseTime,
          message: "AI model connection successful"
        });
      } else {
        res.status(500).json({
          success: false,
          model: model,
          message: "Unexpected response from AI model"
        });
      }
    } catch (error) {
      console.error("Error testing AI connection:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to test AI connection"
      });
    }
  });

  // Batch testing endpoint for multiple barcodes across databases  
  app.post("/api/product-lookup/batch-test", requireAuth, async (req: any, res) => {
    try {
      const { barcode, databases } = req.body;

      if (!barcode || !databases || !Array.isArray(databases)) {
        return res.status(400).json({ 
          message: 'Invalid request: barcode and databases array required' 
        });
      }

      const startTime = Date.now();
      const databaseResults = [];

      // Test against each selected database (simplified for demo)
      for (const databaseId of databases) {
        const dbStartTime = Date.now();
        
        try {
          const result = await smartProductLookup(barcode);
          const dbEndTime = Date.now();
          
          databaseResults.push({
            databaseName: getDatabaseName(databaseId),
            responseTime: dbEndTime - dbStartTime,
            productFound: !!result && !!result.product && !!result.product.name,
            productData: result?.product || null,
            error: null
          });
        } catch (error) {
          const dbEndTime = Date.now();
          
          databaseResults.push({
            databaseName: getDatabaseName(databaseId),
            responseTime: dbEndTime - dbStartTime,
            productFound: false,
            productData: null,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      const totalTime = Date.now() - startTime;

      res.json({
        barcode,
        databaseResults,
        totalTime,
        testedDatabases: databases.length,
        foundInDatabases: databaseResults.filter(r => r.productFound).length
      });

    } catch (error) {
      console.error('Batch test error:', error);
      res.status(500).json({ 
        message: 'Internal server error during batch testing' 
      });
    }
  });

  // Helper function to get readable database names
  function getDatabaseName(databaseId: string): string {
    const names: { [key: string]: string } = {
      'openfoodfacts': 'OpenFoodFacts',
      'fooddb-ca': 'FoodDB.ca',
      'usda-fdc': 'USDA Food Data Central',
      'nutritionix': 'Nutritionix',
      'spoonacular': 'Spoonacular',
      'api-ninjas': 'API Ninjas',
      'upc-database': 'UPC Database',
      'australia-food': 'Australian Food Database',
      'health-canada': 'Health Canada',
      'efsa': 'EFSA Database'
    };
    
    return names[databaseId] || databaseId;
  }

  // Prompt History endpoints
  app.get('/api/prompt-history', requireAuth, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const promptHistory = await storage.getPromptHistoryByUser(req.session.userId, limit);
      
      res.json(promptHistory);
    } catch (error) {
      console.error('Error fetching prompt history:', error);
      res.status(500).json({ message: 'Failed to fetch prompt history' });
    }
  });

  app.get('/api/prompt-history/stats', requireAuth, async (req: Request, res: Response) => {
    try {
      // Only allow admin users to view overall stats
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Admin access required.' });
      }

      const stats = await storage.getPromptHistoryStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching prompt history stats:', error);
      res.status(500).json({ message: 'Failed to fetch prompt history stats' });
    }
  });

  app.get('/api/prompt-history/feature/:feature', requireAuth, async (req: Request, res: Response) => {
    try {
      const feature = req.params.feature;
      const limit = parseInt(req.query.limit as string) || 100;
      
      // Only allow admin users to view feature-specific history
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Admin access required.' });
      }

      const promptHistory = await storage.getPromptHistoryByFeature(feature, limit);
      res.json(promptHistory);
    } catch (error) {
      console.error('Error fetching feature prompt history:', error);
      res.status(500).json({ message: 'Failed to fetch feature prompt history' });
    }
  });

  // ==================== Release Management API Routes ====================

  // Get all releases (public endpoint)
  app.get('/api/releases', async (req: Request, res: Response) => {
    try {
      const releases = await storage.getPublishedReleases();
      res.json(releases);
    } catch (error) {
      console.error('Error fetching releases:', error);
      res.status(500).json({ message: 'Failed to fetch releases' });
    }
  });

  // Get featured releases (public endpoint)
  app.get('/api/releases/featured', async (req: Request, res: Response) => {
    try {
      const releases = await storage.getFeaturedReleases();
      res.json(releases);
    } catch (error) {
      console.error('Error fetching featured releases:', error);
      res.status(500).json({ message: 'Failed to fetch featured releases' });
    }
  });

  // Get recent releases (public endpoint)
  app.get('/api/releases/recent', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const releases = await storage.getRecentReleases(limit);
      res.json(releases);
    } catch (error) {
      console.error('Error fetching recent releases:', error);
      res.status(500).json({ message: 'Failed to fetch recent releases' });
    }
  });

  // Get release by ID (public endpoint)
  app.get('/api/releases/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const release = await storage.getReleaseById(id);
      
      if (!release) {
        return res.status(404).json({ message: 'Release not found' });
      }

      // Only return published releases to non-admin users
      if (req.session.userId) {
        const currentUser = await storage.getUser(req.session.userId);
        if (!currentUser || currentUser.accountType !== 'Admin') {
          if (release.status !== 'published' || !release.isPublic) {
            return res.status(404).json({ message: 'Release not found' });
          }
        }
      } else {
        if (release.status !== 'published' || !release.isPublic) {
          return res.status(404).json({ message: 'Release not found' });
        }
      }

      res.json(release);
    } catch (error) {
      console.error('Error fetching release:', error);
      res.status(500).json({ message: 'Failed to fetch release' });
    }
  });

  // Admin-only routes for release management
  app.get('/api/admin/releases', requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Admin access required.' });
      }

      const releases = await storage.getAllReleases();
      res.json(releases);
    } catch (error) {
      console.error('Error fetching admin releases:', error);
      res.status(500).json({ message: 'Failed to fetch admin releases' });
    }
  });

  app.post('/api/admin/releases', requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Admin access required.' });
      }

      const release = await storage.createRelease(req.body);
      res.status(201).json(release);
    } catch (error) {
      console.error('Error creating release:', error);
      res.status(500).json({ message: 'Failed to create release' });
    }
  });

  app.put('/api/admin/releases/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Admin access required.' });
      }

      const id = parseInt(req.params.id);
      const updated = await storage.updateRelease(id, req.body);

      if (!updated) {
        return res.status(404).json({ message: 'Release not found' });
      }

      res.json(updated);
    } catch (error) {
      console.error('Error updating release:', error);
      res.status(500).json({ message: 'Failed to update release' });
    }
  });

  app.delete('/api/admin/releases/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Admin access required.' });
      }

      const id = parseInt(req.params.id);
      const success = await storage.deleteRelease(id);

      if (!success) {
        return res.status(404).json({ message: 'Release not found' });
      }

      res.json({ message: 'Release deleted successfully' });
    } catch (error) {
      console.error('Error deleting release:', error);
      res.status(500).json({ message: 'Failed to delete release' });
    }
  });

  app.post('/api/admin/releases/:id/publish', requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Admin access required.' });
      }

      const id = parseInt(req.params.id);
      const published = await storage.publishRelease(id, req.session.userId);

      if (!published) {
        return res.status(404).json({ message: 'Release not found' });
      }

      // Send notification to all users when a release is published
      if (published.status === 'published' && !published.notificationSent) {
        try {
          const users = await storage.getAllUsers();
          const notifications = users.map(user => ({
            userId: user.id,
            type: 'info' as const,
            title: `New Release: ${published.title}`,
            message: published.description,
            actionUrl: `/releases/${published.id}`,
            actionText: 'View Release',
            metadata: { releaseId: published.id, releaseVersion: published.version }
          }));

          // Create notifications for all users
          await Promise.all(notifications.map(notification => 
            storage.createNotification(notification)
          ));

          // Mark the release as having notifications sent
          await storage.markReleaseNotificationSent(id);

          console.log(`Sent release notifications to ${users.length} users for release: ${published.title}`);
        } catch (notificationError) {
          console.error('Error sending release notifications:', notificationError);
          // Don't fail the entire request if notifications fail
        }
      }

      res.json(published);
    } catch (error) {
      console.error('Error publishing release:', error);
      res.status(500).json({ message: 'Failed to publish release' });
    }
  });

  app.post('/api/admin/releases/:id/unpublish', requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Admin access required.' });
      }

      const id = parseInt(req.params.id);
      const unpublished = await storage.unpublishRelease(id);

      if (!unpublished) {
        return res.status(404).json({ message: 'Release not found' });
      }

      res.json(unpublished);
    } catch (error) {
      console.error('Error unpublishing release:', error);
      res.status(500).json({ message: 'Failed to unpublish release' });
    }
  });

  app.post('/api/admin/releases/:id/archive', requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId);
      if (!currentUser || currentUser.accountType !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Admin access required.' });
      }

      const id = parseInt(req.params.id);
      const archived = await storage.archiveRelease(id);

      if (!archived) {
        return res.status(404).json({ message: 'Release not found' });
      }

      res.json(archived);
    } catch (error) {
      console.error('Error archiving release:', error);
      res.status(500).json({ message: 'Failed to archive release' });
    }
  });

  return httpServer;
}
