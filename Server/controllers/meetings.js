const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { successResponse } = require('../utils/successResponse');
const { Meeting } = require('../models/meetings');
const { authorize } = require('../middleware/auth');
const { Profile } = require('../models/profiles');
const { User } = require('../models/users');
const { Activity } = require('../models/activities');

const checkAboutActivity = async (activityId, pains_list) => {
  try {
    const activity = await Activity.findById(activityId);
    pains_list.map((p) => {
      activity.bodyPart.map((bp) => {
        if (p == bp) return 1; //activity not good
      });
    });
    return 0; //activity good
  } catch (e) {
    return 2; //error
  }
};

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
    const month = req.body.date[1];
    const day = req.body.date[2];
    const hourse = req.body.date[3];
    const mounth = req.body.date[4];
    date = new Date(year, month, day, hourse, mounth);
  } else {
    date = new Date();
  }
  let meeting = await Meeting.findOne({
    $or: [
      //same date and time
      { date: date },
      //date +10 min
      { date: new Date(date.getTime() + 1 * 60 * 1000) },
      { date: new Date(date.getTime() + 2 * 60 * 1000) },
      { date: new Date(date.getTime() + 3 * 60 * 1000) },
      { date: new Date(date.getTime() + 4 * 60 * 1000) },
      { date: new Date(date.getTime() + 5 * 60 * 1000) },
      { date: new Date(date.getTime() + 6 * 60 * 1000) },
      { date: new Date(date.getTime() + 7 * 60 * 1000) },
      { date: new Date(date.getTime() + 8 * 60 * 1000) },
      { date: new Date(date.getTime() + 9 * 60 * 1000) },
      { date: new Date(date.getTime() + 10 * 60 * 1000) },
      //date -10min
      { date: new Date(date.getTime() - 1 * 60 * 1000) },
      { date: new Date(date.getTime() - 2 * 60 * 1000) },
      { date: new Date(date.getTime() - 3 * 60 * 1000) },
      { date: new Date(date.getTime() - 4 * 60 * 1000) },
      { date: new Date(date.getTime() - 5 * 60 * 1000) },
      { date: new Date(date.getTime() - 6 * 60 * 1000) },
      { date: new Date(date.getTime() - 7 * 60 * 1000) },
      { date: new Date(date.getTime() - 8 * 60 * 1000) },
      { date: new Date(date.getTime() - 9 * 60 * 1000) },
      { date: new Date(date.getTime() - 10 * 60 * 1000) }
    ]
  });
  if (meeting) {
    return next(new ErrorResponse('choose another time'));
  }

  meeting = await Meeting.findOne({ room: req.body.room, status: true });

  if (meeting) {
    return next(new ErrorResponse('choose another name for room'));
  }

  meeting = await Meeting.findOne({ name: req.body.name });

  if (meeting) {
    return next(new ErrorResponse('choose another name for meeting'));
  }
  const participantUser = await User.findById(req.body.participant);
  const participantProfile = await Profile.findById(participantUser.profile_id);

  /** have list activities from two users */
  let activity_list = [];

  for (let i = 0; i < myProfile.physical_movements; i++) {
    const activityId = myProfile.physical_movements[i];
    if (!activity_list.includes(activityId)) {
      activity_list.push(activityId);
    }
  }

  for (let i = 0; i < participantProfile.physical_movements; i++) {
    const activityId = participantProfile.physical_movements[i];
    if (!activity_list.includes(activityId)) {
      activity_list.push(activityId);
    }
  }

  /** have list pains from two users */
  let pains_list = [];

  for (let i = 0; i < myProfile.body_pains; i++) {
    const pain = myProfile.body_pains[i];
    if (!pains_list.includes(pain)) {
      pains_list.push(pain);
    }
  }

  for (let i = 0; i < participantProfile.body_pains; i++) {
    const pain = participantProfile.body_pains[i];
    if (!pains_list.includes(pain)) {
      pains_list.push(pain);
    }
  }

  /** delete activity if not good for one of the users */
  for (let i = 0; i < activity_list; i++) {
    if (!(checkAboutActivity(activity_list[i], pains_list) == 0)) {
      activity_list.splice(i, 1);
    }
  }

  /** choose 5 activities from the list */
  var shuffled = activity_list.sort(() => {
    return 0.5 - Math.random();
  });
  var selected = shuffled.slice(0, 5);
  //const room = //random name
  meeting = await Meeting.create({
    name: req.body.name,
    users: [req.user._id, req.body.participant],
    date: date,
    list_activity_id: selected,
    url: `http://localhost:3000/videochat/room=${room}`
  });
  await Profile.findByIdAndUpdate(myprofile._id, {
    $push: { future_meeting_id: meeting._id }
  });
  await Profile.findByIdAndUpdate(participant._id, {
    $push: { future_meeting_id: meeting._id }
  });

  return successResponse(req, res, meeting);
});

