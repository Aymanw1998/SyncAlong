const express = require('express');
const { protect } = require('../middleware/auth');

const {
  getActivitys,
  getActivity,
  updateActivity,
  createActivity,
  deleteActivity,
  addBasicBodyPartsActivity,
  removeBasicBodyPartsActivity
} = require('../controllers/activitys');
const router = express.Router();

router.route('/').get(getActivitys).post(createActivity);

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
