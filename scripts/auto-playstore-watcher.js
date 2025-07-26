#!/usr/bin/env node

/**
 * Auto Play Store Info Watcher
 * 
 * This script watches for changes in replit.md and automatically updates
 * the Google Play Store listing when modifications are detected.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PlayStoreInfoUpdater from './update-playstore-info.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AutoPlayStoreWatcher {
  constructor() {
    this.updater = new PlayStoreInfoUpdater();
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

    console.log('🔍 Starting Play Store info auto-updater...');
    console.log('📁 Watching: replit.md for changes');

    // Initial update check
    this.updater.run();

    // Watch for changes
    this.watcher = fs.watch(this.replitMdPath, { persistent: true }, (eventType, filename) => {
      if (eventType === 'change') {
        console.log(`\n📝 Detected change in ${filename}`);
        
        // Debounce updates (wait 3 seconds before updating)
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
          console.log('🔄 Updating Play Store info...');
          this.updater.run();
        }, 3000);
      }
    });

    this.isWatching = true;
    console.log('✅ Auto-updater is now active');
    console.log('💡 The Play Store listing will automatically update when replit.md changes');
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
  const watcher = new AutoPlayStoreWatcher();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Play Store info watcher...');
    watcher.stopWatching();
    process.exit(0);
  });

  watcher.startWatching();
  
  // Keep the process alive
  process.stdin.resume();
}

export default AutoPlayStoreWatcher;