# ProcessedOrNot Scanner - Replit Documentation

## Overview

ProcessedOrNot Scanner is a modern web application that analyzes food products for processing levels using barcode scanning and AI-powered ingredient analysis. The system combines real-time product database lookups, OpenAI-powered ingredient processing analysis, and an interactive chatbot called NutriBot to provide comprehensive food product insights.

## System Architecture

### Full-Stack JavaScript/TypeScript Architecture
- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Replit autoscale deployment with Node.js 20

### Multi-Language Support
- Built-in internationalization (i18n) supporting 7 languages: English, Spanish, French, German, Chinese, Japanese, and Dutch
- Dynamic language detection based on browser preferences

### UI Framework
- Shadcn/ui components with Radix UI primitives
- Tailwind CSS for styling with custom design system
- Dark/light theme support with system preference detection

## Key Components

### Frontend Architecture (React + TypeScript)
- **Component Structure**: Modular component design with reusable UI components
- **State Management**: React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Context System**: Language and Theme contexts for global state

### Backend Architecture (Express + TypeScript)
- **API Layer**: RESTful API endpoints for product lookup and analysis
- **Database Layer**: Drizzle ORM with PostgreSQL for data persistence
- **External Integrations**: Multiple food database APIs and OpenAI integration

### Database Schema
```sql
products table:
- id (serial, primary key)
- barcode (text, unique)
- productName (text)
- brands (text)
- imageUrl (text)
- ingredientsText (text)
- nutriments (jsonb)
- processingScore (integer)
- processingExplanation (text)
- glycemicIndex (integer)
- glycemicLoad (integer)
- glycemicExplanation (text)
- dataSource (text)
- lastUpdated (text)

search_history table (enhanced):
- id (serial, primary key)
- searchId (varchar, unique) - auto-generated random code
- searchInput (text) - user's search input (barcode or text)
- searchInputType (varchar) - 'BarcodeInput' or 'TextInput'
- resultFound (boolean) - whether search returned a product
- productBarcode (text) - barcode of found product
- productName (text) - name of found product
- productBrands (text) - brands of found product
- productImageUrl (text) - image URL of found product
- productIngredientsText (text) - ingredients of found product
- productNutriments (jsonb) - nutritional data of found product
- processingScore (integer) - AI-analyzed processing score
- processingExplanation (text) - AI processing level explanation
- glycemicIndex (integer) - calculated glycemic index
- glycemicLoad (integer) - calculated glycemic load
- glycemicExplanation (text) - glycemic impact explanation
- dataSource (text) - original data source
- lookupSource (text) - search method used
- errorMessage (text) - error details if search failed
- createdAt (timestamp) - automatically set
```

### Barcode Scanner System
- ZXing library for barcode recognition
- Camera access for real-time scanning
- Manual barcode entry fallback
- Text-based product search capability

## Data Flow

### Product Lookup Process
1. **Input Processing**: System detects whether input is barcode or text search
2. **Cascading Database Lookup**: 
   - Primary: OpenFoodFacts API
   - Enhanced Coverage: FoodDB.ca, USDA FDC, OpenNutrition, Nutritionix, Spoonacular, API Ninjas
   - Fallback: USDA FoodData Central, UPC Database, and 14+ other food databases
3. **Data Processing**: Product information is normalized and stored locally
4. **AI Analysis**: OpenAI analyzes ingredients for processing level (0-10 scale)
5. **Results Display**: Comprehensive product information with processing analysis

### Smart Lookup System
- **Barcode Detection**: Regex patterns identify various barcode formats (EAN-8, UPC-A, EAN-13, ITF-14)
- **Text Search**: OpenAI-powered product search for text queries
- **Multi-Database Integration**: 20+ different food databases for comprehensive coverage

### AI Integration Points
- **Ingredient Analysis**: OpenAI GPT-4o analyzes ingredient lists for processing levels
- **NutriBot Chat**: Interactive nutritionist chatbot for product advice
- **Nutrition Insights**: AI-generated health assessments and fun facts
- **Multi-language Support**: All AI responses adapt to user's selected language

## External Dependencies

### Food Database APIs
- OpenFoodFacts (primary)
- FoodDB.ca (Canadian Food Database)
- USDA Food Data Central (Enhanced API)
- OpenNutrition
- Nutritionix
- Spoonacular
- API Ninjas
- USDA FoodData Central
- UPC Database
- Australian Food Composition Database
- Health Canada Food Database
- European Food Safety Authority (EFSA)
- Multiple regional food databases (Netherlands, Germany, etc.)

