const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  getMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting
} = require('../controllers/meetings');

router
    .route('/')
    .get(protect, getMeetings)
    .post(protect, createMeeting);
router
  .route('/:name')
  .get(protect, getMeeting)
  .put(protect, updateMeeting)
  .delete(protect, deleteMeeting);

module.exports = router;
