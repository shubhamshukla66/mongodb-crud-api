const rateLimit = require('express-rate-limit');

// Rate limiter middleware configuration
const limiter = rateLimit({
  // Window size: 15 minutes in milliseconds
  windowMs: 15 * 60 * 1000,
  
  // Max requests per IP per windowMs
  max: 100,
  
  // Response message when rate limit is exceeded
  message: 'Too many requests',
  
  // Status code to return when rate limit is exceeded
  statusCode: 429,
  
  // Standard headers for rate limit info (RateLimit-*)
  standardHeaders: true,
  
  // Disable the X-RateLimit-* headers
  legacyHeaders: false,
  
  // Custom handler for when rate limit is exceeded
  handler: (req, res) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000); // in seconds
    console.log(`Rate limit exceeded for IP: ${req.ip}. Retry after ${retryAfter} seconds.`);
    res.status(429).json({
      success: false,
      message: 'Too many requests',
      retryAfter: req.rateLimit.resetTime
    });
  },
  
  // Skip certain requests (optional)
  // For example, you can skip health check endpoints
  skip: (req) => {
    return req.path === '/health';
  }
});

module.exports = limiter;
