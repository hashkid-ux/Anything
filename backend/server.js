require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/environment');

const app = express();
// CRITICAL: Set trust proxy to 1 to ensure req.ip correctly grabs the client's IP 
// from the X-Forwarded-For header when behind a single proxy/load balancer.
app.set('trust proxy', 1); 

// Security Middleware
app.use(helmet());

// Dynamic CORS
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, file://)
    if (!origin) return callback(null, true);
    
    // Check if the origin matches any of the allowed patterns
    const allowed = config.cors.origins.some(allowedOrigin => 
      origin.includes(allowedOrigin)
    );
    
    if (allowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests, please try again later.',
  // ROBUSTNESS FIX: Use a custom keyGenerator to strip any port number from the IP address.
  // This prevents rate limit bypasses caused by proxies that include a port in X-Forwarded-For.
  keyGenerator: (req) => {
    // req.ip is set correctly by Express due to app.set('trust proxy', 1)
    if (req.ip) {
      // Strips port from IPv4 (e.g., 1.2.3.4:1234 -> 1.2.3.4) and IPv6 addresses
      return req.ip.replace(/:\d+[^:]*$/, '');
    }
    // Fallback to the immediate remote address if proxy logic fails (should not happen here)
    return req.socket.remoteAddress; 
  }
});
app.use('/api/', limiter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: '2.0.0'
  });
});

// API Routes
const { router: authRouter } = require('./routes/auth');
const paymentsRouter = require('./routes/payments');
const masterBuildRouter = require('./routes/masterBuild'); // NEW!

app.use('/api/auth', authRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/validate', require('./routes/validate'));
app.use('/api/generate', require('./routes/generate'));
app.use('/api/research', require('./routes/research'));
app.use('/api/deploy', require('./routes/deploy'));
app.use('/api/master', masterBuildRouter); // NEW MASTER ROUTE!

// Error Handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Startup
app.listen(config.port, () => {
  console.log(`🚀 Launch AI Backend v2.0`);
  console.log(`📍 Port: ${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 CORS Origins: ${config.cors.origins.join(', ')}`);
  console.log(`✅ All systems operational`);
});

module.exports = app;
