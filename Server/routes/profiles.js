const express = require('express');
const { protect } = require('../middleware/auth');

const {
      getProfiles,
      getProfile,
      createProfile,
      updateProfile,
      deleteProfile,
      getTraineeProfile,
      createTraineeProfile,
      deleteTraineeProfile,
      updateTraineeProfile,
      scheduledMeetings,
      scheduledMeeting
} = require('../controllers/profiles');
const router = express.Router();

router
      .route('/')
      .get(getProfiles)
      .post(protect, createProfile)
      .put(protect, updateProfile)
      .get(protect, getProfile)
      .put(protect, updateProfile).
      delete(protect, deleteProfile);

router
      .route('/trainee/:id')
      .get(protect, getTraineeProfile)
      .post(protect, createTraineeProfile)
      .put(protect, updateTraineeProfile)
      .delete(protect, deleteTraineeProfile);

// router.route('/scheduled').get(protect, scheduledMeetings);
// router.route('/scheduled/:id').get(protect, scheduledMeeting);
module.exports = router;

