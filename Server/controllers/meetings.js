const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { successResponse } = require('../utils/successResponse');
const { Meeting } = require('../models/meetings');
const { authorize } = require('../middleware/auth');
const { Profile } = require('../models/profiles');
const { User } = require('../models/users');
const { tailoredActivities } = require('../data_activities/filterActivitesByLimitations');

// @desc    Get all meeting
// @route   GET /api/meetings/
// @access  Private
const getMeetings = asyncHandler(async (req, res, next) => {
  if (!req.user.profile_id) {
    return next(
      new ErrorResponse(
        'you do not have profile, create profile and then create meetings',
        401
      )
    );
  }
  let meetings = null;
  meetings = await Meeting.find({ tariner: req.user._id }).populate('tariner trainee', '_id user role avatar').sort({ date: -1 })
  console.log(req.user._id, 'meetings', meetings.length);
  if (meetings.length === 0 || meetings === null)
    meetings = await Meeting.find({ trainee: req.user._id }).populate('tariner trainee', '_id user role avatar').sort({ date: -1 })

  if (meetings.length === 0 || meetings === null)
    return next(new ErrorResponse('no meetings found by user id', 401));
  return successResponse(req, res, meetings);
});

//filter to get the meeting thet are in the futcer 
const machDates = (date, now) => {
  if (date.getDate() == now.getDate()) {
    if (date.getHours() - 2 < now.getHours()) { //-2 becose if z indwx in date
      return false;
    }
    else if (date.getHours() - 2 == now.getHours() && date.getMinutes() < now.getMinutes()) {
      return false;
    }
  }
  return true;
}

const getFutureMeetings = asyncHandler(async (req, res, next) => {
  if (!req.user.profile_id) {
    return next(
      new ErrorResponse(
        'you do not have profile, create profile and then create meetings',
        401
      )
    );
  }
  let meetings = null;
  let now = new Date();
  // console.log(now.getFullYear(), now.getMonth(), now.getDate());
  meetings = await Meeting.find({ tariner: req.user._id, date: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()) } }).populate('tariner trainee', '_id user role avatar').sort({ date: 1 })
  if (meetings.length === 0 || meetings === null) {
    console.log('in trainee');
    meetings = await Meeting.find({ trainee: req.user._id, date: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()) } }).populate('tariner trainee', '_id user role avatar').sort({ date: 1 })
  }
  if (meetings.length === 0 || meetings === null)
    return successResponse(req, res, null);
  else {
    meetings = meetings.filter(i => machDates(i.date, now))
    return successResponse(req, res, meetings);
  }
});

// @desc    Get single meeting
// @route   GET /api/meetings/:id
// @access  Private with token
const getMeeting = asyncHandler(async (req, res, next) => {
  const meeting = await Meeting.findById(req.params.id);
  return successResponse(req, res, meeting);
});

const getActiveMeeting = asyncHandler(async (req, res, next) => {
  let meeting = null;
  console.log('req.user.role ', req.user.role);
  if (req.user.role === 'trainer')
    meeting = await Meeting.find({ tariner: req.user._id, status: true }).populate('tariner trainee', '_id user role avatar').sort({ date: 1 })
  else  //console.log('in trainee');
    meeting = await Meeting.find({ trainee: req.user._id, status: true }).populate('tariner trainee', '_id user role avatar').sort({ date: 1 })

  if (meeting === null || meeting.length === 0)
    return next(new ErrorResponse('No ACTIVE meeting', 401));
  return successResponse(req, res, meeting);
});

// @desc    Get list of activities the system is oferes
// @route   GET /api/meetings/ouractivities/:id
// @access  Private 
const getCustomActivities = asyncHandler(async (req, res, next) => {
  const myProfile = await Profile.findById(req.user.profile_id);
  console.log(myProfile);
  let isAuthorize = await authorize(req.params.id, myProfile.trainerOf);
  if (!isAuthorize) {
    return next(
      new ErrorResponse(`User is not authorize, choose another participant`, 403));
  }

  const you = await User.findById(req.params.id);
  let yourProfile = null;
  if (you.profile_id)
    yourProfile = await Profile.findById(you.profile_id);

  let unique = myProfile.limitations;
  console.log('unique', unique);
  if (yourProfile) {
    let limits = myProfile.limitations.concat(yourProfile.limitations);
    unique = [...new Set(limits)];
  }
  console.log('limits', unique);
  let ourActivitiesChoice = tailoredActivities(unique);
  return successResponse(req, res, ourActivitiesChoice);
});

