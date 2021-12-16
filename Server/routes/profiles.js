const express = require('express');
const { protect } = require('../middleware/auth');

const {
  getProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  createProfileFriend,
  updateProfileFriend,
  deleteProfileFriend,

  addBodyPartsProfile,
  addBodyPartsProfileFriend,

  removeBodyPartsProfile,
  removeBodyPartsProfileFriend
} = require('../controllers/profiles');
const router = express.Router();


router
      .route('/')
      .get(protect, getProfile)
      .post(protect, createProfile)
      .put(protect, updateProfile).
      delete(protect, deleteProfile);

router
      .route('/trainer/:id')
      .post(protect, createProfileFriend)
      .put(protect, updateProfileFriend)
      .delete(protect, deleteProfileFriend);

router
      .route('/body')
      .post(protect, addBodyPartsProfile)
      .delete(protect, removeBodyPartsProfile);

router
      .route('/body/trainer/:id')
      .post(protect, addBodyPartsProfileFriend)
      .delete(protect, removeBodyPartsProfileFriend);

module.exports = router;
