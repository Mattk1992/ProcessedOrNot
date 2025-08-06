# ProcessedOrNot Scanner - Replit Documentation

## Overview
ProcessedOrNot Scanner is a modern web application designed to analyze food products for processing levels. It leverages barcode scanning, AI-powered ingredient analysis, and an interactive chatbot (NutriBot) to provide comprehensive food product insights. The project aims to provide users with transparent and detailed information about the food they consume, fostering healthier dietary choices. It has significant market potential as a tool for health-conscious consumers and aims to become a leading platform for food transparency.

## Recent Changes
- **Industry-Standard Security Implementation**: Implemented comprehensive security upgrade with NIST FIPS 140-3, IEEE P1363, TLS 1.3 (RFC 8446), and ISO/IEC 27001:2022 compliance standards
  - Enhanced encryption system with AES-256-GCM for data at rest and authenticated encryption
  - Upgraded password hashing from bcrypt to Argon2id with NIST-recommended parameters
  - Implemented 90-day automatic key rotation with HSM integration readiness
  - Added post-quantum cryptography support for future-proofing
  - Created comprehensive security API endpoints for compliance monitoring
  - Automatic data migration system for existing users with backward compatibility
- **Security Compliance Features**: 
  - GDPR Article 32 technical measures implementation
  - Continuous security audit logging and penetration testing readiness
  - Certificate pinning capabilities for TLS 1.3 transport security
  - Perfect Forward Secrecy support with modern cipher suites
- **Debug Cascading DB Integration**: Integrated Debug Cascading DB functionality directly into Admin Panel as first tab, removing standalone page route
- **Admin Panel Enhancement**: Restructured Admin Panel with tabbed interface featuring three main sections:
  - Debug Cascading DB (comprehensive database testing and management)
  - System Settings (application configuration)
  - User Management (user role management and permissions)
- **Menu Reorganization**: Completely restructured header dropdown menu with improved logical grouping
- **Role-Based Access Control**: Dashboard page and admin features are restricted to Admin users only
- **In-App Purchase Webhook System**: Comprehensive webhook endpoints for processing purchase status updates from App Store, Google Play, and generic payment providers
  - Automated purchase verification and status tracking in secure database
  - Support for subscriptions, consumables, and non-consumable purchases
  - User subscription management with active subscription tracking
  - Receipt data encryption and webhook payload validation
  - Industry-standard webhook formats with automatic status mapping
- **App-Specific Shared Secret System**: Enterprise-grade secret management for secure webhook verification and API authentication
  - Cryptographically secure secret generation using crypto.randomBytes with NIST-compliant entropy
  - HMAC-SHA256 webhook signature verification with timing-safe comparison for security
  - AES-256-GCM encrypted storage of all secrets with automatic hash generation
  - Automatic 90-day secret rotation with lifecycle management and usage tracking
  - Industry-standard secret formats: App Store (32 chars), Google Play (48 chars), API keys with prefixes
  - Admin API endpoints for secret creation, rotation, deactivation, and verification
  - Support for multiple secret types: webhook verification, API authentication, signing keys
  - Environment-based secret scoping (production, staging, development) with audit logging
- **Content Rights Information System**: Comprehensive intellectual property management and legal compliance framework
  - Database tables for content rights tracking (copyright owners, license types, usage permissions, attribution requirements)
  - Legal notices management system for copyright, terms, disclaimers, and attribution statements
  - Public copyright page displaying third-party licenses, attributions, and legal information
  - API endpoints for content rights verification and legal notice management
  - Support for multiple license types: MIT, Apache 2.0, ODbL, Creative Commons, proprietary licenses
  - Automatic rights verification with expiration tracking and territorial restrictions
  - Complete attribution management for OpenFoodFacts, USDA, Health Canada, and other data sources

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
- **Industry-Standard Security**: Implements NIST FIPS 140-3, IEEE P1363, TLS 1.3 (RFC 8446), and ISO/IEC 27001:2022 compliant security protocols. Features AES-256-GCM encryption for data at rest, RSA-4096/ECC P-384 for asymmetric encryption, Argon2id for password hashing, 90-day key rotation, HSM integration readiness, and post-quantum cryptography support.
- **Enhanced Encryption**: Comprehensive AES-256-GCM encryption with authenticated encryption, PBKDF2-SHA512 key derivation, and backward compatibility with existing data through automatic migration during user sessions.
- **Advanced Security Features**: Email addresses encrypted/hashed for uniqueness, encrypted search history storage, enhanced session security with TLS 1.3 support, certificate pinning capabilities, and encrypted tokens with HMAC authentication for password reset and email verification.
- **Consent Management Platform (CMP)**: Integrated system for GDPR, US state privacy laws, and IAB Global Privacy Platform (GPP) compliance, managing user consent for ads.
- **Reward System**: Tracks user searches/scans and triggers a reward URL visit after every 6 interactions, applicable to both logged-in and anonymous users.
- **Mobile Application**: A corresponding Expo (React Native) mobile app replicates all web functionality, offering native barcode scanning and seamless integration.

## External Dependencies
- **Food Database APIs**: OpenFoodFacts (primary), FoodDB.ca, USDA Food Data Central, OpenNutrition, Nutritionix, Spoonacular, API Ninjas, UPC Database, Australian Food Composition Database, Health Canada Food Database, European Food Safety Authority (EFSA), and multiple regional food databases.
- **Third-Party Services**: OpenAI GPT-4o (AI analysis, chatbot), ZXing Library (barcode scanning), Neon Database (PostgreSQL hosting), Assembly AI (voice-to-text for voice search).
- **Core Dependencies**: React 18, Express.js, Drizzle ORM, Tailwind CSS, React Query, Radix UI.
- **Advertising**: Google AdSense (web), Google AdMob (mobile components for future integration).