const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/user_controller');
const router = express.Router();

router.route('/').get(getUsers).post(createUser);

router.route('/:username').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