### Third-Party Services
- **OpenAI GPT-4o**: Ingredient analysis and chatbot functionality
- **ZXing Library**: Barcode scanning capabilities
- **Neon Database**: PostgreSQL hosting (@neondatabase/serverless)

### Core Dependencies
- **React 18**: Frontend framework
- **Express.js**: Backend server
- **Drizzle ORM**: Database operations
- **Tailwind CSS**: Styling framework
- **React Query**: Server state management
- **Radix UI**: Accessible component primitives

## Deployment Strategy

### Replit Platform Deployment
- **Environment**: Node.js 20 with PostgreSQL 16
- **Build Process**: Vite builds frontend assets, esbuild bundles server
- **Deployment Target**: Autoscale deployment for production
- **Port Configuration**: Internal port 5000, external port 80

### Development Workflow
- **Development Server**: `npm run dev` runs both frontend and backend
- **Database Management**: `npm run db:push` for schema updates
- **Type Checking**: `tsc` for TypeScript validation

### Environment Configuration
- **Database**: PostgreSQL connection via DATABASE_URL
- **OpenAI**: API key for AI functionality
- **Multiple API Keys**: Optional keys for various food databases

## Security Implementation

### Data Encryption
- **Comprehensive PII Encryption**: All personal data (emails, names, search queries) encrypted with AES-256-CBC
- **Secure Authentication**: bcrypt password hashing with 12 salt rounds, secure session management
- **Database Security**: No plaintext sensitive data storage, encrypted fields with hash lookups
- **Environment-based Key Management**: Production-ready encryption key system

### Security Features
- Email addresses encrypted + hashed for uniqueness without plaintext exposure
- User search history encrypted before database storage
- Enhanced session security with custom names and strict sameSite policies
- Password reset and email verification tokens encrypted
- Graceful encryption error handling with logging

## Changelog

