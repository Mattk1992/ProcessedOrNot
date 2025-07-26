#!/usr/bin/env node

/**
 * Automatic Play Store Info Updater
 * 
 * This script monitors replit.md for changes and automatically updates
 * the Google Play Store listing information when new features are added.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PlayStoreInfoUpdater {
  constructor() {
    this.replitMdPath = path.join(__dirname, '..', 'replit.md');
    this.playStoreInfoPath = path.join(__dirname, '..', 'ProcessedOrNot_PlayStore_Info.txt');
    this.lastUpdateFile = path.join(__dirname, '..', '.playstore-last-update');
  }

  /**
   * Extract recent features and enhancements from replit.md changelog
   */
  extractRecentFeatures(content) {
    const features = [];
    const changelogMatch = content.match(/## Changelog\s*\n([\s\S]*?)(?=\n##|$)/);
    
    if (changelogMatch) {
      const changelog = changelogMatch[1];
      const entries = changelog.split('\n').filter(line => line.trim().startsWith('-'));
      
      // Get the most recent entries (last 5 for Play Store)
      const recentEntries = entries.slice(-5);
      
      for (const entry of recentEntries) {
        // Extract and clean feature descriptions
        const cleanEntry = entry.replace(/^-\s*\w+\s+\d+,\s+\d+\.\s*/, '').trim();
        if (cleanEntry.length > 25) {
          // Convert technical descriptions to user-friendly language
          const userFriendly = this.makeUserFriendly(cleanEntry);
          features.push(userFriendly);
        }
      }
    }
    
    return features;
  }

  /**
   * Convert technical feature descriptions to user-friendly language
   */
  makeUserFriendly(technicalDescription) {
    const conversions = {
      'Assembly AI STT engine': 'voice recognition technology',
      'AES-256-CBC encryption': 'advanced security encryption',
      'VoiceSearchButton component': 'voice search feature',
      'OpenAI GPT-4o': 'AI-powered analysis',
      'React Native': 'mobile app technology',
      'PostgreSQL database': 'secure data storage',
      'API endpoints': 'app functionality',
      'TypeScript': 'robust programming',
      'barcode scanning': 'product scanning',
      'multi-language support': 'language options',
      'admin panel': 'management features',
      'user authentication': 'secure login system',
      'search history tracking': 'personal search history',
      'real-time notifications': 'instant alerts'
    };

    let friendly = technicalDescription;
    
    // Apply conversions
    for (const [technical, userFriendly] of Object.entries(conversions)) {
      friendly = friendly.replace(new RegExp(technical, 'gi'), userFriendly);
    }

    // Capitalize first letter and ensure proper sentence structure
    friendly = friendly.charAt(0).toUpperCase() + friendly.slice(1);
    
    // Remove technical jargon and clean up
    friendly = friendly
      .replace(/\b(implemented|added|created|enhanced)\s+/gi, '')
      .replace(/\b(comprehensive|complete|advanced)\s+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    return friendly;
  }

  /**
   * Extract key app features for the feature list
   */
  extractAppFeatures(content) {
    const features = [];
    
    // Look for key components and features
    const keyFeatures = [
      'barcode scanning',
      'voice search',
      'AI analysis',
      'multi-language support',
      'encryption',
      'nutrition analysis',
      'food database',
      'mobile app',
      'chat assistant'
    ];

    for (const feature of keyFeatures) {
      if (content.toLowerCase().includes(feature)) {
        features.push(feature);
      }
    }

    return features;
  }

  /**
   * Update the Play Store info with new features and information
   */
  updatePlayStoreInfo() {
    try {
      // Read current files
      const replitContent = fs.readFileSync(this.replitMdPath, 'utf8');
      const currentPlayStoreInfo = fs.readFileSync(this.playStoreInfoPath, 'utf8');
      
      // Extract recent features
      const recentFeatures = this.extractRecentFeatures(replitContent);
      
      // Get current date
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Update the last updated date
      let updatedInfo = currentPlayStoreInfo.replace(
        /\*Last Updated: .*?\*/,
        `*Last Updated: ${currentDate}*`
      );

      // Update the "What's New" section with recent features
      if (recentFeatures.length > 0) {
        const newFeatures = recentFeatures.slice(0, 4).map(feature => 
          `• ${feature}`
        ).join('\n');
        
        // Find and replace the "What's New" section
        const whatsNewRegex = /(\*\*What's New \(Latest Version\):\*\*\n)([\s\S]*?)(?=\n\*\*Developer:)/;
        const whatsNewMatch = updatedInfo.match(whatsNewRegex);
        
        if (whatsNewMatch) {
          const newWhatsNew = `**What's New (Latest Version):**\n${newFeatures}\n`;
          updatedInfo = updatedInfo.replace(whatsNewRegex, newWhatsNew);
        }
      }

      // Update version info if we have new features
      if (recentFeatures.length > 0) {
        // Increment version in app title if needed
        const versionMatch = updatedInfo.match(/ProcessedOrNot Scanner - AI Food Analysis( v[\d.]+)?/);
        if (versionMatch) {
          const today = new Date();
          const versionString = ` v${today.getFullYear()}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getDate().toString().padStart(2, '0')}`;
          updatedInfo = updatedInfo.replace(
            'ProcessedOrNot Scanner - AI Food Analysis',
            `ProcessedOrNot Scanner - AI Food Analysis${versionString}`
          );
        }
      }

      // Write updated Play Store info
      fs.writeFileSync(this.playStoreInfoPath, updatedInfo);
      
      // Update last update timestamp
      fs.writeFileSync(this.lastUpdateFile, Date.now().toString());
      
      console.log(`✅ Play Store info updated successfully on ${currentDate}`);
      console.log(`📱 Added ${recentFeatures.length} recent features to "What's New"`);
      
      return true;
    } catch (error) {
      console.error('❌ Error updating Play Store info:', error.message);
      return false;
    }
  }

  /**
   * Check if replit.md has been modified since last update
   */
  shouldUpdate() {
    try {
      const replitStats = fs.statSync(this.replitMdPath);
      const replitModified = replitStats.mtime.getTime();
      
      if (!fs.existsSync(this.lastUpdateFile)) {
        return true;
      }
      
      const lastUpdate = parseInt(fs.readFileSync(this.lastUpdateFile, 'utf8'));
      return replitModified > lastUpdate;
    } catch (error) {
      console.error('Error checking update status:', error.message);
      return true;
    }
  }

  /**
   * Run the updater
   */
  run() {
    console.log('🔍 Checking for Play Store info updates...');
    
    if (this.shouldUpdate()) {
      console.log('📝 Changes detected in replit.md - updating Play Store info...');
      return this.updatePlayStoreInfo();
    } else {
      console.log('✅ Play Store info is up to date');
      return true;
    }
  }
}

// Run the updater if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const updater = new PlayStoreInfoUpdater();
  const success = updater.run();
  process.exit(success ? 0 : 1);
}

export default PlayStoreInfoUpdater;