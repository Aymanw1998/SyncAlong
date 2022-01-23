const express = require('express');
const { protect } = require('../middleware/auth');

const {
  getProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfileFriend,
  createProfileFriend,
  updateProfileFriend,
  deleteProfileFriend,
  scheduledMeetings,
  scheduledMeeting
} = require('../controllers/profiles');
const router = express.Router();


router
      .route('/user')
      .get(protect, getProfile)
      .post(protect, createProfile)
      .put(protect, updateProfile).
      delete(protect, deleteProfile);
router
      .route('/elderly/:id')
      .get(protect,getProfileFriend)
      .post(protect, createProfileFriend)
      .put(protect, updateProfileFriend)
      .delete(protect, deleteProfileFriend);

router.route('/scheduled').get(protect, scheduledMeetings);
router.route('/scheduled/:id').get(protect, scheduledMeeting);
module.exports = router;
