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

// User Camera Settings table - for user-specific barcode scanner camera configuration
export const userCameraSettings = pgTable("user_camera_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Foreign key to users table
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
}, (table) => ({
  userIdx: index("user_camera_settings_user_idx").on(table.userId),
}));

// Keep the old admin-only camera settings table for backward compatibility
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

export const insertUserCameraSettingsSchema = createInsertSchema(userCameraSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCameraSettingsSchema = createInsertSchema(cameraSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserCameraSettings = z.infer<typeof insertUserCameraSettingsSchema>;
export type UserCameraSettings = typeof userCameraSettings.$inferSelect;
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
  parentId: integer("parent_id").references(() => menuItems.id), // For nested menus
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
  // Add onboarding completion flag
  onboardingCompleted: boolean("onboarding_completed").default(false),
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

// Rewarding System Settings table
export const rewardingSystemSettings = pgTable("rewarding_system_settings", {
  id: serial("id").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  pointsPerProduct: integer("points_per_product").notNull().default(10),
  pointsPerReview: integer("points_per_review").notNull().default(20),
  pointsPerReferral: integer("points_per_referral").notNull().default(50),
  minRedemptionPoints: integer("min_redemption_points").notNull().default(100),
  enabledRewards: text("enabled_rewards").array().default([]), // Array of reward types
  rewardMultiplier: real("reward_multiplier").notNull().default(1.0),
  bonusPointsEnabled: boolean("bonus_points_enabled").notNull().default(false),
  dailyPointsLimit: integer("daily_points_limit").notNull().default(500),
  weeklyPointsLimit: integer("weekly_points_limit").notNull().default(2000),
  monthlyPointsLimit: integer("monthly_points_limit").notNull().default(8000),
  expirationDays: integer("expiration_days").notNull().default(365), // Points expire after X days
  levelSystemEnabled: boolean("level_system_enabled").notNull().default(false),
  notifications: boolean("notifications").notNull().default(true),
  description: text("description"),
  termsAndConditions: text("terms_and_conditions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRewardingSystemSettingsSchema = createInsertSchema(rewardingSystemSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRewardingSystemSettings = z.infer<typeof insertRewardingSystemSettingsSchema>;
export type RewardingSystemSettings = typeof rewardingSystemSettings.$inferSelect;

// Data Change Requests table - for product data corrections and additions
export const dataChangeRequests = pgTable("data_change_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  requestType: varchar("request_type", { length: 50 }).notNull(), // 'report_error', 'add_missing_data', 'correction'
  productBarcode: text("product_barcode"),
  productName: text("product_name"),
  
  // Current product data (for reference)
  currentData: jsonb("current_data"),
  
  // Proposed changes
  proposedChanges: jsonb("proposed_changes").notNull(),
  
  // Request details
  description: text("description").notNull(),
  issueType: varchar("issue_type", { length: 100 }), // 'wrong_ingredients', 'missing_nutrition', 'incorrect_name', etc.
  priority: varchar("priority", { length: 20 }).notNull().default('medium'), // 'low', 'medium', 'high', 'urgent'
  
  // Admin review
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending', 'approved', 'rejected', 'in_review'
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewComments: text("review_comments"),
  
  // Change tracking
  appliedAt: timestamp("applied_at"),
  appliedChanges: jsonb("applied_changes"), // What changes were actually applied
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("data_change_requests_status_idx").on(table.status),
  typeIdx: index("data_change_requests_type_idx").on(table.requestType),
  userIdx: index("data_change_requests_user_idx").on(table.userId),
  barcodeIdx: index("data_change_requests_barcode_idx").on(table.productBarcode),
}));

export const insertDataChangeRequestSchema = createInsertSchema(dataChangeRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedAt: true,
  appliedAt: true,
});

export type InsertDataChangeRequest = z.infer<typeof insertDataChangeRequestSchema>;
export type DataChangeRequest = typeof dataChangeRequests.$inferSelect;

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

// Calendar Entries table - for nutrition calendar events and schedules
export const calendarEntries = pgTable("calendar_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // 'schedule', 'meal_plan', 'nutrition_goal', 'event'
  
  // Schedule/Plan data
  goal: varchar("goal", { length: 100 }),
  duration: integer("duration"), // days
  startDate: text("start_date").notNull(), // YYYY-MM-DD format
  endDate: text("end_date"), // calculated from startDate + duration
  
  // Nutrition targets for this schedule
  dailyCalories: integer("daily_calories"),
  dailyProtein: real("daily_protein"),
  dailyCarbs: real("daily_carbs"),
  dailyFat: real("daily_fat"),
  
  // Activity and preferences
  activityLevel: varchar("activity_level", { length: 50 }),
  dietaryRestrictions: text("dietary_restrictions"),
  specialNotes: text("special_notes"),
  
  // Meal times (15 time slots for meals throughout the day)
  timeMeal1: varchar("time_meal_1", { length: 5 }), // HH:MM format
  timeMeal2: varchar("time_meal_2", { length: 5 }),
  timeMeal3: varchar("time_meal_3", { length: 5 }),
  timeMeal4: varchar("time_meal_4", { length: 5 }),
  timeMeal5: varchar("time_meal_5", { length: 5 }),
  timeMeal6: varchar("time_meal_6", { length: 5 }),
  timeMeal7: varchar("time_meal_7", { length: 5 }),
  timeMeal8: varchar("time_meal_8", { length: 5 }),
  timeMeal9: varchar("time_meal_9", { length: 5 }),
  timeMeal10: varchar("time_meal_10", { length: 5 }),
  timeMeal11: varchar("time_meal_11", { length: 5 }),
  timeMeal12: varchar("time_meal_12", { length: 5 }),
  timeMeal13: varchar("time_meal_13", { length: 5 }),
  timeMeal14: varchar("time_meal_14", { length: 5 }),
  timeMeal15: varchar("time_meal_15", { length: 5 }),
  
  // Status and tracking
  status: varchar("status", { length: 20 }).default("active").notNull(), // 'active', 'completed', 'paused', 'cancelled'
  progress: real("progress").default(0), // percentage 0-100
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("calendar_entries_user_id_idx").on(table.userId),
  startDateIdx: index("calendar_entries_start_date_idx").on(table.startDate),
  typeIdx: index("calendar_entries_type_idx").on(table.type),
  statusIdx: index("calendar_entries_status_idx").on(table.status),
}));

