# ProcessedOrNot Scanner - Mobile App

A React Native mobile app built with Expo that provides AI-powered food product analysis through barcode scanning and text search. This mobile app replicates all the functionality from the main website in a native mobile interface.

## Features

- **Barcode Scanning**: Real-time camera scanning with advanced barcode detection
- **Text Search**: Search products by name, brand, or ingredients  
- **AI Analysis**: Processing level analysis and nutritional insights
- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Multi-language Support**: Supports the same 7 languages as the web app
- **Native Performance**: Optimized for iOS and Android platforms
- **API Integration**: Connects to the same backend as the web application

## Technology Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type safety and better development experience
- **React Navigation**: Navigation between screens
- **Expo Camera**: Camera access for barcode scanning
- **Expo Barcode Scanner**: Barcode detection and parsing
- **Axios**: API communication with backend

## Project Structure

```
mobile-app-fresh/
├── src/
│   ├── context/          # React contexts (Theme, API)
│   ├── screens/          # Main app screens
│   └── components/       # Reusable UI components (future)
├── assets/              # Images, fonts, and other assets
├── App.tsx             # Main app component
├── app.json            # Expo configuration
└── package.json        # Dependencies and scripts
```

## Key Screens

1. **HomeScreen**: Main landing page with feature overview and navigation
2. **ScannerScreen**: Camera-based barcode scanning with real-time detection
3. **ProductScreen**: Detailed product information display with nutritional data
4. **SearchScreen**: Text-based product search with tips and suggestions
5. **SettingsScreen**: App configuration and preferences

## Getting Started

### Prerequisites
- Node.js 16+ 
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Navigate to the mobile app directory:
```bash
cd mobile-app-fresh
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Running on Devices

**iOS Simulator:**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

**Physical Device:**
- Install Expo Go app on your device
- Scan the QR code from the terminal

## Backend Integration

The mobile app connects to your existing ProcessedOrNot Scanner backend:

- **Product Search**: POST `/api/search` with query parameter
- **Real-time Analysis**: Same AI-powered processing as web app
- **Multi-database Lookup**: Access to 14+ food databases
- **Nutritional Insights**: Comprehensive product analysis

The API URL is automatically configured:
- Development: `http://localhost:5000` (connects to local server)
- Production: Your Replit domain URL

## Key Features Implementation

✅ **Native Barcode Scanning**: Real-time camera scanning with barcode detection
✅ **AI Product Analysis**: Same processing analysis as web app  
✅ **Cross-platform**: iOS and Android support
✅ **Dark/Light Theme**: Automatic theme switching based on system settings
✅ **Navigation**: Smooth navigation between screens using React Navigation
✅ **Search Functionality**: Text-based product search with suggestions
✅ **Settings**: Customizable app preferences and configuration
✅ **API Integration**: Connects to existing backend seamlessly

## Development

The mobile app is designed to replicate the web application functionality:

- All core features from the website are available natively
- Same AI analysis and processing capabilities
- Consistent user experience across platforms
- Real-time barcode scanning (not available on web)
- Native performance and offline capabilities

## Assets

The app requires the following assets in the `assets/` directory:
- `icon.png` (1024x1024) - App icon
- `adaptive-icon.png` (1024x1024) - Android adaptive icon  
- `favicon.png` (32x32) - Web favicon
- `splash.png` (1284x2778) - Splash screen

## Next Steps

1. **Add Required Assets**: Create proper app icons and splash screens
2. **Install Dependencies**: Run npm install to install all packages
3. **Test on Devices**: Use Expo Go to test on physical devices
4. **Build for Production**: Use Expo's build service for app store deployment
5. **Configure API URL**: Update the production API URL for deployment

## Support

This mobile app provides the full ProcessedOrNot Scanner experience on mobile devices, with all the same functionality as the web application plus native features like camera barcode scanning.