import crypto from 'crypto';
import { encryptPII, decryptPII, hashForSearch } from './encryption';

/**
 * Generate a cryptographically secure shared secret
 * Compliant with NIST SP 800-90A recommendations
 */
export function generateSecureSecret(length: number = 64): string {
  // Use crypto.randomBytes for cryptographically secure random generation
  const randomBytes = crypto.randomBytes(Math.ceil(length * 3 / 4));
  
  // Convert to base64 and clean up for URL-safe usage
  return randomBytes
    .toString('base64')
    .replace(/[+/]/g, (char) => char === '+' ? '-' : '_')
    .replace(/=/g, '')
    .substring(0, length);
}

/**
 * Generate a HMAC-SHA512 hash of the secret for verification
 */
export function generateSecretHash(secret: string): string {
  return crypto
    .createHash('sha512')
    .update(secret)
    .digest('hex');
}

/**
 * Verify webhook signature using HMAC-SHA256
 * Compatible with industry-standard webhook implementations
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean {
  try {
    // Remove signature prefix if present (e.g., "sha256=")
    const cleanSignature = signature.replace(/^(sha256=|sha1=)/, '');
    
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac(algorithm, secret)
      .update(payload, 'utf8')
      .digest('hex');
    
    // Use timing-safe comparison to prevent timing attacks
    // Ensure buffers are the same length to avoid errors
    if (cleanSignature.length !== expectedSignature.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(
      Buffer.from(cleanSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Generate App Store Connect shared secret
 * Uses Apple's recommended format and security standards
 */
export function generateAppStoreSharedSecret(): string {
  // Apple recommends 32+ character secrets with high entropy
  return generateSecureSecret(32);
}

/**
 * Generate Google Play Console signing key
 * Uses Google's recommended security standards
 */
export function generateGooglePlaySecret(): string {
  // Google Play uses longer secrets for enhanced security
  return generateSecureSecret(48);
}

/**
 * Create webhook signature for outgoing requests
 */
export function createWebhookSignature(
  payload: string,
  secret: string,
  algorithm: string = 'sha256'
): string {
  const signature = crypto
    .createHmac(algorithm, secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  return `${algorithm}=${signature}`;
}

/**
 * Generate a secure API key with specific format
 */
export function generateApiKey(prefix: string = 'pnot'): string {
  const randomPart = generateSecureSecret(40);
  return `${prefix}_${randomPart}`;
}

/**
 * Rotate a secret by generating a new one while maintaining the same type/format
 */
export function rotateSecret(currentSecret: string, secretType: string): string {
  switch (secretType) {
    case 'app_store':
      return generateAppStoreSharedSecret();
    case 'google_play':
      return generateGooglePlaySecret();
    case 'api_key':
      return generateApiKey();
    case 'webhook':
    default:
      return generateSecureSecret(64);
  }
}

/**
 * Validate secret strength and format
 */
export function validateSecretStrength(secret: string): {
  isValid: boolean;
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 0;

  // Length check
  if (secret.length < 32) {
    issues.push('Secret should be at least 32 characters long');
  } else if (secret.length >= 32) {
    score += 40; // Higher score for length since it's most important
  }

  // Character diversity (adjusted for base64)
  if (/[a-z]/.test(secret)) score += 10;
  if (/[A-Z]/.test(secret)) score += 10;
  if (/[0-9]/.test(secret)) score += 10;
  if (/[^a-zA-Z0-9]/.test(secret)) score += 10;

  // Entropy check (adjusted for URL-safe base64)
  const uniqueChars = new Set(secret).size;
  const diversityRatio = uniqueChars / secret.length;
  
  if (diversityRatio > 0.5) {
    score += 20; // Good diversity for base64
  } else if (diversityRatio > 0.3) {
    score += 10; // Acceptable diversity
  } else {
    issues.push('Secret has very low character diversity');
  }

  // Common patterns check (relaxed for base64)
  if (/(.)\1{5,}/.test(secret)) {
    issues.push('Secret contains excessive repeated character patterns');
    score -= 10;
  }

  // Special case for base64-like strings
  if (/^[A-Za-z0-9_-]+$/.test(secret)) {
    score += 10; // Bonus for URL-safe base64 format
  }

  return {
    isValid: score >= 60 && issues.length === 0, // Lowered threshold for base64
    score: Math.max(0, Math.min(100, score)),
    issues
  };
}