const express = require('express');
const { protect } = require('../middleware/auth');

const { getUsers, getUser, createUser, getUserById, updateUser, deleteUser,
        getTrainee, createTrainee, updateTrainee, getAllTrainees, deleteTrainee,
        loginUser, searchUserByQuery, getMyTrainer,
        forgatPassword, resetPassword } = require('../controllers/users');

const router = express.Router();

router
      .route('/all')
      .get(getUsers);

// CRUD Trainer
router
      .route('/')
      .get(protect, getUser)
      .post(createUser)
      .put(protect, updateUser)
      .delete(protect, deleteUser);

router
      .route('/:id')
      .get(getUserById);

//CRUD Trainee
router
      .route('/trainee')
      .get(protect, getAllTrainees)
      .post(protect, createTrainee);

router
      .route('/trainee/mytrainer')
      .get(protect, getMyTrainer);
router
      .route('/trainee/:id')
      .get(protect, getTrainee)
      .put(protect, updateTrainee)
      .delete(protect, deleteTrainee);

router.route('/search').get(searchUserByQuery);
router.route('/login').post(loginUser);
router.route('/forgatpass').post(forgatPassword);
router.route('/resetpassword/:resettoken').put(resetPassword);

module.exports = router;

