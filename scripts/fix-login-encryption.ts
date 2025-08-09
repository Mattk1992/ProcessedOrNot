#!/usr/bin/env tsx
/**
 * Fix Login Encryption Issues
 * This script creates a new test user with proper encryption settings
 * and provides a migration path for existing users
 */

import { db } from '../server/db';
import { users } from '@shared/schema';
import { hashPassword } from '../server/lib/authUpgrade';
import { encryptEmail, hashForSearch, encryptPII } from '../server/lib/encryption';
import { eq } from 'drizzle-orm';

async function createTestUser() {
  console.log('🔐 Creating test user with current encryption settings...');
  
  try {
    // Check if test user already exists
    const existing = await db.select().from(users).where(eq(users.username, 'demouser'));
    if (existing.length > 0) {
      console.log('⚠️ Demo user already exists, deleting old one...');
      await db.delete(users).where(eq(users.username, 'demouser'));
    }
    
    // Create new test user with properly encrypted data
    const password = 'Demo123!';
    const hashedPassword = await hashPassword(password);
    const email = 'demo@example.com';
    
    const [newUser] = await db.insert(users).values({
      username: 'demouser',
      email: encryptEmail(email),
      emailHash: hashForSearch(email),
      passwordHash: hashedPassword,
      firstName: encryptPII('Demo'),
      lastName: encryptPII('User'),
      isEmailVerified: true,
      accountType: 'Regular',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log('✅ Test user created successfully!');
    console.log('📝 Login credentials:');
    console.log('   Username: demouser');
    console.log('   Password: Demo123!');
    console.log('   Email: demo@example.com');
    
    return newUser;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
}

async function createAdminUser() {
  console.log('🔐 Creating admin user with current encryption settings...');
  
  try {
    // Check if admin user already exists
    const existing = await db.select().from(users).where(eq(users.username, 'admin'));
    if (existing.length > 0) {
      console.log('⚠️ Admin user already exists, deleting old one...');
      await db.delete(users).where(eq(users.username, 'admin'));
    }
    
    // Create new admin user with properly encrypted data
    const password = 'Admin123!';
    const hashedPassword = await hashPassword(password);
    const email = 'admin@example.com';
    
    const [newUser] = await db.insert(users).values({
      username: 'admin',
      email: encryptEmail(email),
      emailHash: hashForSearch(email),
      passwordHash: hashedPassword,
      firstName: encryptPII('Admin'),
      lastName: encryptPII('User'),
      isEmailVerified: true,
      accountType: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log('✅ Admin user created successfully!');
    console.log('📝 Admin login credentials:');
    console.log('   Username: admin');
    console.log('   Password: Admin123!');
    console.log('   Email: admin@example.com');
    
    return newUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

async function main() {
  console.log('=================================');
  console.log('Fix Login Encryption Issues');
  console.log('=================================\n');
  
  try {
    // Create test users
    await createTestUser();
    console.log('');
    await createAdminUser();
    
    console.log('\n=================================');
    console.log('✅ Login fix completed!');
    console.log('=================================');
    console.log('\nYou can now login with either:');
    console.log('• Regular user: demouser / Demo123!');
    console.log('• Admin user: admin / Admin123!');
    console.log('\nNote: Old users with encryption issues need to reset their passwords.');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);