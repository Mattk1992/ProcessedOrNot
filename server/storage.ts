import { users, type User, type InsertUser, products, type Product, type InsertProduct } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product storage methods
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(barcode: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.barcode, barcode));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const productWithTimestamp = {
      ...insertProduct,
      lastUpdated: new Date().toISOString()
    };
    
    const [product] = await db
      .insert(products)
      .values(productWithTimestamp)
      .returning();
    return product;
  }

  async updateProduct(barcode: string, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    const updateData = {
      ...productUpdate,
      lastUpdated: new Date().toISOString()
    };

    const [product] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.barcode, barcode))
      .returning();
    
    return product || undefined;
  }
}

export const storage = new DatabaseStorage();
