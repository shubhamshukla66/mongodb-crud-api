# MongoDB CRUD API

A production-ready RESTful CRUD API built with Node.js, Express.js, and MongoDB.

## Features

- **MVC Architecture**: Organized code structure with controllers, models, routes, and config.
- **CRUD Operations**: Complete Create, Read, Update, Delete operations for User resource.
- **Pagination**: Efficient pagination for GET all users endpoint.
- **Search & Sorting**: Search users by name and sort by any field.
- **Validation**: Input validation using Mongoose schemas.
- **Error Handling**: Comprehensive error handling middleware.
- **Environment Variables**: Secure configuration using dotenv.

## Project Structure

```
mongodb-crud-api/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── userController.js    # User CRUD operations
├── middleware/
│   └── error.js             # Error handling middleware
├── models/
│   └── User.js              # User model/schema
├── routes/
│   └── userRoutes.js        # User API routes
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
├── server.js                # Main server file
└── README.md                # This file
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env` file:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/mongodb-crud-api
   NODE_ENV=development
   ```
4. Start MongoDB service
5. Run the server:
   ```bash
   npm run dev  # For development with nodemon
   npm start    # For production
   ```

## API Endpoints

### Create User
- **POST** `/api/users`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "role": "admin"
  }
  ```

### Get All Users
- **GET** `/api/users`
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
  - `search` (search by name)
  - `sortBy` (default: createdAt)
  - `sortOrder` (asc/desc, default: desc)

### Get Single User
- **GET** `/api/users/:id`

### Update User
- **PUT** `/api/users/:id`
- **Body:** Same as create, all fields optional

### Delete User
- **DELETE** `/api/users/:id`

## User Schema

```javascript
{
  name: String (required),
  email: String (required, unique),
  age: Number,
  role: String (enum: user, admin, moderator),
  createdAt: Date (default: now)
}
```

## Technologies Used

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **dotenv**: Environment variable management

## Development

- Uses `async/await` for asynchronous operations
- Proper HTTP status codes
- JSON responses with success/error indicators
- Input validation and sanitization