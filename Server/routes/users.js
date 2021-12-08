const express = require('express');
const { protect } = require('../middleware/auth');

const {
  getUsers,
  getUser,
  createUser,
  createFriend,
  updateUser,
  updateFriend,
  deleteUser,
  deleteFriend,
  getUserById,
  loginUser,
  searchUserByQuery,
  forgatPassword, resetPassword
} = require('../controllers/users');
const router = express.Router();

router.route('/').get(getUsers).post(createUser);
router.route('/search').get(searchUserByQuery);
router.route('/').put(protect, updateUser).delete(protect, deleteUser);
router.route('/loged').get(protect, getUser);
router.route('/login').post(loginUser);
router.route('/user/:id').get(getUserById);
router.route('/forgatpass').post(forgatPassword);
router.route('/resetpassword/:resettoken').put(resetPassword);

//trainer func options
router.route('/trainer').post(protect, createFriend);
router.route('/trainer/:id').put(protect, updateFriend).delete(protect, deleteFriend);

module.exports = router;
