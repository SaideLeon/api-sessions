// src/config/env.js
import { config } from 'dotenv';

config();

export default {
  // App
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_VERSION: process.env.API_VERSION || 'v1',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // Cors
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100,
  
  // Security
  BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS || 10,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  
  // Cache
  CACHE_TTL: process.env.CACHE_TTL || 60 * 60, // 1 hour
};