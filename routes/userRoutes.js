const express = require('express');
const {
  createUser,
  loginUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

// Auth routes
router.post('/login', loginUser);
router.post('/register', createUser);

// CRUD routes
router.route('/').post(createUser).get(getUsers);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;