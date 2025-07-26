#!/usr/bin/env node

/**
 * Automatic LinkedIn Profile Updater
 * 
 * This script monitors replit.md for changes and automatically updates
 * the LinkedIn profile information when new features are added.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LinkedInProfileUpdater {
  constructor() {
    this.replitMdPath = path.join(__dirname, '..', 'replit.md');
    this.linkedinProfilePath = path.join(__dirname, '..', 'ProcessedOrNot_LinkedIn_Profile.txt');
    this.lastUpdateFile = path.join(__dirname, '..', '.linkedin-last-update');
  }

  /**
   * Extract features and capabilities from replit.md changelog
   */
  extractFeaturesFromChangelog(content) {
    const features = [];
    const changelogMatch = content.match(/## Changelog\s*\n([\s\S]*?)(?=\n##|$)/);
    
    if (changelogMatch) {
      const changelog = changelogMatch[1];
      const entries = changelog.split('\n').filter(line => line.trim().startsWith('-'));
      
      // Get recent entries (last 10)
      const recentEntries = entries.slice(-10);
      
      for (const entry of recentEntries) {
        // Extract feature descriptions
        const cleanEntry = entry.replace(/^-\s*\w+\s+\d+,\s+\d+\.\s*/, '').trim();
        if (cleanEntry.length > 20) {
          features.push(cleanEntry);
        }
      }
    }
    
    return features;
  }

  /**
   * Extract key technologies and capabilities
   */
  extractTechnologies(content) {
    const technologies = [];
    
    // Extract from architecture section
    const archMatch = content.match(/### Full-Stack JavaScript\/TypeScript Architecture([\s\S]*?)(?=\n###|$)/);
    if (archMatch) {
      const archContent = archMatch[1];
      const techLines = archContent.split('\n').filter(line => line.includes('-'));
      technologies.push(...techLines.map(line => line.replace(/^-\s*\*?\*?/, '').trim()));
    }

    // Extract from key components
    const componentsMatch = content.match(/## Key Components([\s\S]*?)(?=\n##|$)/);
    if (componentsMatch) {
      const components = componentsMatch[1];
      const componentLines = components.split('\n').filter(line => line.includes('-'));
      technologies.push(...componentLines.map(line => line.replace(/^-\s*\*?\*?/, '').trim()));
    }

    return technologies.filter(tech => tech.length > 10);
  }

  /**
   * Update the LinkedIn profile with new information
   */
  updateLinkedInProfile() {
    try {
      // Read current files
      const replitContent = fs.readFileSync(this.replitMdPath, 'utf8');
      const currentProfile = fs.readFileSync(this.linkedinProfilePath, 'utf8');
      
      // Extract new features and technologies
      const recentFeatures = this.extractFeaturesFromChangelog(replitContent);
      const technologies = this.extractTechnologies(replitContent);
      
      // Get current date
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Update the last updated date
      const updatedProfile = currentProfile.replace(
        /\*Last Updated: .*?\*/,
        `*Last Updated: ${currentDate}*`
      );

      // Add recent features to the profile if they're not already mentioned
      let finalProfile = updatedProfile;
      
      // Update the recent capabilities section if we have new features
      if (recentFeatures.length > 0) {
        const newCapabilities = recentFeatures.slice(0, 3).map(feature => 
          `- ${feature}`
        ).join('\n');
        
        // Insert recent updates before the Technology Stack section
        const insertPoint = finalProfile.indexOf('## Technology Stack');
        if (insertPoint > 0) {
          const beforeTech = finalProfile.substring(0, insertPoint);
          const afterTech = finalProfile.substring(insertPoint);
          
          const recentUpdatesSection = `## Recent Platform Enhancements

${newCapabilities}

`;
          
          // Remove existing recent updates section if it exists
          const cleanedBefore = beforeTech.replace(/## Recent Platform Enhancements[\s\S]*?(?=\n##|$)/, '');
          
          finalProfile = cleanedBefore + recentUpdatesSection + afterTech;
        }
      }

      // Write updated profile
      fs.writeFileSync(this.linkedinProfilePath, finalProfile);
      
      // Update last update timestamp
      fs.writeFileSync(this.lastUpdateFile, Date.now().toString());
      
      console.log(`✅ LinkedIn profile updated successfully on ${currentDate}`);
      console.log(`📊 Added ${recentFeatures.length} recent features`);
      
      return true;
    } catch (error) {
      console.error('❌ Error updating LinkedIn profile:', error.message);
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
    console.log('🔍 Checking for LinkedIn profile updates...');
    
    if (this.shouldUpdate()) {
      console.log('📝 Changes detected in replit.md - updating LinkedIn profile...');
      return this.updateLinkedInProfile();
    } else {
      console.log('✅ LinkedIn profile is up to date');
      return true;
    }
  }
}

// Run the updater if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const updater = new LinkedInProfileUpdater();
  const success = updater.run();
  process.exit(success ? 0 : 1);
}

export default LinkedInProfileUpdater;