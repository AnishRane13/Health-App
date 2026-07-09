/**
 * Centralized, validated environment configuration.
 * Fails fast on boot if a required variable is missing — better to crash on
 * deploy than to serve broken auth in production.
 */
const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const parseOrigins = (value) =>
  (value || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT, 10) || 5000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // Comma-separated list of allowed frontend origins (Vercel URL, localhost, etc.)
  clientOrigins: parseOrigins(process.env.CLIENT_URL),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
};
