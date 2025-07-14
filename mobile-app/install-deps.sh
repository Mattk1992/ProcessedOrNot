#!/bin/bash

# Mobile App Dependencies Installation Script
# This script installs all necessary dependencies for the ProcessedOrNot Mobile App

echo "Starting mobile app dependency installation..."
echo "Current directory: $(pwd)"

# Check if we're in the mobile-app directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Are you in the mobile-app directory?"
    exit 1
fi

# Clean up any existing node_modules
echo "Cleaning up existing node_modules..."
rm -rf node_modules
rm -f package-lock.json

# Update package.json with compatible versions
echo "Updating package.json with compatible versions..."
cat > package.json << 'EOF'
{
  "name": "processedornot-mobile",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "eject": "expo eject"
  },
  "dependencies": {
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
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.0",
    "@types/react-native": "~0.72.0",
    "typescript": "^5.1.0"
  },
  "private": true
}
EOF

echo "Package.json updated with compatible versions."

# Try to install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Installation completed!"

# Check if node_modules was created
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed successfully!"
    echo "Node modules directory created with $(ls node_modules | wc -l) packages"
else
    echo "❌ Installation failed - node_modules directory not created"
    exit 1
fi

echo "Mobile app is ready for development!"