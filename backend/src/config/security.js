const INSECURE_JWT_SECRETS = new Set([
  'your-super-secret-jwt-key-here',
  'nkwa_jwt_secret_2024_very_secure_key_here',
  'dev-only-insecure-jwt-secret'
]);

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    return 'dev-only-insecure-jwt-secret';
  }

  if (process.env.NODE_ENV === 'production' && INSECURE_JWT_SECRETS.has(secret)) {
    throw new Error('JWT_SECRET must not use a default or example value in production');
  }

  return secret;
}

function assertProductionSecurity() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  getJwtSecret();

  if (String(process.env.AUTH_DEMO_MODE || '').toLowerCase() === 'true') {
    throw new Error('AUTH_DEMO_MODE cannot be enabled in production');
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set in production');
  }
}

function isDemoAuthAllowed() {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  const forcedDemoMode = String(process.env.AUTH_DEMO_MODE || '').toLowerCase() === 'true';
  const missingDatabaseUrl = !process.env.DATABASE_URL;
  return forcedDemoMode || missingDatabaseUrl;
}

module.exports = {
  getJwtSecret,
  assertProductionSecurity,
  isDemoAuthAllowed
};
