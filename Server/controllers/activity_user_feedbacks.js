const asyncHandler = require('../middleware/async');
const { ActivityUserFeedback } = require('../models/activity_user_feedbacks');
const ErrorResponse = require('../utils/errorResponse');
const { successResponse } = require('../utils/successResponse');

// @desc    Get all ActivityUserFeedbacks
// @route   GET /api/ActivityUserFeedbacks/
// @access  Public
const getActivityUserFeedbacks = asyncHandler(async (req, res, next) => {
  const activitys = await ActivityUserFeedback.find();
  return successResponse(req, res, { activitys });
});

// @desc    Get single ActivityUserFeedback
// @route   GET /api/activityUserFeedbacks/:meeting_id
// @access  Public
const getActivityUserFeedback = asyncHandler(async (req, res, next) => {
  const activity = await ActivityUserFeedback.findOne({ meeting_id: req.params.meeting_id });
  return successResponse(req, res, { activity });
});

// @desc    Create new ActivityUserFeedback
// @route   POST /api/activityUserFeedbacks/
// @access  Private with token
const createActivityUserFeedback = asyncHandler(async (req, res, next) => {
  const activity = await ActivityUserFeedback.create(body);
  console.log('ActivityUserFeedback:', activity);
  return successResponse(req, res, { ActivityUserFeedback: activity });
});

// @desc    Update ActivityUserFeedback
// @route   PUT /api/activityUserFeedbacks/:meeting_id
// @access  Private with token
const updateActivityUserFeedback = asyncHandler(async (req, res, next) => {
  //body: url, or BasicBodyParts, or anything
  const activity = await ActivityUserFeedback.findOne({ meeting_id: req.params.meeting_id });
  var changed = false;
  if (activity) {
      await Activity.findOneAndUpdate(
        { _id: activity._id },
        req.body
      );
      changed = true;
  }
  activity = await ActivityUserFeedback.findOne({ _id: activity._id });
  if (changed) {
    return successResponse(req, res, activity);
  } else {
    return next(new ErrorResponse(`missing data`, 400));
  }
});

// @desc    DELETE ActivityUserFeedback
// @route   DELETE /api/activityUserFeedbacks/:meeting_id
// @access  Private with token
const deleteActivityUserFeedback = asyncHandler(async (req, res, next) => {
  ActivityUserFeedback.deleteOne({ meeting_id: req.params.meeting_id }, (err, data) => {
    if (err) {
      return next(new ErrorResponse(`delete failed`, 400));
    }
    return successResponse(req, res, { data });
  });
});

module.exports = {
  getActivityUserFeedbacks,
  getActivityUserFeedback,
  updateActivityUserFeedback,
  createActivityUserFeedback,
  deleteActivityUserFeedback,
}