/**
 * RATE LIMITER MIDDLEWARE EXAMPLES
 * This file demonstrates different ways to use the rate limiter middleware
 */

const rateLimit = require('express-rate-limit');

// ==========================================
// 1. GLOBAL RATE LIMITER (already applied in server.js)
// ==========================================
// Limits: 100 requests per IP per 15 minutes
// Applied to: ALL routes

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests',
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// ==========================================
// 2. STRICT RATE LIMITER (for sensitive operations)
// ==========================================
// Limits: 5 requests per IP per 15 minutes
// Use for: Login, password reset, authentication endpoints

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many failed login attempts. Please try again later.',
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user && req.user.isAdmin, // Skip for admin users
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many failed login attempts. Please try again later.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// ==========================================
// 3. LIGHT RATE LIMITER (for non-critical operations)
// ==========================================
// Limits: 500 requests per IP per 15 minutes
// Use for: Public APIs, search endpoints

const lightLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests',
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false
});

// ==========================================
// 4. ALTERNATIVE STORAGE OPTIONS
// ==========================================
// By default, express-rate-limit uses in-memory store
// For production with multiple servers, use Redis:

// Example with Redis store (requires: npm install rate-limit-redis redis)
/*
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
});

const redisLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:' // Redis key prefix
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests',
  statusCode: 429
});
*/

// ==========================================
// USAGE IN ROUTES
// ==========================================
/*
const express = require('express');
const router = express.Router();

// Apply strict limiter to login route
router.post('/login', strictLimiter, (req, res) => {
  // Login logic here
});

// Apply light limiter to public search
router.get('/search', lightLimiter, (req, res) => {
  // Search logic here
});

module.exports = router;
*/

module.exports = {
  globalLimiter,
  strictLimiter,
  lightLimiter
};
