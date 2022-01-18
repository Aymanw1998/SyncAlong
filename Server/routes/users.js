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
  getAllFriends,
  deleteFriend,
  getUserById,
  loginUser,
  searchUserByQuery,
  getMyTrainer,
  forgatPassword, resetPassword
} = require('../controllers/users');
const router = express.Router();

router
  .route('/')
  .get(getUsers)
  .post(createUser);
router
  .route('/search')
  .get(searchUserByQuery);
router
  .route('/')
  .put(protect, updateUser)
  .delete(protect, deleteUser);
router
  .route('/loged')
  .get(protect, getUser);
router.route('/login').post(loginUser);
router.route('/user/:id').get(getUserById);
router.route('/forgatpass').post(forgatPassword);
router.route('/resetpassword/:resettoken').put(resetPassword);

//trainer
router.route('/trainer/alltrainee').get(protect, getAllFriends);
router.route('/trainer/trainee').post(protect, createFriend);
router.route('/trainer/trainee/:id').put(protect, updateFriend).delete(protect, deleteFriend);

//trainee / Elderly
router
  .route('/trainee/mytrainer')
  .get(protect, getMyTrainer);

module.exports = router;
