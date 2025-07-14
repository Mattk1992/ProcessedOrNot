#!/usr/bin/env node
/**
 * Mobile App Dependencies Installation Script
 * This script helps install React Native dependencies for the ProcessedOrNot mobile app
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ProcessedOrNot Mobile App - Dependencies Installation');
console.log('=' .repeat(60));

// Read package.json
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found in mobile-app directory');
    process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
console.log(`📦 App Name: ${packageJson.name}`);
console.log(`📱 Version: ${packageJson.version}`);
console.log('');

// Dependencies to install
const dependencies = Object.keys(packageJson.dependencies || {});
const devDependencies = Object.keys(packageJson.devDependencies || {});

console.log('📋 Dependencies to install:');
console.log('Production dependencies:', dependencies.length);
dependencies.forEach(dep => console.log(`  - ${dep}`));
console.log('Development dependencies:', devDependencies.length);
devDependencies.forEach(dep => console.log(`  - ${dep}`));
console.log('');

// Check if running in Replit environment
const isReplit = process.env.REPLIT_SLUG || process.env.REPLIT_URL;
if (isReplit) {
    console.log('🔧 Detected Replit environment');
    console.log('Note: Use the packager tool to install dependencies in Replit');
    console.log('');
    console.log('Commands to run:');
    console.log('1. Use the packager tool to install Node.js dependencies');
    console.log('2. Or install dependencies in a local development environment');
    console.log('');
} else {
    console.log('💻 Local development environment detected');
    console.log('Installing dependencies...');
    
    try {
        // Install dependencies
        console.log('Running npm install...');
        execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
        console.log('✅ Dependencies installed successfully!');
    } catch (error) {
        console.error('❌ Failed to install dependencies:', error.message);
        console.log('');
        console.log('Alternative installation methods:');
        console.log('1. npm install --legacy-peer-deps');
        console.log('2. npm install --force');
        console.log('3. yarn install');
        process.exit(1);
    }
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
    const nodeModulesCount = fs.readdirSync(nodeModulesPath).length;
    console.log(`✅ node_modules directory exists with ${nodeModulesCount} packages`);
} else {
    console.log('📝 node_modules directory not found');
    console.log('To complete setup:');
    console.log('1. Navigate to mobile-app directory');
    console.log('2. Run: npm install --legacy-peer-deps');
    console.log('3. Start development: npm start');
}

console.log('');
console.log('🎯 Next steps:');
console.log('1. Configure API endpoint in src/context/ApiContext.tsx');
console.log('2. Test on device with Expo Go');
console.log('3. Run npm start to begin development');
console.log('');
console.log('📚 Documentation:');
console.log('- COMPLETE_SETUP_GUIDE.md - Full setup instructions');
console.log('- DEPLOYMENT_CHECKLIST.md - Deployment checklist');
console.log('- README.md - Project overview');
console.log('');
console.log('🎉 Mobile app setup is ready!');