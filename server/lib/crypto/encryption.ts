// Advanced Encryption Implementation
// NIST FIPS 140-3 Compliant Data at Rest Encryption

import * as crypto from 'crypto';
import { getEncryptionKey, generateSecureIV, validateKeyMaterial } from './keyManagement';

// NIST FIPS 140-3 Approved Algorithms
export const ENCRYPTION_ALGORITHMS = {
  // AES-256-GCM for symmetric encryption (NIST approved)
  SYMMETRIC: 'aes-256-gcm' as const,
  // RSA-4096 for asymmetric encryption 
  ASYMMETRIC_RSA: 'rsa' as const,
  // ECC P-384 for asymmetric encryption (NIST P-384)
  ASYMMETRIC_ECC: 'secp384r1' as const,
  // Legacy support for existing data
  LEGACY_CBC: 'aes-256-cbc' as const,
} as const;

export const ENCRYPTION_CONSTANTS = {
  AES_KEY_LENGTH: 32, // 256 bits
  IV_LENGTH: 16, // 128 bits for GCM
  AUTH_TAG_LENGTH: 16, // 128 bits for GCM authentication tag
  RSA_KEY_SIZE: 4096, // RSA-4096 bits
  ECC_CURVE: 'secp384r1', // NIST P-384 curve
} as const;

export interface EncryptedData {
  algorithm: string;
  ciphertext: string;
  iv: string;
  authTag?: string; // For GCM mode
  keyId?: string; // For key rotation tracking
  timestamp: number;
}

export interface AsymmetricKeyPair {
  publicKey: string;
  privateKey: string;
  keyId: string;
  algorithm: 'rsa-4096' | 'ecc-p384';
  createdAt: Date;
}

/**
 * AES-256-GCM Encryption (NIST FIPS 140-3 Approved)
 * Provides both confidentiality and authenticity
 */
export function encryptDataGCM(plaintext: string, keyId?: string): EncryptedData {
  try {
    validateKeyMaterial();
    
    const key = Buffer.from(getEncryptionKey(keyId), 'hex');
    const iv = generateSecureIV(ENCRYPTION_CONSTANTS.IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHMS.SYMMETRIC, key, iv);
    
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    
    // Get authentication tag for integrity verification
    const authTag = cipher.getAuthTag();
    
    return {
      algorithm: ENCRYPTION_ALGORITHMS.SYMMETRIC,
      ciphertext,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      keyId: keyId || 'default',
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('AES-256-GCM encryption error:', error);
    throw new Error('Symmetric encryption failed - FIPS 140-3 compliance violation');
  }
}

/**
 * AES-256-GCM Decryption with integrity verification
 */
export function decryptDataGCM(encryptedData: EncryptedData): string {
  try {
    if (encryptedData.algorithm !== ENCRYPTION_ALGORITHMS.SYMMETRIC) {
      throw new Error(`Unsupported algorithm: ${encryptedData.algorithm}`);
    }
    
    validateKeyMaterial();
    
    const key = Buffer.from(getEncryptionKey(encryptedData.keyId), 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag!, 'hex');
    
    if (iv.length !== ENCRYPTION_CONSTANTS.IV_LENGTH) {
      throw new Error('Invalid IV length');
    }
    
    if (authTag.length !== ENCRYPTION_CONSTANTS.AUTH_TAG_LENGTH) {
      throw new Error('Invalid authentication tag length');
    }
    
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHMS.SYMMETRIC, key, iv);
    decipher.setAuthTag(authTag);
    
    let plaintext = decipher.update(encryptedData.ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');
    
    return plaintext;
  } catch (error) {
    console.error('AES-256-GCM decryption error:', error);
    throw new Error('Symmetric decryption failed - data integrity compromised');
  }
}

/**
 * Generate RSA-4096 Key Pair (NIST approved for asymmetric encryption)
 */
export function generateRSAKeyPair(): AsymmetricKeyPair {
  try {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: ENCRYPTION_CONSTANTS.RSA_KEY_SIZE,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });
    
    const keyId = crypto.randomUUID();
    
    return {
      publicKey,
      privateKey,
      keyId,
      algorithm: 'rsa-4096',
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('RSA-4096 key generation error:', error);
    throw new Error('RSA key generation failed');
  }
}

