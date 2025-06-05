import { pgTable, text, serial, integer, real, jsonb } from "drizzle-orm/pg-core";
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
  dataSource: text("data_source").default("OpenFoodFacts"),
  lastUpdated: text("last_updated"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  lastUpdated: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

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

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
