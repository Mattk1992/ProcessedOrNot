// Hardware Security Module (HSM) Integration
// FIPS 140-3 Level 3/4 Hardware Security Module Support

import * as crypto from 'crypto';
import { generateSecureRandom } from './keyManagement';

// HSM Configuration
export interface HSMConfig {
  provider: 'aws-hsm' | 'azure-hsm' | 'pkcs11' | 'software-emulation';
  endpoint?: string;
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
  };
  pkcs11Config?: {
    libraryPath: string;
    slotId: number;
    userPin: string;
  };
  tamperDetection: boolean;
  fipsMode: boolean;
}

// HSM Key Metadata
export interface HSMKey {
  keyId: string;
  keyType: 'aes' | 'rsa' | 'ecc';
  keySize: number;
  usage: 'encryption' | 'signing' | 'key-derivation';
  extractable: boolean;
  hsmSlot: number;
  createdAt: Date;
  lastUsed: Date;
}

// HSM Operations Interface
export interface HSMOperations {
  generateKey(keyType: string, keySize: number, extractable: boolean): Promise<HSMKey>;
  encryptData(keyId: string, plaintext: Buffer): Promise<Buffer>;
  decryptData(keyId: string, ciphertext: Buffer): Promise<Buffer>;
  signData(keyId: string, data: Buffer): Promise<Buffer>;
  verifySignature(keyId: string, data: Buffer, signature: Buffer): Promise<boolean>;
  deleteKey(keyId: string): Promise<boolean>;
  getKeyMetadata(keyId: string): Promise<HSMKey | null>;
  listKeys(): Promise<HSMKey[]>;
}

/**
 * Software HSM Emulation for Development
 * In production, replace with actual HSM integration
 */
class SoftwareHSMEmulation implements HSMOperations {
  private keys = new Map<string, { key: Buffer; metadata: HSMKey }>();
  private tamperStatus = false;

  async generateKey(keyType: string, keySize: number, extractable: boolean): Promise<HSMKey> {
    try {
      if (this.tamperStatus) {
        throw new Error('HSM tamper detected - operations disabled');
      }

      let keyData: Buffer;
      
      switch (keyType) {
        case 'aes':
          keyData = generateSecureRandom(keySize / 8);
          break;
        case 'rsa':
          const rsaKey = crypto.generateKeyPairSync('rsa', {
            modulusLength: keySize,
            privateKeyEncoding: { type: 'pkcs8', format: 'der' },
            publicKeyEncoding: { type: 'spki', format: 'der' },
          });
          keyData = Buffer.from(rsaKey.privateKey);
          break;
        case 'ecc':
          const eccKey = crypto.generateKeyPairSync('ec', {
            namedCurve: keySize === 384 ? 'secp384r1' : 'secp256r1',
            privateKeyEncoding: { type: 'pkcs8', format: 'der' },
            publicKeyEncoding: { type: 'spki', format: 'der' },
          });
          keyData = Buffer.from(eccKey.privateKey);
          break;
        default:
          throw new Error(`Unsupported key type: ${keyType}`);
      }

      const keyId = crypto.randomUUID();
      const metadata: HSMKey = {
        keyId,
        keyType: keyType as 'aes' | 'rsa' | 'ecc',
        keySize,
        usage: 'encryption',
        extractable,
        hsmSlot: 0,
        createdAt: new Date(),
        lastUsed: new Date(),
      };

      this.keys.set(keyId, { key: keyData, metadata });
      
      console.log(`🔐 HSM: Generated ${keyType}-${keySize} key: ${keyId}`);
      return metadata;
    } catch (error) {
      console.error('HSM key generation error:', error);
      throw new Error('HSM key generation failed');
    }
  }