/**
 * Generate ECC P-384 Key Pair (NIST approved curve)
 */
export function generateECCKeyPair(): AsymmetricKeyPair {
  try {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: ENCRYPTION_CONSTANTS.ECC_CURVE,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });
    
    const keyId = crypto.randomUUID();
    
    return {
      publicKey,
      privateKey,
      keyId,
      algorithm: 'ecc-p384',
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('ECC P-384 key generation error:', error);
    throw new Error('ECC key generation failed');
  }
}

/**
 * RSA-4096 Encryption for asymmetric operations
 */
export function encryptAsymmetricRSA(plaintext: string, publicKey: string): string {
  try {
    const buffer = Buffer.from(plaintext, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha384', // NIST approved hash
      },
      buffer
    );
    
    return encrypted.toString('base64');
  } catch (error) {
    console.error('RSA-4096 encryption error:', error);
    throw new Error('RSA asymmetric encryption failed');
  }
}

/**
 * RSA-4096 Decryption
 */
export function decryptAsymmetricRSA(encryptedData: string, privateKey: string): string {
  try {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha384',
      },
      buffer
    );
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('RSA-4096 decryption error:', error);
    throw new Error('RSA asymmetric decryption failed');
  }
}

/**
 * Legacy CBC decryption support for existing data
 * Will be phased out during key rotation
 */
export function decryptLegacyCBC(encryptedData: string): string {
  try {
    if (!encryptedData || encryptedData.length < ENCRYPTION_CONSTANTS.IV_LENGTH * 2) {
      console.warn('Invalid legacy encrypted data: too short or empty');
      return '';
    }

    const key = Buffer.from(getEncryptionKey(), 'hex');
    const ivHex = encryptedData.slice(0, ENCRYPTION_CONSTANTS.IV_LENGTH * 2);
    const encrypted = encryptedData.slice(ENCRYPTION_CONSTANTS.IV_LENGTH * 2);
    
    if (ivHex.length !== ENCRYPTION_CONSTANTS.IV_LENGTH * 2 || !/^[0-9a-f]+$/i.test(ivHex)) {
      console.warn('Invalid IV format in legacy encrypted data');
      return '';
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    
    if (iv.length !== ENCRYPTION_CONSTANTS.IV_LENGTH) {
      console.warn('Invalid IV length after conversion');
      return '';
    }
    
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHMS.LEGACY_CBC, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Legacy CBC decryption error:', error);
    return '';
  }
}

/**
 * Migrate legacy CBC encrypted data to AES-256-GCM
 */
export function migrateLegacyEncryption(legacyEncryptedData: string): EncryptedData {
  try {
    // Decrypt using legacy method
    const plaintext = decryptLegacyCBC(legacyEncryptedData);
    
    if (!plaintext) {
      throw new Error('Failed to decrypt legacy data');
    }
    
    // Re-encrypt using AES-256-GCM
    return encryptDataGCM(plaintext);
  } catch (error) {
    console.error('Legacy encryption migration error:', error);
    throw new Error('Failed to migrate legacy encrypted data');
  }
}

/**
 * Secure data wiping from memory
 * NIST 800-88 compliant data sanitization
 */
export function secureWipe(buffer: Buffer): void {
  try {
    // Overwrite with random data
    crypto.randomFillSync(buffer);
    // Overwrite with zeros
    buffer.fill(0);
    // Overwrite with ones
    buffer.fill(0xFF);
    // Final overwrite with random data
    crypto.randomFillSync(buffer);
  } catch (error) {
    console.error('Secure wipe error:', error);
  }
}