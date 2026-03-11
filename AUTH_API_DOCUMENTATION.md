# Authentication API Documentation

## Overview

Complete authentication system with password hashing and JWT tokens has been implemented.

---

## 📦 Packages Installed

- **bcryptjs**: For secure password hashing
- **jsonwebtoken**: For JWT token generation and verification

---

## 🔑 User Registration & Login APIs

### 1. User Registration (Create User)

**Endpoint:** `POST /api/users/register` (or `POST /api/users`)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "age": 25,
  "role": "user"
}
```

**Required Fields:**
- `name` (string) - User's full name
- `email` (string) - Unique email address
- `password` (string) - Minimum 6 characters

**Optional Fields:**
- `age` (number) - User's age
- `role` (string) - 'user', 'admin', or 'moderator' (default: 'user')

**Success Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "role": "user"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

### 2. User Login

**Endpoint:** `POST /api/users/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Required Fields:**
- `email` (string) - User's email
- `password` (string) - User's password

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "role": "user"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## 🔐 JWT Token

### Token Structure

The JWT token is generated using:
- **Secret Key**: `JWT_SECRET` environment variable (or default: 'your-secret-key')
- **Expiration**: `JWT_EXPIRE` environment variable (or default: '7d')

### Using the Token

Include the token in the Authorization header for protected routes:

```bash
Authorization: Bearer <your-jwt-token>
```

### Token Payload

```json
{
  "id": "507f1f77bcf86cd799439011",
  "iat": 1710164400,
  "exp": 1710769200
}
```

---

## 🛡️ Protected Routes Middleware

### Authentication Middleware

Location: `middleware/auth.js`

```javascript
const { protect } = require('../middleware/auth');

// Use in routes:
router.get('/protected-route', protect, controllerFunction);
```

### How to Use

```javascript
// In your routes file
const { protect } = require('../middleware/auth');

// Protect specific routes
router.get('/profile', protect, getUserProfile);
router.put('/update', protect, updateUserProfile);
```

### Example: Protect Update User Route

```javascript
const { protect } = require('../middleware/auth');

// Protect the PUT route
router.put('/:id', protect, updateUser);
```

**Request with Token:**
```bash
curl -X PUT http://localhost:5000/api/users/123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe"}'
```

---

## 📝 User Model Changes

### Updated User Schema

```javascript
{
  name: String,           // Required
  email: String,          // Required, unique
  password: String,       // Required, hashed, select: false
  age: Number,            // Optional
  role: String,           // 'user', 'admin', 'moderator'
  createdAt: Date         // Auto-generated
}
```

### Password Handling

- **Hashing**: Passwords are automatically hashed using bcryptjs before saving
- **Security**: Password field uses `select: false` - not returned in queries
- **Comparison**: Use `user.matchPassword(enteredPassword)` method

---

## 🧪 Testing APIs

### Using cURL

**1. Register a new user:**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "age": 25,
    "role": "user"
  }'
```

**2. Login:**
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**3. Use token to access protected route:**
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <your-token>"
```

---

### Using Postman

**1. Register:**
- Method: POST
- URL: `http://localhost:5000/api/users/register`
- Body (JSON):
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "age": 25,
    "role": "user"
  }
  ```

**2. Login:**
- Method: POST
- URL: `http://localhost:5000/api/users/login`
- Body (JSON):
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

**3. Use Token:**
- Copy the token from login response
- In Headers tab, add:
  - Key: `Authorization`
  - Value: `Bearer <paste-token-here>`

---

## 🔄 API Flow

### Registration Flow
```
1. User sends registration request with name, email, password
2. System checks if email already exists
3. Password is hashed using bcryptjs
4. User is created in database
5. JWT token is generated
6. Token and user data are returned
```

### Login Flow
```
1. User sends email and password
2. System finds user by email
3. Password is compared using bcrypt
4. If match: JWT token is generated
5. Token and user data are returned
6. If no match: Error 401
```

### Protected Route Flow
```
1. Client sends request with Authorization header
2. Middleware extracts and verifies token
3. If valid: userId is attached to request
4. Route handler processes request
5. If invalid: Error 401
```

---

## 🔧 Environment Variables

Create a `.env` file in project root:

```env
# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d

# Database
MONGODB_URI=mongodb://localhost:27017/your-db

# Server
PORT=5000
NODE_ENV=development
```

---

## 📋 Implementation Details

### Files Modified/Created

**Created:**
- `middleware/auth.js` - Authentication middleware

**Modified:**
- `models/User.js` - Added password field, hashing, and comparison method
- `controllers/userController.js` - Added loginUser function and JWT generation
- `routes/userRoutes.js` - Added login endpoint

**Updated Dependencies:**
- `package.json` - Added bcryptjs and jsonwebtoken

---

## ✨ Features

✅ **Password Hashing**: Secure bcryptjs hashing with salt rounds
✅ **JWT Tokens**: Standard JWT authentication
✅ **Token Expiration**: Configurable expiration time
✅ **Protected Routes**: Middleware to protect API endpoints
✅ **Email Validation**: Unique email addresses
✅ **Password Validation**: Minimum 6 characters
✅ **Error Handling**: Proper HTTP status codes and messages
✅ **Security**: Passwords not returned in queries

---

## 🔍 Code Examples

### Example 1: Protect a Route

```javascript
// middleware/auth.js imports
const { protect } = require('../middleware/auth');

// In routes file
router.put('/:id', protect, updateUser);

// Now only authenticated users can update
```

### Example 2: Get Authenticated User ID

```javascript
// In controller after protect middleware
const userId = req.userId; // Available from middleware
const user = await User.findById(userId);
```

### Example 3: Custom Error Messages

```javascript
// Login error response
{
  "success": false,
  "message": "Invalid email or password"  // Generic for security
}
```

---

## 🚀 Quick Start

1. **Install packages** (done):
   ```bash
   npm install bcryptjs jsonwebtoken
   ```

2. **Set up environment variables**:
   ```bash
   echo "JWT_SECRET=your-secret-key" >> .env
   echo "JWT_EXPIRE=7d" >> .env
   ```

3. **Start server**:
   ```bash
   npm run dev
   ```

4. **Test registration**:
   ```bash
   curl -X POST http://localhost:5000/api/users/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","password":"test123"}'
   ```

5. **Test login**:
   ```bash
   curl -X POST http://localhost:5000/api/users/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

---

## ❌ Common Issues

**Issue**: "Token is not valid"
- **Solution**: Make sure JWT_SECRET is the same in env and code

**Issue**: "Invalid email or password"
- **Solution**: Check email and password are correct

**Issue**: "User with this email already exists"
- **Solution**: Use a different email for registration

**Issue**: "Not authorized to access this route"
- **Solution**: Add Authorization header with valid token

---

## 📚 Additional Resources

- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
- [jsonwebtoken Documentation](https://www.npmjs.com/package/jsonwebtoken)
- [JWT.io](https://jwt.io) - JWT Debugger
- [OWASP Authentication Guide](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## Summary

Complete authentication system with:
- ✅ User registration with password hashing
- ✅ User login with JWT token generation
- ✅ Protected routes middleware
- ✅ Secure password comparison
- ✅ Token-based authorization
- ✅ Production-ready security

Ready to use! Start testing with the cURL or Postman examples above.
