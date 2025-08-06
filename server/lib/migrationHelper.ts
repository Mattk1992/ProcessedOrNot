// Migration Helper for Existing Users to Enhanced Security
// Gradually upgrades user data from legacy to industry-standard encryption

import { 
  encryptDataCompatible, 
  decryptDataCompatible,
  hashPassword,
  verifyPassword,
  migrateUserPassword 
} from './authUpgrade';
import { storage } from './storage';

/**
 * Migrate user data from legacy encryption to enhanced encryption
 */
export async function migrateUserData(userId: number): Promise<boolean> {
  try {
    const user = await storage.getUserById(userId);
    if (!user) {
      return false;
    }

    let needsUpdate = false;
    const updates: any = {};

    // Migrate encrypted email if needed
    if (user.email && !user.email.startsWith('{"version":2')) {
      try {
        const decryptedEmail = decryptDataCompatible(user.email);
        const reencryptedEmail = encryptDataCompatible(decryptedEmail);
        updates.email = reencryptedEmail;
        needsUpdate = true;
        console.log(`🔐 Migrated email encryption for user ${userId}`);
      } catch (error) {
        console.warn(`Failed to migrate email for user ${userId}:`, error);
      }
    }

    // Migrate encrypted names if needed
    if (user.firstName && !user.firstName.startsWith('{"version":2')) {
      try {
        const decryptedFirstName = decryptDataCompatible(user.firstName);
        const reencryptedFirstName = encryptDataCompatible(decryptedFirstName);
        updates.firstName = reencryptedFirstName;
        needsUpdate = true;
        console.log(`🔐 Migrated firstName encryption for user ${userId}`);
      } catch (error) {
        console.warn(`Failed to migrate firstName for user ${userId}:`, error);
      }
    }

    if (user.lastName && !user.lastName.startsWith('{"version":2')) {
      try {
        const decryptedLastName = decryptDataCompatible(user.lastName);
        const reencryptedLastName = encryptDataCompatible(decryptedLastName);
        updates.lastName = reencryptedLastName;
        needsUpdate = true;
        console.log(`🔐 Migrated lastName encryption for user ${userId}`);
      } catch (error) {
        console.warn(`Failed to migrate lastName for user ${userId}:`, error);
      }
    }

    // Migrate tokens if needed
    if (user.emailVerificationToken && !user.emailVerificationToken.startsWith('{"version":2')) {
      try {
        const decryptedToken = decryptDataCompatible(user.emailVerificationToken);
        const reencryptedToken = encryptDataCompatible(decryptedToken);
        updates.emailVerificationToken = reencryptedToken;
        needsUpdate = true;
        console.log(`🔐 Migrated email verification token for user ${userId}`);
      } catch (error) {
        console.warn(`Failed to migrate email verification token for user ${userId}:`, error);
      }
    }

    if (user.passwordResetToken && !user.passwordResetToken.startsWith('{"version":2')) {
      try {
        const decryptedToken = decryptDataCompatible(user.passwordResetToken);
        const reencryptedToken = encryptDataCompatible(decryptedToken);
        updates.passwordResetToken = reencryptedToken;
        needsUpdate = true;
        console.log(`🔐 Migrated password reset token for user ${userId}`);
      } catch (error) {
        console.warn(`Failed to migrate password reset token for user ${userId}:`, error);
      }
    }

    // Update user record if changes were made
    if (needsUpdate) {
      await storage.updateUser(userId, updates);
      console.log(`🔐 Successfully migrated encryption for user ${userId}`);
    }

    return true;
  } catch (error) {
    console.error(`Migration failed for user ${userId}:`, error);
    return false;
  }
}

/**
 * Migrate user password from bcrypt to Argon2id during login
 */
export async function migrateUserPasswordOnLogin(
  userId: number,
  password: string
): Promise<boolean> {
  try {
    const user = await storage.getUserById(userId);
    if (!user) {
      return false;
    }

    // Check if password needs migration (bcrypt hash doesn't start with $argon2id$)
    if (!user.passwordHash.startsWith('$argon2id$')) {
      const newHash = await migrateUserPassword(password, user.passwordHash);
      
      if (newHash && newHash !== user.passwordHash) {
        await storage.updateUser(userId, { passwordHash: newHash });
        console.log(`🔐 Migrated password hash to Argon2id for user ${userId}`);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`Password migration failed for user ${userId}:`, error);
    return false;
  }
}

/**
 * Migrate search history encryption
 */
export async function migrateSearchHistoryData(): Promise<void> {
  try {
    console.log('🔐 Starting search history encryption migration...');
    
    const searchHistories = await storage.getAllSearchHistory();
    let migrated = 0;

    for (const history of searchHistories) {
      try {
        let needsUpdate = false;
        const updates: any = {};

        // Migrate search input encryption
        if (history.searchInput && !history.searchInput.startsWith('{"version":2')) {
          const decryptedInput = decryptDataCompatible(history.searchInput);
          const reencryptedInput = encryptDataCompatible(decryptedInput);
          updates.searchInput = reencryptedInput;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await storage.updateSearchHistory(history.id, updates);
          migrated++;
        }
      } catch (error) {
        console.warn(`Failed to migrate search history ${history.id}:`, error);
      }
    }

    console.log(`🔐 Migrated encryption for ${migrated} search history records`);
  } catch (error) {
    console.error('Search history migration error:', error);
  }
}

/**
 * Check if user data needs migration
 */
export function needsMigration(user: any): boolean {
  const checks = [
    user.email && !user.email.startsWith('{"version":2'),
    user.firstName && !user.firstName.startsWith('{"version":2'),
    user.lastName && !user.lastName.startsWith('{"version":2'),
    user.emailVerificationToken && !user.emailVerificationToken.startsWith('{"version":2'),
    user.passwordResetToken && !user.passwordResetToken.startsWith('{"version":2'),
    user.passwordHash && !user.passwordHash.startsWith('$argon2id$'),
  ];

  return checks.some(Boolean);
}

/**
 * Schedule automatic migration for all users
 */
export async function scheduleUserMigrations(): Promise<void> {
  try {
    console.log('🔐 Scheduling user data migrations...');

    // In production, this would be done in batches to avoid overwhelming the system
    const users = await storage.getAllUsers();
    
    for (const user of users) {
      if (needsMigration(user)) {
        // Schedule migration (in production, use a job queue)
        setTimeout(async () => {
          await migrateUserData(user.id);
        }, Math.random() * 10000); // Spread migrations over 10 seconds
      }
    }

    // Schedule search history migration
    setTimeout(async () => {
      await migrateSearchHistoryData();
    }, 15000); // After user migrations

    console.log('🔐 User migration scheduling completed');
  } catch (error) {
    console.error('Migration scheduling error:', error);
  }
}