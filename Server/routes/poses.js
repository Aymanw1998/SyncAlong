const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  getPoses,
  getPose,
  createPose,
  updatePose,
  deletePose,
} = require('../controllers/poses');

router
    .route('/')
    .get(protect, getPoses)
    .post(protect, createPose);
router
  .route('/:id')
  .get(protect, getPose)
  .put(protect, updatePose)
  .delete(protect, deletePose);

module.exports = router;
