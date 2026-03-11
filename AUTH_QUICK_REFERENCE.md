# 🔐 Authentication Quick Reference

## API Endpoints

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| **POST** | `/api/users/register` | `{name, email, password, age?, role?}` | `{token, data}` |
| **POST** | `/api/users/login` | `{email, password}` | `{token, data}` |
| **GET** | `/api/users` | - | `{data, pagination}` |
| **GET** | `/api/users/:id` | - | `{data}` |
| **PUT** | `/api/users/:id` | `{name, email, age, role}` | `{data}` |
| **DELETE** | `/api/users/:id` | - | `{message}` |

---

## Quick Tests

### 1️⃣ Register
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"test123"}'
```

### 2️⃣ Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"test123"}'
```

### 3️⃣ Use Token
```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Response Format

### Success
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "role": "user"
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## Protect Routes

```javascript
const { protect } = require('./middleware/auth');

// Protect a route
router.get('/profile', protect, getProfile);
router.put('/update/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);
```

---

## Environment Variables

```env
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRE=7d
```

---

## Files Modified/Created

| File | Status | Changes |
|------|--------|---------|
| `models/User.js` | ✏️ Modified | Added password field |
| `controllers/userController.js` | ✏️ Modified | Added login function |
| `routes/userRoutes.js` | ✏️ Modified | Added login route |
| `middleware/auth.js` | ✨ Created | Auth middleware |
| `AUTH_API_DOCUMENTATION.md` | ✨ Created | Full documentation |
| `AUTH_TESTING_GUIDE.sh` | ✨ Created | Testing examples |

---

## Key Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token generation (7 days expiry)
- ✅ Token verification middleware
- ✅ Secure password storage
- ✅ Protected routes support
- ✅ Email validation & uniqueness

---

## Start Using

1. **Start server**: `npm run dev`
2. **Register**: POST to `/api/users/register`
3. **Login**: POST to `/api/users/login`
4. **Get token**: Copy from response
5. **Use token**: Add `Authorization: Bearer <token>` header

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid email or password" | Check email and password are correct |
| "User with this email already exists" | Use different email |
| "Please provide email and password" | Include both fields in request body |
| "Not authorized to access this route" | Add Authorization header with valid token |
| "Token is not valid" | Check token is not expired |

---

## Docs

- **Full Documentation**: [AUTH_API_DOCUMENTATION.md](AUTH_API_DOCUMENTATION.md)
- **Testing Guide**: [AUTH_TESTING_GUIDE.sh](AUTH_TESTING_GUIDE.sh)
- **Implementation Summary**: [AUTH_IMPLEMENTATION_SUMMARY.js](AUTH_IMPLEMENTATION_SUMMARY.js)

---

**Status**: ✅ Ready to use | **Version**: 1.0 | **Date**: March 11, 2026
