const SENSITIVE_FIELDS = new Set([
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'secret',
  'jwt_secret',
  'evm_relayer_private_key',
  'privateKey',
  'apiSecret',
  'apiKey'
]);

function redactSensitiveData(value, depth = 0) {
  if (depth > 5 || value == null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveData(item, depth + 1));
  }

  if (typeof value !== 'object') {
    return value;
  }

  return Object.entries(value).reduce((acc, [key, nestedValue]) => {
    if (SENSITIVE_FIELDS.has(key) || SENSITIVE_FIELDS.has(key.toLowerCase())) {
      acc[key] = '[REDACTED]';
      return acc;
    }

    acc[key] = redactSensitiveData(nestedValue, depth + 1);
    return acc;
  }, {});
}

module.exports = {
  redactSensitiveData
};
