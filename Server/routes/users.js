const express = require('express');
const { protect } = require('../middleware/auth');

const {
  getUsers,
  getUser,
  createUser,
  getUserById,
  updateUser,
  deleteUser,

  getFriend,
  createFriend,
  updateFriend,
  getAllFriends,
  deleteFriend,
  loginUser,
  searchUserByQuery,
  getMyTrainer,
  forgatPassword,
  resetPassword
} = require('../controllers/users');

const router = express.Router();

router.route('/').get(getUsers);

// CRUD Trainer
router
  .route('/user')
  .post(createUser)
  .put(protect, updateUser)
  .delete(protect, deleteUser);
router.route('/user/:id').get(getUserById);

//CRUD Trainee
router
  .route('/elderly')
  .get(protect, getAllFriends)
  .post(protect, createFriend);
router
  .route('/elderly/mytrainer')
  .get(protect, getMyTrainer);
router
  .route('/elderly/:id')
  .get(protect,getFriend)
  .put(protect, updateFriend)
  .delete(protect, deleteFriend);

router.route('/search').get(searchUserByQuery);
router.route('/loged').get(protect, getUser);
router.route('/login').post(loginUser);
router.route('/forgatpass').post(forgatPassword);
router.route('/resetpassword/:resettoken').put(resetPassword);

module.exports = router;