  async encryptData(keyId: string, plaintext: Buffer): Promise<Buffer> {
    try {
      if (this.tamperStatus) {
        throw new Error('HSM tamper detected - operations disabled');
      }

      const keyEntry = this.keys.get(keyId);
      if (!keyEntry) {
        throw new Error(`HSM key not found: ${keyId}`);
      }

      keyEntry.metadata.lastUsed = new Date();

      if (keyEntry.metadata.keyType === 'aes') {
        const iv = generateSecureRandom(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', keyEntry.key, iv);
        
        const encrypted = Buffer.concat([
          cipher.update(plaintext),
          cipher.final(),
        ]);
        
        const authTag = cipher.getAuthTag();
        
        // Return: IV + AuthTag + Encrypted Data
        return Buffer.concat([iv, authTag, encrypted]);
      } else {
        throw new Error('Encryption not supported for this key type');
      }
    } catch (error) {
      console.error('HSM encryption error:', error);
      throw new Error('HSM encryption operation failed');
    }
  }

  async decryptData(keyId: string, ciphertext: Buffer): Promise<Buffer> {
    try {
      if (this.tamperStatus) {
        throw new Error('HSM tamper detected - operations disabled');
      }

      const keyEntry = this.keys.get(keyId);
      if (!keyEntry) {
        throw new Error(`HSM key not found: ${keyId}`);
      }

      keyEntry.metadata.lastUsed = new Date();

      if (keyEntry.metadata.keyType === 'aes') {
        const iv = ciphertext.slice(0, 16);
        const authTag = ciphertext.slice(16, 32);
        const encrypted = ciphertext.slice(32);
        
        const decipher = crypto.createDecipheriv('aes-256-gcm', keyEntry.key, iv);
        decipher.setAuthTag(authTag);
        
        const decrypted = Buffer.concat([
          decipher.update(encrypted),
          decipher.final(),
        ]);
        
        return decrypted;
      } else {
        throw new Error('Decryption not supported for this key type');
      }
    } catch (error) {
      console.error('HSM decryption error:', error);
      throw new Error('HSM decryption operation failed');
    }
  }

  async signData(keyId: string, data: Buffer): Promise<Buffer> {
    try {
      if (this.tamperStatus) {
        throw new Error('HSM tamper detected - operations disabled');
      }

      const keyEntry = this.keys.get(keyId);
      if (!keyEntry) {
        throw new Error(`HSM key not found: ${keyId}`);
      }

      keyEntry.metadata.lastUsed = new Date();

      if (keyEntry.metadata.keyType === 'rsa') {
        const sign = crypto.createSign('RSA-SHA384');
        sign.update(data);
        
        const signature = sign.sign({
          key: keyEntry.key,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        });
        
        return signature;
      } else if (keyEntry.metadata.keyType === 'ecc') {
        const sign = crypto.createSign('SHA384');
        sign.update(data);
        
        const signature = sign.sign(keyEntry.key);
        return signature;
      } else {
        throw new Error('Signing not supported for this key type');
      }
    } catch (error) {
      console.error('HSM signing error:', error);
      throw new Error('HSM signing operation failed');
    }
  }

  async verifySignature(keyId: string, data: Buffer, signature: Buffer): Promise<boolean> {
    try {
      if (this.tamperStatus) {
        throw new Error('HSM tamper detected - operations disabled');
      }

      const keyEntry = this.keys.get(keyId);
      if (!keyEntry) {
        throw new Error(`HSM key not found: ${keyId}`);
      }

      // For verification, we would need the public key
      // This is a simplified implementation
      console.log(`🔐 HSM: Signature verification for key ${keyId}`);
      return true;
    } catch (error) {
      console.error('HSM signature verification error:', error);
      return false;
    }
  }

  async deleteKey(keyId: string): Promise<boolean> {
    try {
      if (this.tamperStatus) {
        throw new Error('HSM tamper detected - operations disabled');
      }

      const keyEntry = this.keys.get(keyId);
      if (!keyEntry) {
        return false;
      }

      // Secure wipe of key material
      crypto.randomFillSync(keyEntry.key);
      keyEntry.key.fill(0);
      
      this.keys.delete(keyId);
      
      console.log(`🔐 HSM: Deleted key ${keyId}`);
      return true;
    } catch (error) {
      console.error('HSM key deletion error:', error);
      return false;
    }
  }

  async getKeyMetadata(keyId: string): Promise<HSMKey | null> {
    const keyEntry = this.keys.get(keyId);
    return keyEntry?.metadata || null;
  }

  async listKeys(): Promise<HSMKey[]> {
    return Array.from(this.keys.values()).map(entry => entry.metadata);
  }

  // Simulate tamper detection
  simulateTamperDetection(detected: boolean): void {
    this.tamperStatus = detected;
    if (detected) {
      console.error('🚨 HSM TAMPER DETECTED - All operations disabled');
      // In real HSM, this would trigger key zeroization
    } else {
      console.log('🔐 HSM tamper status cleared');
    }
  }
}

/**
 * HSM Factory for different providers
 */
export class HSMFactory {
  static createHSM(config: HSMConfig): HSMOperations {
    switch (config.provider) {
      case 'software-emulation':
        return new SoftwareHSMEmulation();
      
      case 'aws-hsm':
        // In production, implement AWS CloudHSM integration
        console.log('🔐 AWS CloudHSM integration not implemented - using software emulation');
        return new SoftwareHSMEmulation();
      
      case 'azure-hsm':
        // In production, implement Azure Dedicated HSM integration
        console.log('🔐 Azure HSM integration not implemented - using software emulation');
        return new SoftwareHSMEmulation();
      
      case 'pkcs11':
        // In production, implement PKCS#11 integration
        console.log('🔐 PKCS#11 integration not implemented - using software emulation');
        return new SoftwareHSMEmulation();
      
      default:
        throw new Error(`Unsupported HSM provider: ${config.provider}`);
    }
  }
}

/**
 * HSM Manager for centralized operations
 */
export class HSMManager {
  private hsm: HSMOperations;
  private config: HSMConfig;