// @desc    Update meeting
// @route   PUT /api/meetings/:name
// @access  Private with token
const updateMeeting = asyncHandler(async (req, res, next) => {
  //body: name, trainee(id), date(no must), room (name/id)
  //date : [y, m, d, h, m]
  meeting = await Meeting.findOne({ name: req.params.name });

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
      let isAuthorize = await authorize(
        req.body.participant,
        myProfile.trainerOf
      );
      if (!isAuthorize) {
        return next(
          new ErrorResponse(
            `User is not authorize, choose another participant or just keep with old participant`,
            403
          )
        );
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
    const month = req.body.date[1];
    const day = req.body.date[2];
    const hourse = req.body.date[3];
    const mounth = req.body.date[4];
    date = new Date(year, month, day, hourse, mounth);
  } else {
    date = new Date();
  }
  let meeting = await Meeting.findOne({
    $or: [
      //same date and time
      { date: date },
      //date +10 min
      { date: new Date(date.getTime() + 1 * 60 * 1000) },
      { date: new Date(date.getTime() + 2 * 60 * 1000) },
      { date: new Date(date.getTime() + 3 * 60 * 1000) },
      { date: new Date(date.getTime() + 4 * 60 * 1000) },
      { date: new Date(date.getTime() + 5 * 60 * 1000) },
      { date: new Date(date.getTime() + 6 * 60 * 1000) },
      { date: new Date(date.getTime() + 7 * 60 * 1000) },
      { date: new Date(date.getTime() + 8 * 60 * 1000) },
      { date: new Date(date.getTime() + 9 * 60 * 1000) },
      { date: new Date(date.getTime() + 10 * 60 * 1000) },
      //date -10min
      { date: new Date(date.getTime() - 1 * 60 * 1000) },
      { date: new Date(date.getTime() - 2 * 60 * 1000) },
      { date: new Date(date.getTime() - 3 * 60 * 1000) },
      { date: new Date(date.getTime() - 4 * 60 * 1000) },
      { date: new Date(date.getTime() - 5 * 60 * 1000) },
      { date: new Date(date.getTime() - 6 * 60 * 1000) },
      { date: new Date(date.getTime() - 7 * 60 * 1000) },
      { date: new Date(date.getTime() - 8 * 60 * 1000) },
      { date: new Date(date.getTime() - 9 * 60 * 1000) },
      { date: new Date(date.getTime() - 10 * 60 * 1000) }
    ]
  });
  if (meeting) {
    return next(new ErrorResponse('choose another time'));
  }

  meeting = await Meeting.findOne({ room: req.body.room, status: true });

  if (meeting) {
    return next(new ErrorResponse('choose another name for room'));
  }

  const participantUser = await User.findById(req.body.participant);
  const participantProfile = await Profile.findById(participantUser.profile_id);

  /** have list activitys from two users */
  let activity_list = [];

  for (let i = 0; i < myProfile.physical_movements; i++) {
    const activityId = myProfile.physical_movements[i];
    if (!activity_list.includes(activityId)) {
      activity_list.push(activityId);
    }
  }

  for (let i = 0; i < participantProfile.physical_movements; i++) {
    const activityId = participantProfile.physical_movements[i];
    if (!activity_list.includes(activityId)) {
      activity_list.push(activityId);
    }
  }

  /** have list pains from two users */
  let pains_list = [];

  for (let i = 0; i < myProfile.body_pains; i++) {
    const pain = myProfile.body_pains[i];
    if (!pains_list.includes(pain)) {
      pains_list.push(pain);
    }
  }

  for (let i = 0; i < participantProfile.body_pains; i++) {
    const pain = participantProfile.body_pains[i];
    if (!pains_list.includes(pain)) {
      pains_list.push(pain);
    }
  }

  /** delete activity if not good for one of the users */
  for (let i = 0; i < activity_list; i++) {
    if (!(checkAboutActivity(activity_list[i], pains_list) == 0)) {
      activity_list.splice(i, 1);
    }
  }

  /** choose 5 activities from the list */
  var shuffled = activity_list.sort(() => {
    return 0.5 - Math.random();
  });
  var selected = shuffled.slice(0, n);

  meeting = await Meeting.create({
    name: req.body.name,
    users: [req.user._id, req.body.participant],
    date: date,
    list_activity_id: selected,
    room: room,
    url: `http://localhost:3000/videochat/room=${room}`
  });
  await Profile.findByIdAndUpdate(myprofile._id, {
    $push: { future_meeting_id: meeting._id }
  });
  await Profile.findByIdAndUpdate(participant._id, {
    $push: { future_meeting_id: meeting._id }
  });

  return successResponse(req, res, meeting);
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
  deleteMeeting
};
