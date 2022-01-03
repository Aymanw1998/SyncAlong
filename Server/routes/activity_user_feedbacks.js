const express = require('express');
const { protect } = require('../middleware/auth');

const {
  getActivityUserFeedbacks,
  getActivityUserFeedback,
  updateActivityUserFeedback,
  createActivityUserFeedback,
  deleteActivityUserFeedback
} = require('../controllers/activity_user_feedbacks');
const router = express.Router();

router.route('/').get(getActivityUserFeedbacks).post(createActivityUserFeedback);

router
  .route('/:meeting_id')
  .get(getActivityUserFeedback)
  .put(updateActivityUserFeedback)
  .delete(deleteActivityUserFeedback);

  module.exports = router;

