const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  getMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getCustomActivities
} = require('../controllers/meetings');

router
  .route('/')
  .get(protect, getMeetings)
  .post(protect, createMeeting);
router
  .route('/:id')
  .get(protect, getMeeting)
  .put(protect, updateMeeting)
  .delete(protect, deleteMeeting);
router
  .route('/ouractivities/:id') //traniee id
  .get(protect, getCustomActivities)


module.exports = router;