const setRandomActivities = (options) => {
  const body_areas = ['arms', 'abdomen', 'legs_knees', 'lower_back', 'upper_back', 'none']
  let curr = [];
  let random_list = [];
  let random, randon_action;

  for (const el of body_areas) {
    switch (el) {
      case 'arms':
        if (!options.arms) break;
        random = Math.floor(Math.random() * options.arms.length);
        randon_action = options.arms[random];
        random_list.push(randon_action);
        break;
      case 'abdomen':
        if (!options.abdomen) break;
        random = Math.floor(Math.random() * options.abdomen.length);
        randon_action = options.abdomen[random];
        random_list.push(randon_action);
        break;
      case 'legs_knees':
        if (!options.legs_knees) break;
        random = Math.floor(Math.random() * options.legs_knees.length);
        randon_action = options.legs_knees[random];
        random_list.push(randon_action);
        break;
      case 'lower_back':
        if (!options.lower_back) break;
        random = Math.floor(Math.random() * options.lower_back.length);
        randon_action = options.lower_back[random];
        random_list.push(randon_action);
        break;

      case 'upper_back':
        if (!options.upper_back) break;
        random = Math.floor(Math.random() * options.upper_back.length);
        randon_action = options.upper_back[random];
        random_list.push(randon_action);
        break;

      case 'none':
        if (!options.none) break;
        random = Math.floor(Math.random() * options.upper_back.length);
        randon_action = options.upper_back[random];
        random_list.push(randon_action);

        random = Math.floor(Math.random() * options.lower_back.length);
        randon_action = options.lower_back[random];
        random_list.push(randon_action);

        random = Math.floor(Math.random() * options.legs_knees.length);
        randon_action = options.legs_knees[random];
        random_list.push(randon_action);

        random = Math.floor(Math.random() * options.arms.length);
        randon_action = options.arms[random];
        random_list.push(randon_action);
        break;
      default:
        break;
    }
  }

  //when nothing is in the aeeay 
  if (random_list.length === 0) {
    random = Math.floor(Math.random() * options.upper_back.length);
    randon_action = options.upper_back[random];
    random_list.push(randon_action);

    random = Math.floor(Math.random() * options.lower_back.length);
    randon_action = options.lower_back[random];
    random_list.push(randon_action);

    random = Math.floor(Math.random() * options.legs_knees.length);
    randon_action = options.legs_knees[random];
    random_list.push(randon_action);

    random = Math.floor(Math.random() * options.arms.length);
    randon_action = options.arms[random];
    random_list.push(randon_action);
  }

  console.log(random_list);
  return random_list;
}

// @desc    Create new meeting
// @route   POST /api/meetings/
// @access  Private with token
const createMeeting = asyncHandler(async (req, res, next) => {
  //body: name, trainee(id), date(no must), room (name/id)
  //date : [y, m, d, h, m]
  //when calling creact -MUSt do a call for getCustomActivities fist - from that the user chose the activityies
  //get my trainees from my profile
  const myProfile = await Profile.findById(req.user.profile_id);
  let isAuthorize = await authorize(req.body.trainee, myProfile.trainerOf);
  if (!isAuthorize) {
    return next(
      new ErrorResponse(
        `User is not authorize, choose another participant`,
        403
      )
    );
  }
  //update the profile of both users about the new meetings
  const participantUser = await User.findById(req.body.trainee);
  const participantProfile = await Profile.findById(participantUser.profile_id);
  //const room = Buffer.alloc(10, req.body.name + date).toString('base64');
  //req.body.urlRoom = `http://localhost:3000/videochat/room=${room}`;
  req.body.tariner = req.user._id; //who is creating the meeting is always the trainer
  //craete mew meeting to db
  let unique;
  if (!req.body.activities || req.body.activities.length == 0) {
    unique = myProfile.limitations;
    if (participantProfile) {
      let limits = myProfile.limitations.concat(participantProfile.limitations);
      unique = [...new Set(limits)];
    }
    let options = tailoredActivities(unique);
    req.body.activities = setRandomActivities(options);
  }
  req.body.date = new Date(req.body.date);
  // console.log(req.body.date.getFullYear());
  // console.log(req.body.date.getMonth());
  // console.log(req.body.date.getDate());
  // console.log(req.body.date.getTime());

  let meeting = await Meeting.create(req.body);

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
  let meeting = null;
  console.log('req.user.role ', req.user.role);
  if (req.user.role === 'trainer')
    meeting = await Meeting.updateOne({ _id: req.params.id }, req.body);
  else  //console.log('in trainee');
    return next(new ErrorResponse('trainee cant do update... sorry', 401));

  if (!meeting) return new ErrorResponse(`faild to update`, 401)
  return successResponse(req, res, 'update done!');
});

// @desc    Delete meeting
// @route   DELETE /api/meetings/:name
// @access  Private with token
const deleteMeeting = asyncHandler(async (req, res, next) => {
  const meeting = await Meeting.findOne({ name: req.params.name });
  meeting.users.map(userId => {
    const user = User.findById(userId);
    let data = Profile.findByIdAndUpdate(user.profile_id, { $pull: { meetings: meeting._id } });
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
  getCustomActivities,
  getFutureMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getActiveMeeting
};
