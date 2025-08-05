# ProcessedOrNot Scanner - Replit Documentation

## Overview
ProcessedOrNot Scanner is a modern web application designed to analyze food products for processing levels. It leverages barcode scanning, AI-powered ingredient analysis, and an interactive chatbot (NutriBot) to provide comprehensive food product insights. The project aims to provide users with transparent and detailed information about the food they consume, fostering healthier dietary choices. It has significant market potential as a tool for health-conscious consumers and aims to become a leading platform for food transparency.

## Recent Changes
- **Debug Cascading DB Integration**: Integrated Debug Cascading DB functionality directly into Admin Panel as first tab, removing standalone page route
- **Admin Panel Enhancement**: Restructured Admin Panel with tabbed interface featuring three main sections:
  - Debug Cascading DB (comprehensive database testing and management)
  - System Settings (application configuration)
  - User Management (user role management and permissions)
- **Improved Organization**: Debug Cascading DB now accessible through Admin Panel tabs instead of separate route, providing better admin workflow
- **Menu Reorganization**: Completely restructured header dropdown menu with improved logical grouping:
  - Main Navigation (always expanded)
  - User Account (with Dashboard for Admin, Sign Out)
  - Admin Tools (collapsed by default - Admin Panel, Take Tour, Debug Tools)
  - Information & Support (collapsed by default)
  - Legal & Privacy (collapsed by default)
- **Simplified Home Page**: Home page now shows simple redirect screen to product-lookup page
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