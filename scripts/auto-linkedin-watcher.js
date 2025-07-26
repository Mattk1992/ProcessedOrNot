#!/usr/bin/env node

/**
 * Auto LinkedIn Profile Watcher
 * 
 * This script watches for changes in replit.md and automatically updates
 * the LinkedIn profile when modifications are detected.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import LinkedInProfileUpdater from './update-linkedin-profile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AutoLinkedInWatcher {
  constructor() {
    this.updater = new LinkedInProfileUpdater();
    this.replitMdPath = path.join(__dirname, '..', 'replit.md');
    this.isWatching = false;
  }

  /**
   * Start watching for file changes
   */
  startWatching() {
    if (this.isWatching) {
      console.log('Already watching for changes...');
      return;
    }

    console.log('🔍 Starting LinkedIn profile auto-updater...');
    console.log('📁 Watching: replit.md for changes');

    // Initial update check
    this.updater.run();

    // Watch for changes
    this.watcher = fs.watch(this.replitMdPath, { persistent: true }, (eventType, filename) => {
      if (eventType === 'change') {
        console.log(`\n📝 Detected change in ${filename}`);
        
        // Debounce updates (wait 2 seconds before updating)
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
          console.log('🔄 Updating LinkedIn profile...');
          this.updater.run();
        }, 2000);
      }
    });

    this.isWatching = true;
    console.log('✅ Auto-updater is now active');
    console.log('💡 The LinkedIn profile will automatically update when replit.md changes');
  }

  /**
   * Stop watching
   */
  stopWatching() {
    if (this.watcher) {
      this.watcher.close();
      this.isWatching = false;
      console.log('🛑 Stopped watching for changes');
    }
  }
}

// Run the watcher if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const watcher = new AutoLinkedInWatcher();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down LinkedIn profile watcher...');
    watcher.stopWatching();
    process.exit(0);
  });

  watcher.startWatching();
  
  // Keep the process alive
  process.stdin.resume();
}

export default AutoLinkedInWatcher;