// Advanced Password Hashing and Authentication
// Argon2id Implementation (NIST Recommended for Password Storage)

import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { generateSecureRandom } from './keyManagement';

// Argon2id Configuration (NIST Recommended Parameters)
export const ARGON2_CONFIG = {
  type: argon2.argon2id, // Argon2id variant (hybrid of Argon2i and Argon2d)
  memoryCost: 65536, // 64 MB memory usage (2^16 KB)
  timeCost: 3, // 3 iterations
  parallelism: 4, // 4 parallel threads
  hashLength: 32, // 256-bit output
  saltLength: 16, // 128-bit salt
} as const;

// HMAC Configuration for token authentication
export const HMAC_CONFIG = {
  algorithm: 'sha512', // NIST approved hash function
  keyLength: 64, // 512-bit HMAC key
  saltLength: 32, // 256-bit salt
} as const;

// Digital signature algorithms (NIST approved)
export const SIGNATURE_ALGORITHMS = {
  RSA_PSS: 'rsa-pss',
  ECDSA_P384: 'ecdsa',
} as const;

export interface HashedPassword {
  hash: string;
  algorithm: 'argon2id';
  params: {
    memoryCost: number;
    timeCost: number;
    parallelism: number;
  };
  createdAt: Date;
}

export interface SecureToken {
  token: string;
  hmac: string;
  salt: string;
  expiresAt: Date;
  purpose: string;
}

export interface DigitalSignature {
  signature: string;
  algorithm: string;
  publicKeyId: string;
  createdAt: Date;
}

/**
 * Hash password using Argon2id (NIST recommended)
 * Replaces bcrypt for enhanced security
 */
export async function hashPasswordArgon2(password: string): Promise<HashedPassword> {
  try {
    const salt = generateSecureRandom(ARGON2_CONFIG.saltLength);
    
    const hash = await argon2.hash(password, {
      type: ARGON2_CONFIG.type,
      memoryCost: ARGON2_CONFIG.memoryCost,
      timeCost: ARGON2_CONFIG.timeCost,
      parallelism: ARGON2_CONFIG.parallelism,
      hashLength: ARGON2_CONFIG.hashLength,
      salt,
    });
    
    return {
      hash,
      algorithm: 'argon2id',
      params: {
        memoryCost: ARGON2_CONFIG.memoryCost,
        timeCost: ARGON2_CONFIG.timeCost,
        parallelism: ARGON2_CONFIG.parallelism,
      },
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Argon2id hashing error:', error);
    throw new Error('Password hashing failed');
  }
}

/**
 * Verify password against Argon2id hash
 */
export async function verifyPasswordArgon2(password: string, hashedPassword: HashedPassword): Promise<boolean> {
  try {
    return await argon2.verify(hashedPassword.hash, password);
  } catch (error) {
    console.error('Argon2id verification error:', error);
    return false;
  }
}

/**
 * Migrate bcrypt password to Argon2id
 * For upgrading existing user passwords
 */
export async function migrateBcryptToArgon2(password: string, bcryptHash: string): Promise<HashedPassword | null> {
  try {
    const bcrypt = await import('bcryptjs');
    
    // Verify the password against bcrypt hash first
    const isValid = await bcrypt.compare(password, bcryptHash);
    
    if (!isValid) {
      return null;
    }
    
    // Hash with Argon2id
    return await hashPasswordArgon2(password);
  } catch (error) {
    console.error('Bcrypt to Argon2id migration error:', error);
    return null;
  }
}

/**
 * Generate secure authentication token with HMAC
 */
export function generateSecureAuthToken(purpose: string, expirationHours: number = 24): SecureToken {
  try {
    const token = generateSecureRandom(32).toString('hex');
    const salt = generateSecureRandom(HMAC_CONFIG.saltLength);
    const hmacKey = generateSecureRandom(HMAC_CONFIG.keyLength);
    
    // Create HMAC for token integrity
    const hmac = crypto.createHmac(HMAC_CONFIG.algorithm, hmacKey);
    hmac.update(token + salt.toString('hex') + purpose);
    const hmacDigest = hmac.digest('hex');
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);
    
    return {
      token,
      hmac: hmacDigest,
      salt: salt.toString('hex'),
      expiresAt,
      purpose,
    };
  } catch (error) {
    console.error('Secure token generation error:', error);
    throw new Error('Authentication token generation failed');
  }
}

