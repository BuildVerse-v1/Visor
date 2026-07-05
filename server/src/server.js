import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { fileURLToPath } from 'url';

import { config, validateConfig } from './config/config.js';
import './config/passport.js'; // Initialize Passport strategies
import authRoutes from './routes/auth.routes.js';

// Initialize server app
const app = express();

// Validate configurations
validateConfig();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Must be exact origin for credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Required for sending/receiving JWT cookies
}));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api/', apiLimiter);

// Logger & Parsers
app.use(morgan('dev'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser()); 

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/api/v1/auth', authRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    environment: config.server.env
  });
});

// 404 Route Catch-All
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint ${req.originalUrl} not found`
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack || err.message);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

// Database Connection
const connectDB = async () => {
  if (!config.database.uri) {
    console.error('[DATABASE ERROR] MONGODB_URI is undefined. Server is running without a persistent database.');
    return;
  }
  
  try {
    await mongoose.connect(config.database.uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('[SUCCESS] Connected to MongoDB Atlas Cloud');
  } catch (error) {
    console.error('[DATABASE ERROR] Failed to connect to MongoDB Atlas:', error.message);
    process.exit(1);
  }
};

// Start listener
const PORT = config.server.port;
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[SUCCESS] Visor backend server active on port ${PORT} in ${config.server.env} mode`);
  });
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}

export { app, startServer };