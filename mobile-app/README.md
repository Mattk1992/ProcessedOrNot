# ProcessedOrNot Scanner - Mobile App

A React Native mobile app built with Expo that provides AI-powered food product analysis through barcode scanning and text search.

## Features

- **Barcode Scanning**: Real-time camera scanning with advanced barcode detection
- **Text Search**: Search products by name, brand, or ingredients
- **AI Analysis**: Processing level analysis and nutritional insights
- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Multi-language Support**: Supports the same 7 languages as the web app
- **Offline Capabilities**: Basic functionality works without internet
- **Native Performance**: Optimized for iOS and Android platforms

## Getting Started

### Prerequisites
- Node.js 16+ 
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Navigate to the mobile app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure your backend API URL in `src/context/ApiContext.tsx`:
```typescript
const API_BASE_URL = 'https://your-replit-domain.replit.app';
```

4. Start the development server:
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

## Architecture

### Technology Stack
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type safety and better development experience
- **React Navigation**: Navigation between screens
- **Expo Camera**: Camera access for barcode scanning
- **Expo Barcode Scanner**: Barcode detection and parsing

### Project Structure
```
mobile-app/
├── src/
│   ├── context/          # React contexts (Theme, API)
│   ├── screens/          # Main app screens
│   └── components/       # Reusable UI components
├── assets/              # Images, fonts, and other assets
├── App.tsx             # Main app component
├── app.json            # Expo configuration
└── package.json        # Dependencies and scripts
```

### Key Components

1. **HomeScreen**: Main landing page with feature overview
2. **ScannerScreen**: Camera-based barcode scanning
3. **ProductScreen**: Detailed product information display
4. **SearchScreen**: Text-based product search
5. **SettingsScreen**: App configuration and preferences

### API Integration

The mobile app connects to your existing ProcessedOrNot Scanner backend:

- **Product Search**: POST `/api/search` with query parameter
- **Real-time Analysis**: Same AI-powered processing as web app
- **Multi-database Lookup**: Access to 14+ food databases
- **Nutritional Insights**: Complete ingredient and nutrition analysis

## Development

### Adding New Features

1. Create new screens in `src/screens/`
2. Add navigation routes in `App.tsx`
3. Update types and interfaces as needed
4. Test on both iOS and Android

### Customization

- **Colors**: Modify theme colors in `src/context/ThemeContext.tsx`
- **Navigation**: Update navigation structure in `App.tsx`
- **API Endpoints**: Configure API URLs in `src/context/ApiContext.tsx`

## Building for Production

### iOS Build
```bash
expo build:ios
```

### Android Build
```bash
expo build:android
```

### Publishing to App Stores

1. **Configure app.json**: Set proper bundle identifiers and app details
2. **Generate assets**: Create proper icons and splash screens
3. **Build signed APK/IPA**: Use Expo's build service
4. **Submit to stores**: Follow Apple App Store and Google Play Store guidelines

## Permissions

The app requires the following permissions:
- **Camera**: For barcode scanning
- **Internet**: For product data lookup
- **Network State**: To check connectivity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple devices
5. Submit a pull request

## License

This project is licensed under the MIT License.