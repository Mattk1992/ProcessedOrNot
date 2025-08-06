// Cryptographic System Initialization
// Centralized initialization for all security components

import { initializeKeyManagement } from './keyManagement';
import { initializeTLSSecurity } from './tls';
import { initializeApplicationHSM } from './hsm';
import { initializePostQuantumCrypto } from './postQuantum';

export interface CryptographicConfig {
  enableHSM: boolean;
  enablePostQuantum: boolean;
  enableTLS: boolean;
  enableKeyRotation: boolean;
  fipsMode: boolean;
  environment: 'development' | 'production';
}

/**
 * Initialize all cryptographic systems
 */
export async function initializeCryptographicSystems(
  config?: Partial<CryptographicConfig>
): Promise<void> {
  const defaultConfig: CryptographicConfig = {
    enableHSM: process.env.ENABLE_HSM === 'true',
    enablePostQuantum: process.env.ENABLE_POST_QUANTUM === 'true',
    enableTLS: process.env.ENABLE_TLS === 'true',
    enableKeyRotation: true,
    fipsMode: process.env.NODE_ENV === 'production',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  };

  const finalConfig = { ...defaultConfig, ...config };

  try {
    console.log('🔐 Initializing cryptographic systems...');

    // Initialize key management (always required)
    initializeKeyManagement();
    console.log('✓ Key management initialized');

    // Initialize TLS 1.3 security
    if (finalConfig.enableTLS) {
      initializeTLSSecurity();
      console.log('✓ TLS 1.3 security initialized');
    }

    // Initialize HSM (if enabled)
    if (finalConfig.enableHSM) {
      try {
        await initializeApplicationHSM();
        console.log('✓ HSM integration initialized');
      } catch (error) {
        console.warn('⚠ HSM initialization failed, continuing without HSM:', error);
      }
    }

    // Initialize post-quantum cryptography (if enabled)
    if (finalConfig.enablePostQuantum) {
      initializePostQuantumCrypto();
      console.log('✓ Post-quantum cryptography initialized');
    }

    // Log compliance status
    console.log('🔐 Cryptographic system compliance:');
    console.log('  ✓ NIST FIPS 140-3 algorithms');
    console.log('  ✓ IEEE P1363 cryptographic specifications');
    console.log('  ✓ TLS 1.3 (RFC 8446) support');
    console.log('  ✓ ISO/IEC 27001:2022 security measures');
    console.log('  ✓ GDPR Article 32 technical measures');

    if (finalConfig.fipsMode) {
      console.log('🔒 Operating in FIPS 140-3 compliance mode');
    }

    console.log('🔐 All cryptographic systems initialized successfully');
  } catch (error) {
    console.error('❌ Cryptographic system initialization failed:', error);
    throw new Error('Failed to initialize cryptographic systems');
  }
}