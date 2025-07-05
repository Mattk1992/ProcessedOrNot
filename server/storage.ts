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
  type InsertSearchHistory,
  adminSettings,
  type AdminSetting,
  type InsertAdminSetting,
  userSettings,
  type UserSetting,
  type InsertUserSetting
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
  
  // Account type management methods
  updateUserAccountType(userId: number, accountType: string): Promise<User | undefined>;
  getUsersByAccountType(accountType: string): Promise<User[]>;
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
  clearAllSearchHistory(): Promise<void>;
  removeDuplicateSearchHistory(): Promise<{ removedCount: number; message: string }>;

  // Admin settings methods
  getAdminSetting(settingKey: string): Promise<AdminSetting | undefined>;
  getAllAdminSettings(): Promise<AdminSetting[]>;
  getAdminSettingsByCategory(category: string): Promise<AdminSetting[]>;
  createAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting>;
  updateAdminSetting(settingKey: string, settingValue: string): Promise<AdminSetting | undefined>;
  deleteAdminSetting(settingKey: string): Promise<boolean>;
  initializeDefaultSettings(): Promise<void>;

  // User settings methods
  getUserSetting(userId: number, settingKey: string): Promise<UserSetting | undefined>;
  getUserSettings(userId: number): Promise<UserSetting[]>;
  createUserSetting(setting: InsertUserSetting): Promise<UserSetting>;
  updateUserSetting(userId: number, settingKey: string, settingValue: string): Promise<UserSetting | undefined>;
  deleteUserSetting(userId: number, settingKey: string): Promise<boolean>;
  upsertUserSetting(userId: number, settingKey: string, settingValue: string): Promise<UserSetting>;
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
    
    return (result.rowCount ?? 0) > 0;
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
    
    return (result.rowCount ?? 0) > 0;
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
    
    return (result.rowCount ?? 0) > 0;
  }

  // Legacy methods for backwards compatibility
  async getUser(id: number): Promise<User | undefined> {
    return this.getUserById(id);
  }

  // Account type management methods
  async updateUserAccountType(userId: number, accountType: string): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ accountType, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      
      return updatedUser ? sanitizeUser(updatedUser) : undefined;
    } catch (error) {
      console.error("Error updating user account type:", error);
      return undefined;
    }
  }

  async getUsersByAccountType(accountType: string): Promise<User[]> {
    try {
      const userList = await db
        .select()
        .from(users)
        .where(eq(users.accountType, accountType))
        .orderBy(users.createdAt);
      
      return userList.map(sanitizeUser);
    } catch (error) {
      console.error("Error fetching users by account type:", error);
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

      const adminUsersResult = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.accountType, 'Admin'));
      const adminUsers = Number(adminUsersResult[0]?.count) || 0;

      const regularUsersResult = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.accountType, 'Regular'));
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

  // Admin settings methods
  async getAdminSetting(settingKey: string): Promise<AdminSetting | undefined> {
    const [setting] = await db.select().from(adminSettings).where(eq(adminSettings.settingKey, settingKey));
    return setting || undefined;
  }

  async getAllAdminSettings(): Promise<AdminSetting[]> {
    return await db.select().from(adminSettings).orderBy(adminSettings.category, adminSettings.settingKey);
  }

  async getAdminSettingsByCategory(category: string): Promise<AdminSetting[]> {
    return await db.select().from(adminSettings)
      .where(eq(adminSettings.category, category))
      .orderBy(adminSettings.settingKey);
  }

  async createAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting> {
    const [newSetting] = await db
      .insert(adminSettings)
      .values(setting)
      .returning();
    return newSetting;
  }

  async updateAdminSetting(settingKey: string, settingValue: string): Promise<AdminSetting | undefined> {
    const [updatedSetting] = await db
      .update(adminSettings)
      .set({ 
        settingValue,
        updatedAt: new Date()
      })
      .where(eq(adminSettings.settingKey, settingKey))
      .returning();
    return updatedSetting || undefined;
  }

  async deleteAdminSetting(settingKey: string): Promise<boolean> {
    const result = await db.delete(adminSettings).where(eq(adminSettings.settingKey, settingKey));
    return (result.rowCount ?? 0) > 0;
  }

  async initializeDefaultSettings(): Promise<void> {
    const defaultSettings: InsertAdminSetting[] = [
      // Search Engine Settings
      {
        settingKey: 'camera_timeout',
        settingValue: '40',
        settingType: 'integer',
        description: 'Number of seconds before the barcode camera times out',
        category: 'search_engine'
      },
      {
        settingKey: 'barcode_scan_interval',
        settingValue: '300',
        settingType: 'integer',
        description: 'Interval in milliseconds between barcode scanning attempts',
        category: 'search_engine'
      },
      {
        settingKey: 'max_search_results',
        settingValue: '50',
        settingType: 'integer',
        description: 'Maximum number of search results to return in admin panel',
        category: 'search_engine'
      },
      {
        settingKey: 'enable_fallback_databases',
        settingValue: 'true',
        settingType: 'boolean',
        description: 'Enable fallback to secondary food databases when primary lookup fails',
        category: 'search_engine'
      },
      
      // AI Settings
      {
        settingKey: 'default_ai_provider',
        settingValue: 'OpenAI',
        settingType: 'select',
        description: 'Default AI provider for product analysis and nutrition insights',
        category: 'ai_settings'
      },
      {
        settingKey: 'ai_analysis_timeout',
        settingValue: '30000',
        settingType: 'integer',
        description: 'Timeout in milliseconds for AI analysis requests',
        category: 'ai_settings'
      },
      {
        settingKey: 'enable_nutribot_chat',
        settingValue: 'true',
        settingType: 'boolean',
        description: 'Enable the NutriBot chat functionality for users',
        category: 'ai_settings'
      },
      {
        settingKey: 'default_analysis_language',
        settingValue: 'en',
        settingType: 'select',
        description: 'Default language for AI analysis when user language is not detected',
        category: 'ai_settings'
      },
      
      // User Interface Settings
      {
        settingKey: 'tutorial_overlay_enabled',
        settingValue: 'false',
        settingType: 'boolean',
        description: 'Enable or disable the tutorial overlay for new users',
        category: 'user_interface'
      },
      {
        settingKey: 'dark_mode_default',
        settingValue: 'system',
        settingType: 'select',
        description: 'Default theme setting for new users (light, dark, system)',
        category: 'user_interface'
      },
      {
        settingKey: 'camera_auto_focus',
        settingValue: 'true',
        settingType: 'boolean',
        description: 'Enable automatic focus for barcode scanning camera',
        category: 'user_interface'
      },
      {
        settingKey: 'search_history_retention_days',
        settingValue: '90',
        settingType: 'integer',
        description: 'Number of days to retain search history data',
        category: 'user_interface'
      },
      
      // Security & Privacy Settings
      {
        settingKey: 'session_timeout_hours',
        settingValue: '24',
        settingType: 'integer',
        description: 'User session timeout in hours',
        category: 'security'
      },
      {
        settingKey: 'max_login_attempts',
        settingValue: '5',
        settingType: 'integer',
        description: 'Maximum login attempts before account lockout',
        category: 'security'
      },
      {
        settingKey: 'require_email_verification',
        settingValue: 'true',
        settingType: 'boolean',
        description: 'Require email verification for new user accounts',
        category: 'security'
      },
      {
        settingKey: 'data_retention_policy_days',
        settingValue: '365',
        settingType: 'integer',
        description: 'Number of days to retain user data and search history',
        category: 'security'
      },
      
      // Performance Settings
      {
        settingKey: 'cache_ttl_seconds',
        settingValue: '3600',
        settingType: 'integer',
        description: 'Time-to-live for cached product data in seconds',
        category: 'performance'
      },
      {
        settingKey: 'enable_database_optimizations',
        settingValue: 'true',
        settingType: 'boolean',
        description: 'Enable database query optimizations and indexing',
        category: 'performance'
      },
      {
        settingKey: 'max_concurrent_ai_requests',
        settingValue: '10',
        settingType: 'integer',
        description: 'Maximum number of concurrent AI analysis requests',
        category: 'performance'
      }
    ];

    for (const setting of defaultSettings) {
      const existingSetting = await this.getAdminSetting(setting.settingKey);
      if (!existingSetting) {
        await this.createAdminSetting(setting);
      }
    }
  }

  // User settings methods
  async getUserSetting(userId: number, settingKey: string): Promise<UserSetting | undefined> {
    const [setting] = await db.select().from(userSettings)
      .where(and(eq(userSettings.userId, userId), eq(userSettings.settingKey, settingKey)));
    return setting || undefined;
  }

  async getUserSettings(userId: number): Promise<UserSetting[]> {
    return await db.select().from(userSettings)
      .where(eq(userSettings.userId, userId))
      .orderBy(userSettings.settingKey);
  }

  async createUserSetting(setting: InsertUserSetting): Promise<UserSetting> {
    const [newSetting] = await db
      .insert(userSettings)
      .values(setting)
      .returning();
    return newSetting;
  }

  async updateUserSetting(userId: number, settingKey: string, settingValue: string): Promise<UserSetting | undefined> {
    const [updatedSetting] = await db
      .update(userSettings)
      .set({ 
        settingValue,
        updatedAt: new Date()
      })
      .where(and(eq(userSettings.userId, userId), eq(userSettings.settingKey, settingKey)))
      .returning();
    return updatedSetting || undefined;
  }

  async deleteUserSetting(userId: number, settingKey: string): Promise<boolean> {
    const result = await db.delete(userSettings)
      .where(and(eq(userSettings.userId, userId), eq(userSettings.settingKey, settingKey)));
    return (result.rowCount || 0) > 0;
  }

  async upsertUserSetting(userId: number, settingKey: string, settingValue: string): Promise<UserSetting> {
    // Try to update first
    const updated = await this.updateUserSetting(userId, settingKey, settingValue);
    if (updated) {
      return updated;
    }
    
    // If no update, create new
    return await this.createUserSetting({
      userId,
      settingKey,
      settingValue
    });
  }

  async clearAllSearchHistory(): Promise<void> {
    await db.delete(searchHistory);
  }

  async removeDuplicateSearchHistory(): Promise<{ removedCount: number; message: string }> {
    try {
      // First, get all unique search inputs with their earliest entries
      const uniqueEntries = await db
        .select({
          searchInput: searchHistory.searchInput,
          minId: sql<number>`MIN(${searchHistory.id})`.as('minId')
        })
        .from(searchHistory)
        .groupBy(searchHistory.searchInput);

      // Get all IDs of entries to keep (the earliest entry for each unique search input)
      const idsToKeep = uniqueEntries.map(entry => entry.minId);

      // Count how many duplicates we'll remove
      const duplicateCountResult = await db
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(searchHistory)
        .where(sql`${searchHistory.id} NOT IN (${sql.join(idsToKeep.map(id => sql`${id}`), sql`, `)})`);

      const duplicateCount = duplicateCountResult[0]?.count || 0;

      if (duplicateCount === 0) {
        return {
          removedCount: 0,
          message: "No duplicate entries found in search history"
        };
      }

      // Delete all entries except the ones we want to keep
      const deleteResult = await db
        .delete(searchHistory)
        .where(sql`${searchHistory.id} NOT IN (${sql.join(idsToKeep.map(id => sql`${id}`), sql`, `)})`);

      const removedCount = deleteResult.rowCount ?? 0;

      return {
        removedCount,
        message: `Successfully removed ${removedCount} duplicate entries from search history. Kept ${uniqueEntries.length} unique entries.`
      };

    } catch (error) {
      console.error("Error removing duplicate search history entries:", error);
      throw new Error("Failed to remove duplicate search history entries");
    }
  }
}

export const storage = new DatabaseStorage();
