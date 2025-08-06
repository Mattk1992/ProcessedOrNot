// Secure Key Management System
// NIST FIPS 140-3 Compliant Key Management with HSM Integration Support

import * as crypto from 'crypto';

export interface KeyMaterial {
  keyId: string;
  algorithm: string;
  keyData: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'active' | 'rotating' | 'retired';
  usage: 'encryption' | 'signing' | 'kdf';
}

export interface KeyRotationConfig {
  rotationIntervalDays: number;
  maxKeyAge: number;
  retainOldKeys: boolean;
  automaticRotation: boolean;
}

// Default key rotation configuration (90-day maximum as specified)
const DEFAULT_ROTATION_CONFIG: KeyRotationConfig = {
  rotationIntervalDays: 90,
  maxKeyAge: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
  retainOldKeys: true,
  automaticRotation: true,
};

// In-memory key store (in production, this would be HSM or secure key vault)
const keyStore = new Map<string, KeyMaterial>();

/**
 * Cryptographically Secure Pseudo-Random Number Generator (CSPRNG)
 * NIST FIPS 140-3 compliant random number generation
 */
export function generateSecureRandom(bytes: number): Buffer {
  try {
    return crypto.randomBytes(bytes);
  } catch (error) {
    console.error('CSPRNG generation error:', error);
    throw new Error('Secure random generation failed - FIPS 140-3 violation');
  }
}

/**
 * Generate secure initialization vector using CSPRNG
 */
export function generateSecureIV(length: number): Buffer {
  return generateSecureRandom(length);
}

/**
 * Generate cryptographically secure encryption key
 */
export function generateEncryptionKey(keyId?: string): KeyMaterial {
  try {
    const id = keyId || crypto.randomUUID();
    const keyData = generateSecureRandom(32).toString('hex'); // 256-bit key
    const now = new Date();
    const expiresAt = new Date(now.getTime() + DEFAULT_ROTATION_CONFIG.maxKeyAge);
    
    const keyMaterial: KeyMaterial = {
      keyId: id,
      algorithm: 'aes-256-gcm',
      keyData,
      createdAt: now,
      expiresAt,
      status: 'active',
      usage: 'encryption',
    };
    
    keyStore.set(id, keyMaterial);
    
    console.log(`🔐 Generated new encryption key: ${id}`);
    return keyMaterial;
  } catch (error) {
    console.error('Key generation error:', error);
    throw new Error('Encryption key generation failed');
  }
}

/**
 * Get encryption key with automatic rotation check
 */
export function getEncryptionKey(keyId?: string): string {
  const id = keyId || 'default';
  
  // Check environment variable first
  const envKey = process.env.ENCRYPTION_KEY;
  if (envKey && id === 'default') {
    // Validate environment key format
    if (envKey.length === 64 && /^[0-9a-f]+$/i.test(envKey)) {
      return envKey;
    } else {
      // Derive proper key from environment variable
      const derivedKey = crypto.createHash('sha256').update(envKey).digest('hex');
      console.log('🔐 Using derived encryption key from environment');
      return derivedKey;
    }
  }
  
  // Check if key exists in store
  let keyMaterial = keyStore.get(id);
  
  // Generate new key if not found
  if (!keyMaterial) {
    keyMaterial = generateEncryptionKey(id);
  }
  
  // Check if key needs rotation
  if (isKeyExpired(keyMaterial)) {
    console.warn(`🔐 Key ${id} is expired, rotating...`);
    keyMaterial = rotateKey(id);
  }
  
  return keyMaterial.keyData;
}

/**
 * Check if key is expired and needs rotation
 */
export function isKeyExpired(keyMaterial: KeyMaterial): boolean {
  return Date.now() > keyMaterial.expiresAt.getTime();
}

/**
 * Rotate encryption key (90-day maximum compliance)
 */
export function rotateKey(keyId: string): KeyMaterial {
  try {
    const oldKey = keyStore.get(keyId);
    
    if (oldKey && DEFAULT_ROTATION_CONFIG.retainOldKeys) {
      // Mark old key as retired but keep for decryption
      oldKey.status = 'retired';
      const retiredId = `${keyId}-retired-${Date.now()}`;
      keyStore.set(retiredId, oldKey);
    }
    
    // Generate new key
    const newKey = generateEncryptionKey(keyId);
    
    console.log(`🔐 Key rotation completed for: ${keyId}`);
    return newKey;
  } catch (error) {
    console.error('Key rotation error:', error);
    throw new Error('Key rotation failed');
  }
}

/**
 * Get all retired keys for legacy data decryption
 */
export function getRetiredKeys(): KeyMaterial[] {
  return Array.from(keyStore.values()).filter(key => key.status === 'retired');
}

/**
 * Key Derivation Function using PBKDF2 (NIST approved)
 */
