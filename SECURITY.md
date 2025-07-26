# Security Implementation Documentation

## Data Encryption

ProcessedOrNot Scanner implements comprehensive end-to-end encryption for all sensitive user data:

### Encrypted Data Types

1. **Personal Identifiable Information (PII)**
   - Email addresses (encrypted + hashed for uniqueness)
   - First and last names
   - User search queries and history

2. **Authentication Tokens**
   - Email verification tokens
   - Password reset tokens
   - Session data

### Encryption Methods

- **Algorithm**: AES-256-CBC with random IV for each encryption
- **Key Management**: Environment-based encryption keys
- **Hash Functions**: SHA-256 for search/comparison operations

### Security Features

1. **Password Security**
   - bcrypt with 12 salt rounds
   - Secure password complexity requirements
   - Password reset with time-limited tokens

2. **Session Security**
   - Secure session cookies with httpOnly and sameSite flags
   - Custom session names to avoid default patterns
   - Configurable session duration (7 days default, 30 days with "keep logged in")

3. **Data Protection**
   - All PII encrypted at rest
   - Search queries encrypted before database storage
   - Email addresses hashed for uniqueness checks while maintaining encryption

4. **Database Security**
   - No plaintext storage of sensitive data
   - Encrypted fields clearly marked in schema
   - Secure user lookup by hash comparison

### Environment Variables

Required for production:
- `ENCRYPTION_KEY`: 64-character hex string for data encryption
- `SESSION_SECRET`: Secure session signing key
- `DATABASE_URL`: PostgreSQL connection with SSL

### Implementation Details

The encryption system uses a multi-layer approach:
1. Data is encrypted before database insertion
2. Hashes are created for search/uniqueness without exposing plaintext
3. Data is decrypted only when needed for display
4. All encryption/decryption errors are logged and handled gracefully

### Compliance

This implementation provides:
- Data protection at rest and in transit
- User privacy for search history
- Secure authentication flows
- Encrypted personal information storage

### Development vs Production

- Development: Auto-generates encryption keys with warnings
- Production: Requires explicit environment variable configuration
- All encryption is active in both environments

## Security Best Practices Applied

1. **Zero Trust Architecture**: All user data is encrypted regardless of internal system access
2. **Defense in Depth**: Multiple layers of security (encryption, hashing, secure sessions)
3. **Minimal Data Exposure**: Only decrypt data when absolutely necessary for display
4. **Secure by Default**: All new user data is automatically encrypted
5. **Audit Trail**: All encryption operations are logged for security monitoring