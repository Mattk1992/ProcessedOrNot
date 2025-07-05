import { 
  users, 
  type User, 
  type InsertUser, 
  type RegisterUser,
  type LoginUser,
  products, 
  type Product, 
  type InsertProduct,
  searchHistory,
  type SearchHistory,
  type InsertSearchHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, or, and, isNull, isNotNull } from "drizzle-orm";
import { hashPassword, verifyPassword, generateEmailVerificationToken, generatePasswordResetToken, sanitizeUser, generateSearchId } from "./lib/auth";

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
  
  // Role management methods
  updateUserRole(userId: number, role: string): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  getAdminStats(): Promise<{
    totalUsers: number;
    adminUsers: number;
    regularUsers: number;
    verifiedUsers: number;
    totalProducts: number;
    recentRegistrations: number;
  }>;
  
  // Product storage methods
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(barcode: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  getProductsWithoutGlycemicIndex(): Promise<Product[]>;
  
  // Search history methods
  createSearchHistory(searchHistory: InsertSearchHistory): Promise<SearchHistory>;
  getSearchHistoryBySearchId(searchId: string): Promise<SearchHistory | undefined>;
  getSearchHistoryByInput(searchInput: string): Promise<SearchHistory | undefined>;
  getAllSearchHistory(): Promise<SearchHistory[]>;
  getRecentSearchHistory(limit?: number): Promise<SearchHistory[]>;
  createSearchHistoryWithResult(searchInput: string, searchInputType: string, product?: Product | null, error?: string, lookupSource?: string): Promise<SearchHistory>;
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

  // Role management methods
  async updateUserRole(userId: number, role: string): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ role, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      
      return updatedUser ? sanitizeUser(updatedUser) : undefined;
    } catch (error) {
      console.error("Error updating user role:", error);
      return undefined;
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const userList = await db
        .select()
        .from(users)
        .where(eq(users.role, role))
        .orderBy(users.createdAt);
      
      return userList.map(sanitizeUser);
    } catch (error) {
      console.error("Error fetching users by role:", error);
      return [];
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const userList = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt));
      
      return userList.map(sanitizeUser);
    } catch (error) {
      console.error("Error fetching all users:", error);
      return [];
    }
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    adminUsers: number;
    regularUsers: number;
    verifiedUsers: number;
    totalProducts: number;
    recentRegistrations: number;
  }> {
    try {
      // Get user counts
      const totalUsersResult = await db.select({ count: sql`count(*)` }).from(users);
      const totalUsers = Number(totalUsersResult[0]?.count) || 0;

      const adminUsersResult = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.role, 'Admin'));
      const adminUsers = Number(adminUsersResult[0]?.count) || 0;

      const regularUsersResult = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.role, 'Regular'));
      const regularUsers = Number(regularUsersResult[0]?.count) || 0;

      const verifiedUsersResult = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.isEmailVerified, true));
      const verifiedUsers = Number(verifiedUsersResult[0]?.count) || 0;

      // Get product count
      const totalProductsResult = await db.select({ count: sql`count(*)` }).from(products);
      const totalProducts = Number(totalProductsResult[0]?.count) || 0;

      // Get recent registrations (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentRegistrationsResult = await db.select({ count: sql`count(*)` }).from(users).where(sql`${users.createdAt} >= ${sevenDaysAgo}`);
      const recentRegistrations = Number(recentRegistrationsResult[0]?.count) || 0;

      return {
        totalUsers,
        adminUsers,
        regularUsers,
        verifiedUsers,
        totalProducts,
        recentRegistrations,
      };
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      return {
        totalUsers: 0,
        adminUsers: 0,
        regularUsers: 0,
        verifiedUsers: 0,
        totalProducts: 0,
        recentRegistrations: 0,
      };
    }
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

  async getProductsWithoutGlycemicIndex(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        and(
          isNull(products.glycemicIndex),
          isNotNull(products.nutriments)
        )
      )
      .limit(50); // Limit to 50 products to avoid overwhelming the API
  }

  // Search history methods
  async createSearchHistory(insertSearchHistory: InsertSearchHistory): Promise<SearchHistory> {
    const [searchRecord] = await db
      .insert(searchHistory)
      .values(insertSearchHistory)
      .returning();
    return searchRecord;
  }

  async getSearchHistoryBySearchId(searchId: string): Promise<SearchHistory | undefined> {
    const [searchRecord] = await db
      .select()
      .from(searchHistory)
      .where(eq(searchHistory.searchId, searchId));
    return searchRecord || undefined;
  }

  async getSearchHistoryByInput(searchInput: string): Promise<SearchHistory | undefined> {
    const [searchRecord] = await db
      .select()
      .from(searchHistory)
      .where(eq(searchHistory.searchInput, searchInput))
      .orderBy(desc(searchHistory.createdAt))
      .limit(1);
    return searchRecord || undefined;
  }

  async getAllSearchHistory(): Promise<SearchHistory[]> {
    return await db
      .select()
      .from(searchHistory)
      .orderBy(desc(searchHistory.createdAt));
  }

  async getRecentSearchHistory(limit: number = 50): Promise<SearchHistory[]> {
    return await db
      .select()
      .from(searchHistory)
      .orderBy(desc(searchHistory.createdAt))
      .limit(limit);
  }

  async createSearchHistoryWithResult(
    searchInput: string, 
    searchInputType: string, 
    product?: Product | null, 
    error?: string,
    lookupSource?: string
  ): Promise<SearchHistory> {
    // Check for duplicate search input first
    const existingSearch = await this.getSearchHistoryByInput(searchInput);
    if (existingSearch) {
      console.log(`Duplicate search input detected: "${searchInput}". Skipping database save.`);
      return existingSearch;
    }

    // Generate unique search ID
    const searchId = generateSearchId();

    // Prepare search history data
    const searchHistoryData: InsertSearchHistory = {
      searchId,
      searchInput,
      searchInputType,
      resultFound: !!product,
      productBarcode: product?.barcode || null,
      productName: product?.productName || null,
      productBrands: product?.brands || null,
      productImageUrl: product?.imageUrl || null,
      productIngredientsText: product?.ingredientsText || null,
      productNutriments: product?.nutriments || null,
      processingScore: product?.processingScore || null,
      processingExplanation: product?.processingExplanation || null,
      glycemicIndex: product?.glycemicIndex || null,
      glycemicLoad: product?.glycemicLoad || null,
      glycemicExplanation: product?.glycemicExplanation || null,
      dataSource: product?.dataSource || null,
      lookupSource: lookupSource || null,
      errorMessage: error || null,
    };

    const [searchRecord] = await db
      .insert(searchHistory)
      .values(searchHistoryData)
      .returning();
    
    console.log(`Created search history record for: "${searchInput}" with result: ${!!product}`);
    return searchRecord;
  }
}

export const storage = new DatabaseStorage();