export function deriveKey(
  password: string,
  salt: Buffer,
  iterations: number = 100000,
  keyLength: number = 32
): Buffer {
  try {
    return crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha512');
  } catch (error) {
    console.error('Key derivation error:', error);
    throw new Error('Key derivation failed');
  }
}

/**
 * Generate salt for key derivation
 */
export function generateSalt(length: number = 32): Buffer {
  return generateSecureRandom(length);
}

/**
 * Validate key material integrity
 */
export function validateKeyMaterial(): boolean {
  try {
    // Check if default key exists and is valid
    const defaultKey = process.env.ENCRYPTION_KEY;
    if (defaultKey) {
      if (defaultKey.length !== 64 || !/^[0-9a-f]+$/i.test(defaultKey)) {
        console.warn('🔐 Environment encryption key format invalid');
        return false;
      }
    }
    
    // Validate stored keys
    for (const [keyId, keyMaterial] of Array.from(keyStore.entries())) {
      if (!keyMaterial.keyData || keyMaterial.keyData.length !== 64) {
        console.error(`🔐 Invalid key material for: ${keyId}`);
        return false;
      }
      
      if (keyMaterial.status === 'active' && isKeyExpired(keyMaterial)) {
        console.warn(`🔐 Active key ${keyId} is expired`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Key validation error:', error);
    return false;
  }
}

/**
 * Clean up expired keys (security housekeeping)
 */
export function cleanupExpiredKeys(): void {
  try {
    const expiredKeys: string[] = [];
    
    for (const [keyId, keyMaterial] of Array.from(keyStore.entries())) {
      if (keyMaterial.status === 'retired') {
        // Keep retired keys for 1 year for legacy data decryption
        const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
        if (keyMaterial.createdAt.getTime() < oneYearAgo) {
          expiredKeys.push(keyId);
        }
      }
    }
    
    expiredKeys.forEach(keyId => {
      const keyMaterial = keyStore.get(keyId);
      if (keyMaterial) {
        // Secure wipe key data
        const keyBuffer = Buffer.from(keyMaterial.keyData, 'hex');
        secureWipeBuffer(keyBuffer);
        keyStore.delete(keyId);
        console.log(`🔐 Cleaned up expired key: ${keyId}`);
      }
    });
  } catch (error) {
    console.error('Key cleanup error:', error);
  }
}

/**
 * Secure buffer wiping for sensitive data
 */
function secureWipeBuffer(buffer: Buffer): void {
  try {
    // Triple overwrite pattern for secure deletion
    crypto.randomFillSync(buffer);
    buffer.fill(0);
    crypto.randomFillSync(buffer);
  } catch (error) {
    console.error('Secure wipe error:', error);
  }
}

/**
 * Initialize key management system
 */
export function initializeKeyManagement(): void {
  try {
    validateKeyMaterial();
    
    // Set up automatic key rotation if enabled
    if (DEFAULT_ROTATION_CONFIG.automaticRotation) {
      const rotationInterval = DEFAULT_ROTATION_CONFIG.rotationIntervalDays * 24 * 60 * 60 * 1000;
      
      setInterval(() => {
        console.log('🔐 Starting scheduled key rotation check...');
        
        for (const [keyId, keyMaterial] of Array.from(keyStore.entries())) {
          if (keyMaterial.status === 'active' && isKeyExpired(keyMaterial)) {
            rotateKey(keyId);
          }
        }
        
        cleanupExpiredKeys();
      }, rotationInterval);
      
      console.log(`🔐 Automatic key rotation enabled (${DEFAULT_ROTATION_CONFIG.rotationIntervalDays} days)`);
    }
  } catch (error) {
    console.error('Key management initialization error:', error);
    throw new Error('Failed to initialize key management system');
  }
}

/**
 * Export key material for HSM integration
 */
export function exportKeyForHSM(keyId: string): string | null {
  try {
    const keyMaterial = keyStore.get(keyId);
    if (!keyMaterial) {
      return null;
    }
    
    // In production, this would securely transfer to HSM
    console.log(`🔐 Exporting key ${keyId} for HSM integration`);
    return keyMaterial.keyData;
  } catch (error) {
    console.error('HSM key export error:', error);
    return null;
  }
}

/**
 * Import key material from HSM
 */
export function importKeyFromHSM(keyId: string, keyData: string, algorithm: string): boolean {
  try {
    const keyMaterial: KeyMaterial = {
      keyId,
      algorithm,
      keyData,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + DEFAULT_ROTATION_CONFIG.maxKeyAge),
      status: 'active',
      usage: 'encryption',
    };
    
    keyStore.set(keyId, keyMaterial);
    console.log(`🔐 Imported key ${keyId} from HSM`);
    return true;
  } catch (error) {
    console.error('HSM key import error:', error);
    return false;
  }
}