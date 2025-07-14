const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Manual installation of React Native dependencies...');

// Read current package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = Object.keys(packageJson.dependencies || {});

console.log(`Installing ${deps.length} dependencies...`);

// Try different npm configurations
const installMethods = [
  'npm install --legacy-peer-deps --no-audit --no-fund',
  'npm install --force --no-audit --no-fund',
  'npm install --legacy-peer-deps --timeout=300000',
  'npm install --production=false --legacy-peer-deps'
];

for (const method of installMethods) {
  console.log(`\nTrying: ${method}`);
  try {
    execSync(method, { 
      stdio: 'inherit',
      timeout: 300000,
      cwd: process.cwd()
    });
    console.log('✅ Installation successful!');
    process.exit(0);
  } catch (error) {
    console.log(`❌ Method failed: ${error.message}`);
    continue;
  }
}

console.log('\nAll methods failed. Please install manually in local environment.');
process.exit(1);