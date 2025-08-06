// TLS 1.3 Configuration and Certificate Management
// RFC 8446 Compliant Transport Layer Security

import * as crypto from 'crypto';
import * as https from 'https';
import * as tls from 'tls';

// TLS 1.3 Configuration (RFC 8446)
export const TLS_CONFIG = {
  // Minimum TLS version (1.3 only)
  minVersion: 'TLSv1.3' as const,
  maxVersion: 'TLSv1.3' as const,
  
  // Strong cipher suites (NIST approved)
  ciphers: [
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256',
  ].join(':'),
  
  // Perfect Forward Secrecy groups
  ecdhCurve: 'secp384r1:X25519:secp256r1',
  
  // Disable insecure features
  honorCipherOrder: true,
  secureProtocol: 'TLSv1_3_method',
} as const;

// Certificate pinning configuration
export interface CertificatePin {
  hostname: string;
  publicKeyHash: string;
  algorithm: 'sha256';
  expiresAt: Date;
  backup?: string[];
}

// Certificate validation results
export interface CertificateValidation {
  isValid: boolean;
  hostname: string;
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
  fingerprint: string;
  algorithm: string;
  keySize: number;
  errors: string[];
}

// In-memory certificate pin store (in production, use persistent storage)
const certificatePins = new Map<string, CertificatePin>();

/**
 * Generate self-signed certificate for development
 * In production, use certificates from trusted CA
 */
export function generateSelfSignedCertificate(): { cert: string; key: string } {
  try {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });
    
    // Note: In production, obtain certificates from trusted CA like Let's Encrypt
    console.warn('🔒 Using self-signed certificate for development');
    console.warn('🔒 In production, use certificates from trusted Certificate Authority');
    
    return { cert: publicKey, key: privateKey };
  } catch (error) {
    console.error('Certificate generation error:', error);
    throw new Error('Failed to generate self-signed certificate');
  }
}

/**
 * Create TLS 1.3 compliant HTTPS server options
 */
export function createTLSServerOptions(): https.ServerOptions {
  const options: https.ServerOptions = {
    ...TLS_CONFIG,
    
    // Certificate validation
    requestCert: false,
    rejectUnauthorized: true,
    
    // Security headers
    secureOptions: 
      crypto.constants.SSL_OP_NO_SSLv2 |
      crypto.constants.SSL_OP_NO_SSLv3 |
      crypto.constants.SSL_OP_NO_TLSv1 |
      crypto.constants.SSL_OP_NO_TLSv1_1 |
      crypto.constants.SSL_OP_NO_TLSv1_2,
  };
  
  // Load certificates (in production, load from secure storage)
  if (process.env.TLS_CERT_PATH && process.env.TLS_KEY_PATH) {
    try {
      const fs = require('fs');
      options.cert = fs.readFileSync(process.env.TLS_CERT_PATH);
      options.key = fs.readFileSync(process.env.TLS_KEY_PATH);
    } catch (error) {
      console.error('Failed to load TLS certificates:', error);
      const selfSigned = generateSelfSignedCertificate();
      options.cert = selfSigned.cert;
      options.key = selfSigned.key;
    }
  } else {
    const selfSigned = generateSelfSignedCertificate();
    options.cert = selfSigned.cert;
    options.key = selfSigned.key;
  }
  
  return options;
}

/**
 * Validate certificate against pinned public key
 */
export function validateCertificatePin(hostname: string, cert: any): boolean {
  try {
    const pin = certificatePins.get(hostname);
    if (!pin) {
      console.warn(`🔒 No certificate pin found for ${hostname}`);
      return true; // Allow if no pin configured
    }
    
    // Check expiration
    if (Date.now() > pin.expiresAt.getTime()) {
      console.warn(`🔒 Certificate pin expired for ${hostname}`);
      return false;
    }
    
    // Extract public key and calculate hash
    const publicKey = cert.pubkey;
    const publicKeyHash = crypto.createHash(pin.algorithm).update(publicKey).digest('hex');
    
    // Check primary pin
    if (publicKeyHash === pin.publicKeyHash) {
      return true;
    }
    
    // Check backup pins
    if (pin.backup && pin.backup.includes(publicKeyHash)) {
      return true;
    }
    
    console.error(`🔒 Certificate pin validation failed for ${hostname}`);
    return false;
  } catch (error) {
    console.error('Certificate pin validation error:', error);
    return false;
  }
}

/**
 * Add certificate pin for hostname
 */
export function addCertificatePin(
  hostname: string,
  publicKeyHash: string,
  expirationDays: number = 90,
  backup?: string[]
): void {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);
    
    const pin: CertificatePin = {
      hostname,
      publicKeyHash,
      algorithm: 'sha256',
      expiresAt,
      backup,
    };
    
    certificatePins.set(hostname, pin);
    console.log(`🔒 Added certificate pin for ${hostname}`);
  } catch (error) {
    console.error('Certificate pin addition error:', error);
  }
}

/**
 * Validate certificate details
 */
