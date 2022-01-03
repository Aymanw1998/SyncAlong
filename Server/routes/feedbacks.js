const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  getFeedbacks,
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback
} = require('../controllers/feedbacks');

router
    .route('/')
    .get(protect, getFeedbacks)
    .post(protect, createFeedback);
router
  .route('/:name')
  .get(protect, getFeedback)
  .put(protect, updateFeedback)
  .delete(protect, deleteFeedback);

module.exports = router;
