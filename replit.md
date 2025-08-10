# ProcessedOrNot Scanner - Replit Documentation

## Overview
ProcessedOrNot Scanner is a modern web application designed to analyze food products for processing levels. It leverages barcode scanning, AI-powered ingredient analysis, and an interactive chatbot (NutriBot) to provide comprehensive food product insights. The project aims to provide users with transparent and detailed information about the food they consume, fostering healthier dietary choices. It has significant market potential as a tool for health-conscious consumers and aims to become a leading platform for food transparency.

## Recent Changes
- **NutriBot AI Personalization**: Enhanced NutriBot with user data integration for personalized nutrition advice:
  - Added "ExtraInfo" parameter to getNutriBotSystemPrompt and getNutriBotResponse functions
  - Modified NutriBot chat API endpoint to fetch and include all user profile data (except name, username, email, password)
  - User data includes health goals, activity level, weight goals, dietary restrictions, health conditions, physical attributes, onboarding information, allergies, dietary preferences, lifestyle factors, fitness goals, cooking skills, meal prep time, and budget preferences
  - NutriBot now provides personalized recommendations based on authenticated user's complete profile
- **Product Analysis Settings**: Implemented customizable analysis sections with toggleable visibility:
  - Added Product Analysis Settings button to main Product Analysis screen (moved from Add to Nutrition Diary modal)
  - Created settings modal with checkboxes for 8 analysis sections (Processing Analysis, Nutrition Facts, Glycemic Impact, Ingredients List, Product Metadata, Nutrition Spotlight, Fun Facts, NutriBot AI Insight)
  - Implemented localStorage persistence for user preferences
  - Made all analysis sections conditional based on user settings
  - Moved "Add Missing Data" button to Product Analysis screen and made it smaller
- **User Profile System**: Created comprehensive User Profile page with authentication-based access control:
  - Developed /profile page with editable user information (first name, last name, email)
  - Added User Profile option to authenticated dropdown menu (hidden when logged out)
  - Implemented authentication protection with automatic redirect to login page
  - Created backend API endpoint for updating profile information
  - Added User Profile link to Dashboard page in Additional Quick Actions section
- **Homepage Restructure**: Renamed Marketing page to Home and made it the new homepage, featuring comprehensive product showcase and AI-powered food analysis information
- **Enhanced Admin Panel Visual Design**: Improved tab styling with color-coded gradients, smooth animations, and modern visual hierarchy:
  - Debug Cascading DB tab (blue theme)
  - System Settings tab (emerald theme) 
  - Speech-to-Text Settings tab (violet theme)
  - User Management tab (orange theme)
- **Speech-to-Text Settings Fix**: Resolved database table creation issue and encryption errors for Speech-to-Text functionality
- **Debug Cascading DB Integration**: Integrated Debug Cascading DB functionality directly into Admin Panel as first tab, removing standalone page route
- **Admin Panel Enhancement**: Restructured Admin Panel with tabbed interface featuring three main sections:
  - Debug Cascading DB (comprehensive database testing and management)
  - System Settings (application configuration)
  - User Management (user role management and permissions)
- **Menu Reorganization**: Completely restructured header dropdown menu with improved logical grouping:
  - Main Navigation (always expanded)
  - User Account (with Dashboard for Admin, User Profile, Sign Out)
  - Admin Tools (collapsed by default - Admin Panel, Take Tour, Debug Tools)
  - Information & Support (collapsed by default)
  - Legal & Privacy (collapsed by default)
- **Role-Based Access Control**: Dashboard page and admin features are restricted to Admin users only

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
ProcessedOrNot Scanner is built on a full-stack JavaScript/TypeScript architecture.
- **Frontend**: React with TypeScript, utilizing Vite for build processes, Shadcn/ui components with Radix UI primitives, and Tailwind CSS for styling. It supports dark/light themes and features modular component design, React Query for state management, Wouter for routing, and a context system for global state.
- **Backend**: Express.js server with TypeScript, providing RESTful API endpoints.
- **Database**: PostgreSQL with Drizzle ORM for data persistence.
- **Deployment**: Replit autoscale deployment on Node.js 20.

The system incorporates multi-language support for 7 languages with dynamic language detection. Core features include:
- **Barcode Scanner System**: Uses ZXing library for real-time barcode recognition via camera access, with manual entry and text-based search fallbacks.
- **Smart Lookup System**: Employs regex for barcode format detection and OpenAI for text-based product searches. It integrates with over 20 different food databases for comprehensive coverage.
- **AI Integration**: OpenAI GPT-4o powers ingredient analysis for processing levels, the NutriBot chatbot, and generates nutrition insights and fun facts, all adaptable to the user's selected language.
- **Data Encryption**: Comprehensive AES-256-CBC encryption for all PII (emails, names, search queries), bcrypt for password hashing, and secure session management.
- **Security Features**: Email addresses encrypted/hashed for uniqueness, encrypted search history storage, enhanced session security, and encrypted tokens for password reset and email verification.
- **Consent Management Platform (CMP)**: Integrated system for GDPR, US state privacy laws, and IAB Global Privacy Platform (GPP) compliance, managing user consent for ads.
- **Reward System**: Tracks user searches/scans and triggers a reward URL visit after every 6 interactions, applicable to both logged-in and anonymous users.
- **Mobile Application**: A corresponding Expo (React Native) mobile app replicates all web functionality, offering native barcode scanning and seamless integration.

## External Dependencies
- **Food Database APIs**: OpenFoodFacts (primary), FoodDB.ca, USDA Food Data Central, OpenNutrition, Nutritionix, Spoonacular, API Ninjas, UPC Database, Australian Food Composition Database, Health Canada Food Database, European Food Safety Authority (EFSA), and multiple regional food databases.
- **Third-Party Services**: OpenAI GPT-4o (AI analysis, chatbot), ZXing Library (barcode scanning), Neon Database (PostgreSQL hosting), Assembly AI (voice-to-text for voice search).
- **Core Dependencies**: React 18, Express.js, Drizzle ORM, Tailwind CSS, React Query, Radix UI.
- **Advertising**: Google AdSense (web), Google AdMob (mobile components for future integration).