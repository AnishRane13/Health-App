const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/env');
const { notFound, errorHandler } = require('./middleware/error');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Render terminates TLS at its proxy; trust it so rate-limit sees real IPs.
app.set('trust proxy', 1);

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS: allow configured frontend origins + local dev. Requests with no origin
// (curl, Postman, server-to-server) are permitted.
const allowedOrigins = new Set([
  ...config.clientOrigins,
  'http://localhost:5173',
  'http://localhost:3000',
]);
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.has(origin)) return cb(null, true);
      // Reject quietly — throwing here causes a 500 on OPTIONS preflight.
      console.warn(`[cors] blocked origin: ${origin}`);
      return cb(null, false);
    },
    credentials: true,
  })
);

if (!config.isProd) app.use(morgan('dev'));

// Health check — used by Render and to warm the free-tier dyno before demos.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), env: config.nodeEnv });
});

// Throttle auth endpoints against brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many attempts, try again later' } },
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
