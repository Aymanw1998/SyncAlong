const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { successResponse } = require('../utils/successResponse');
const { Feedback } = require('../models/feedbacks');

// @desc    Get all feedback
// @route   GET /api/feedbacks/
// @access  Public
const getFeedbacks = asyncHandler(async (req, res, next) => {
  const feedbacks = await Feedback.find();
  return successResponse(req, res, { feedbacks });
});

// @desc    Get single meeting
// @route   GET /api/feedbacks/:name
// @access  Private with token
const getFeedback = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.findOne({ name: req.params.name });
  return successResponse(req, res, { feedback });
});

// @desc    Create new meeting
// @route   POST /api/feedbacks/
// @access  Private with token
const createFeedback = asyncHandler(async (req, res, next) => {
  //body: name, message, AR  
  const feedback = await Feedback.create(req.body);
  return successResponse(req, res, feedback);
});

// @desc    Update feedback
// @route   PUT /api/feedbacks/:name
// @access  Private with token
const updateFeedback = asyncHandler(async (req, res, next) => {
  let data = await Feedback.updateOne({ name: req.params.name }, req.body);
  return successResponse(req, res, { data });
});

// @desc    Delete feedback
// @route   DELETE /api/meetings/:name
// @access  Private with token
const deleteFeedback = asyncHandler(async (req, res, next) => {
    Feedback.deleteOne({ name: req.params.name }, (err, data) => {
    if (err) {
      return next(new ErrorResponse(`delete failed`, 400));
    }
    return successResponse(req, res, { data });
  });
});

module.exports = {
    getFeedbacks,
    getFeedback,
    createFeedback,
    updateFeedback,
    deleteFeedback,
}