const express = require('express');
const { protect } = require('../middleware/auth');

const {
  getProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  
  getTrainers,
  createProfileFriend,
  updateProfileFriend,
  deleteProfileFriend,

  addBodyPartsProfile,
  addBodyPartsProfileFriend,

  removeBodyPartsProfile,
  removeBodyPartsProfileFriend,

  scheduledMeetings,
  scheduledMeeting
} = require('../controllers/profiles');
const router = express.Router();


router
      .route('/')
      .get(protect, getProfile)
      .post(protect, createProfile)
      .put(protect, updateProfile).
      delete(protect, deleteProfile);

router.route('/trainer').get(protect, getTrainers); //הצגה של 
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

router.route('/scheduled').get(protect, scheduledMeetings);
router.route('/scheduled/:id').get(protect, scheduledMeeting);
module.exports = router;
