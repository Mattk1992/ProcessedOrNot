import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ProcessedOrNot Scanner',
  slug: 'processedornot-scanner',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#3B82F6'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.processedornot.scanner',
    buildNumber: '1.0.0'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#3B82F6'
    },
    package: 'com.processedornot.scanner',
    versionCode: 1,
    permissions: [
      'CAMERA',
      'RECORD_AUDIO',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE'
    ]
  },
  web: {
    favicon: './assets/favicon.png',
    name: 'ProcessedOrNot Scanner',
    shortName: 'ProcessedOrNot',
    lang: 'en',
    scope: '/',
    themeColor: '#3B82F6'
  },
  plugins: [
    [
      'expo-camera',
      {
        cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera for barcode scanning.',
        microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone for video recording.'
      }
    ],
    [
      'expo-barcode-scanner',
      {
        cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera for barcode scanning.'
      }
    ]
  ],
  extra: {
    eas: {
      projectId: 'your-project-id-here'
    }
  }
});