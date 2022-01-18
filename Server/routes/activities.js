const express = require('express');
const { protect } = require('../middleware/auth');

const {
  getActivities,
  getActivity,
  updateActivity,
  createActivity,
  deleteActivity,
  addBasicBodyPartsActivity,
  removeBasicBodyPartsActivity
} = require('../controllers/activities');
const router = express.Router();

router.route('/').get(getActivities).post(createActivity);

router
  .route('/:name')
  .get(getActivity)
  .put(updateActivity)
  .delete(deleteActivity);

router
  .route('/:name/body')
  .post(addBasicBodyPartsActivity)
  .delete(removeBasicBodyPartsActivity);

  module.exports = router;