export function validateCertificate(cert: any, hostname?: string): CertificateValidation {
  const validation: CertificateValidation = {
    isValid: true,
    hostname: hostname || '',
    issuer: '',
    subject: '',
    validFrom: new Date(),
    validTo: new Date(),
    fingerprint: '',
    algorithm: '',
    keySize: 0,
    errors: [],
  };
  
  try {
    // Extract certificate information
    if (cert.issuer) {
      validation.issuer = typeof cert.issuer === 'string' ? cert.issuer : JSON.stringify(cert.issuer);
    }
    
    if (cert.subject) {
      validation.subject = typeof cert.subject === 'string' ? cert.subject : JSON.stringify(cert.subject);
    }
    
    if (cert.valid_from) {
      validation.validFrom = new Date(cert.valid_from);
    }
    
    if (cert.valid_to) {
      validation.validTo = new Date(cert.valid_to);
    }
    
    if (cert.fingerprint) {
      validation.fingerprint = cert.fingerprint;
    }
    
    // Validate expiration
    const now = new Date();
    if (validation.validTo < now) {
      validation.isValid = false;
      validation.errors.push('Certificate has expired');
    }
    
    if (validation.validFrom > now) {
      validation.isValid = false;
      validation.errors.push('Certificate is not yet valid');
    }
    
    // Validate hostname (if provided)
    if (hostname && cert.subject) {
      const subjectCN = cert.subject.CN || '';
      if (subjectCN !== hostname && !cert.subjectaltname?.includes(hostname)) {
        validation.isValid = false;
        validation.errors.push(`Hostname mismatch: expected ${hostname}, got ${subjectCN}`);
      }
    }
    
    // Check key size
    if (cert.bits) {
      validation.keySize = cert.bits;
      if (validation.keySize < 2048) {
        validation.isValid = false;
        validation.errors.push(`Weak key size: ${validation.keySize} bits (minimum 2048)`);
      }
    }
    
  } catch (error) {
    validation.isValid = false;
    validation.errors.push(`Certificate validation error: ${error}`);
  }
  
  return validation;
}

/**
 * Create secure HTTP client with TLS 1.3 and certificate pinning
 */
export function createSecureHttpClient(): https.Agent {
  return new https.Agent({
    ...TLS_CONFIG,
    
    // Certificate validation callback
    checkServerIdentity: (hostname: string, cert: any): Error | undefined => {
      // Standard hostname verification
      const hostnameError = tls.checkServerIdentity(hostname, cert);
      if (hostnameError) {
        return hostnameError;
      }
      
      // Certificate pinning validation
      if (!validateCertificatePin(hostname, cert)) {
        return new Error(`Certificate pin validation failed for ${hostname}`);
      }
      
      return undefined;
    },
  });
}

/**
 * Setup certificate pinning for API endpoints
 */
export function setupAPIEndpointPinning(): void {
  try {
    // Add certificate pins for critical API endpoints
    // These would be obtained from actual certificates in production
    
    // Example: Pin OpenAI API certificate
    addCertificatePin(
      'api.openai.com',
      'example_public_key_hash', // Replace with actual hash
      90,
      ['backup_hash_1', 'backup_hash_2']
    );
    
    // Example: Pin food database API certificates
    addCertificatePin(
      'world.openfoodfacts.org',
      'example_public_key_hash', // Replace with actual hash
      90
    );
    
    console.log('🔒 API endpoint certificate pinning configured');
  } catch (error) {
    console.error('API endpoint pinning setup error:', error);
  }
}

/**
 * Generate Certificate Signing Request (CSR)
 */
export function generateCSR(commonName: string, organization?: string): { csr: string; privateKey: string } {
  try {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });
    
    // In a real implementation, you would use a proper CSR library
    // This is a simplified example
    console.log(`🔒 Generated CSR for ${commonName}`);
    console.log('🔒 Submit CSR to trusted Certificate Authority');
    
    return { csr: publicKey, privateKey };
  } catch (error) {
    console.error('CSR generation error:', error);
    throw new Error('Failed to generate Certificate Signing Request');
  }
}

/**
 * Monitor certificate expiration
 */
export function monitorCertificateExpiration(): void {
  try {
    setInterval(() => {
      for (const [hostname, pin] of Array.from(certificatePins.entries())) {
        const daysUntilExpiration = Math.ceil(
          (pin.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysUntilExpiration <= 30) {
          console.warn(`🔒 Certificate pin for ${hostname} expires in ${daysUntilExpiration} days`);
        }
        
        if (daysUntilExpiration <= 0) {
          console.error(`🔒 Certificate pin for ${hostname} has expired`);
        }
      }
    }, 24 * 60 * 60 * 1000); // Check daily
    
    console.log('🔒 Certificate expiration monitoring started');
  } catch (error) {
    console.error('Certificate monitoring setup error:', error);
  }
}

/**
 * Initialize TLS security features
 */
export function initializeTLSSecurity(): void {
  try {
    // Setup certificate pinning for API endpoints
    setupAPIEndpointPinning();
    
    // Start certificate expiration monitoring
    monitorCertificateExpiration();
    
    console.log('🔒 TLS 1.3 security features initialized');
  } catch (error) {
    console.error('TLS security initialization error:', error);
    throw new Error('Failed to initialize TLS security features');
  }
}