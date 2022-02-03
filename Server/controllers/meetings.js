const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { successResponse } = require('../utils/successResponse');
const { Meeting } = require('../models/meetings');
const { authorize } = require('../middleware/auth');
const { Profile } = require('../models/profiles');
const { User } = require('../models/users');

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
  return successResponse(req, res, meeting);
});

// @desc    Create new meeting
// @route   POST /api/meetings/
// @access  Private with token
const createMeeting = asyncHandler(async (req, res, next) => {
  //body: name, trainee(id), date(no must), room (name/id)
  //date : [y, m, d, h, m]
  if (!req.body.participant) {
    return next(ErrorResponse('missing participant for create meeting'));
  }
  const myProfile = await Profile.findById(req.user.profile_id);
  let isAuthorize = await authorize(req.body.participant, myProfile.trainerOf);
  if (!isAuthorize) {
    return next(
      new ErrorResponse(
        `User is not authorize, choose another participant`,
        403
      )
    );
  }
  let date = null;
  if (req.body.date) {
    if (req.body.date.length != 5) {
      return next(
        ErrorResponse(
          'the date must be array: [year, month, day, houre, minute]'
        )
      );
    }
    const year = req.body.date[0];
    const month = req.body.date[1] -1;
    const day = req.body.date[2];
    const hourse = req.body.date[3] + (3); // +3h for israel country
    const mountes = req.body.date[4];
    date = new Date(year, month, day, hourse, mountes);
  } else {
    date = new Date();
  }
  let meeting = await Meeting.findOne({
    users: [req.user._id, req.body.participant],
    $or: [
      //same date and time
      { date: date.toISOString() },
      //date +10 min
      { date: new Date(date.getTime() + 1 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() + 2 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() + 3 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() + 4 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() + 5 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() + 6 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() + 7 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() + 8 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() + 9 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() + 10 * 60 * 1000).toISOString() },
      //date -10min
      { date: new Date(date.getTime() - 1 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() - 2 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() - 3 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() - 4 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() - 5 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() - 6 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() - 7 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() - 8 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() - 9 * 60 * 1000).toISOString() },
      { date: new Date(date.getTime() - 10 * 60 * 1000).toISOString() }
    ]
  });
  if (meeting) {
    return next(new ErrorResponse('choose another time'));
  }

  meeting = await Meeting.findOne({ name: req.body.name });

  if (meeting) {
    return next(new ErrorResponse('choose another name for meeting'));
  }

  const participantUser = await User.findById(req.body.participant);
  const participantProfile = await Profile.findById(participantUser.profile_id);
  const room = Buffer.alloc(10,req.body.name + date).toString('base64');


  meeting = await Meeting.create({
    name: req.body.name,
    users: [req.user._id, req.body.participant],
    date: date.toISOString(),
    list_activity_id: req.body.list_activity_id,
    urlRoom: `http://localhost:3000/videochat/room=${room}`
  });

  await Profile.findByIdAndUpdate(myProfile._id, {
    $push: { meetings: meeting._id }
  });
  await Profile.findByIdAndUpdate(participantProfile._id, {
    $push: { meetings: meeting._id }
  });

  return successResponse(req, res, meeting);
});

// @desc    Update meeting
// @route   PUT /api/meetings/:name
// @access  Private with token
const updateMeeting = asyncHandler(async (req, res, next) => {
  //body: name, trainee(id), date(no must), room (name/id)
  //date : [y, m, d, h, m]
  let meeting = await Meeting.findOne({ name: req.params.name });

  if (!meeting) {
    return next(
      new ErrorResponse(
        `the meeting with name: [${req.params.name}] is not exist`,
        401
      )
    );
  }
  if (req.body.participant) {
    if (!meeting.users.includes(req.body.participant)) {
      const myProfile = await Profile.findById(req.user.profile_id);
      let isAuthorize = await authorize(req.body.participant, myProfile.trainerOf);
      if (!isAuthorize) {
        return next(new ErrorResponse(`User is not authorize, choose another participant or just keep with old participant`,403));
      }
      else { 
        for (let i =0; i < meeting.users.length; i++) {
          if(meeting.users[i] != req.user._id) {
            let user = User.findById(meeting.users[i]);
            let data = Profile.findByIdAndUpdate(user.profile_id, {$pull: {meetings: meeting._id}});
            meeting.users.splice(i, 1); // delete old participant
            meeting.users.push(req.body.participant);
            user = User.findById(req.body.participant);
            data = Profile.findByIdAndUpdate(user.profile_id, {$pull: {meetings: meeting._id}});

            data = Meeting.findByIdAndUpdate(meeting._id, {users: meeting.users});
          }
        }
      }
    }
  }
  let date = null;
  if (req.body.date) {
    if (req.body.date.length != 5) {
      return next(
        ErrorResponse(
          'the date must be array: [year, month, day, houre, minute]'
        )
      );
    }
    const year = req.body.date[0];
    const month = req.body.date[1] -1;
    const day = req.body.date[2];
    const hourse = req.body.date[3] + (3); // +3h for israel country
    const mountes = req.body.date[4];
    date = new Date(year, month, day, hourse, mountes);
    //20-4-2023 1:25
    let meetingT = await Meeting.findOne({
      $or: [
        //same date and time
        { date: date.toISOString() },
        //date +10 min
        { date: new Date(date.getTime() + 1 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() + 2 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() + 3 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() + 4 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() + 5 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() + 6 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() + 7 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() + 8 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() + 9 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() + 10 * 60 * 1000).toISOString() },
        //date -10min
        { date: new Date(date.getTime() - 1 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() - 2 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() - 3 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() - 4 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() - 5 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() - 6 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() - 7 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() - 8 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() - 9 * 60 * 1000).toISOString() },
        { date: new Date(date.getTime() - 10 * 60 * 1000).toISOString() }
      ]
    });
    if (meetingT) {
      return next(new ErrorResponse('choose another time'));
    } 
  }

  let data = await Meeting.findByIdAndUpdate(meeting._id,{
    date: date.toISOString(),
    list_activity_id: req.body.list_activity_id
  });

  meeting = await Meeting.findOne({ name: req.params.name }); 
  return successResponse(req, res,meeting);
  
});

// @desc    Delete meeting
// @route   DELETE /api/meetings/:name
// @access  Private with token
const deleteMeeting = asyncHandler(async (req, res, next) => {
  const meeting = await Meeting.findOne({ name: req.params.name });
  meeting.users.map(userId => {
    const user = User.findById(userId);
    let data = Profile.findByIdAndUpdate(user.profile_id, {$pull: {meetings: meeting._id}});
  });
  Meeting.deleteOne({ name: req.params.name }, (err, data) => {
    if (err) {
      return next(new ErrorResponse(`delete failed`, 400));
    }
    return successResponse(req, res, data);
  });
});

module.exports = {
  getMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting
};
