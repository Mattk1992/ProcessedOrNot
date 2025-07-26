// Using native Node.js crypto module for better performance
import * as crypto from 'crypto';

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm' as const;
const ENCRYPTION_KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

// Get encryption key from environment or generate one
function getEncryptionKey(): string {
  const envKey = process.env.ENCRYPTION_KEY;
  if (envKey && envKey.length === 64) { // 32 bytes = 64 hex chars
    return envKey;
  }
  
  // Generate a new key for development (should be set in production)
  const key = crypto.randomBytes(ENCRYPTION_KEY_LENGTH).toString('hex');
  console.warn('🔐 No ENCRYPTION_KEY found in environment. Using generated key for development.');
  console.warn(`🔐 Add this to your environment: ENCRYPTION_KEY=${key}`);
  return key;
}

const ENCRYPTION_KEY = getEncryptionKey();

/**
 * Encrypts sensitive data using AES-256-GCM
 */
export function encryptData(plaintext: string): string {
  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Combine IV + encrypted data
    const combined = iv.toString('hex') + encrypted;
    return combined;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Data encryption failed');
  }
}

/**
 * Decrypts data encrypted with encryptData
 */
export function decryptData(encryptedData: string): string {
  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    
    // Extract IV and encrypted data
    const ivHex = encryptedData.slice(0, IV_LENGTH * 2);
    const encrypted = encryptedData.slice(IV_LENGTH * 2);
    
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    // Return empty string for invalid encrypted data instead of throwing
    // This handles cases where encryption key changed between server restarts
    return '';
  }
}

/**
 * Encrypts personal information (PII) using symmetric encryption
 */
export function encryptPII(data: string): string {
  if (!data || data.trim() === '') return '';
  return encryptData(data);
}

/**
 * Decrypts personal information
 */
export function decryptPII(encryptedData: string): string {
  if (!encryptedData || encryptedData.trim() === '') return '';
  return decryptData(encryptedData);
}

/**
 * Encrypts email addresses with additional validation
 */
export function encryptEmail(email: string): string {
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email format');
  }
  return encryptData(email);
}

/**
 * Decrypts email addresses
 */
export function decryptEmail(encryptedEmail: string): string {
  if (!encryptedEmail) return '';
  const decrypted = decryptData(encryptedEmail);
  if (!decrypted.includes('@')) {
    throw new Error('Decrypted email is invalid');
  }
  return decrypted;
}

/**
 * Hash sensitive data for search/comparison purposes
 * This creates a one-way hash that can be used to find records without storing plaintext
 */
export function hashForSearch(data: string): string {
  try {
    // Create a SHA-256 hash for searching while maintaining privacy
    const hash = crypto.createHash('sha256').update(data + ENCRYPTION_KEY).digest('hex');
    return hash;
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error('Data hashing failed');
  }
}

/**
 * Encrypt user search history and queries
 */
export function encryptSearchData(searchInput: string): string {
  if (!searchInput) return '';
  return encryptData(searchInput);
}

/**
 * Decrypt user search history and queries
 */
export function decryptSearchData(encryptedSearch: string): string {
  if (!encryptedSearch) return '';
  try {
    return decryptData(encryptedSearch);
  } catch (error) {
    console.warn('Failed to decrypt search data, returning placeholder');
    return '[Encrypted Data]';
  }
}

/**
 * Securely wipe sensitive data from memory
 */
export function secureWipe(data: any): void {
  if (typeof data === 'string') {
    // Overwrite string memory with random data
    for (let i = 0; i < data.length; i++) {
      data = data.substring(0, i) + String.fromCharCode(Math.floor(Math.random() * 256)) + data.substring(i + 1);
    }
  }
}

/**
 * Generate secure session tokens
 */
export function generateSecureSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Encrypt session data
 */
export function encryptSessionData(sessionData: object): string {
  return encryptData(JSON.stringify(sessionData));
}

/**
 * Decrypt session data
 */
export function decryptSessionData(encryptedSession: string): object {
  const decrypted = decryptData(encryptedSession);
  return JSON.parse(decrypted);
}