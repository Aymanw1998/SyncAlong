const express = require('express');
const { authToken } = require('../middleware/auth');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  loginUser
} = require('../controllers/users');
const router = express.Router();

router.route('/').get(getUsers).post(createUser);
router.route('/', authToken).get(getUser).put(updateUser).delete(deleteUser);
router.route('/login').post(loginUser);
router.route('/:id').get(getUserById);

//router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