export const insertCalendarEntrySchema = createInsertSchema(calendarEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCalendarEntry = z.infer<typeof insertCalendarEntrySchema>;
export type CalendarEntry = typeof calendarEntries.$inferSelect;

// Schedule Generation History table - for tracking AI-generated nutrition schedules
export const scheduleGenHistory = pgTable("schedule_gen_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Generation request details
  requestData: jsonb("request_data").notNull(), // User profile data and form inputs used for generation
  aiModel: varchar("ai_model", { length: 50 }).notNull().default("gpt-4o"), // AI model used
  prompt: text("prompt").notNull(), // Full prompt sent to AI
  
  // AI response details
  aiResponse: text("ai_response").notNull(), // Full AI response
  generatedSchedule: jsonb("generated_schedule").notNull(), // Parsed schedule data
  
  // Calendar integration
  calendarEntryId: integer("calendar_entry_id").references(() => calendarEntries.id, { onDelete: "set null" }), // Link to created calendar entry
  
  // Generation metadata
  generationTimeMs: integer("generation_time_ms"), // Time taken for AI generation
  tokensUsed: integer("tokens_used"), // Number of tokens used in generation
  
  // Status and tracking
  status: varchar("status", { length: 20 }).default("success").notNull(), // 'success', 'failed', 'partial'
  errorMessage: text("error_message"), // Error details if generation failed
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("schedule_gen_history_user_id_idx").on(table.userId),
  statusIdx: index("schedule_gen_history_status_idx").on(table.status),
  createdAtIdx: index("schedule_gen_history_created_at_idx").on(table.createdAt),
  calendarEntryIdx: index("schedule_gen_history_calendar_entry_idx").on(table.calendarEntryId),
}));

