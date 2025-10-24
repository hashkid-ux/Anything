require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = [
  'ANTHROPIC_API_KEY',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',
  
  api: {
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    anthropicKeyFree: process.env.ANTHROPIC_API_KEY_FREE || process.env.ANTHROPIC_API_KEY,
  },
  
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiry: '7d',
  },
  
  payment: {
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  
  database: {
    url: process.env.DATABASE_URL,
  },
  
  cors: {
    origins: [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://anythingai.vercel.app',
      process.env.CORS_ORIGIN,
    ].filter(Boolean),
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
};