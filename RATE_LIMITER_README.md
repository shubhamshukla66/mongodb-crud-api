# Rate Limiter Middleware - Documentation

## Overview
A production-ready rate limiter middleware for Express.js APIs that limits requests to **100 requests per IP per 15 minutes**.

## Installation

The `express-rate-limit` package has been installed:
```bash
npm install express-rate-limit
```

## Implementation

### 1. Middleware File: `middleware/rateLimiter.js`

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,        // 15 minutes
  max: 100,                          // 100 requests per windowMs
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
  },
  skip: (req) => {
    return req.path === '/health';   // Skip health checks
  }
});

module.exports = limiter;
```

### 2. Server Setup: `server.js`

```javascript
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/error');
const limiter = require('./middleware/rateLimiter');

dotenv.config();
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());

// Apply rate limiter globally (MUST be before routes)
app.use(limiter);

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the User Management API');
});

app.use('/api/users', require('./routes/userRoutes'));

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Features

✅ **Global Rate Limiting** - Applies to all routes  
✅ **IP-Based Tracking** - Limits per individual IP address  
✅ **429 Status Code** - Standard HTTP status for rate limiting  
✅ **Standard Headers** - RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset  
✅ **Custom Response** - JSON response with retry information  
✅ **Configurable Limits** - Easy to adjust per use case  
✅ **Production Ready** - Suitable for scalable applications  

## Response Headers

When a request is made, the response includes:

```
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 1710164400
```

## Response When Limit Exceeded (Status 429)

```json
{
  "success": false,
  "message": "Too many requests",
  "retryAfter": 1710164400
}
```

## Configuration Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `windowMs` | 900000 | Time window in milliseconds (15 minutes) |
| `max` | 100 | Maximum requests per IP in time window |
| `statusCode` | 429 | HTTP status code when limit exceeded |
| `message` | "Too many requests" | Error message |
| `standardHeaders` | true | Include standard RateLimit-* headers |
| `legacyHeaders` | false | Disable X-RateLimit-* headers |

## Multiple Rate Limiters

For different endpoints, create different limiters:

```javascript
// Strict limiter for auth endpoints (5 requests per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
});

// Light limiter for public endpoints (500 requests per 15 min)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500
});

// Apply to specific routes
router.post('/login', authLimiter, loginHandler);
router.get('/public', publicLimiter, publicHandler);
```

## Production Considerations

### 1. Using Redis (Recommended for Clusters)

For multi-server deployments, use Redis as the store:

```bash
npm install rate-limit-redis redis
```

```javascript
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
});

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

### 2. Exclude Certain IPs

```javascript
const limiter = rateLimit({
  skip: (req) => {
    // Skip rate limiting for health checks
    if (req.path === '/health') return true;
    // Skip for admin IPs
    if (req.ip === '192.168.1.1') return true;
    return false;
  },
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

### 3. Custom Key Generator

By default, uses client IP. Customize if needed:

```javascript
const limiter = rateLimit({
  keyGenerator: (req, res) => {
    // Use user ID if logged in, otherwise use IP
    return req.user ? req.user.id : req.ip;
  },
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

## Testing the Rate Limiter

### Using cURL

```bash
# Make 101 requests
for i in {1..101}; do
  curl http://localhost:5000/api/users
done

# The 101st request will return 429
```

### Using Node.js Script

See `middleware/RATE_LIMITER_TESTING.js` for complete testing examples.

```javascript
const axios = require('axios');

for (let i = 0; i < 105; i++) {
  try {
    const response = await axios.get('http://localhost:5000/api/users');
    console.log(`Request ${i + 1}: ${response.status}`);
  } catch (error) {
    if (error.response?.status === 429) {
      console.log(`Request ${i + 1}: Rate Limited (429)`);
    }
  }
}
```

## Order Matters in Middleware

Rate limiter must be applied **BEFORE** route handlers:

```javascript
// ✅ CORRECT
app.use(express.json());
app.use(limiter);  // Apply rate limiter before routes
app.use('/api/users', userRoutes);

// ❌ WRONG
app.use('/api/users', userRoutes);
app.use(limiter);  // Too late - routes already defined
```

## Customization Examples

### Strict Authentication Limiter (3 attempts per hour)
```javascript
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 3,
  message: 'Too many login attempts, please try again in an hour'
});
```

### API Key Rate Limiting
```javascript
const keyLimiter = rateLimit({
  keyGenerator: (req, res) => {
    return req.headers['x-api-key'] || req.ip;
  },
  windowMs: 60 * 1000,  // 1 minute
  max: 30
});
```

### Time-Based Limiting
```javascript
const timeLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' 
    ? 15 * 60 * 1000   // 15 min in production
    : 60 * 60 * 1000,  // 1 hour in development
  max: process.env.NODE_ENV === 'production' ? 100 : 1000
});
```

## Troubleshooting

**Issue**: Rate limiter not working
- Ensure it's applied BEFORE route definitions
- Check that express.json() is before rate limiter

**Issue**: All requests blocked
- Increase `max` value
- Check if skip condition is correct

**Issue**: Different limits needed per user
- Use `keyGenerator` to generate custom keys
- Use different limiters for different routes

## Files Created

- `middleware/rateLimiter.js` - Main rate limiter configuration
- `middleware/rateLimiterExamples.js` - Examples of different limiters
- `middleware/RATE_LIMITER_TESTING.js` - Testing guide and scripts

## Summary

✅ **Installed**: express-rate-limit v7.1.5  
✅ **Configured**: 100 requests per 15 minutes per IP  
✅ **Applied Globally**: All routes protected  
✅ **Status Code**: 429 (Too Many Requests)  
✅ **Response Format**: JSON with retry information  
✅ **Production Ready**: Scalable and configurable  
