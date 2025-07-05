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
   - Fallback: USDA FoodData Central, UPC Database, and 10+ other food databases
3. **Data Processing**: Product information is normalized and stored locally
4. **AI Analysis**: OpenAI analyzes ingredients for processing level (0-10 scale)
5. **Results Display**: Comprehensive product information with processing analysis

### Smart Lookup System
- **Barcode Detection**: Regex patterns identify various barcode formats (EAN-8, UPC-A, EAN-13, ITF-14)
- **Text Search**: OpenAI-powered product search for text queries
- **Multi-Database Integration**: 14 different food databases for comprehensive coverage

### AI Integration Points
- **Ingredient Analysis**: OpenAI GPT-4o analyzes ingredient lists for processing levels
- **NutriBot Chat**: Interactive nutritionist chatbot for product advice
- **Nutrition Insights**: AI-generated health assessments and fun facts
- **Multi-language Support**: All AI responses adapt to user's selected language

## External Dependencies

### Food Database APIs
- OpenFoodFacts (primary)
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

## Changelog

Changelog:
- June 16, 2025. Initial setup
- June 16, 2025. Implemented comprehensive user account system with secure authentication, registration, login pages, password hashing, email verification, password reset functionality, and session management
- June 16, 2025. Added user role system with Admin and Regular user types, role management API endpoints, and set user ID 1 to Admin role
- June 16, 2025. Implemented comprehensive admin panel with user management, role updates, system statistics, admin-only routes, and admin access controls integrated into the application navigation
- July 5, 2025. Implemented search history database system with automatic tracking of all product searches, search ID generation, search input type detection (BarcodeInput vs TextInput), and comprehensive API endpoints for search history management and statistics
- July 5, 2025. Fixed and enhanced text search functionality with two-step OpenAI process: keyword optimization and realistic nutritional data generation. Added multi-language support for Dutch terms like "Gehakt" and "Gehaktbal". Improved error handling and fallback mechanisms for robust text-based product searches.
- July 5, 2025. Enhanced search history database system with comprehensive search result tracking. Added automatic capture of complete product data, processing scores, nutritional information, lookup sources, and error details. Implemented duplicate prevention based on search input to avoid redundant database entries. System now tracks successful searches, failed searches, and cached results with full context.

## User Preferences

Preferred communication style: Simple, everyday language.