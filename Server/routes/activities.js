const express = require('express');
const { protect } = require('../middleware/auth');
const multer = require('multer');

const {
  getActivities,
  getActivity,
  updateActivity,
  createActivity,
  deleteActivity,
} = require('../controllers/activities');
const router = express.Router();

const storage = multer.memoryStorage({
  acl: 'public-read-write',
  destination: (req, file, callback) => {
    callback(null, '');
  }
});
const upload = multer({ storage }).single('file_data');

router.route('/')
  .get(getActivities)
  .post(upload,createActivity);
  
router
  .route('/:name')
  .get(getActivity)
  .put(updateActivity)
  .delete(deleteActivity);

module.exports = router;