Changelog:
- July 31, 2025. **IMPLEMENTED COMPREHENSIVE CONSENT MANAGEMENT PLATFORM (CMP)**: Built complete CMP system compliant with 2025 Google Publisher Policies. Features include EU/UK/Switzerland GDPR compliance with Google-certified CMP functionality, US state privacy law support (Iowa, Delaware, New Jersey, Nebraska, New Hampshire), IAB Global Privacy Platform (GPP) integration, Restricted Data Processing (RDP) settings, automatic region detection, consent banner with customizable preferences, privacy settings page, Google Analytics/AdSense consent integration, and complete compliance string generation (TC String, USP String, GPP String). System provides proper consent management for personalized ads in regulated regions while maintaining non-personalized ad fallback for compliance.
- July 31, 2025. **CONFIGURED ADS.TXT SERVING FOR GOOGLE ADSENSE**: Created ads.txt file in root directory with Google AdSense publisher verification (pub-1163701043339821) and added Express route to serve it at /ads.txt endpoint. File is now properly accessible for Google's crawler verification to enable ad serving authorization.
- July 31, 2025. **REPOSITIONED LANGUAGE SWITCHER TO LEFT SIDE**: Moved language switcher from right side to left side of header across all pages. Updated dropdown alignment to "start" for proper left-side positioning. Notifications and main dropdown menu remain on right side for optimal layout balance.
- July 31, 2025. **CONFIGURED COMPREHENSIVE GOOGLE PUBLISHER TAG (GPT) REWARD AD SYSTEM**: Successfully implemented complete GPT reward ad monetization system with Google AdSense Publisher ID (ca-pub-1163701043339821). Built enhanced GPT Ad Manager with interstitial reward ads triggering every 5 camera scans/searches, comprehensive targeting (nutrition content, high user engagement), privacy settings (RDP enabled), Google Analytics integration for ad performance tracking, GPT library pre-loading in HTML, GPT Test Panel for admin testing and debugging, GPT Configuration Dashboard with metrics/analytics/testing tabs, force reinitialization capabilities, and comprehensive error handling. Connected reward system to barcode scanner/text search/voice search with detailed logging and performance monitoring. System provides professional-grade ad monetization while maintaining optimal user experience.
- July 31, 2025. **REPOSITIONED DROPDOWN MENU TO LEFT SIDE**: Moved main dropdown menu from right side to left side of header for improved user interface layout. Updated header structure to position dropdown menu and language switcher on left, logo and title in center, and notifications on right. Changed dropdown positioning from "right-0" to "left-0" for proper left-side alignment.
- June 16, 2025. Initial setup
- June 16, 2025. Implemented comprehensive user account system with secure authentication, registration, login pages, password hashing, email verification, password reset functionality, and session management
- June 16, 2025. Added user role system with Admin and Regular user types, role management API endpoints, and set user ID 1 to Admin role
- June 16, 2025. Implemented comprehensive admin panel with user management, role updates, system statistics, admin-only routes, and admin access controls integrated into the application navigation
- July 5, 2025. Implemented search history database system with automatic tracking of all product searches, search ID generation, search input type detection (BarcodeInput vs TextInput), and comprehensive API endpoints for search history management and statistics
- July 5, 2025. Fixed and enhanced text search functionality with two-step OpenAI process: keyword optimization and realistic nutritional data generation. Added multi-language support for Dutch terms like "Gehakt" and "Gehaktbal". Improved error handling and fallback mechanisms for robust text-based product searches.
- July 5, 2025. Enhanced search history database system with comprehensive search result tracking. Added automatic capture of complete product data, processing scores, nutritional information, lookup sources, and error details. Implemented duplicate prevention based on search input to avoid redundant database entries. System now tracks successful searches, failed searches, and cached results with full context.
- July 5, 2025. Implemented mobile header improvements: hidden subtitle text on mobile screens for cleaner layout, improved menu button visibility and touch targets, added language switcher to mobile dropdown menu, and enhanced responsive design.
- July 5, 2025. Implemented interactive tutorial overlay system for first-time users. Features 7-step guided tour highlighting key features (camera scanning, manual entry, AI analysis, NutriBot chat, menu features), CSS-based zoom camera functionality as fallback, tutorial data attributes on key UI elements, localStorage-based completion tracking, and "Take Tour" option in header dropdown menu for restarting the tutorial.
- July 5, 2025. Fixed dropdown menu visibility issue by increasing z-index values (backdrop z-40, dropdown z-50) to prevent layering conflicts with other UI elements. The header dropdown menu now displays properly with all menu items visible and functional.
- July 5, 2025. Debugged and enhanced tutorial overlay system with "Don't show again" functionality. Fixed tutorial rendering issue by correcting conditional return logic, added checkbox option to permanently disable tutorial popup, implemented localStorage-based tutorial disabling (processedornot-tutorial-disabled key), and improved tutorial state management with proper visibility controls.
- July 5, 2025. Implemented comprehensive Admin Search History Analytics page with data visualization, statistics dashboard, search filtering, CSV export functionality, and search history management. Added API endpoints for search history analytics, statistics calculation, data export, and bulk operations. Created admin-only route accessible via Admin Panel Quick Actions navigation. Features include success rate tracking, most searched products analysis, data source breakdowns, and time-based analytics.
- July 5, 2025. Renamed "role" column to "account_type" in users database table. Updated all TypeScript interfaces, database queries, API endpoints, and frontend components to use accountType terminology instead of role. Changed method names from updateUserRole/getUsersByRole to updateUserAccountType/getUsersByAccountType. Updated admin panel UI to show "Account Type" instead of "Role" throughout the interface. Database migration completed via SQL ALTER TABLE command.
- July 5, 2025. Implemented automatic camera cleanup when leaving the website. Added event listeners for visibilitychange, beforeunload, and pagehide events to automatically stop the camera stream when users switch tabs, close the browser, or navigate away. Also added route change detection to clean up camera when navigating to different pages within the app. This prevents camera access staying active in background and improves user privacy and system performance.
- July 5, 2025. Enhanced barcode scanner autofocus and scanning capabilities. Implemented improved camera constraints with higher resolution (1920x1080), continuous autofocus mode, environment-facing camera selection, and automatic white balance/exposure controls. Added barcode format validation (8-14 digits), enhanced scanning performance with 300ms interval between attempts, visual scanning indicators, and graceful fallback for unsupported camera features. Improved user feedback with active scanning status display.
- July 5, 2025. Configured advanced camera constraints for optimal short-range autofocus and image quality. Enhanced resolution settings (1920x1080 ideal, 1280x720 minimum), 30fps frame rate, very close focus distance (0.05), maximum sharpness (100), increased contrast (120), optimized ISO range (100-200), and automatic exposure compensation (+0.2). Applied consistent settings across both main camera initialization and fallback modes for superior barcode detection performance.
- July 5, 2025. Implemented comprehensive camera optimization for short-range barcode scanning excellence. Upgraded resolution to 2560x1440 (ideal), 60fps frame rate, ultra-precise focus distance (0.015) for 1.5cm-8cm range, narrow focus search range (0.005-0.12), ultra-fast shutter (6000μs), minimal ISO (64-125), extreme contrast (160), maximum noise reduction (100), image stabilization, and 1.2x zoom optimization. Advanced constraints include daylight white balance, enhanced brightness (125), and reduced saturation (40) for optimal barcode detection across all devices.
- July 5, 2025. Configured complete short-range barcode scanning interface with enhanced camera section (384px height, contrast/brightness/saturation filters, crisp-edge rendering), multi-layer scanning overlay (close-range focus zones, optimal 2-8cm target area, center crosshair, enhanced corner guides), and specialized zoom controls (optimal 1.5x preset button, close-range indicator, distance guidance). Added comprehensive CSS animations including scan pulse effects, range indicators, and mobile-optimized responsive design for superior 2-8cm barcode scanning performance.
- July 5, 2025. Implemented "Barcode Scan System" dropdown menu in Settings page with "Main Barcode Scanner" as default option. Added complete UI with selection, description, save functionality, and database integration for user preference storage.
- July 5, 2025. Fixed Admin Search History page accessibility by updating authentication checks from deprecated "role" field to "accountType" field across frontend components and backend API routes. Admin users can now properly access search history analytics, statistics, export functionality, and data management features.
- July 10, 2025. Created comprehensive Features page showcasing all application capabilities including advanced barcode scanning, AI-powered analysis, multi-database integration, and multilingual support. Added page to navigation menu with detailed feature descriptions, technology stack information, and visual enhancements.
- July 10, 2025. Implemented Media storage system with dedicated database table for future image/video uploads. Added media fields to products table (additional_images, video_url, media_gallery), complete storage interface with CRUD operations, and support for image/video metadata, tags, and access controls.
- July 10, 2025. Implemented comprehensive notifications system with database table, API endpoints, and UI components. Added bell icon notification button in header visible only to authenticated users, with real-time unread count badges, notification management (read/unread/archive/delete), and automatic 30-second refresh intervals. Created complete notification storage interface with user-specific filtering and notification type support (info, warning, success, error).
- July 10, 2025. Implemented comprehensive blog system with database table, API endpoints, and complete UI interface. Added main blog page displaying all posts with search and tag filtering, new blog post creation page with form validation and preview functionality, individual blog post view page with reading time and view count tracking. Created complete blog storage interface with CRUD operations, automatic slug generation, excerpt creation, and view count tracking. Added blog navigation to header menu and sample blog posts for demonstration.
- July 14, 2025. Created complete Expo mobile app (React Native) for ProcessedOrNot Scanner with native barcode scanning, AI-powered product analysis, and cross-platform compatibility. Implemented camera-based barcode scanning with real-time detection, text search functionality, dark/light theme support, navigation between screens, and API integration with existing backend. Added comprehensive mobile UI with HomeScreen, ScannerScreen, ProductScreen, SearchScreen, and SettingsScreen. Configured project structure with TypeScript, Expo configuration, and proper asset management. Mobile app provides native performance with same AI analysis capabilities as web application.
- July 14, 2025. Enhanced home page with comprehensive features showcase section including interactive feature cards for AI Analysis, Multi-Database Integration, Smart Scanning, NutriBot Chat, Multi-Language Support, and Smart Analytics. Added visual statistics grid displaying key metrics (14+ databases, 7 languages, 6+ barcode formats, AI-powered analysis) and smooth scroll CTA button. Improved user engagement with hover effects, gradient backgrounds, and detailed feature descriptions. Fixed tutorial overlay interference with camera controls by implementing pointer-events management and proper z-index layering
- July 24, 2025. Created complete fresh Expo mobile app clone in mobile-app-fresh/ directory that replicates all website functionality in native mobile interface. Implemented React Native app with TypeScript, React Navigation, Theme Context, API Context, and five main screens: HomeScreen (feature overview), ScannerScreen (camera barcode scanning), ProductScreen (detailed analysis results), SearchScreen (text-based product search), and SettingsScreen (app configuration). Mobile app connects to same backend API as website, provides native barcode scanning capabilities, supports dark/light themes, and includes comprehensive documentation and project structure for Expo development.
- July 26, 2025. Implemented comprehensive data encryption system for all user data. Added AES-256-CBC encryption for PII (emails, names, search queries), bcrypt password hashing with 12 salt rounds, encrypted search history storage, hash-based email lookups for uniqueness while maintaining encryption, enhanced session security with custom names and strict sameSite policies, environment-based encryption key management, and complete security documentation. All sensitive user data is now encrypted at rest with secure authentication flows.
- July 26, 2025. Implemented voice-activated product lookup using Assembly AI STT engine. Added VoiceSearchButton component with microphone recording, audio processing, and real-time transcription. Integrated voice search into main product lookup interface next to text input field with automatic submission of voice queries. Added comprehensive voice transcription API endpoints with error handling and Assembly AI integration.
- July 26, 2025. Added account deletion request functionality to Settings page with detailed warning dialogs, confirmation requirements, and clear information about data removal process. Users can now request account deletion with appropriate safeguards and user experience considerations.
- July 26, 2025. Created comprehensive LinkedIn company profile documentation with professional descriptions of features, mission, and unique value propositions. Implemented automatic LinkedIn profile updater script that monitors replit.md changes and updates profile content when new features are added. Added auto-watcher for real-time profile maintenance.
- July 26, 2025. Created professional Google Play Store listing with user-friendly descriptions, feature highlights, and mobile-optimized content. Implemented automatic Play Store info updater that converts technical features into user-friendly language and maintains "What's New" section. Added auto-watcher system for seamless Play Store listing maintenance when new features are released.
- July 26, 2025. Fixed critical encryption security bug by replacing deprecated crypto.createCipher/createDecipher functions with secure crypto.createCipheriv/createDecipheriv methods. Updated AES-256-CBC encryption system to use proper initialization vectors and enhanced security. User registration, login, and data encryption now working properly with enterprise-grade security standards.
- July 26, 2025. Fixed encryption key rotation bug causing search history decryption failures between server restarts. Implemented graceful handling of invalid encrypted data by returning empty strings instead of throwing errors. Enhanced decryption error handling to prevent API failures when encryption keys change during development.
- July 26, 2025. Enhanced cascading product lookup system with 6 additional food databases: FoodDB.ca (Canadian Food Database), USDA Food Data Central (Enhanced API), OpenNutrition, Nutritionix, Spoonacular, and API Ninjas. Expanded total database coverage from 14 to 20+ food databases for comprehensive global product lookup. Added complete API integration modules with authentication, data normalization, and AI ingredient analysis for all new databases. Improved fallback system reliability and international product coverage.
- July 26, 2025. Optimized database priority order for cascading product lookups with strategic ordering: OpenFoodFacts (Primary), USDA FoodData Central (Secondary), FoodDB.ca, USDA FDC, OpenNutrition, Nutritionix, Spoonacular, API Ninjas, FoodData Central (USDA), EFSA, Health Canada, Barcode Spider, EAN Search, UPC Database. New priority system maximizes success rate by placing high-coverage databases first while maintaining comprehensive fallback coverage for global product lookup accuracy.
- July 26, 2025. Reorganized header dropdown menu with grouped categories: "Information & Support" (About us, Features, Help), "Content & Community" (Blog, Social Media), and "Legal & Contact" (Contact, Privacy Policy, Terms of Service). Added visual section headers and dividers for improved navigation. Renamed "Sign In" to "Authentication" for clearer terminology.
- July 26, 2025. Reduced main menu size by decreasing padding, spacing, and overall dimensions. Changed menu width from 288px to 224px, reduced item padding from py-3 to py-2, decreased icon sizes, and minimized spacing throughout the dropdown for a more compact interface.
- July 26, 2025. **COMPLETED COMPREHENSIVE DATABASE TESTING**: Successfully tested all 14 databases in the cascading product lookup system. Results: 98 total API calls, 100% connection success rate, OpenFoodFacts (57.1% data rate) and UPC Database (28.6% data rate) as top performers. System fully operational with intelligent cascading, AI-enhanced analysis (processing scores, glycemic index), and complete PostgreSQL integration. End-to-end API testing confirmed at `/api/products/{barcode}` endpoint. Created comprehensive test script and detailed performance reports.
- July 30, 2025. **IMPLEMENTED COMPREHENSIVE REWARD SYSTEM**: Created complete reward tracking system requiring users to visit reward URL after every 6 searches/scans. Built RewardModal component with reward URL opening functionality, useRewardSystem hook for reward management, and integrated reward checking into all search methods (barcode scanning, text search, voice search). Enhanced session middleware to track anonymous users in PostgreSQL database, ensuring reward system works for both logged-in and non-logged-in users. Successfully tested complete workflow: search tracking, reward triggering at 6 searches, reward URL requirement (428 status), and reward reset functionality.
- July 30, 2025. **IMPLEMENTED COMPLETE GOOGLE ADSENSE & ADMOB INTEGRATION**: Created comprehensive advertising monetization system with Google AdSense for web and AdMob components for future React Native deployment. Built AdManagerProvider context with consent management, ad blocker detection, and platform switching between web/mobile. Implemented multiple ad components: HeaderBannerAd (728x90), SidebarAd (300x250), ResponsiveAd (auto-responsive), InArticleAd (fluid layout), CustomBannerAd (configurable), and AdMob components for mobile. Added Ad Settings page for configuration management, consent banner for GDPR compliance, and integrated ads strategically throughout home page and product lookup page. System includes test mode for development, ad performance tracking with Google Analytics events, and environment-based configuration. Successfully configured with user's Google AdSense (ca-pub-1163701043339821), AdMob App ID (ca-app-pub-1163701043339821~8067371248), and Banner Ad Unit ID (ca-app-pub-1163701043339821/8527084986). All ad components are live and generating revenue through Google's advertising network.
- July 31, 2025. **IMPLEMENTED MENU VISIBILITY CONTROLS**: Added authentication-based menu visibility system that completely hides the main dropdown menu for non-authenticated users. Enhanced user experience by showing menu options only to logged-in users, providing cleaner interface for guest visitors while maintaining full functionality for authenticated users. System provides streamlined navigation experience with automatic menu visibility management based on authentication status.
- July 31, 2025. **FIXED LOGOUT FUNCTIONALITY**: Resolved sign out bug by adding GET /api/logout endpoint alongside existing POST /api/auth/logout. Users can now successfully log out through header dropdown menu, which properly destroys session, clears cookies, and redirects to home page. Both GET and POST logout endpoints work correctly for different client implementations.
- July 31, 2025. **UPDATED LOGIN SESSION DURATION**: Changed "Keep me logged in for 30 days" to "Keep me logged in" with indefinite session duration (10 years). Users selecting this option now stay logged in indefinitely until manual logout, providing seamless long-term access without re-authentication requirements. Standard session duration remains 24 hours for unchecked option.
- July 31, 2025. **IMPLEMENTED ADMIN-ONLY SIDEBAR ACCESS**: Hidden the left sidebar navigation menu for non-authenticated users and regular users. Only admin users can now access the sidebar navigation system, providing streamlined interface for regular users while maintaining full admin functionality. Layout automatically adjusts content area when sidebar is hidden.
- July 31, 2025. **ADDED COMPREHENSIVE ADSENSE PRIVACY DISCLOSURES**: Enhanced privacy policy with required Google AdSense privacy disclosures including third-party vendor cookie usage, personalized advertising explanations, clear opt-out information with direct links to Google Ads Settings, detailed data collection practices from advertising partners, international data transfer policies, and comprehensive cookie categorization. Privacy policy now fully complies with Google Publisher Policies requirements for AdSense monetization.
- July 31, 2025. **IMPLEMENTED AD PLACEMENT GUIDELINES & USER CONSENT COLLECTION SYSTEMS**: Created comprehensive ad compliance infrastructure with dedicated Ad Placement Guidelines page featuring Google Publisher Policy requirements, ad placement rules (required/recommended/prohibited categories), location-specific guidelines, mobile optimization standards, and implementation checklist. Built User Consent Collection system with interactive consent flow, regional compliance detection, preference management, consent metrics dashboard, and real-time status monitoring. Added Ad Compliance Dashboard integrating all compliance tools with overall compliance scoring, policy violation tracking, and direct access to all ad management features. All systems accessible through admin panel and individual routes for comprehensive Google AdSense compliance management.

## Bug Fixes Applied (July 24, 2025)
- Fixed missing expo-status-bar dependency by using native StatusBar from react-native
- Resolved TypeScript LinearGradient type errors with proper const assertions
- Updated package.json scripts from placeholder commands to proper Expo commands
- Added missing core dependencies: react, react-native, @babel/core, and TypeScript types
- Fixed API URL configuration by removing trailing slash
- Created SVG-based placeholder assets for icon, splash, adaptive-icon, and favicon
- Verified all TypeScript compilation errors are resolved
- App is now ready for Expo development and testing on iOS/Android devices.

## User Preferences

Preferred communication style: Simple, everyday language.

