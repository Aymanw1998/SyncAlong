const express = require('express');
const { protect } = require('../middleware/auth');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  loginUser,
  searchUserByQuery,
} = require('../controllers/users');
const router = express.Router();

router.route('/').get(getUsers).post(createUser);
router.route('/search').get(searchUserByQuery);
router.route('/').put(protect, updateUser).delete(protect, deleteUser);
router.route('/loged').get(protect, getUser);
router.route('/login').post(loginUser);
router.route('/user/:id').get(getUserById);

module.exports = router;