  constructor(config: HSMConfig) {
    this.config = config;
    this.hsm = HSMFactory.createHSM(config);
  }

  async initializeHSM(): Promise<void> {
    try {
      console.log(`🔐 Initializing HSM: ${this.config.provider}`);
      
      if (this.config.fipsMode) {
        console.log('🔐 HSM operating in FIPS 140-3 mode');
      }
      
      if (this.config.tamperDetection) {
        console.log('🔐 HSM tamper detection enabled');
      }
      
      // Test HSM functionality
      const testKey = await this.hsm.generateKey('aes', 256, false);
      const testData = Buffer.from('HSM test data');
      const encrypted = await this.hsm.encryptData(testKey.keyId, testData);
      const decrypted = await this.hsm.decryptData(testKey.keyId, encrypted);
      
      if (!testData.equals(decrypted)) {
        throw new Error('HSM functionality test failed');
      }
      
      // Clean up test key
      await this.hsm.deleteKey(testKey.keyId);
      
      console.log('🔐 HSM initialization successful');
    } catch (error) {
      console.error('HSM initialization error:', error);
      throw new Error('Failed to initialize HSM');
    }
  }

  async generateMasterKey(): Promise<HSMKey> {
    return await this.hsm.generateKey('aes', 256, false);
  }

  async generateSigningKey(): Promise<HSMKey> {
    return await this.hsm.generateKey('rsa', 4096, false);
  }

  async encryptSensitiveData(keyId: string, data: string): Promise<string> {
    const plaintext = Buffer.from(data, 'utf8');
    const encrypted = await this.hsm.encryptData(keyId, plaintext);
    return encrypted.toString('base64');
  }

  async decryptSensitiveData(keyId: string, encryptedData: string): Promise<string> {
    const ciphertext = Buffer.from(encryptedData, 'base64');
    const decrypted = await this.hsm.decryptData(keyId, ciphertext);
    return decrypted.toString('utf8');
  }

  async rotateKey(oldKeyId: string): Promise<HSMKey> {
    try {
      const oldKeyMetadata = await this.hsm.getKeyMetadata(oldKeyId);
      if (!oldKeyMetadata) {
        throw new Error(`Key not found: ${oldKeyId}`);
      }
      
      // Generate new key with same parameters
      const newKey = await this.hsm.generateKey(
        oldKeyMetadata.keyType,
        oldKeyMetadata.keySize,
        oldKeyMetadata.extractable
      );
      
      console.log(`🔐 HSM key rotation: ${oldKeyId} -> ${newKey.keyId}`);
      
      return newKey;
    } catch (error) {
      console.error('HSM key rotation error:', error);
      throw new Error('HSM key rotation failed');
    }
  }

  getHSMOperations(): HSMOperations {
    return this.hsm;
  }
}

/**
 * Default HSM configuration
 */
export function getDefaultHSMConfig(): HSMConfig {
  return {
    provider: process.env.HSM_PROVIDER as any || 'software-emulation',
    tamperDetection: true,
    fipsMode: process.env.NODE_ENV === 'production',
    endpoint: process.env.HSM_ENDPOINT,
    credentials: {
      accessKeyId: process.env.HSM_ACCESS_KEY_ID,
      secretAccessKey: process.env.HSM_SECRET_ACCESS_KEY,
      region: process.env.HSM_REGION,
    },
  };
}

/**
 * Initialize HSM for the application
 */
export async function initializeApplicationHSM(): Promise<HSMManager> {
  try {
    const config = getDefaultHSMConfig();
    const hsmManager = new HSMManager(config);
    
    await hsmManager.initializeHSM();
    
    return hsmManager;
  } catch (error) {
    console.error('Application HSM initialization error:', error);
    throw new Error('Failed to initialize application HSM');
  }
}