export const insertScheduleGenHistorySchema = createInsertSchema(scheduleGenHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertScheduleGenHistory = z.infer<typeof insertScheduleGenHistorySchema>;
export type ScheduleGenHistory = typeof scheduleGenHistory.$inferSelect;

// AI Configuration table - for managing AI models and settings
export const aiConfiguration = pgTable("ai_configuration", {
  id: serial("id").primaryKey(),
  
  // Analysis AI Configuration
  analysisAiModel: varchar("analysis_ai_model", { length: 50 }).notNull().default("gpt-4o"),
  analysisAiTemperature: real("analysis_ai_temperature").notNull().default(0.3),
  analysisAiMaxTokens: integer("analysis_ai_max_tokens").notNull().default(1500),
  analysisAiSystemPrompt: text("analysis_ai_system_prompt").notNull().default("You are a professional nutritionist and food analysis expert. Analyze food products and ingredients to provide accurate processing scores, nutritional insights, and health recommendations."),
  analysisAiEnabled: boolean("analysis_ai_enabled").notNull().default(true),
  
  // Future AI configurations can be added here
  // chatbotAiModel: varchar("chatbot_ai_model", { length: 50 }).notNull().default("gpt-4o"),
  // recommendationAiModel: varchar("recommendation_ai_model", { length: 50 }).notNull().default("gpt-4o"),
  
  // Metadata
  updatedBy: integer("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAiConfigurationSchema = createInsertSchema(aiConfiguration).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAiConfiguration = z.infer<typeof insertAiConfigurationSchema>;
export type AiConfiguration = typeof aiConfiguration.$inferSelect;

// User Onboarding Information - Comprehensive health and lifestyle data
export const userOnboarding = pgTable("user_onboarding", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  
  // Basic Information
  age: integer("age"),
  gender: varchar("gender", { length: 20 }), // 'male', 'female', 'other', 'prefer_not_to_say'
  height: real("height"), // in cm
  weight: real("weight"), // in kg
  
  // Health Status
  medicalConditions: text("medical_conditions").array(), // ['diabetes', 'hypertension', 'heart_disease', 'thyroid', 'none']
  allergies: text("allergies").array(), // ['nuts', 'dairy', 'gluten', 'shellfish', 'eggs', 'soy', 'none']
  medications: text("medications").array(), // List of current medications
  
  // Lifestyle Factors
  activityLevel: varchar("activity_level", { length: 20 }), // 'sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'
  occupation: varchar("occupation", { length: 100 }), // Job type
  exerciseFrequency: varchar("exercise_frequency", { length: 20 }), // 'never', 'rarely', '1-2_times_week', '3-4_times_week', '5-6_times_week', 'daily'
  exerciseTypes: text("exercise_types").array(), // ['cardio', 'strength', 'yoga', 'sports', 'walking', 'cycling']
  
  // Dietary Preferences
  foodPreferences: text("food_preferences").array(), // Liked foods
  foodDislikes: text("food_dislikes").array(), // Disliked foods
  dietaryRestrictions: text("dietary_restrictions").array(), // ['vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'gluten_free', 'dairy_free']
  
  // Goals
  weightGoals: varchar("weight_goals", { length: 20 }), // 'lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle'
  targetWeight: real("target_weight"), // in kg
  healthGoals: text("health_goals").array(), // ['lower_cholesterol', 'control_blood_sugar', 'reduce_blood_pressure', 'increase_energy', 'improve_digestion']
  
  // Eating Habits
  mealsPerDay: integer("meals_per_day").default(3), // Number of main meals
  snacksPerDay: integer("snacks_per_day").default(2), // Number of snacks
  cookingSkill: varchar("cooking_skill", { length: 20 }), // 'beginner', 'intermediate', 'advanced', 'expert'
  cookingFrequency: varchar("cooking_frequency", { length: 20 }), // 'never', 'rarely', 'sometimes', 'often', 'always'
  
  // Support System
  familySupport: boolean("family_support").default(false), // Has family support for diet goals
  friendsSupport: boolean("friends_support").default(false), // Has friends support for diet goals
  professionalSupport: boolean("professional_support").default(false), // Working with nutritionist/dietitian
  
  // Meal times (15 time slots for meals throughout the day)
  timeMeal1: varchar("time_meal_1", { length: 5 }), // HH:MM format
  timeMeal2: varchar("time_meal_2", { length: 5 }),
  timeMeal3: varchar("time_meal_3", { length: 5 }),
  timeMeal4: varchar("time_meal_4", { length: 5 }),
  timeMeal5: varchar("time_meal_5", { length: 5 }),
  timeMeal6: varchar("time_meal_6", { length: 5 }),
  timeMeal7: varchar("time_meal_7", { length: 5 }),
  timeMeal8: varchar("time_meal_8", { length: 5 }),
  timeMeal9: varchar("time_meal_9", { length: 5 }),
  timeMeal10: varchar("time_meal_10", { length: 5 }),
  timeMeal11: varchar("time_meal_11", { length: 5 }),
  timeMeal12: varchar("time_meal_12", { length: 5 }),
  timeMeal13: varchar("time_meal_13", { length: 5 }),
  timeMeal14: varchar("time_meal_14", { length: 5 }),
  timeMeal15: varchar("time_meal_15", { length: 5 }),
  
  // Additional Information
  sleepHours: real("sleep_hours"), // Average hours of sleep per night
  stressLevel: varchar("stress_level", { length: 20 }), // 'very_low', 'low', 'moderate', 'high', 'very_high'
  waterIntake: real("water_intake"), // Glasses of water per day
  alcoholConsumption: varchar("alcohol_consumption", { length: 20 }), // 'never', 'rarely', 'occasionally', 'regularly', 'frequently'
  smokingStatus: varchar("smoking_status", { length: 20 }), // 'never', 'former', 'current'
  
  // Completion and tracking
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("onboarding_user_id_idx").on(table.userId),
}));

export const insertUserOnboardingSchema = createInsertSchema(userOnboarding).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial().extend({
  userId: z.number().optional(), // userId is handled by the backend
  isCompleted: z.boolean().optional(), // Special field for completion
  completedAt: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null) {
      return null;
    }
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }).optional(),
  lastUpdated: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null) {
      return null;
    }
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }).optional(),
});

export type InsertUserOnboarding = z.infer<typeof insertUserOnboardingSchema>;
export type UserOnboarding = typeof userOnboarding.$inferSelect;
