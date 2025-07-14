# ProcessedOrNot Scanner Mobile App - Complete Setup Guide

## Project Overview
A React Native mobile application for scanning and analyzing food products using AI-powered technology. The app provides barcode scanning, product analysis, and nutritional insights.

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Expo CLI (`npm install -g @expo/cli`)
- Mobile device with Expo Go app OR emulator setup

## Installation Steps

### 1. Navigate to Mobile App Directory
```bash
cd mobile-app
```

### 2. Install Dependencies
```bash
# Install all required packages
npm install --legacy-peer-deps

# Alternative for compatibility issues
npm install --force
```

### 3. Configure Backend Connection
Edit `src/context/ApiContext.tsx` and update the API URL:
```typescript
// Replace with your actual Replit domain
const API_BASE_URL = 'https://your-replit-domain.replit.app';
```

### 4. Start Development Server
```bash
# Start Expo development server
npm start

# Or run on specific platform
npm run android  # For Android
npm run ios      # For iOS
```

### 5. Test on Device
- Install Expo Go app on your mobile device
- Scan the QR code from the terminal
- Test barcode scanning and product analysis features

## Project Structure
```
mobile-app/
├── App.tsx                 # Main app component
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── babel.config.js        # Babel configuration
├── assets/                # App icons and splash screens
│   ├── icon.svg
│   ├── splash.svg
│   └── adaptive-icon.svg
└── src/
    ├── context/           # React contexts
    │   ├── ApiContext.tsx
    │   └── ThemeContext.tsx
    ├── screens/           # App screens
    │   ├── HomeScreen.tsx
    │   ├── ScannerScreen.tsx
    │   ├── ProductScreen.tsx
    │   ├── SearchScreen.tsx
    │   └── SettingsScreen.tsx
    └── components/        # Reusable components
        └── (various UI components)
```

## Key Features
- **Native Barcode Scanning**: Real-time camera-based scanning
- **AI Product Analysis**: Processing level analysis using OpenAI
- **Text Search**: Product search by name or description
- **Dark/Light Theme**: Automatic theme switching
- **Cross-platform**: iOS and Android support
- **API Integration**: Connects to ProcessedOrNot backend
- **Offline Capabilities**: Local caching for better performance

## Troubleshooting

### Common Issues
1. **Dependencies not installing**: Use `--legacy-peer-deps` flag
2. **Camera not working**: Check device permissions
3. **API connection issues**: Verify backend URL in ApiContext.tsx
4. **Build errors**: Clear node_modules and reinstall

### Debug Commands
```bash
# Clear cache
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache

# Check Expo doctor
npx expo doctor
```

## Development Tips
- Use Expo Go for rapid testing
- Test camera functionality on real device
- Monitor network requests in development
- Use React DevTools for debugging

## Production Build
```bash
# Build for production
npx expo build:android
npx expo build:ios

# Or use EAS Build (recommended)
npm install -g @expo/eas-cli
eas build --platform android
eas build --platform ios
```

## API Integration
The app integrates with the ProcessedOrNot backend:
- **Search endpoint**: `/api/search`
- **Product analysis**: Uses existing AI processing
- **Authentication**: Session-based auth
- **Multi-database lookup**: 14+ food databases

## Next Steps
1. Complete dependency installation
2. Configure API endpoint
3. Test on physical device
4. Customize branding/colors
5. Add additional features
6. Prepare for app store submission

## Support
For issues with the mobile app:
- Check Expo documentation
- Review React Native guides
- Use existing ProcessedOrNot backend APIs
- Test thoroughly on multiple devices