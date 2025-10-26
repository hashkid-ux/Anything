require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const config = require('./config/environment');
const { passport } = require('./config/passport');

const app = express();

// ========================================
// TRUST PROXY
// ========================================
app.set('trust proxy', 1);

// ========================================
// SESSION MIDDLEWARE (Required for Passport)
// ========================================
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ========================================
// INITIALIZE PASSPORT
// ========================================
app.use(passport.initialize());
app.use(passport.session());

// ========================================
// SECURITY MIDDLEWARE
// ========================================
app.use(helmet());

// ========================================
// DYNAMIC CORS
// ========================================
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
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
  credentials: true // Important for OAuth cookies/sessions
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================
// RATE LIMITING
// ========================================
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests, please try again later.',
  keyGenerator: (req) => {
    if (req.ip) {
      return req.ip.replace(/:\d+[^:]*$/, '');
    }
    return req.socket.remoteAddress; 
  }
});
app.use('/api/', limiter);

// ========================================
// HEALTH CHECK
// ========================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: '2.0.0',
    oauth: {
      google: !!process.env.GOOGLE_CLIENT_ID,
      github: !!process.env.GITHUB_CLIENT_ID
    }
  });
});

// ========================================
// API ROUTES
// ========================================
const { router: authRouter } = require('./routes/auth');
const authOAuthRouter = require('./routes/authOAuth');
const paymentsRouter = require('./routes/payments');
const masterBuildRouter = require('./routes/masterBuild');

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/auth/oauth', authOAuthRouter); // OAuth routes
app.use('/api/payments', paymentsRouter);
app.use('/api/validate', require('./routes/validate'));
app.use('/api/generate', require('./routes/generate'));
app.use('/api/research', require('./routes/research'));
app.use('/api/deploy', require('./routes/deploy'));
app.use('/api/master', masterBuildRouter);

// ========================================
// ERROR HANDLING
// ========================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// ========================================
// 404 HANDLER
// ========================================
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ========================================
// STARTUP
// ========================================
app.listen(config.port, () => {
  const backendURL = process.env.BACKEND_URL || `http://localhost:${config.port}`;
  
  console.log(`🚀 Launch AI Backend v2.0`);
  console.log(`📍 Port: ${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Backend URL: ${backendURL}`);
  console.log(`🔗 CORS Origins: ${config.cors.origins.join(', ')}`);
  console.log(`🔐 OAuth Providers:`);
  console.log(`   - Google: ${process.env.GOOGLE_CLIENT_ID ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`   - GitHub: ${process.env.GITHUB_CLIENT_ID ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`\n📝 OAuth Callback URLs (must match provider settings):`);
  console.log(`   Google:  ${backendURL}/api/auth/oauth/google/callback`);
  console.log(`   GitHub:  ${backendURL}/api/auth/oauth/github/callback`);
  console.log(`✅ All systems operational`);
});

module.exports = app;