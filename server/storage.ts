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
  type InsertUserSetting,
  media,
  type Media,
  type InsertMedia,
  notifications,
  type Notification,
  type InsertNotification,
  blogPosts,
  type BlogPost,
  type InsertBlogPost,
  diaryEntries,
  type DiaryEntry,
  type InsertDiaryEntry,
  userGoals,
  type UserGoals,
  type InsertUserGoals,
  userProfiles,
  type UserProfile,
  type InsertUserProfile,
  weightEntries,
  type WeightEntry,
  type InsertWeightEntry,
  productDatabases,
  type ProductDatabase,
  type InsertProductDatabase,
  deviceIdentifiers,
  type DeviceIdentifier,
  type InsertDeviceIdentifier
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, or, and, isNull, isNotNull } from "drizzle-orm";
import { hashPassword, verifyPassword, generateEmailVerificationToken, generatePasswordResetToken, sanitizeUser, generateSearchId } from "./lib/auth";
import { encryptPII, decryptPII, encryptEmail, decryptEmail, hashForSearch, encryptSearchData, decryptSearchData } from "./lib/encryption";

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

  // Media storage methods
  getMediaById(id: number): Promise<Media | undefined>;
  getMediaByFilename(filename: string): Promise<Media | undefined>;
  createMedia(media: InsertMedia): Promise<Media>;
  updateMedia(id: number, updates: Partial<InsertMedia>): Promise<Media | undefined>;
  deleteMedia(id: number): Promise<boolean>;
  getMediaByUser(userId: number): Promise<Media[]>;
  getPublicMedia(): Promise<Media[]>;
  getMediaByType(mediaType: string): Promise<Media[]>;
  getMediaByTags(tags: string[]): Promise<Media[]>;

  // Notification methods
  getNotificationById(id: number): Promise<Notification | undefined>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  getUnreadNotificationsByUser(userId: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markNotificationAsUnread(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  archiveNotification(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  deleteAllNotifications(userId: number): Promise<void>;

  // Blog post methods
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPostsByAuthor(authorId: number): Promise<BlogPost[]>;
  getBlogPostsByTag(tag: string): Promise<BlogPost[]>;
  createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  incrementViewCount(id: number): Promise<void>;
  searchBlogPosts(query: string): Promise<BlogPost[]>;

  // Nutrition tracking methods
  // Diary entries
  createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry>;
  updateDiaryEntry(id: number, updates: Partial<InsertDiaryEntry>): Promise<DiaryEntry | undefined>;
  deleteDiaryEntry(id: number): Promise<boolean>;
  getDiaryEntriesByUser(userId: number): Promise<DiaryEntry[]>;
  getDiaryEntriesByUserAndDate(userId: number, date: string): Promise<DiaryEntry[]>;
  getRecentDiaryEntries(userId: number, limit: number): Promise<DiaryEntry[]>;

  // User goals
  createUserGoals(goals: InsertUserGoals): Promise<UserGoals>;
  updateUserGoals(userId: number, updates: Partial<InsertUserGoals>): Promise<UserGoals | undefined>;
  getUserGoals(userId: number): Promise<UserGoals | undefined>;

  // User profiles
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, updates: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  getUserProfile(userId: number): Promise<UserProfile | undefined>;

  // Weight entries
  createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry>;
  getWeightEntriesByUser(userId: number): Promise<WeightEntry[]>;
  getRecentWeightEntries(userId: number, limit: number): Promise<WeightEntry[]>;

  // Nutrition analytics
  getDailyNutritionProgress(userId: number, date: string): Promise<{
    calories: number;
    fat: number;
    carbs: number;
    proteins: number;
    salt: number;
    fiber: number;
    averageProcessingScore: number;
    entriesCount: number;
  }>;

  // Product Database Management methods
  getAllProductDatabases(): Promise<ProductDatabase[]>;
  getProductDatabaseById(id: number): Promise<ProductDatabase | undefined>;
  getProductDatabaseByName(databaseName: string): Promise<ProductDatabase | undefined>;
  createProductDatabase(database: InsertProductDatabase): Promise<ProductDatabase>;
  updateProductDatabase(id: number, updates: Partial<InsertProductDatabase>): Promise<ProductDatabase | undefined>;
  deleteProductDatabase(id: number): Promise<boolean>;
  reorderProductDatabases(databases: Array<{ id: number; priority: number }>): Promise<ProductDatabase[]>;
  testProductDatabase(id: number, testBarcode: string): Promise<any>;
  testAllProductDatabases(testBarcode: string): Promise<any[]>;
  initializeDefaultProductDatabases(): Promise<ProductDatabase[]>;

  // Device Identifier methods
  logDeviceIdentifier(deviceData: any): Promise<DeviceIdentifier>;
  getDeviceIdentifierByHash(identifierHash: string): Promise<DeviceIdentifier | undefined>;
  updateDeviceLastSeen(identifierHash: string): Promise<void>;
  getDeviceAnalytics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Helper method to check if data is encrypted (current format uses 32-char hex IV prefix)
  private isEncrypted(data: string): boolean {
    if (!data || data.length < 32) return false;
    // Check if the first 32 characters are hex (IV format)
    return /^[0-9a-f]{32}/i.test(data);
  }

  // Helper method to decrypt user data for display
  private decryptUserData(user: any): User {
    if (!user) return user;
    
    try {
      // Handle email decryption
      let decryptedEmail = user.email;
      if (user.email && this.isEncrypted(user.email)) {
        const decrypted = decryptEmail(user.email);
        if (decrypted) {
          decryptedEmail = decrypted;
        } else {
          console.warn(`Failed to decrypt email for user ${user.id}, using original`);
          // If decryption fails, treat as plain text
          decryptedEmail = user.email;
        }
      }

      // Handle firstName decryption  
      let decryptedFirstName = user.firstName;
      if (user.firstName && this.isEncrypted(user.firstName)) {
        const decrypted = decryptPII(user.firstName);
        if (decrypted) {
          decryptedFirstName = decrypted;
        } else {
          console.warn(`Failed to decrypt firstName for user ${user.id}, using original`);
          decryptedFirstName = user.firstName;
        }
      }

      // Handle lastName decryption
      let decryptedLastName = user.lastName;
      if (user.lastName && this.isEncrypted(user.lastName)) {
        const decrypted = decryptPII(user.lastName);
        if (decrypted) {
          decryptedLastName = decrypted;
        } else {
          console.warn(`Failed to decrypt lastName for user ${user.id}, using original`);
          decryptedLastName = user.lastName;
        }
      }

      return {
        ...user,
        email: decryptedEmail,
        firstName: decryptedFirstName,
        lastName: decryptedLastName,
      };
    } catch (error) {
      console.error('Error decrypting user data:', error);
      // Return user with original data if decryption fails completely
      return {
        ...user,
        email: user.email || `user${user.id}@example.com`,
        firstName: user.firstName || `User${user.id}`,
        lastName: user.lastName || `LastName${user.id}`,
      };
    }
  }

  // User authentication methods
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ? this.decryptUserData(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user ? this.decryptUserData(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const emailHash = hashForSearch(email);
    const [user] = await db.select().from(users).where(eq(users.emailHash, emailHash));
    return user ? this.decryptUserData(user) : undefined;
  }

  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined> {
    // Try by username first
    let [user] = await db.select().from(users).where(eq(users.username, usernameOrEmail));
    
    // If not found, try by email hash
    if (!user && usernameOrEmail.includes('@')) {
      const emailHash = hashForSearch(usernameOrEmail);
      [user] = await db.select().from(users).where(eq(users.emailHash, emailHash));
    }
    
    return user ? this.decryptUserData(user) : undefined;
  }

  async createUser(registerUser: RegisterUser): Promise<User> {
    const hashedPassword = await hashPassword(registerUser.password);
    const emailVerificationToken = generateEmailVerificationToken();
    
    // Encrypt sensitive user data
    const encryptedEmail = encryptEmail(registerUser.email);
    const emailHash = hashForSearch(registerUser.email);
    const encryptedFirstName = encryptPII(registerUser.firstName);
    const encryptedLastName = encryptPII(registerUser.lastName);
    
    const [user] = await db
      .insert(users)
      .values({
        username: registerUser.username,
        email: encryptedEmail,
        emailHash: emailHash,
        passwordHash: hashedPassword,
        firstName: encryptedFirstName,
        lastName: encryptedLastName,
        emailVerificationToken,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    return this.decryptUserData(user);
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
    const encryptedSearchInput = encryptSearchData(searchInput);
    const [searchRecord] = await db
      .select()
      .from(searchHistory)
      .where(eq(searchHistory.searchInput, encryptedSearchInput))
      .orderBy(desc(searchHistory.createdAt))
      .limit(1);
    
    if (!searchRecord) return undefined;
    
    // Decrypt for return
    return {
      ...searchRecord,
      searchInput: decryptSearchData(searchRecord.searchInput)
    };
  }

  async getAllSearchHistory(): Promise<SearchHistory[]> {
    const records = await db
      .select()
      .from(searchHistory)
      .orderBy(desc(searchHistory.createdAt));
    
    // Decrypt search inputs for display
    return records.map(record => ({
      ...record,
      searchInput: record.searchInput ? decryptSearchData(record.searchInput) : record.searchInput
    }));
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
    lookupSource?: string,
    userId?: number
  ): Promise<SearchHistory> {
    // Check for duplicate search input first
    const existingSearch = await this.getSearchHistoryByInput(searchInput);
    if (existingSearch) {
      console.log(`Duplicate search input detected: "${searchInput}". Skipping database save.`);
      return existingSearch;
    }

    // Generate unique search ID
    const searchId = generateSearchId();

    // Encrypt sensitive search data
    const encryptedSearchInput = encryptSearchData(searchInput);
    
    // Prepare search history data
    const searchHistoryData: InsertSearchHistory = {
      searchId,
      searchInput: encryptedSearchInput,
      searchInputType,
      userId: userId || null,
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
    return (result.rowCount || 0) > 0;
  }

  async initializeDefaultSettings(): Promise<void> {
    const defaultSettings: InsertAdminSetting[] = [
      {
        settingKey: 'camera_timeout',
        settingValue: '40',
        settingType: 'integer',
        description: 'Number of seconds before the barcode camera times out',
        category: 'search_engine'
      },
      {
        settingKey: 'default_ai_provider',
        settingValue: 'ChatGPT',
        settingType: 'select',
        description: 'Default AI provider for product analysis and nutrition insights',
        category: 'ai_settings'
      },
      {
        settingKey: 'tutorial_overlay_enabled',
        settingValue: 'false',
        settingType: 'boolean',
        description: 'Enable or disable the tutorial overlay for new users',
        category: 'user_interface'
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

  // Media storage methods
  async getMediaById(id: number): Promise<Media | undefined> {
    const [mediaFile] = await db.select().from(media).where(eq(media.id, id));
    return mediaFile || undefined;
  }

  async getMediaByFilename(filename: string): Promise<Media | undefined> {
    const [mediaFile] = await db.select().from(media).where(eq(media.filename, filename));
    return mediaFile || undefined;
  }

  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const [mediaFile] = await db
      .insert(media)
      .values({
        ...insertMedia,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return mediaFile;
  }

  async updateMedia(id: number, updates: Partial<InsertMedia>): Promise<Media | undefined> {
    const [updatedMedia] = await db
      .update(media)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(media.id, id))
      .returning();
    return updatedMedia || undefined;
  }

  async deleteMedia(id: number): Promise<boolean> {
    const result = await db.delete(media).where(eq(media.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getMediaByUser(userId: number): Promise<Media[]> {
    return await db.select().from(media)
      .where(eq(media.uploadedBy, userId))
      .orderBy(desc(media.createdAt));
  }

  async getPublicMedia(): Promise<Media[]> {
    return await db.select().from(media)
      .where(and(eq(media.isPublic, true), eq(media.isActive, true)))
      .orderBy(desc(media.createdAt));
  }

  async getMediaByType(mediaType: string): Promise<Media[]> {
    return await db.select().from(media)
      .where(and(eq(media.mediaType, mediaType), eq(media.isActive, true)))
      .orderBy(desc(media.createdAt));
  }

  async getMediaByTags(tags: string[]): Promise<Media[]> {
    return await db.select().from(media)
      .where(and(
        sql`tags && ${tags}`, // PostgreSQL array overlap operator
        eq(media.isActive, true)
      ))
      .orderBy(desc(media.createdAt));
  }

  // Notification methods
  async getNotificationById(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification || undefined;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isArchived, false)))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationsByUser(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false),
        eq(notifications.isArchived, false)
      ))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const [result] = await db.select({ count: sql`count(*)` }).from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false),
        eq(notifications.isArchived, false)
      ));
    return Number(result.count);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values({
        ...insertNotification,
        createdAt: new Date()
      })
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ 
        isRead: true,
        readAt: new Date()
      })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification || undefined;
  }

  async markNotificationAsUnread(id: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ 
        isRead: false,
        readAt: null
      })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification || undefined;
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ 
        isRead: true,
        readAt: new Date()
      })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
  }

  async archiveNotification(id: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ 
        isArchived: true
      })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification || undefined;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id));
    return (result.rowCount || 0) > 0;
  }

  async deleteAllNotifications(userId: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.userId, userId));
  }

  // Blog post methods
  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    const [blogPost] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return blogPost || undefined;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [blogPost] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return blogPost || undefined;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts)
      .orderBy(desc(blogPosts.publishedAt));
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async getBlogPostsByAuthor(authorId: number): Promise<BlogPost[]> {
    return await db.select().from(blogPosts)
      .where(eq(blogPosts.authorId, authorId))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
    return await db.select().from(blogPosts)
      .where(and(
        sql`tags && ${[tag]}`, // PostgreSQL array overlap operator
        eq(blogPosts.isPublished, true)
      ))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost> {
    // Generate slug from title if not provided
    const slug = insertBlogPost.slug || this.generateSlug(insertBlogPost.title);
    
    // Calculate reading time (average 200 words per minute)
    const wordCount = insertBlogPost.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    
    // Generate excerpt if not provided
    const excerpt = insertBlogPost.excerpt || this.generateExcerpt(insertBlogPost.content);

    const [blogPost] = await db
      .insert(blogPosts)
      .values({
        ...insertBlogPost,
        slug,
        readTime,
        excerpt,
        publishedAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return blogPost;
  }

  async updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    // Update slug if title changed
    if (updates.title && !updates.slug) {
      updates.slug = this.generateSlug(updates.title);
    }
    
    // Recalculate reading time if content changed
    if (updates.content) {
      const wordCount = updates.content.split(/\s+/).length;
      updates.readTime = Math.ceil(wordCount / 200);
      
      // Update excerpt if not provided
      if (!updates.excerpt) {
        updates.excerpt = this.generateExcerpt(updates.content);
      }
    }

    const [updatedBlogPost] = await db
      .update(blogPosts)
      .set({ 
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedBlogPost || undefined;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async incrementViewCount(id: number): Promise<void> {
    await db
      .update(blogPosts)
      .set({
        viewCount: sql`${blogPosts.viewCount} + 1`
      })
      .where(eq(blogPosts.id, id));
  }

  async searchBlogPosts(query: string): Promise<BlogPost[]> {
    const searchQuery = `%${query}%`;
    return await db.select().from(blogPosts)
      .where(and(
        or(
          sql`${blogPosts.title} ILIKE ${searchQuery}`,
          sql`${blogPosts.content} ILIKE ${searchQuery}`,
          sql`${blogPosts.author} ILIKE ${searchQuery}`,
          sql`array_to_string(${blogPosts.tags}, ' ') ILIKE ${searchQuery}`
        ),
        eq(blogPosts.isPublished, true)
      ))
      .orderBy(desc(blogPosts.publishedAt));
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 100);
  }

  private generateExcerpt(content: string): string {
    const plainText = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText;
  }

  // Nutrition tracking implementations
  async createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry> {
    const [created] = await db.insert(diaryEntries).values(entry).returning();
    return created;
  }

  async updateDiaryEntry(id: number, updates: Partial<InsertDiaryEntry>): Promise<DiaryEntry | undefined> {
    const [updated] = await db
      .update(diaryEntries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(diaryEntries.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDiaryEntry(id: number): Promise<boolean> {
    const result = await db.delete(diaryEntries).where(eq(diaryEntries.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getDiaryEntriesByUser(userId: number): Promise<DiaryEntry[]> {
    return await db.select().from(diaryEntries)
      .where(eq(diaryEntries.userId, userId))
      .orderBy(desc(diaryEntries.consumedAt));
  }

  async getDiaryEntriesByUserAndDate(userId: number, date: string): Promise<DiaryEntry[]> {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    return await db.select().from(diaryEntries)
      .where(and(
        eq(diaryEntries.userId, userId),
        sql`${diaryEntries.consumedAt} >= ${startDate}`,
        sql`${diaryEntries.consumedAt} < ${endDate}`
      ))
      .orderBy(diaryEntries.consumedAt);
  }

  async getRecentDiaryEntries(userId: number, limit: number): Promise<DiaryEntry[]> {
    return await db.select().from(diaryEntries)
      .where(eq(diaryEntries.userId, userId))
      .orderBy(desc(diaryEntries.consumedAt))
      .limit(limit);
  }

  async createUserGoals(goals: InsertUserGoals): Promise<UserGoals> {
    const [created] = await db.insert(userGoals).values(goals).returning();
    return created;
  }

  async updateUserGoals(userId: number, updates: Partial<InsertUserGoals>): Promise<UserGoals | undefined> {
    const [updated] = await db
      .update(userGoals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userGoals.userId, userId))
      .returning();
    return updated || undefined;
  }

  async getUserGoals(userId: number): Promise<UserGoals | undefined> {
    const [goals] = await db.select().from(userGoals)
      .where(eq(userGoals.userId, userId))
      .limit(1);
    return goals || undefined;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [created] = await db.insert(userProfiles).values(profile).returning();
    return created;
  }

  async updateUserProfile(userId: number, updates: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [updated] = await db
      .update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated || undefined;
  }

  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    return profile || undefined;
  }

  async createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry> {
    const [created] = await db.insert(weightEntries).values(entry).returning();
    return created;
  }

  async getWeightEntriesByUser(userId: number): Promise<WeightEntry[]> {
    return await db.select().from(weightEntries)
      .where(eq(weightEntries.userId, userId))
      .orderBy(desc(weightEntries.recordedAt));
  }

  async getRecentWeightEntries(userId: number, limit: number): Promise<WeightEntry[]> {
    return await db.select().from(weightEntries)
      .where(eq(weightEntries.userId, userId))
      .orderBy(desc(weightEntries.recordedAt))
      .limit(limit);
  }

  async getDailyNutritionProgress(userId: number, date: string): Promise<{
    calories: number;
    fat: number;
    carbs: number;
    proteins: number;
    salt: number;
    fiber: number;
    averageProcessingScore: number;
    entriesCount: number;
  }> {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    const entries = await db.select().from(diaryEntries)
      .where(and(
        eq(diaryEntries.userId, userId),
        sql`${diaryEntries.consumedAt} >= ${startDate}`,
        sql`${diaryEntries.consumedAt} < ${endDate}`
      ));

    let calories = 0, fat = 0, carbs = 0, proteins = 0, salt = 0, fiber = 0;
    let totalProcessingScore = 0, processingEntries = 0;

    for (const entry of entries) {
      const serving = entry.servingSize || 1;
      calories += (entry.calories || 0) * serving;
      fat += (entry.fat || 0) * serving;
      carbs += (entry.carbohydrates || 0) * serving;
      proteins += (entry.proteins || 0) * serving;
      salt += (entry.salt || 0) * serving;
      fiber += (entry.fiber || 0) * serving;
      
      if (entry.processingScore !== null && entry.processingScore !== undefined) {
        totalProcessingScore += entry.processingScore;
        processingEntries++;
      }
    }

    return {
      calories: Math.round(calories * 100) / 100,
      fat: Math.round(fat * 100) / 100,
      carbs: Math.round(carbs * 100) / 100,
      proteins: Math.round(proteins * 100) / 100,
      salt: Math.round(salt * 100) / 100,
      fiber: Math.round(fiber * 100) / 100,
      averageProcessingScore: processingEntries > 0 ? Math.round((totalProcessingScore / processingEntries) * 100) / 100 : 0,
      entriesCount: entries.length,
    };
  }

  // ==================== Product Database Management Methods ====================

  async getAllProductDatabases(): Promise<ProductDatabase[]> {
    return await db.select().from(productDatabases)
      .orderBy(productDatabases.priority);
  }

  async getProductDatabaseById(id: number): Promise<ProductDatabase | undefined> {
    const [database] = await db.select().from(productDatabases)
      .where(eq(productDatabases.id, id))
      .limit(1);
    return database || undefined;
  }

  async getProductDatabaseByName(databaseName: string): Promise<ProductDatabase | undefined> {
    const [database] = await db.select().from(productDatabases)
      .where(eq(productDatabases.databaseName, databaseName))
      .limit(1);
    return database || undefined;
  }

  async createProductDatabase(database: InsertProductDatabase): Promise<ProductDatabase> {
    const [created] = await db.insert(productDatabases).values({
      ...database,
      updatedAt: new Date()
    }).returning();
    return created;
  }

  async updateProductDatabase(id: number, updates: Partial<InsertProductDatabase>): Promise<ProductDatabase | undefined> {
    const [updated] = await db
      .update(productDatabases)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(productDatabases.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProductDatabase(id: number): Promise<boolean> {
    const result = await db.delete(productDatabases)
      .where(eq(productDatabases.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async reorderProductDatabases(databases: Array<{ id: number; priority: number }>): Promise<ProductDatabase[]> {
    // Update priorities in a transaction
    const updatedDatabases: ProductDatabase[] = [];
    
    for (const { id, priority } of databases) {
      const [updated] = await db
        .update(productDatabases)
        .set({ priority, updatedAt: new Date() })
        .where(eq(productDatabases.id, id))
        .returning();
      if (updated) {
        updatedDatabases.push(updated);
      }
    }
    
    // Return all databases in new order
    return await this.getAllProductDatabases();
  }

  async testProductDatabase(id: number, testBarcode: string): Promise<any> {
    const database = await this.getProductDatabaseById(id);
    if (!database) {
      throw new Error('Database not found');
    }

    // Import the specific database test function dynamically
    const startTime = Date.now();
    let result = null;
    let error = null;

    try {
      // Import the corresponding test function based on database name
      const testFunction = await this.getTestFunctionForDatabase(database.databaseName);
      result = await testFunction(testBarcode);
      
      // Update database stats
      const responseTime = Date.now() - startTime;
      const hasData = result !== null && result !== undefined;
      
      await this.updateProductDatabase(id, {
        lastTested: new Date(),
        averageResponseTime: responseTime,
        isOperational: true,
        dataFoundRate: hasData ? 100 : 0
      });

    } catch (testError: any) {
      error = testError.message;
      
      // Update database as not operational
      await this.updateProductDatabase(id, {
        lastTested: new Date(),
        isOperational: false
      });
    }

    return {
      databaseName: database.displayName,
      testBarcode,
      success: error === null,
      hasData: result !== null,
      responseTime: Date.now() - startTime,
      error,
      result: result ? 'Data found' : 'No data found'
    };
  }

  async testAllProductDatabases(testBarcode: string): Promise<any[]> {
    const databases = await this.getAllProductDatabases();
    const results = [];

    for (const database of databases.filter(db => db.isEnabled)) {
      try {
        const testResult = await this.testProductDatabase(database.id, testBarcode);
        results.push(testResult);
      } catch (error: any) {
        results.push({
          databaseName: database.displayName,
          testBarcode,
          success: false,
          hasData: false,
          error: error.message,
          result: 'Test failed'
        });
      }
    }

    return results;
  }

  private async getTestFunctionForDatabase(databaseName: string): Promise<(barcode: string) => Promise<any>> {
    // Map database names to their corresponding test functions
    const databaseMap: { [key: string]: string } = {
      'OpenFoodFacts': 'fetchProductFromOpenFoodFacts',
      'USDA_FoodData_Central': 'fetchProductFromUSDA',
      'FoodDB_CA': 'fetchProductFromFoodDBCA',
      'USDA_FDC': 'fetchProductFromUSDAFDC',
      'OpenNutrition': 'fetchProductFromOpenNutrition',
      'Nutritionix': 'fetchProductFromNutritionix',
      'Spoonacular': 'fetchProductFromSpoonacular',
      'API_Ninjas': 'fetchProductFromAPINinjas',
      'FoodData_Central_USDA': 'fetchProductFromFoodDataCentral',
      'EFSA': 'fetchProductFromEFSA',
      'Health_Canada': 'fetchProductFromHealthCanada',
      'Barcode_Spider': 'fetchProductFromBarcodeSpider',
      'EAN_Search': 'fetchProductFromEANSearch',
      'UPC_Database': 'fetchProductFromUPCDatabase'
    };

    const functionName = databaseMap[databaseName];
    if (!functionName) {
      throw new Error(`No test function found for database: ${databaseName}`);
    }

    // Dynamically import the function
    try {
      const module = await import('./lib/openfoodfacts');
      return module[functionName];
    } catch (error) {
      throw new Error(`Failed to import test function for ${databaseName}: ${error}`);
    }
  }

  async initializeDefaultProductDatabases(): Promise<ProductDatabase[]> {
    // Check if databases are already initialized
    const existingCount = await db.select({ count: sql`count(*)` }).from(productDatabases);
    if (existingCount[0]?.count && Number(existingCount[0].count) > 0) {
      return await this.getAllProductDatabases();
    }

    // Default database configurations based on the current cascading system
    const defaultDatabases: InsertProductDatabase[] = [
      {
        databaseName: 'OpenFoodFacts',
        displayName: 'OpenFoodFacts (Primary)',
        priority: 1,
        isEnabled: true,
        apiEndpoint: 'https://world.openfoodfacts.org/api/v0/product/',
        requiresApiKey: false,
        apiKeyConfigured: false,
        description: 'Global, crowd-sourced food database with comprehensive product information',
        coverage: 'Global',
        dataType: 'Nutrition, Ingredients, Processing',
        isOperational: true
      },
      {
        databaseName: 'USDA_FoodData_Central',
        displayName: 'USDA FoodData Central (Secondary)',
        priority: 2,
        isEnabled: true,
        apiEndpoint: 'https://api.nal.usda.gov/fdc/v1/',
        requiresApiKey: false,
        apiKeyConfigured: false,
        description: 'US government nutrition database',
        coverage: 'United States',
        dataType: 'Nutrition, Scientific Data',
        isOperational: true
      },
      {
        databaseName: 'FoodDB_CA',
        displayName: 'FoodDB.ca',
        priority: 3,
        isEnabled: true,
        apiEndpoint: 'https://fooddb.ca/api/v1/',
        requiresApiKey: false,
        apiKeyConfigured: false,
        description: 'Canadian food database',
        coverage: 'Canada',
        dataType: 'Nutrition, Ingredients',
        isOperational: true
      },
      {
        databaseName: 'USDA_FDC',
        displayName: 'USDA FDC',
        priority: 4,
        isEnabled: true,
        apiEndpoint: 'https://api.nal.usda.gov/fdc/v1/',
        requiresApiKey: true,
        apiKeyConfigured: false,
        description: 'USDA Food Data Central API',
        coverage: 'United States',
        dataType: 'Comprehensive Nutrition Data',
        isOperational: false
      },
      {
        databaseName: 'OpenNutrition',
        displayName: 'OpenNutrition',
        priority: 5,
        isEnabled: true,
        apiEndpoint: 'https://opennutrition.org/api/v1/',
        requiresApiKey: false,
        apiKeyConfigured: false,
        description: 'Open nutrition database',
        coverage: 'Global',
        dataType: 'Nutrition',
        isOperational: true
      },
      {
        databaseName: 'Nutritionix',
        displayName: 'Nutritionix',
        priority: 6,
        isEnabled: true,
        apiEndpoint: 'https://trackapi.nutritionix.com/v2/',
        requiresApiKey: true,
        apiKeyConfigured: false,
        description: 'Commercial nutrition API',
        coverage: 'United States',
        dataType: 'Nutrition, Brand Products',
        isOperational: false
      },
      {
        databaseName: 'Spoonacular',
        displayName: 'Spoonacular',
        priority: 7,
        isEnabled: true,
        apiEndpoint: 'https://api.spoonacular.com/',
        requiresApiKey: true,
        apiKeyConfigured: false,
        description: 'Recipe and food API',
        coverage: 'Global',
        dataType: 'Recipes, Ingredients, Nutrition',
        isOperational: false
      },
      {
        databaseName: 'API_Ninjas',
        displayName: 'API Ninjas',
        priority: 8,
        isEnabled: true,
        apiEndpoint: 'https://api.api-ninjas.com/v1/',
        requiresApiKey: true,
        apiKeyConfigured: false,
        description: 'Multi-purpose API with nutrition data',
        coverage: 'Global',
        dataType: 'Nutrition',
        isOperational: false
      },
      {
        databaseName: 'FoodData_Central_USDA',
        displayName: 'FoodData Central (USDA)',
        priority: 9,
        isEnabled: true,
        apiEndpoint: 'https://api.nal.usda.gov/fdc/v1/',
        requiresApiKey: false,
        apiKeyConfigured: false,
        description: 'USDA comprehensive food data',
        coverage: 'United States',
        dataType: 'Scientific Nutrition Data',
        isOperational: true
      },
      {
        databaseName: 'EFSA',
        displayName: 'EFSA',
        priority: 10,
        isEnabled: true,
        apiEndpoint: 'https://www.efsa.europa.eu/api/',
        requiresApiKey: false,
        apiKeyConfigured: false,
        description: 'European Food Safety Authority',
        coverage: 'Europe',
        dataType: 'Safety, Nutrition',
        isOperational: true
      },
      {
        databaseName: 'Health_Canada',
        displayName: 'Health Canada',
        priority: 11,
        isEnabled: true,
        apiEndpoint: 'https://food-nutrition.canada.ca/api/',
        requiresApiKey: false,
        apiKeyConfigured: false,
        description: 'Health Canada Food Database',
        coverage: 'Canada',
        dataType: 'Nutrition, Regulations',
        isOperational: true
      },
      {
        databaseName: 'Barcode_Spider',
        displayName: 'Barcode Spider',
        priority: 12,
        isEnabled: true,
        apiEndpoint: 'https://api.barcodespider.com/v1/',
        requiresApiKey: false,
        apiKeyConfigured: false,
        description: 'Barcode lookup service',
        coverage: 'Global',
        dataType: 'Product Information',
        isOperational: true
      },
      {
        databaseName: 'EAN_Search',
        displayName: 'EAN Search',
        priority: 13,
        isEnabled: true,
        apiEndpoint: 'https://api.ean-search.org/',
        requiresApiKey: false,
        apiKeyConfigured: false,
        description: 'EAN barcode search',
        coverage: 'Global',
        dataType: 'Product Identification',
        isOperational: true
      },
      {
        databaseName: 'UPC_Database',
        displayName: 'UPC Database',
        priority: 14,
        isEnabled: true,
        apiEndpoint: 'https://api.upcitemdb.com/prod/trial/',
        requiresApiKey: false,
        apiKeyConfigured: false,
        description: 'UPC barcode database',
        coverage: 'Global',
        dataType: 'Product Information',
        isOperational: true
      }
    ];

    // Insert all default databases
    const createdDatabases = await db.insert(productDatabases)
      .values(defaultDatabases)
      .returning();

    return createdDatabases;
  }

  // ==================== Device Identifier Methods ====================

  async logDeviceIdentifier(deviceData: any): Promise<DeviceIdentifier> {
    try {
      // Create a hash from device/browser information
      const identifierString = `${deviceData.userAgent || ''}-${deviceData.screenResolution || ''}-${deviceData.timezone || ''}`;
      const identifierHash = hashForSearch(identifierString);

      // Check if device already exists
      const existing = await this.getDeviceIdentifierByHash(identifierHash);
      
      if (existing) {
        // Update last seen and increment visit count
        const [updated] = await db
          .update(deviceIdentifiers)
          .set({ 
            lastSeen: new Date(),
            visitCount: sql`${deviceIdentifiers.visitCount} + 1`
          })
          .where(eq(deviceIdentifiers.identifierHash, identifierHash))
          .returning();
        return updated;
      } else {
        // Create new device record
        const encryptedData = {
          identifierHash,
          identifierType: deviceData.identifierType || 'browser',
          platform: deviceData.platform || 'web',
          browserInfo: deviceData.userAgent ? encryptPII(deviceData.userAgent) : null,
          deviceInfo: deviceData.deviceInfo ? encryptPII(JSON.stringify(deviceData.deviceInfo)) : null,
          screenResolution: deviceData.screenResolution || null,
          timezone: deviceData.timezone || null,
          language: deviceData.language || null,
          visitCount: 1,
          isActive: true
        };

        const [created] = await db.insert(deviceIdentifiers)
          .values(encryptedData)
          .returning();
        return created;
      }
    } catch (error) {
      console.error('Error logging device identifier:', error);
      throw error;
    }
  }

  async getDeviceIdentifierByHash(identifierHash: string): Promise<DeviceIdentifier | undefined> {
    const [device] = await db.select().from(deviceIdentifiers)
      .where(eq(deviceIdentifiers.identifierHash, identifierHash))
      .limit(1);
    return device || undefined;
  }

  async updateDeviceLastSeen(identifierHash: string): Promise<void> {
    await db
      .update(deviceIdentifiers)
      .set({ lastSeen: new Date() })
      .where(eq(deviceIdentifiers.identifierHash, identifierHash));
  }

  async getDeviceAnalytics(): Promise<any> {
    const totalDevices = await db.select({ count: sql`count(*)` }).from(deviceIdentifiers);
    const activeDevices = await db.select({ count: sql`count(*)` })
      .from(deviceIdentifiers)
      .where(eq(deviceIdentifiers.isActive, true));
    
    const platformStats = await db.select({
      platform: deviceIdentifiers.platform,
      count: sql`count(*)`
    })
    .from(deviceIdentifiers)
    .groupBy(deviceIdentifiers.platform);

    const recentDevices = await db.select({ count: sql`count(*)` })
      .from(deviceIdentifiers)
      .where(sql`${deviceIdentifiers.firstSeen} >= NOW() - INTERVAL '7 days'`);

    return {
      totalDevices: Number(totalDevices[0]?.count || 0),
      activeDevices: Number(activeDevices[0]?.count || 0),
      recentDevices: Number(recentDevices[0]?.count || 0),
      platformStats: platformStats.map(stat => ({
        platform: stat.platform,
        count: Number(stat.count)
      }))
    };
  }
}

export const storage = new DatabaseStorage();