/**
 * Verify secure authentication token
 */
export function verifySecureAuthToken(
  token: string,
  expectedHmac: string,
  salt: string,
  purpose: string
): boolean {
  try {
    const hmacKey = generateSecureRandom(HMAC_CONFIG.keyLength);
    const hmac = crypto.createHmac(HMAC_CONFIG.algorithm, hmacKey);
    hmac.update(token + salt + purpose);
    const computedHmac = hmac.digest('hex');
    
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedHmac, 'hex'),
      Buffer.from(computedHmac, 'hex')
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

/**
 * Generate cryptographic hash using NIST approved algorithms
 */
export function generateSecureHash(
  data: string,
  algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha256'
): string {
  try {
    return crypto.createHash(algorithm).update(data).digest('hex');
  } catch (error) {
    console.error('Secure hash generation error:', error);
    throw new Error('Hash generation failed');
  }
}

/**
 * Generate HMAC for data integrity verification
 */
export function generateHMAC(
  data: string,
  key: string,
  algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha512'
): string {
  try {
    return crypto.createHmac(algorithm, key).update(data).digest('hex');
  } catch (error) {
    console.error('HMAC generation error:', error);
    throw new Error('HMAC generation failed');
  }
}

/**
 * Verify HMAC for data integrity
 */
export function verifyHMAC(
  data: string,
  expectedHmac: string,
  key: string,
  algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha512'
): boolean {
  try {
    const computedHmac = generateHMAC(data, key, algorithm);
    
    // Constant-time comparison
    return crypto.timingSafeEqual(
      Buffer.from(expectedHmac, 'hex'),
      Buffer.from(computedHmac, 'hex')
    );
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

/**
 * Create digital signature using RSA-PSS (NIST approved)
 */
export function createDigitalSignatureRSA(
  data: string,
  privateKey: string,
  publicKeyId: string
): DigitalSignature {
  try {
    const sign = crypto.createSign('RSA-SHA384');
    sign.update(data);
    
    const signature = sign.sign(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
      },
      'base64'
    );
    
    return {
      signature,
      algorithm: SIGNATURE_ALGORITHMS.RSA_PSS,
      publicKeyId,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('RSA digital signature error:', error);
    throw new Error('Digital signature creation failed');
  }
}

/**
 * Verify digital signature using RSA-PSS
 */
export function verifyDigitalSignatureRSA(
  data: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const verify = crypto.createVerify('RSA-SHA384');
    verify.update(data);
    
    return verify.verify(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
      },
      signature,
      'base64'
    );
  } catch (error) {
    console.error('RSA signature verification error:', error);
    return false;
  }
}

/**
 * Create digital signature using ECDSA P-384
 */
export function createDigitalSignatureECDSA(
  data: string,
  privateKey: string,
  publicKeyId: string
): DigitalSignature {
  try {
    const sign = crypto.createSign('SHA384');
    sign.update(data);
    
    const signature = sign.sign(privateKey, 'base64');
    
    return {
      signature,
      algorithm: SIGNATURE_ALGORITHMS.ECDSA_P384,
      publicKeyId,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('ECDSA digital signature error:', error);
    throw new Error('ECDSA signature creation failed');
  }
}

/**
 * Verify digital signature using ECDSA P-384
 */
export function verifyDigitalSignatureECDSA(
  data: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const verify = crypto.createVerify('SHA384');
    verify.update(data);
    
    return verify.verify(publicKey, signature, 'base64');
  } catch (error) {
    console.error('ECDSA signature verification error:', error);
    return false;
  }
}

/**
 * Key stretching for additional security
 */
export function stretchKey(
  password: string,
  salt: Buffer,
  iterations: number = 100000
): Buffer {
  try {
    return crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512');
  } catch (error) {
    console.error('Key stretching error:', error);
    throw new Error('Key stretching failed');
  }
}

/**
 * Time-constant string comparison to prevent timing attacks
 */
export function constantTimeCompare(a: string, b: string): boolean {
  try {
    if (a.length !== b.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch (error) {
    console.error('Constant time comparison error:', error);
    return false;
  }
}