# ProcessedOrNot Scanner Mobile App Assets

## Overview
This directory contains all visual assets for the ProcessedOrNot Scanner mobile app, including icons, splash screens, and adaptive icons for iOS and Android platforms.

## Asset Files

### Icons
- **icon.svg** - Main app icon source (1024x1024)
- **icon.png** - Generated main app icon (1024x1024)
- **adaptive-icon.svg** - Android adaptive icon source (1024x1024)
- **adaptive-icon.png** - Generated Android adaptive icon (1024x1024)
- **icon-foreground.svg** - Adaptive icon foreground layer (1024x1024)
- **icon-foreground.png** - Generated foreground layer (1024x1024)
- **icon-background.svg** - Adaptive icon background layer (1024x1024)
- **icon-background.png** - Generated background layer (1024x1024)

### Splash Screen
- **splash.svg** - Splash screen source (1284x2778)
- **splash.png** - Generated splash screen (1284x2778)

### Web Assets
- **favicon.svg** - Web favicon source (32x32)
- **favicon.png** - Generated web favicon (32x32)

## Design Elements

### Color Scheme
- **Primary Blue**: #3B82F6 (Blue 500)
- **Secondary Blue**: #1E40AF (Blue 800)
- **Accent Green**: #10B981 (Emerald 500)
- **Background**: White (#FFFFFF)

### Brand Identity
- **Scanner Frame**: White outlined frame with corner markers
- **Barcode**: Stylized white barcode lines
- **Scanning Line**: Green gradient animation line
- **Typography**: System fonts (SF Pro Display/Roboto)

### Icon Features
- Blue gradient background (#3B82F6 to #1E40AF)
- White scanner frame with corner guides
- Stylized barcode representation
- Green scanning line animation
- Clean, modern design aesthetic

## Platform-Specific Assets

### iOS
- Uses `icon.png` as main app icon
- Supports light/dark mode adaptation
- Optimized for retina displays

### Android
- Uses adaptive icon system with separate foreground and background layers
- Background: Blue gradient with subtle decorative elements
- Foreground: White scanner frame with barcode
- Supports Material Design guidelines

### Web
- Uses 32x32 favicon for web deployment
- Simplified design for small scale display

## Asset Generation

### SVG to PNG Conversion
Run the asset generation script:
```bash
cd mobile-app/assets
node generate-assets.js
```

### Manual Conversion
If you need to convert SVG to PNG manually:

**Using ImageMagick:**
```bash
magick icon.svg -resize 1024x1024 icon.png
magick adaptive-icon.svg -resize 1024x1024 adaptive-icon.png
magick favicon.svg -resize 32x32 favicon.png
magick splash.svg -resize 1284x2778 splash.png
magick icon-foreground.svg -resize 1024x1024 icon-foreground.png
magick icon-background.svg -resize 1024x1024 icon-background.png
```

**Using rsvg-convert:**
```bash
rsvg-convert -w 1024 -h 1024 icon.svg > icon.png
rsvg-convert -w 1024 -h 1024 adaptive-icon.svg > adaptive-icon.png
rsvg-convert -w 32 -h 32 favicon.svg > favicon.png
rsvg-convert -w 1284 -h 2778 splash.svg > splash.png
rsvg-convert -w 1024 -h 1024 icon-foreground.svg > icon-foreground.png
rsvg-convert -w 1024 -h 1024 icon-background.svg > icon-background.png
```

## App Configuration

The `app.json` file is configured to use these assets:
- Main icon: `./assets/icon.png`
- Splash screen: `./assets/splash.png`
- Android adaptive icon: `./assets/icon-foreground.png` + `./assets/icon-background.png`
- Web favicon: `./assets/favicon.png`

## Quality Guidelines

### Icon Design
- Maintain 1024x1024 resolution for crisp display
- Use proper padding (10% margin minimum)
- Ensure visibility at small sizes (16x16 to 512x512)
- Follow platform-specific design guidelines

### Splash Screen
- Match app brand colors
- Keep loading time minimal
- Ensure proper scaling on all device sizes
- Use appropriate resolution for target devices

### File Formats
- **SVG**: Source files for scalability and editing
- **PNG**: Production files for app builds
- **32-bit PNG**: For transparency support

## Usage in App

These assets are automatically loaded by Expo/React Native:
- App icon appears on home screen and app store
- Splash screen displays during app launch
- Adaptive icons provide dynamic theming on Android
- Favicon used for web deployment

## Maintenance

When updating assets:
1. Edit the SVG source files
2. Regenerate PNG files using the conversion script
3. Test on both iOS and Android devices
4. Verify web favicon displays correctly
5. Update this documentation if needed

## Brand Consistency

All assets maintain consistent:
- Color palette (blue gradient, green accent, white elements)
- Typography (system fonts, proper weight hierarchy)
- Visual style (scanner frame, barcode elements, scanning line)
- Brand messaging (ProcessedOrNot Scanner identity)