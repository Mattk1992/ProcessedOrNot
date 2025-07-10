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
  type InsertBlogPost
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
}

export const storage = new DatabaseStorage();
