const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { successResponse } = require('../utils/successResponse');
const { Pose } = require('../models/poses');

// @desc    Get all pose
// @route   GET /api/poses/
// @access  Public
const getPoses = asyncHandler(async (req, res, next) => {
  const poses = await Pose.find();
  return successResponse(req, res, { poses });
});

// @desc    Get single pose
// @route   GET /api/poses/:id
// @access  Private with token
const getPose = asyncHandler(async (req, res, next) => {
  const pose = await Pose.findOne({ id: req.params.id });
  return successResponse(req, res, { pose });
});

// @desc    Create new pose
// @route   POST /api/poses/
// @access  Private with token
const createPose = asyncHandler(async (req, res, next) => {
  const pose = await Pose.create(req.body);
  return successResponse(req, res, pose);
});

// @desc    Update pose
// @route   PUT /api/poses/:id
// @access  Private with token
const updatePose = asyncHandler(async (req, res, next) => {
  let data = await Pose.updateOne({ id: req.params.id }, req.body);
  return successResponse(req, res, { data });
});

// @desc    Delete pose
// @route   DELETE /api/poses/:id
// @access  Private with token
const deletePose = asyncHandler(async (req, res, next) => {
  Pose.deleteOne({ id: req.params.id }, (err, data) => {
    if (err) {
      return next(new ErrorResponse(`delete failed`, 400));
    }
    return successResponse(req, res, { data });
  });
});

module.exports = {
    getPoses,
    getPose,
    createPose,
    updatePose,
    deletePose,
}