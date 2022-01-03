const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { successResponse } = require('../utils/successResponse');
const { Meeting } = require('../models/meetings');

// @desc    Get all meeting
// @route   GET /api/meetings/
// @access  Public
const getMeetings = asyncHandler(async (req, res, next) => {
  const meetings = await Meeting.find();
  return successResponse(req, res, { meetings });
});

// @desc    Get single meeting
// @route   GET /api/meetings/:name
// @access  Private with token
const getMeeting = asyncHandler(async (req, res, next) => {
  const meeting = await Meeting.findOne({ name: req.params.name });
  return successResponse(req, res, { meeting });
});

// @desc    Create new meeting
// @route   POST /api/meetings/
// @access  Private with token
const createMeeting = asyncHandler(async (req, res, next) => {
  //body: name, participants, date(no must), urlRoom
  let body = {};
  if (req.body.participants.length > 0 && req.body.urlRoom) {
    if (req.body.date) {
      body = {
        name: req.body.name,
        host: req.user._id,
        participants: req.body.participants,
        date: req.body.date,
        urlRoom: req.body.urlRoom
      };
    }
    else{
        body = {
            name: req.body.name,
            host: req.user._id,
            participants: req.body.participants,
            urlRoom: req.body.urlRoom
          };
    }
  }else{
      return next( new ErrorResponse('missing participants and/or urlRoom', 401));
  }
  const meeting = await Meeting.create(body);
  return successResponse(req, res, meeting);
});

// @desc    Update meeting
// @route   PUT /api/meetings/:name
// @access  Private with token
const updateMeeting = asyncHandler(async (req, res, next) => {
  let data = await Meeting.updateOne({ name: req.params.name }, req.body);
  return successResponse(req, res, { data });
});

// @desc    Delete meeting
// @route   DELETE /api/meetings/:name
// @access  Private with token
const deleteMeeting = asyncHandler(async (req, res, next) => {
  Meeting.deleteOne({ name: req.params.name }, (err, data) => {
    if (err) {
      return next(new ErrorResponse(`delete failed`, 400));
    }
    return successResponse(req, res, { data });
  });
});

module.exports = {
    getMeetings,
    getMeeting,
    createMeeting,
    updateMeeting,
    deleteMeeting,
}