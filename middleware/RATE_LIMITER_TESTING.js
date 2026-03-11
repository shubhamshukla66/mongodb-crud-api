/**
 * RATE LIMITER TESTING GUIDE
 * 
 * This guide shows how to test the rate limiter middleware
 */

// ==========================================
// USING CURL TO TEST RATE LIMITER
// ==========================================

/*
1. Normal requests (within limit):
   curl http://localhost:5000/api/users

2. Check rate limit headers:
   curl -i http://localhost:5000/api/users
   
   Response headers will include:
   RateLimit-Limit: 100
   RateLimit-Remaining: 99
   RateLimit-Reset: 1710164400

3. Exceed rate limit with a loop:
   for i in {1..101}; do
     curl http://localhost:5000/api/users
   done
   
4. Exceed limit with parallel requests:
   for i in {1..150}; do
     curl http://localhost:5000/api/users &
   done
   wait

5. Rate limit will return 429:
   {
     "success": false,
     "message": "Too many requests",
     "retryAfter": 1710164400
   }
*/

// ==========================================
// USING POSTMAN TO TEST RATE LIMITER
// ==========================================

/*
1. Create a request for: GET http://localhost:5000/api/users
2. Go to Tests tab and add a loop:
   
   for (let i = 0; i < 105; i++) {
     pm.sendRequest("http://localhost:5000/api/users", function (err, response) {
       console.log(`Request ${i + 1}: ${response.code}`);
     });
   }

3. Run the request collection
4. Check the console for status codes
5. After 100 requests, you should see 429 status codes
*/

// ==========================================
// USING AXIOS (Node.js) TO TEST RATE LIMITER
// ==========================================

/*
const axios = require('axios');

async function testRateLimiter() {
  const url = 'http://localhost:5000/api/users';
  let successCount = 0;
  let limitExceededCount = 0;

  try {
    for (let i = 0; i < 105; i++) {
      try {
        const response = await axios.get(url);
        successCount++;
        console.log(`Request ${i + 1}: ${response.status} - Remaining: ${response.headers['ratelimit-remaining']}`);
      } catch (error) {
        if (error.response?.status === 429) {
          limitExceededCount++;
          console.log(`Request ${i + 1}: 429 - Rate Limited`);
        } else {
          console.log(`Request ${i + 1}: Error - ${error.message}`);
        }
      }
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    console.log(`\nResults:`);
    console.log(`Successful: ${successCount}`);
    console.log(`Rate Limited: ${limitExceededCount}`);
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testRateLimiter();
*/

// ==========================================
// TESTING SCRIPT (save as test-rate-limiter.js)
// ==========================================

/*
const axios = require('axios');

async function testRateLimiter() {
  const baseURL = 'http://localhost:5000';
  const endpoint = '/api/users';
  const requestsToMake = 105;
  
  console.log(`Testing Rate Limiter: ${requestsToMake} requests to ${baseURL}${endpoint}`);
  console.log('Limit: 100 requests per 15 minutes\n');

  let successCount = 0;
  let limitExceededCount = 0;
  const results = [];

  for (let i = 1; i <= requestsToMake; i++) {
    try {
      const response = await axios.get(`${baseURL}${endpoint}`);
      successCount++;
      
      const remaining = response.headers['ratelimit-remaining'];
      const limit = response.headers['ratelimit-limit'];
      
      results.push({
        requestNum: i,
        status: response.status,
        remaining,
        limit
      });

      console.log(`[${i}] ✓ Status: ${response.status} | Remaining: ${remaining}/${limit}`);
    } catch (error) {
      if (error.response?.status === 429) {
        limitExceededCount++;
        results.push({
          requestNum: i,
          status: 429,
          message: error.response.data.message
        });
        console.log(`[${i}] ✗ Status: 429 | ${error.response.data.message}`);
      } else {
        console.log(`[${i}] ✗ Error: ${error.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Requests: ${requestsToMake}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Rate Limited (429): ${limitExceededCount}`);
  console.log(`Expected limit exceeded at request #101`);
  console.log('='.repeat(60));
}

testRateLimiter().catch(console.error);
*/

// ==========================================
// RATE LIMITER CONFIGURATION
// ==========================================

/*
Current Configuration:
- Window: 15 minutes (900,000 ms)
- Limit: 100 requests per IP
- Status Code: 429 (Too Many Requests)
- Standard Headers: Enabled (RateLimit-*)
- Legacy Headers: Disabled (X-RateLimit-*)

Response when limit exceeded:
{
  "success": false,
  "message": "Too many requests",
  "retryAfter": 1710164400
}
*/

module.exports = {
  description: 'Rate Limiter Testing Guide - See comments for testing examples'
};
