/**
 * COMPLETE EXAMPLE: Rate Limiter Usage in Routes
 * 
 * This file shows how to use different rate limiters
 * in your Express routes
 */

const express = require('express');
const rateLimit = require('express-rate-limit');

// ==========================================
// GLOBAL LIMITER (already applied in server.js)
// ==========================================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per IP
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
// STRICT LIMITER (Authentication)
// ==========================================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 login attempts
  message: 'Too many login attempts. Please try again later.',
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user && req.user.role === 'admin', // Skip for admins
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// ==========================================
// MODERATE LIMITER (API Operations)
// ==========================================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 50,                    // 50 API calls
  message: 'API rate limit exceeded',
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false
});

// ==========================================
// LIGHT LIMITER (Public endpoints)
// ==========================================
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 30,                    // 30 requests per minute
  message: 'Too many requests to public endpoint',
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false
});

// ==========================================
// EXAMPLE ROUTES
// ==========================================

const router = express.Router();

/**
 * PROTECTED ENDPOINT - Login (Strict Limiter)
 * 
 * POST /api/users/login
 * Request: { email, password }
 * Response: { success, token, user }
 */
router.post('/login', authLimiter, (req, res) => {
  // Login logic here
  res.json({
    success: true,
    message: 'Login successful',
    token: 'example_jwt_token'
  });
});

/**
 * PROTECTED ENDPOINT - Register (Strict Limiter)
 * 
 * POST /api/users/register
 * Request: { name, email, password }
 * Response: { success, user }
 */
router.post('/register', authLimiter, (req, res) => {
  // Registration logic here
  res.json({
    success: true,
    message: 'Registration successful'
  });
});

/**
 * API ENDPOINT - Get all users (API Limiter)
 * 
 * GET /api/users
 * Response: { success, data: users }
 */
router.get('/', apiLimiter, (req, res) => {
  // Get users logic here
  res.json({
    success: true,
    data: [],
    message: 'Users retrieved successfully'
  });
});

/**
 * API ENDPOINT - Get user by ID (API Limiter)
 * 
 * GET /api/users/:id
 * Response: { success, data: user }
 */
router.get('/:id', apiLimiter, (req, res) => {
  // Get user by ID logic here
  res.json({
    success: true,
    data: { id: req.params.id },
    message: 'User retrieved successfully'
  });
});

/**
 * API ENDPOINT - Create user (API Limiter)
 * 
 * POST /api/users
 * Request: { name, email, phone }
 * Response: { success, data: user }
 */
router.post('/', apiLimiter, (req, res) => {
  // Create user logic here
  res.status(201).json({
    success: true,
    data: { id: 1, ...req.body },
    message: 'User created successfully'
  });
});

/**
 * API ENDPOINT - Update user (API Limiter)
 * 
 * PUT /api/users/:id
 * Request: { name, email, phone }
 * Response: { success, data: user }
 */
router.put('/:id', apiLimiter, (req, res) => {
  // Update user logic here
  res.json({
    success: true,
    data: { id: req.params.id, ...req.body },
    message: 'User updated successfully'
  });
});

/**
 * API ENDPOINT - Delete user (API Limiter)
 * 
 * DELETE /api/users/:id
 * Response: { success, message }
 */
router.delete('/:id', apiLimiter, (req, res) => {
  // Delete user logic here
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * PUBLIC ENDPOINT - Search users (Public Limiter)
 * 
 * GET /api/users/search?q=
 * Response: { success, data: users }
 */
router.get('/search/results', publicLimiter, (req, res) => {
  // Search logic here
  res.json({
    success: true,
    data: [],
    message: 'Search results'
  });
});

/**
 * PUBLIC ENDPOINT - Health check (No Limiter)
 * 
 * GET /health
 * Response: { status: 'ok' }
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

module.exports = router;

// ==========================================
// HOW TO APPLY IN SERVER.JS
// ==========================================

/*
const express = require('express');
const limiter = require('./middleware/rateLimiter');

const app = express();

// Middleware
app.use(express.json());

// Global rate limiter (applied to all routes)
app.use(limiter);

// Routes
app.use('/api/users', require('./routes/userRoutes'));

// Listen
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
*/

// ==========================================
// TESTING ENDPOINTS
// ==========================================

/*
CURL COMMANDS:

1. Test Global Limiter (100 req / 15 min):
   for i in {1..105}; do curl http://localhost:5000/api/users; done

2. Test Auth Limiter (5 req / 15 min):
   for i in {1..10}; do curl -X POST http://localhost:5000/api/users/login; done

3. Test with Headers:
   curl -i http://localhost:5000/api/users
   (Look for RateLimit-* headers)

4. Check Rate Limit Status:
   curl -i http://localhost:5000/api/users | grep RateLimit

5. Test with API Key (if implemented):
   curl -H "X-API-Key: your-key" http://localhost:5000/api/users
*/

// ==========================================
// KEY POINTS
// ==========================================

/*
✅ Global Limiter:
   - Applied to ALL routes via app.use(limiter)
   - 100 requests per IP per 15 minutes
   - Returns 429 when exceeded

✅ Route-Specific Limiters:
   - Apply specific limiters to sensitive endpoints
   - E.g., auth limiter for login (5 attempts)
   - E.g., API limiter for CRUD operations

✅ Response Format:
   {
     "success": false,
     "message": "Too many requests",
     "retryAfter": 1710164400
   }

✅ Headers Included:
   - RateLimit-Limit: 100
   - RateLimit-Remaining: 99
   - RateLimit-Reset: 1710164400

✅ Best Practices:
   - Apply global limiter before routes
   - Use stricter limits for auth endpoints
   - Use lighter limits for public endpoints
   - Skip health check endpoints
   - Log rate limit hits for monitoring
   - Consider using Redis for multi-server setup
*/
