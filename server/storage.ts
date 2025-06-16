import { 
  users, 
  type User, 
  type InsertUser, 
  type RegisterUser,
  type LoginUser,
  products, 
  type Product, 
  type InsertProduct 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, or } from "drizzle-orm";
import { hashPassword, verifyPassword, generateEmailVerificationToken, generatePasswordResetToken, sanitizeUser } from "./lib/auth";

export interface IStorage {
  // User authentication methods
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined>;
  createUser(user: RegisterUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  verifyUserCredentials(username: string, password: string): Promise<User | null>;
  
  // Password reset methods
  setPasswordResetToken(email: string, token: string): Promise<boolean>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
  
  // Email verification methods
  verifyEmail(token: string): Promise<boolean>;
  
  // Product storage methods
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(barcode: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User authentication methods
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined> {
    const [user] = await db.select().from(users)
      .where(or(eq(users.username, usernameOrEmail), eq(users.email, usernameOrEmail)));
    return user || undefined;
  }

  async createUser(registerUser: RegisterUser): Promise<User> {
    const hashedPassword = await hashPassword(registerUser.password);
    const emailVerificationToken = generateEmailVerificationToken();
    
    const [user] = await db
      .insert(users)
      .values({
        username: registerUser.username,
        email: registerUser.email,
        passwordHash: hashedPassword,
        firstName: registerUser.firstName,
        lastName: registerUser.lastName,
        emailVerificationToken,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async verifyUserCredentials(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsernameOrEmail(username);
    if (!user) return null;
    
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) return null;
    
    // Update last login time
    await this.updateUser(user.id, { lastLoginAt: new Date() });
    
    return user;
  }

  // Password reset methods
  async setPasswordResetToken(email: string, token: string): Promise<boolean> {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    const result = await db
      .update(users)
      .set({ 
        passwordResetToken: token,
        passwordResetExpires: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(users.email, email));
    
    return result.rowCount > 0;
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users)
      .where(eq(users.passwordResetToken, token));
    
    if (!user || !user.passwordResetExpires) return undefined;
    
    // Check if token is expired
    if (new Date() > user.passwordResetExpires) return undefined;
    
    return user;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.getUserByPasswordResetToken(token);
    if (!user) return false;
    
    const hashedPassword = await hashPassword(newPassword);
    
    const result = await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));
    
    return result.rowCount > 0;
  }

  // Email verification methods
  async verifyEmail(token: string): Promise<boolean> {
    const result = await db
      .update(users)
      .set({
        isEmailVerified: true,
        emailVerificationToken: null,
        updatedAt: new Date()
      })
      .where(eq(users.emailVerificationToken, token));
    
    return result.rowCount > 0;
  }

  // Legacy methods for backwards compatibility
  async getUser(id: number): Promise<User | undefined> {
    return this.getUserById(id);
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    // First try exact barcode match
    const [product] = await db.select().from(products).where(eq(products.barcode, barcode));
    if (product) return product;
    
    // If not found and input looks like a text search, try finding by product name (case-insensitive)
    if (!barcode.match(/^\d+$/) && barcode.length > 0) {
      const nameMatches = await db.select().from(products)
        .where(eq(products.productName, barcode))
        .orderBy(products.id)
        .limit(1);
      const [nameMatch] = nameMatches;
      return nameMatch || undefined;
    }
    
    return undefined;
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
