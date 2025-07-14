# Mobile App Dependencies Installation Guide

## Current Status
The mobile app structure is complete with all necessary configuration files, but dependencies need to be installed in a local development environment.

## Quick Installation (Recommended)

### Local Development Environment
```bash
# Navigate to mobile-app directory
cd mobile-app

# Install dependencies with compatibility flags
npm install --legacy-peer-deps

# Alternative if above fails
npm install --force

# Or using yarn
yarn install
```

## Dependencies Overview

### Production Dependencies (19 packages)
```json
{
  "expo": "~49.0.0",
  "expo-status-bar": "~1.6.0",
  "react": "18.2.0",
  "react-native": "0.72.6",
  "expo-camera": "~13.4.0",
  "expo-barcode-scanner": "~12.5.0",
  "expo-constants": "~14.4.2",
  "expo-permissions": "~14.2.1",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/stack": "^6.3.0",
  "react-native-screens": "~3.22.0",
  "react-native-safe-area-context": "4.6.3",
  "react-native-gesture-handler": "~2.12.0",
  "react-native-reanimated": "~3.3.0",
  "axios": "^1.6.0",
  "expo-linear-gradient": "~12.3.0",
  "expo-haptics": "~12.4.0",
  "expo-speech": "~11.3.0",
  "expo-av": "~13.4.0"
}
```

### Development Dependencies (4 packages)
```json
{
  "@babel/core": "^7.20.0",
  "@types/react": "~18.2.0",
  "@types/react-native": "~0.72.0",
  "typescript": "^5.1.0"
}
```

## Installation Process

### Step 1: Prerequisites
```bash
# Install Node.js 18+ and npm
node --version  # Should show v18.x.x or higher
npm --version   # Should show 8.x.x or higher

# Install Expo CLI globally
npm install -g @expo/cli
```

### Step 2: Install Dependencies
```bash
cd mobile-app
npm install --legacy-peer-deps
```

### Step 3: Verify Installation
```bash
# Check if node_modules was created
ls -la node_modules/

# Should show ~800+ packages installed
ls node_modules/ | wc -l
```

## Troubleshooting

### Common Installation Issues

#### Issue: Peer dependency conflicts
```bash
# Solution: Use legacy peer deps flag
npm install --legacy-peer-deps
```

#### Issue: Network timeouts
```bash
# Solution: Increase timeout and use different registry
npm install --registry https://registry.npmjs.org/ --timeout 60000
```

#### Issue: Permission errors
```bash
# Solution: Use npm without sudo
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Alternative Installation Methods

#### Using Yarn
```bash
# Install yarn if not available
npm install -g yarn

# Install dependencies
yarn install
```

#### Using pnpm
```bash
# Install pnpm if not available
npm install -g pnpm

# Install dependencies
pnpm install
```

## Post-Installation Steps

### 1. Configure API Endpoint
Edit `src/context/ApiContext.tsx`:
```typescript
const API_BASE_URL = 'https://your-replit-domain.replit.app';
```

### 2. Start Development Server
```bash
npm start
```

### 3. Test on Device
- Install Expo Go app on your mobile device
- Scan QR code from terminal
- Test barcode scanning functionality

## File Structure After Installation
```
mobile-app/
├── node_modules/          # 800+ packages (created after npm install)
├── package-lock.json      # Lockfile (created after npm install)
├── App.tsx               # Main app component
├── package.json          # Dependencies configuration
├── app.json             # Expo configuration
├── src/                 # Source code
└── assets/              # App icons and images
```

## Development Commands

### Available Scripts
```bash
npm start          # Start development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run on web browser
```

### Build Commands
```bash
# EAS Build (recommended for production)
npm install -g @expo/eas-cli
eas build --platform android
eas build --platform ios
```

## Environment Requirements

### System Requirements
- macOS, Windows, or Linux
- Node.js 18+ 
- npm 8+
- Git
- 4GB+ RAM available
- 2GB+ free disk space

### Mobile Development
- iOS: Xcode 12+ (for iOS simulator)
- Android: Android Studio with SDK 30+
- Physical device with Expo Go app

## Success Indicators
✅ node_modules directory exists with 800+ packages
✅ package-lock.json file created
✅ `npm start` command works without errors
✅ QR code appears in terminal
✅ App loads on device via Expo Go
✅ Camera permissions work correctly
✅ Barcode scanning functionality active

## Next Steps After Installation
1. Configure backend API endpoint
2. Test all app features
3. Customize app branding
4. Add additional features as needed
5. Prepare for app store deployment

The mobile app is fully configured and ready for development once dependencies are installed!