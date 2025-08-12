# ProcessedOrNot Scanner

## Overview
ProcessedOrNot Scanner is a web application that analyzes food products for processing levels. It provides comprehensive food product insights through barcode scanning, AI-powered ingredient analysis, and an interactive chatbot (NutriBot). The project aims to empower users with transparent and detailed information about their food, encouraging healthier dietary choices, and has significant market potential as a leading platform for food transparency.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
ProcessedOrNot Scanner is built on a full-stack JavaScript/TypeScript architecture.
- **Frontend**: React with TypeScript, Vite, Shadcn/ui, Radix UI, and Tailwind CSS. It supports dark/light themes, features modular components, React Query for state management, Wouter for routing, and a context system for global state.
- **Backend**: Express.js server with TypeScript, providing RESTful API endpoints.
- **Database**: PostgreSQL with Drizzle ORM.
- **Deployment**: Replit autoscale deployment on Node.js 20.
- **UI/UX Decisions**: Shadcn/ui components, Radix UI primitives, Tailwind CSS for styling, dark/light theme support, and a modular component design.
- **Technical Implementations**:
    - **Multi-language Support**: Supports 7 languages with dynamic detection.
    - **Barcode Scanner System**: Uses ZXing library for real-time barcode recognition, with manual entry and text-based search fallbacks.
    - **Smart Lookup System**: Employs regex for barcode format detection and OpenAI for text-based product searches, integrating with over 20 food databases.
    - **AI Integration**: OpenAI GPT-4o powers ingredient analysis, the NutriBot chatbot, and generates nutrition insights and fun facts, adaptable to user language. Includes Admin AI Management for model selection (GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-3.5 Turbo), temperature, max tokens, and system prompt customization.
    - **Data Security**: AES-256-CBC encryption for PII, bcrypt for password hashing, secure session management, and encrypted tokens for password reset/email verification. Email addresses are encrypted/hashed for uniqueness, and search history is encrypted.
    - **Consent Management Platform (CMP)**: Integrated for GDPR, US state privacy laws, and IAB Global Privacy Platform (GPP) compliance.
    - **User Profile System**: Comprehensive profile management accessible at `/nutri-dashboard/profile` with editable user information, authentication protection, and specific meal timing fields.
    - **Onboarding System**: Tracks onboarding completion with a popup for incomplete users.
    - **Product Analysis Settings**: Customizable analysis sections with toggleable visibility and localStorage persistence.
    - **NutriBot AI Personalization**: Integrates user profile data (excluding PII) into NutriBot responses for personalized advice.
    - **AI Schedule Generation with Meal Times**: AI-powered nutrition schedule generator automatically includes user's customized meal times (breakfast, lunch, dinner, snack) in schedule requests for personalized meal timing recommendations.
    - **Admin Panel**: Redesigned with tabs for Overview, Users, Products, Settings, Speech, Rewards, and Debug, including AI Management.
    - **Role-Based Access Control**: Dashboard and admin features restricted to Admin users. 
    - **Universal Account Type URL Modification System**: Comprehensive URL modification based on user account types:
      - Paid users: URLs automatically get "?paiduser=true" parameter
      - Regular users: URLs automatically get "?regularuser=true" parameter  
      - Admin users: URLs automatically get "?adminuser=true" parameter
      - Custom hook (usePaidUserNavigation) handles URL generation and navigation
      - System intelligently handles existing query parameters, fragments, and complex URLs
      - AccountTypeTester component provides real-time testing interface
      - Backend API endpoint `/api/auth/account-type` enables account type management
- **Mobile Application**: A corresponding Expo (React Native) mobile app replicates web functionality.

## External Dependencies
- **Food Database APIs**: OpenFoodFacts, FoodDB.ca, USDA Food Data Central, OpenNutrition, Nutritionix, Spoonacular, API Ninjas, UPC Database, Australian Food Composition Database, Health Canada Food Database, European Food Safety Authority (EFSA), and multiple regional food databases.
- **Third-Party Services**: OpenAI GPT-4o, ZXing Library, Neon Database (PostgreSQL hosting), Assembly AI (voice-to-text).
- **Core Dependencies**: React 18, Express.js, Drizzle ORM, Tailwind CSS, React Query, Radix UI.
- **Advertising**: Google AdSense (web), Google AdMob (mobile components for future integration).