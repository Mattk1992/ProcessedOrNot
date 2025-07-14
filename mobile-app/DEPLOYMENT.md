# Mobile App Deployment Guide

## Setup Instructions

### 1. Configure Backend API URL

First, update the API endpoint in `src/context/ApiContext.tsx`:

```typescript
// Replace with your actual Replit domain
const API_BASE_URL = 'https://your-replit-domain.replit.app';
```

### 2. Install Dependencies

```bash
cd mobile-app
npm install
```

### 3. Add Required Assets

Create the following assets in the `assets/` directory:
- `icon.png` (1024x1024)
- `adaptive-icon.png` (1024x1024) 
- `favicon.png` (32x32)
- `splash.png` (1284x2778)

### 4. Test the App

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator  
npm run android
```

## Building for Production

### iOS Build

1. Configure Apple Developer Account
2. Update bundle identifier in `app.json`
3. Build for iOS:
```bash
expo build:ios
```

### Android Build

1. Configure Google Play Console
2. Update package name in `app.json`
3. Build for Android:
```bash
expo build:android
```

## Key Features Implemented

✅ **Native Barcode Scanning**: Real-time camera scanning with barcode detection
✅ **AI Product Analysis**: Same processing analysis as web app
✅ **Cross-platform**: iOS and Android support
✅ **Dark/Light Theme**: Automatic theme switching
✅ **Navigation**: Smooth navigation between screens
✅ **Search Functionality**: Text-based product search
✅ **Settings**: Customizable app preferences
✅ **API Integration**: Connects to existing backend

## Next Steps

1. **Add App Assets**: Create proper icons and splash screens
2. **Configure API URL**: Set your Replit domain
3. **Test on Devices**: Install Expo Go and test functionality
4. **Build for Stores**: Use Expo's build service
5. **Submit to App Stores**: Follow Apple and Google guidelines

## Backend Integration

The mobile app uses your existing ProcessedOrNot Scanner backend:
- All API endpoints remain the same
- Database structure is unchanged
- AI analysis functionality is preserved
- Multi-database lookup works identically

## Troubleshooting

**Camera Permission Issues**: Ensure proper permissions in `app.json`
**API Connection**: Check your backend URL and CORS settings
**Build Errors**: Verify all dependencies are installed
**Asset Missing**: Add required icons and splash screens

## Support

For issues with:
- **Expo**: Check Expo documentation
- **React Native**: Refer to React Native guides
- **Backend API**: Use your existing ProcessedOrNot Scanner support