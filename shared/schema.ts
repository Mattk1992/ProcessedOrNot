import { pgTable, text, serial, integer, real, jsonb, timestamp, varchar, boolean, index } from "drizzle-orm/pg-core";
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
  // Media fields for future image/video uploads
  additionalImages: text("additional_images").array(), // URLs to additional product images
  videoUrl: text("video_url"), // URL to product video
  mediaGallery: jsonb("media_gallery"), // JSON array of media IDs for comprehensive media management
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Search History table - enhanced to include encrypted search result data
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  searchId: varchar("search_id", { length: 255 }).notNull().unique(),
  searchInput: text("search_input").notNull(), // Encrypted search queries
  searchInputType: varchar("search_input_type", { length: 50 }).notNull(),
  userId: integer("user_id"), // Track user searches for authenticated users
  
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

// Camera Settings table - for barcode scanner camera configuration
export const cameraSettings = pgTable("camera_settings", {
  id: serial("id").primaryKey(),
  timeout: integer("timeout").notNull().default(30),
  autoStopEnabled: boolean("auto_stop_enabled").notNull().default(true),
  maxZoomLevel: real("max_zoom_level").notNull().default(3.0),
  minZoomLevel: real("min_zoom_level").notNull().default(1.0),
  defaultZoomLevel: real("default_zoom_level").notNull().default(1.0),
  focusMode: varchar("focus_mode", { length: 50 }).notNull().default('continuous'),
  flashMode: varchar("flash_mode", { length: 50 }).notNull().default('auto'),
  scanFrequency: integer("scan_frequency").notNull().default(10),
  enableBeepSound: boolean("enable_beep_sound").notNull().default(true),
  enableVibration: boolean("enable_vibration").notNull().default(true),
  overlayOpacity: real("overlay_opacity").notNull().default(0.70),
  scanAreaSize: real("scan_area_size").notNull().default(0.60),
  optimizeForCloseRange: boolean("optimize_for_close_range").notNull().default(true),
  enhanceContrast: boolean("enhance_contrast").notNull().default(true),
  adjustBrightness: real("adjust_brightness").notNull().default(1.0),
  scanIntervalMs: integer("scan_interval_ms").notNull().default(100),
  torchEnabled: boolean("torch_enabled").notNull().default(false),
  videoConstraints: text("video_constraints").default('{}'),
  preferredCameraId: varchar("preferred_camera_id", { length: 255 }).default(''),
  enableAutoFocus: boolean("enable_auto_focus").notNull().default(true),
  qualityPreset: varchar("quality_preset", { length: 50 }).notNull().default('balanced'),
  performanceMode: varchar("performance_mode", { length: 50 }).notNull().default('balanced'),
  errorRecoveryEnabled: boolean("error_recovery_enabled").notNull().default(true),
  debugMode: boolean("debug_mode").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCameraSettingsSchema = createInsertSchema(cameraSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCameraSettings = z.infer<typeof insertCameraSettingsSchema>;
export type CameraSettings = typeof cameraSettings.$inferSelect;

// Product Database Configuration table - for managing the cascading database system
export const productDatabases = pgTable("product_databases", {
  id: serial("id").primaryKey(),
  databaseName: text("database_name").notNull().unique(),
  displayName: text("display_name").notNull(),
  priority: integer("priority").notNull().unique(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  apiEndpoint: text("api_endpoint"),
  requiresApiKey: boolean("requires_api_key").notNull().default(false),
  apiKeyConfigured: boolean("api_key_configured").notNull().default(false),
  description: text("description"),
  coverage: text("coverage"), // Geographic or category coverage
  dataType: text("data_type"), // Type of data provided (nutrition, barcode, etc.)
  averageResponseTime: integer("average_response_time"), // in milliseconds
  successRate: real("success_rate"), // percentage 0-100
  dataFoundRate: real("data_found_rate"), // percentage 0-100
  lastTestedAt: timestamp("last_tested_at"),
  isOperational: boolean("is_operational").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductDatabaseSchema = createInsertSchema(productDatabases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProductDatabase = z.infer<typeof insertProductDatabaseSchema>;
export type ProductDatabase = typeof productDatabases.$inferSelect;

// Device Identifier table - for logging device/browser/app identifiers
export const deviceIdentifiers = pgTable("device_identifiers", {
  id: serial("id").primaryKey(),
  identifierHash: text("identifier_hash").notNull().unique(), // Encrypted hash of device ID
  identifierType: varchar("identifier_type", { length: 50 }).notNull(), // 'browser', 'mobile_app', 'device_id'
  platform: varchar("platform", { length: 50 }), // 'web', 'ios', 'android', 'desktop'
  browserInfo: text("browser_info"), // Encrypted browser user agent info
  deviceInfo: text("device_info"), // Encrypted device information
  screenResolution: text("screen_resolution"), // Screen dimensions
  timezone: text("timezone"), // User timezone
  language: text("language"), // Preferred language
  firstSeen: timestamp("first_seen").defaultNow().notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  visitCount: integer("visit_count").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
}, (table) => ({
  identifierHashIdx: index("device_identifier_hash_idx").on(table.identifierHash),
  platformIdx: index("device_platform_idx").on(table.platform),
  lastSeenIdx: index("device_last_seen_idx").on(table.lastSeen),
}));

export const insertDeviceIdentifierSchema = createInsertSchema(deviceIdentifiers).omit({
  id: true,
  firstSeen: true,
  lastSeen: true,
});

export type InsertDeviceIdentifier = z.infer<typeof insertDeviceIdentifierSchema>;
export type DeviceIdentifier = typeof deviceIdentifiers.$inferSelect;

// Menu Items table - for managing navigation menu items
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  icon: text("icon"), // Lucide icon name
  description: text("description"),
  isVisible: boolean("is_visible").notNull().default(true),
  isAdminOnly: boolean("is_admin_only").notNull().default(false),
  order: integer("order").notNull().default(0),
  parentId: integer("parent_id"), // For nested menus - self-reference handled below
  target: text("target").notNull().default('_self'), // '_self' or '_blank'
  cssClass: text("css_class"), // Custom CSS classes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  orderIdx: index("menu_item_order_idx").on(table.order),
  visibilityIdx: index("menu_item_visibility_idx").on(table.isVisible),
  parentIdx: index("menu_item_parent_idx").on(table.parentId),
}));

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

// Website Settings table - for global website configuration
export const websiteSettings = pgTable("website_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default('ProcessedOrNot'),
  siteDescription: text("site_description"),
  siteKeywords: text("site_keywords"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: text("primary_color").notNull().default('#3b82f6'),
  secondaryColor: text("secondary_color").notNull().default('#64748b'),
  accentColor: text("accent_color").notNull().default('#f59e0b'),
  footerText: text("footer_text"),
  contactEmail: text("contact_email"),
  socialLinks: text("social_links"), // JSON string
  seoSettings: text("seo_settings"), // JSON string
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  analyticsCode: text("analytics_code"),
  customCss: text("custom_css"),
  customJs: text("custom_js"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWebsiteSettingsSchema = createInsertSchema(websiteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWebsiteSettings = z.infer<typeof insertWebsiteSettingsSchema>;
export type WebsiteSettings = typeof websiteSettings.$inferSelect;

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

// User Account System - All PII fields are encrypted
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(), // Not encrypted (used for login)
  email: text("email").notNull().unique(), // Encrypted email storage
  emailHash: varchar("email_hash", { length: 64 }).notNull().unique(), // Hash for uniqueness checks
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"), // Encrypted
  lastName: text("last_name"), // Encrypted
  accountType: varchar("account_type", { length: 20 }).notNull().default("Regular"),
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerificationToken: text("email_verification_token"), // Encrypted
  passwordResetToken: text("password_reset_token"), // Encrypted
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
  keepLoggedIn: z.boolean().optional().default(false),
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

// User Account Types
export type UserAccountType = 'Admin' | 'Regular';

// Admin Settings schema
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key").unique().notNull(),
  settingValue: text("setting_value").notNull(),
  settingType: varchar("setting_type").notNull(), // 'integer', 'string', 'boolean'
  description: text("description"),
  category: varchar("category").notNull(), // 'search_engine', 'general', etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;

// User settings table for personal preferences
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  settingKey: varchar("setting_key").notNull(),
  settingValue: text("setting_value").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSettingSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserSetting = z.infer<typeof insertUserSettingSchema>;
export type UserSetting = typeof userSettings.$inferSelect;

// Media table for storing images and videos
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(),
  fileUrl: text("file_url").notNull(),
  mediaType: varchar("media_type", { length: 50 }).notNull(), // 'image' or 'video'
  width: integer("width"),
  height: integer("height"),
  duration: integer("duration"), // for videos in seconds
  thumbnailUrl: text("thumbnail_url"), // for videos
  altText: text("alt_text"),
  caption: text("caption"),
  tags: text("tags").array(), // searchable tags
  uploadedBy: integer("uploaded_by").references(() => users.id),
  isPublic: boolean("is_public").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof media.$inferSelect;

// Speech-to-Text Settings table
export const speechSettings = pgTable("speech_settings", {
  id: serial("id").primaryKey(),
  enabled: boolean("enabled").notNull().default(true),
  apiKey: text("api_key"), // Encrypted AssemblyAI API key
  language: varchar("language", { length: 10 }).notNull().default("en"),
  autoStop: boolean("auto_stop").notNull().default(true),
  autoStopDuration: integer("auto_stop_duration").notNull().default(10),
  enhancedAccuracy: boolean("enhanced_accuracy").notNull().default(true),
  punctuation: boolean("punctuation").notNull().default(true),
  formatText: boolean("format_text").notNull().default(true),
  wordBoost: text("word_boost").array(), // Array of boosted words
  customWords: text("custom_words"), // Comma-separated custom words
  confidenceThreshold: real("confidence_threshold").notNull().default(0.5),
  maxRecordingDuration: integer("max_recording_duration").notNull().default(30),
  sampleRate: integer("sample_rate").notNull().default(16000),
  echoCancellation: boolean("echo_cancellation").notNull().default(true),
  noiseSuppression: boolean("noise_suppression").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSpeechSettingsSchema = createInsertSchema(speechSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSpeechSettings = z.infer<typeof insertSpeechSettingsSchema>;
export type SpeechSettings = typeof speechSettings.$inferSelect;

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'info', 'warning', 'success', 'error'
  title: text("title").notNull(),
  message: text("message").notNull(),
  actionUrl: text("action_url"), // Optional URL for action button
  actionText: text("action_text"), // Optional text for action button
  isRead: boolean("is_read").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  metadata: jsonb("metadata"), // Additional data for the notification
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  tags: text("tags").array(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  slug: varchar("slug", { length: 500 }).unique(),
  excerpt: text("excerpt"),
  readTime: integer("read_time"), // estimated reading time in minutes
  viewCount: integer("view_count").default(0).notNull(),
  authorId: integer("author_id").references(() => users.id),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  publishedAt: true,
  updatedAt: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Nutrition Diary Entry table
export const diaryEntries = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  productBarcode: text("product_barcode"),
  productName: text("product_name").notNull(),
  productBrands: text("product_brands"),
  productImageUrl: text("product_image_url"),
  servingSize: real("serving_size").default(1).notNull(), // multiplier for nutrition values
  servingUnit: varchar("serving_unit", { length: 50 }).default("serving").notNull(),
  calories: real("calories"),
  fat: real("fat"),
  saturatedFat: real("saturated_fat"),
  carbohydrates: real("carbohydrates"),
  sugars: real("sugars"),
  proteins: real("proteins"),
  salt: real("salt"),
  fiber: real("fiber"),
  processingScore: integer("processing_score"),
  processingExplanation: text("processing_explanation"),
  glycemicIndex: integer("glycemic_index"),
  glycemicLoad: integer("glycemic_load"),
  mealType: varchar("meal_type", { length: 20 }).notNull(), // 'breakfast', 'lunch', 'dinner', 'snack'
  consumedAt: timestamp("consumed_at").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("diary_user_id_idx").on(table.userId),
  consumedAtIdx: index("diary_consumed_at_idx").on(table.consumedAt),
}));

export const insertDiaryEntrySchema = createInsertSchema(diaryEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDiaryEntry = z.infer<typeof insertDiaryEntrySchema>;
export type DiaryEntry = typeof diaryEntries.$inferSelect;

// User Goals table
export const userGoals = pgTable("user_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  dailyCalories: integer("daily_calories").default(2000),
  dailyFat: real("daily_fat").default(65),
  dailyCarbs: real("daily_carbs").default(300),
  dailyProteins: real("daily_proteins").default(50),
  dailySalt: real("daily_salt").default(6),
  dailyFiber: real("daily_fiber").default(25),
  maxProcessingScore: integer("max_processing_score").default(5), // Target max processing score
  activityLevel: varchar("activity_level", { length: 20 }).default("moderate"), // 'sedentary', 'light', 'moderate', 'active', 'very_active'
  weightGoal: varchar("weight_goal", { length: 20 }).default("maintain"), // 'lose', 'maintain', 'gain'
  dietaryRestrictions: text("dietary_restrictions").array(), // ['vegetarian', 'vegan', 'gluten_free', etc.]
  healthConditions: text("health_conditions").array(), // ['diabetes', 'hypertension', etc.]
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserGoalsSchema = createInsertSchema(userGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserGoals = z.infer<typeof insertUserGoalsSchema>;
export type UserGoals = typeof userGoals.$inferSelect;

// User Profile Extended Information
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  dateOfBirth: text("date_of_birth"), // Encrypted
  gender: text("gender"), // Encrypted
  height: real("height"), // in cm
  weight: real("weight"), // in kg
  bio: text("bio"), // Encrypted
  avatarUrl: text("avatar_url"),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  units: varchar("units", { length: 10 }).default("metric"), // 'metric' or 'imperial'
  privacyLevel: varchar("privacy_level", { length: 20 }).default("public"), // 'public', 'friends', 'private'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

// Weight Tracking table
export const weightEntries = pgTable("weight_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  weight: real("weight").notNull(), // in kg
  bodyFat: real("body_fat"), // percentage
  muscleMass: real("muscle_mass"), // in kg
  notes: text("notes"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("weight_user_id_idx").on(table.userId),
  recordedAtIdx: index("weight_recorded_at_idx").on(table.recordedAt),
}));

export const insertWeightEntrySchema = createInsertSchema(weightEntries).omit({
  id: true,
  createdAt: true,
});

export type InsertWeightEntry = z.infer<typeof insertWeightEntrySchema>;
export type WeightEntry = typeof weightEntries.$inferSelect;

// In-App Purchase table for mobile app subscriptions and purchases
export const inAppPurchases = pgTable("in_app_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  
  // Purchase identification
  transactionId: varchar("transaction_id", { length: 255 }).notNull().unique(),
  originalTransactionId: varchar("original_transaction_id", { length: 255 }),
  productId: varchar("product_id", { length: 255 }).notNull(),
  
  // Store information
  store: varchar("store", { length: 50 }).notNull(), // 'app_store', 'google_play', 'web'
  storeUserId: varchar("store_user_id", { length: 255 }),
  
  // Purchase details
  purchaseType: varchar("purchase_type", { length: 50 }).notNull(), // 'subscription', 'consumable', 'non_consumable'
  status: varchar("status", { length: 50 }).notNull(), // 'pending', 'active', 'expired', 'cancelled', 'refunded', 'failed'
  priceAmount: real("price_amount"),
  priceCurrency: varchar("price_currency", { length: 10 }),
  
  // Subscription-specific fields
  subscriptionPeriod: varchar("subscription_period", { length: 50 }), // 'monthly', 'yearly', 'weekly'
  isTrialPeriod: boolean("is_trial_period").default(false),
  trialDuration: integer("trial_duration"), // in days
  autoRenewing: boolean("auto_renewing").default(true),
  
  // Timestamps
  purchaseDate: timestamp("purchase_date").notNull(),
  expirationDate: timestamp("expiration_date"),
  cancellationDate: timestamp("cancellation_date"),
  refundDate: timestamp("refund_date"),
  
  // Raw data from stores
  receiptData: text("receipt_data"), // Encrypted receipt/verification data
  verificationData: jsonb("verification_data"), // Parsed verification response
  webhookData: jsonb("webhook_data"), // Raw webhook payload
  
  // Processing
  isVerified: boolean("is_verified").default(false),
  verificationAttempts: integer("verification_attempts").default(0),
  lastVerificationDate: timestamp("last_verification_date"),
  
  // Environment
  environment: varchar("environment", { length: 20 }).default("production"), // 'sandbox', 'production'
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("iap_user_id_idx").on(table.userId),
  statusIdx: index("iap_status_idx").on(table.status),
  storeIdx: index("iap_store_idx").on(table.store),
  productIdIdx: index("iap_product_id_idx").on(table.productId),
}));

export const insertInAppPurchaseSchema = createInsertSchema(inAppPurchases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInAppPurchase = z.infer<typeof insertInAppPurchaseSchema>;
export type InAppPurchase = typeof inAppPurchases.$inferSelect;

// Purchase status update webhook schema for validation
export const purchaseStatusUpdateSchema = z.object({
  store: z.enum(['app_store', 'google_play', 'web']),
  transactionId: z.string().min(1),
  originalTransactionId: z.string().optional(),
  productId: z.string().min(1),
  status: z.enum(['pending', 'active', 'expired', 'cancelled', 'refunded', 'failed']),
  purchaseDate: z.string().datetime(),
  expirationDate: z.string().datetime().optional(),
  cancellationDate: z.string().datetime().optional(),
  refundDate: z.string().datetime().optional(),
  priceAmount: z.number().optional(),
  priceCurrency: z.string().length(3).optional(),
  subscriptionPeriod: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  isTrialPeriod: z.boolean().default(false),
  autoRenewing: z.boolean().default(true),
  environment: z.enum(['sandbox', 'production']).default('production'),
  receiptData: z.string().optional(),
  verificationData: z.any().optional(),
  webhookData: z.any().optional(),
  userId: z.number().optional(),
  storeUserId: z.string().optional(),
});

export type PurchaseStatusUpdate = z.infer<typeof purchaseStatusUpdateSchema>;

// App Shared Secrets table for secure webhook verification and app authentication
export const appSharedSecrets = pgTable("app_shared_secrets", {
  id: serial("id").primaryKey(),
  
  // Secret identification
  secretName: varchar("secret_name", { length: 100 }).notNull().unique(),
  secretType: varchar("secret_type", { length: 50 }).notNull(), // 'webhook', 'app_auth', 'api_key', 'signing'
  
  // Secret data (encrypted)
  secretValue: text("secret_value").notNull(), // Encrypted secret
  secretHash: varchar("secret_hash", { length: 128 }).notNull().unique(), // SHA-512 hash for verification
  
  // Metadata
  description: text("description"),
  environment: varchar("environment", { length: 20 }).default("production"), // 'production', 'staging', 'development'
  scope: varchar("scope", { length: 100 }).default("global"), // 'global', 'app_store', 'google_play', 'web'
  
  // Security settings
  isActive: boolean("is_active").default(true).notNull(),
  rotationIntervalDays: integer("rotation_interval_days").default(90), // Key rotation period
  lastRotated: timestamp("last_rotated").defaultNow().notNull(),
  nextRotation: timestamp("next_rotation"),
  
  // Usage tracking
  usageCount: integer("usage_count").default(0).notNull(),
  lastUsed: timestamp("last_used"),
  
  // Audit trail
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  secretTypeIdx: index("secret_type_idx").on(table.secretType),
  environmentIdx: index("secret_environment_idx").on(table.environment),
  activeIdx: index("secret_active_idx").on(table.isActive),
}));

export const insertAppSharedSecretSchema = createInsertSchema(appSharedSecrets).omit({
  id: true,
  secretHash: true,
  usageCount: true,
  lastUsed: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAppSharedSecret = z.infer<typeof insertAppSharedSecretSchema>;
export type AppSharedSecret = typeof appSharedSecrets.$inferSelect;

// Webhook verification schema with signature validation
export const webhookVerificationSchema = z.object({
  signature: z.string().min(1),
  timestamp: z.number().or(z.string()),
  secretName: z.string().optional(),
  payload: z.any(),
});

export type WebhookVerification = z.infer<typeof webhookVerificationSchema>;

// Content Rights Management table for tracking intellectual property and licensing
export const contentRights = pgTable("content_rights", {
  id: serial("id").primaryKey(),
  
  // Content identification
  contentType: varchar("content_type", { length: 50 }).notNull(), // 'image', 'video', 'text', 'audio', 'data', 'api_response'
  contentIdentifier: text("content_identifier").notNull(), // URL, barcode, or unique ID
  contentHash: varchar("content_hash", { length: 128 }), // SHA-256 hash for verification
  
  // Rights and ownership
  copyrightOwner: text("copyright_owner"), // Primary copyright holder
  licenseType: varchar("license_type", { length: 100 }), // 'CC BY-SA', 'MIT', 'Apache 2.0', 'proprietary', etc.
  licenseUrl: text("license_url"), // Link to full license text
  copyrightNotice: text("copyright_notice"), // Complete copyright statement
  
  // Attribution requirements
  attributionRequired: boolean("attribution_required").default(false),
  attributionText: text("attribution_text"), // Required attribution text
  sourceUrl: text("source_url"), // Original source URL
  sourceApi: varchar("source_api", { length: 100 }), // API provider name
  
  // Usage permissions
  commercialUseAllowed: boolean("commercial_use_allowed").default(false),
  modificationAllowed: boolean("modification_allowed").default(false),
  redistributionAllowed: boolean("redistribution_allowed").default(false),
  derivativeWorksAllowed: boolean("derivative_works_allowed").default(false),
  
  // Legal and compliance
  rightsStatus: varchar("rights_status", { length: 50 }).default("verified"), // 'verified', 'pending', 'disputed', 'expired'
  expirationDate: timestamp("expiration_date"), // When rights expire (if applicable)
  territorialRestrictions: text("territorial_restrictions"), // Geographic restrictions
  usageRestrictions: text("usage_restrictions"), // Other usage limitations
  
  // Third-party information
  thirdPartyContent: boolean("third_party_content").default(false),
  thirdPartyRights: jsonb("third_party_rights"), // Array of third-party rights holders
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  verifiedBy: integer("verified_by").references(() => users.id), // Who verified these rights
  notes: text("notes"), // Additional legal notes
}, (table) => ({
  contentTypeIdx: index("content_type_idx").on(table.contentType),
  contentIdentifierIdx: index("content_identifier_idx").on(table.contentIdentifier),
  copyrightOwnerIdx: index("copyright_owner_idx").on(table.copyrightOwner),
  rightsStatusIdx: index("rights_status_idx").on(table.rightsStatus),
}));

export const insertContentRightsSchema = createInsertSchema(contentRights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertContentRights = z.infer<typeof insertContentRightsSchema>;
export type ContentRights = typeof contentRights.$inferSelect;

// Legal notices table for managing various legal statements
export const legalNotices = pgTable("legal_notices", {
  id: serial("id").primaryKey(),
  
  // Notice identification
  noticeType: varchar("notice_type", { length: 50 }).notNull(), // 'copyright', 'privacy', 'terms', 'disclaimer', 'attribution'
  title: text("title").notNull(),
  content: text("content").notNull(), // Full legal text
  
  // Versioning and validity
  version: varchar("version", { length: 20 }).default("1.0"),
  isActive: boolean("is_active").default(true),
  effectiveDate: timestamp("effective_date").defaultNow().notNull(),
  expirationDate: timestamp("expiration_date"),
  
  // Localization
  language: varchar("language", { length: 10 }).default("en"), // ISO language code
  jurisdiction: varchar("jurisdiction", { length: 100 }), // Legal jurisdiction
  
  // Display settings
  displayLocation: varchar("display_location", { length: 100 }), // Where to show this notice
  displayPriority: integer("display_priority").default(1), // Display order
  requiresAcceptance: boolean("requires_acceptance").default(false),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
}, (table) => ({
  noticeTypeIdx: index("notice_type_idx").on(table.noticeType),
  activeIdx: index("legal_notices_active_idx").on(table.isActive),
  languageIdx: index("legal_notices_language_idx").on(table.language),
}));

export const insertLegalNoticesSchema = createInsertSchema(legalNotices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLegalNotices = z.infer<typeof insertLegalNoticesSchema>;
export type LegalNotices = typeof legalNotices.$inferSelect;
