import { pgTable, text, serial, integer, real, jsonb, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  barcode: text("barcode").notNull().unique(),
  productName: text("product_name"),
  brands: text("brands"),
  imageUrl: text("image_url"),
  ingredientsText: text("ingredients_text"),
  nutriments: jsonb("nutriments"),
  processingScore: integer("processing_score"),
  processingExplanation: text("processing_explanation"),
  glycemicIndex: integer("glycemic_index"),
  glycemicLoad: integer("glycemic_load"),
  glycemicExplanation: text("glycemic_explanation"),
  dataSource: text("data_source").default("OpenFoodFacts"),
  lastUpdated: text("last_updated"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Search History table - enhanced to include search result data
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  searchId: varchar("search_id", { length: 255 }).notNull().unique(),
  searchInput: text("search_input").notNull(),
  searchInputType: varchar("search_input_type", { length: 50 }).notNull(),
  
  // Search result data
  resultFound: boolean("result_found").notNull().default(false),
  productBarcode: text("product_barcode"),
  productName: text("product_name"),
  productBrands: text("product_brands"),
  productImageUrl: text("product_image_url"),
  productIngredientsText: text("product_ingredients_text"),
  productNutriments: jsonb("product_nutriments"),
  processingScore: integer("processing_score"),
  processingExplanation: text("processing_explanation"),
  glycemicIndex: integer("glycemic_index"),
  glycemicLoad: integer("glycemic_load"),
  glycemicExplanation: text("glycemic_explanation"),
  dataSource: text("data_source"),
  lookupSource: text("lookup_source"),
  
  // Error handling
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;

// OpenFoodFacts API response types
export type OpenFoodFactsProduct = {
  product: {
    product_name?: string;
    brands?: string;
    image_url?: string;
    ingredients_text?: string;
    nutriments?: {
      energy_100g?: number;
      fat_100g?: number;
      saturated_fat_100g?: number;
      carbohydrates_100g?: number;
      sugars_100g?: number;
      proteins_100g?: number;
      salt_100g?: number;
      [key: string]: any;
    };
  };
  status: number;
  status_verbose: string;
};

// OpenAI analysis response type
export type ProcessingAnalysis = {
  score: number;
  explanation: string;
  categories: {
    ultraProcessed: string[];
    processed: string[];
    minimallyProcessed: string[];
  };
};

// Glycemic analysis response type
export type GlycemicAnalysis = {
  glycemicIndex: number;
  glycemicLoad: number;
  explanation: string;
  category: 'Low' | 'Medium' | 'High';
  impactDescription: string;
};

// User Account System
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: varchar("role", { length: 20 }).notNull().default("Regular"),
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Authentication Schemas
export const registerUserSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string()
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required").max(100, "First name must not exceed 100 characters"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name must not exceed 100 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User Role Types
export type UserRole = 'Admin' | 'Regular';
