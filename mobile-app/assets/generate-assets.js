const fs = require('fs');
const path = require('path');

/**
 * Asset Generation Script for ProcessedOrNot Scanner Mobile App
 * 
 * This script converts SVG assets to PNG format for use in the Expo app.
 * Run this script to generate all required PNG assets from SVG sources.
 */

console.log('🎨 ProcessedOrNot Scanner Asset Generator');
console.log('==========================================');

// Asset configurations
const assets = [
  {
    name: 'icon',
    source: './icon.svg',
    output: './icon.png',
    size: '1024x1024',
    description: 'Main app icon'
  },
  {
    name: 'adaptive-icon',
    source: './adaptive-icon.svg',
    output: './adaptive-icon.png',
    size: '1024x1024',
    description: 'Android adaptive icon'
  },
  {
    name: 'favicon',
    source: './favicon.svg',
    output: './favicon.png',
    size: '32x32',
    description: 'Web favicon'
  },
  {
    name: 'splash',
    source: './splash.svg',
    output: './splash.png',
    size: '1284x2778',
    description: 'Splash screen'
  },
  {
    name: 'icon-foreground',
    source: './icon-foreground.svg',
    output: './icon-foreground.png',
    size: '1024x1024',
    description: 'Adaptive icon foreground'
  },
  {
    name: 'icon-background',
    source: './icon-background.svg',
    output: './icon-background.png',
    size: '1024x1024',
    description: 'Adaptive icon background'
  }
];

// Check if required SVG files exist
console.log('📋 Checking SVG source files...');
let allFilesExist = true;

assets.forEach(asset => {
  const sourcePath = path.join(__dirname, asset.source);
  if (fs.existsSync(sourcePath)) {
    console.log(`✅ ${asset.name}: ${asset.source} found`);
  } else {
    console.log(`❌ ${asset.name}: ${asset.source} not found`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some SVG source files are missing. Please ensure all SVG files are in the assets directory.');
  process.exit(1);
}

console.log('\n🔄 Converting SVG to PNG...');
console.log('Note: This requires a SVG to PNG converter tool.');
console.log('You can use online tools or install imagemagick/rsvg-convert:');
console.log('');
console.log('Option 1: Install imagemagick');
console.log('  macOS: brew install imagemagick');
console.log('  Ubuntu: sudo apt-get install imagemagick');
console.log('  Windows: Download from https://imagemagick.org/');
console.log('');
console.log('Option 2: Install rsvg-convert');
console.log('  macOS: brew install librsvg');
console.log('  Ubuntu: sudo apt-get install librsvg2-bin');
console.log('');
console.log('Option 3: Use online converter');
console.log('  Upload SVG files to https://convertio.co/svg-png/');
console.log('');

// Generate conversion commands
console.log('📝 Conversion commands:');
console.log('');

assets.forEach(asset => {
  console.log(`# ${asset.description}`);
  console.log(`magick ${asset.source} -resize ${asset.size} ${asset.output}`);
  console.log(`# OR`);
  console.log(`rsvg-convert -w ${asset.size.split('x')[0]} -h ${asset.size.split('x')[1]} ${asset.source} > ${asset.output}`);
  console.log('');
});

console.log('🚀 Once PNG files are generated, your app will be ready to build!');
console.log('');
console.log('Asset summary:');
assets.forEach(asset => {
  console.log(`  ${asset.name}: ${asset.size} - ${asset.description}`);
});