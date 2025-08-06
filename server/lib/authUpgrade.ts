// Enhanced Authentication Module - Industry Standard Upgrade
// Argon2id password hashing with enhanced security features

import { 
  hashPasswordEnhanced,
  verifyPasswordEnhanced,
  generateSecureToken,
  generateSecureHash,
  generateHMAC,
  verifyHMAC
} from './encryptionUpgrade';

// Legacy auth functions for migration
import { 
  hashPassword as legacyHashPassword,
  verifyPassword as legacyVerifyPassword,
  generateSecureToken as legacyGenerateToken
} from './auth';

/**
 * Enhanced password hashing with Argon2id
 * Maintains backward compatibility with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await hashPasswordEnhanced(password);
  } catch (error) {
    console.error('Enhanced password hashing failed, using legacy:', error);
    return await legacyHashPassword(password);
  }
}

/**
 * Enhanced password verification
 * Supports both Argon2id and bcrypt hashes
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // Check if it's an Argon2id hash
    if (hash.startsWith('$argon2id$')) {
      return await verifyPasswordEnhanced(password, hash);
    }
    
    // Fall back to bcrypt verification
    return await legacyVerifyPassword(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Migrate user password from bcrypt to Argon2id
 * Call this during user login to upgrade their password hash
 */
export async function migrateUserPassword(
  password: string,
  currentHash: string
): Promise<string | null> {
  try {
    // Verify current password
    const isValid = await verifyPassword(password, currentHash);
    if (!isValid) {
      return null;
    }
    
    // If already using Argon2id, no migration needed
    if (currentHash.startsWith('$argon2id$')) {
      return currentHash;
    }
    
    // Upgrade to Argon2id
    console.log('🔐 Migrating user password to Argon2id');
    return await hashPasswordEnhanced(password);
  } catch (error) {
    console.error('Password migration error:', error);
    return null;
  }
}

/**
 * Generate enhanced secure token with HMAC authentication
 */
export function generateAuthToken(purpose: string = 'auth'): {
  token: string;
  hmac: string;
  expiresAt: Date;
} {
  try {
    const token = generateSecureToken(32);
    const hmacKey = process.env.SESSION_SECRET || generateSecureToken(64);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const hmac = generateHMAC(`${token}:${purpose}:${expiresAt.getTime()}`, hmacKey);
    
    return { token, hmac, expiresAt };
  } catch (error) {
    console.error('Auth token generation error:', error);
    throw new Error('Failed to generate authentication token');
  }
}

/**
 * Verify enhanced authentication token
 */
export function verifyAuthToken(
  token: string,
  hmac: string,
  purpose: string,
  expiresAt: Date
): boolean {
  try {
    // Check expiration
    if (Date.now() > expiresAt.getTime()) {
      return false;
    }
    
    const hmacKey = process.env.SESSION_SECRET || '';
    if (!hmacKey) {
      console.error('Session secret not configured');
      return false;
    }
    
    const expectedData = `${token}:${purpose}:${expiresAt.getTime()}`;
    return verifyHMAC(expectedData, hmac, hmacKey);
  } catch (error) {
    console.error('Auth token verification error:', error);
    return false;
  }
}

/**
 * Generate enhanced email verification token
 */
export function generateEmailVerificationToken(): {
  token: string;
  hash: string;
  expiresAt: Date;
} {
  const token = generateSecureToken(32);
  const hash = generateSecureHash(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  return { token, hash, expiresAt };
}

/**
 * Generate enhanced password reset token
 */
export function generatePasswordResetToken(): {
  token: string;
  hash: string;
  expiresAt: Date;
} {
  const token = generateSecureToken(32);
  const hash = generateSecureHash(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  return { token, hash, expiresAt };
}

/**
 * Verify token against its hash
 */
export function verifyTokenHash(token: string, hash: string): boolean {
  try {
    const computedHash = generateSecureHash(token);
    return computedHash === hash;
  } catch (error) {
    console.error('Token hash verification error:', error);
    return false;
  }
}

/**
 * Generate search ID with enhanced entropy
 */
export function generateSearchId(): string {
  return generateSecureToken(16); // 128-bit search ID
}

/**
 * Enhanced rate limiting token
 */
export function generateRateLimitToken(identifier: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const data = `${identifier}:${timestamp}`;
  return generateSecureHash(data);
}

/**
 * Initialize enhanced authentication system
 */
export function initializeEnhancedAuth(): void {
  try {
    // Validate session secret
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret) {
      console.warn('🔐 No SESSION_SECRET found in environment');
      const newSecret = generateSecureToken(64);
      console.warn(`🔐 Generated secret for development: SESSION_SECRET=${newSecret}`);
    }
    
    console.log('🔐 Enhanced authentication system initialized');
    console.log('🔐 Features: Argon2id hashing, HMAC tokens, secure migrations');
  } catch (error) {
    console.error('Enhanced auth initialization error:', error);
    throw new Error('Failed to initialize enhanced authentication');
  }
}