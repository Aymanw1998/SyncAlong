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
  // console.log('now', now);
  // console.log('date', date);

  if (date.getDate() == now.getDate()) {
    if (date.getHours() < now.getHours()) { //-2 becose if z indwx in date
      return false;
    }
    else if (date.getHours() == now.getHours() && date.getMinutes() < now.getMinutes()) {
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
  meetings = await Meeting.find({ tariner: req.user._id, date: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } }).populate('tariner trainee', '_id user role avatar').sort({ date: 1 })
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

const getComplitedMeetings = asyncHandler(async (req, res, next) => {
  let meetings = null;
  if (req.user.role === 'trainer')
    meetings = await Meeting.find({ tariner: req.user._id, status: false }).populate('tariner trainee', '_id user role avatar').sort({ date: 1 })
  else  //console.log('in trainee');
    meetings = await Meeting.find({ trainee: req.user._id, status: false }).populate('tariner trainee', '_id user role avatar').sort({ date: 1 })

  if (meetings === null || meetings.length === 0)
    return next(new ErrorResponse('No ACTIVE meeting', 401));
  return successResponse(req, res, meetings);
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
  console.log('req.body create', req.body);
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

  // let myDate = new Date(req.body.date);
  // let trut_date = new Date(myDate.getFullYear(), myDate.getMonth(), myDate.getDate(), myDate.getHours() + 3, myDate.getMinutes())
  // req.body.date = trut_date;
  // console.log(req.body.date.getFullYear());
  // console.log(req.body.date.getMonth());
  // console.log(req.body.date.getDate());
  // console.log(req.body.date.getTime());
  //console.log(req.body.date.getHours());

  let meeting = await Meeting.create(req.body)//.populate('tariner trainee', '_id user role avatar')
  let m2 = {
    _id: meeting._id,
    title: meeting.title,
    date: meeting.date,
    activities: meeting.activities,
    status: meeting.status,
    tariner: { _id: req.user._id, user: req.user.user, avatar: req.user.avatar, role: req.user.role },
    trainee: { _id: req.body.trainee, user: participantUser.user, avatar: participantUser.avatar, role: participantUser.role }
  }
  console.log('meeting', m2);
  await Profile.findByIdAndUpdate(myProfile._id, {
    $push: { meetings: meeting._id }
  });
  await Profile.findByIdAndUpdate(participantProfile._id, {
    $push: { meetings: meeting._id }
  });

  return successResponse(req, res, m2);
});

// @desc    Update meeting
// @route   PUT /api/meetings/:name
// @access  Private with token
const updateMeeting = asyncHandler(async (req, res, next) => {
  let meeting = null;
  //whan updates status to activity thet is ended:
  if (req.body.status) {
    //trainer & trainee can do this call 
    //each one of them - apans automaticly when meeting is ended.
    let profile = await Profile.findByIdAndUpdate(req.user.profile_id,
      {
        $pull: { meetings: req.params.id },
        $push: { ended_meetings: req.params.id }
      },
    )

    meeting = await Meeting.updateOne({ _id: req.params.id }, req.body);

    if (!meeting)
      return next(new ErrorResponse('No ACTIVE meeting', 401));
    return successResponse(req, res, meeting);

  }

  if (!meeting) return new ErrorResponse(`faild to update`, 401)
  return successResponse(req, res, 'update done!');
});

// @desc    Delete meeting
// @route   DELETE /api/meetings/:name
// @access  Private with token
const deleteMeeting = asyncHandler(async (req, res, next) => {
  console.log(req.params.id);
  let meeting = null;
  console.log('req.user.role ', req.user.role);
  if (req.user.role === 'trainer')
    meeting = await Meeting.deleteOne({ _id: req.params.id });
  else  //console.log('in trainee');
    return next(new ErrorResponse('trainee cant do delete... sorry', 401));

  if (!meeting) return new ErrorResponse(`faild to delete`, 401)
  return successResponse(req, res, 'delted one!');
});

module.exports = {
  getMeetings,
  getCustomActivities,
  getFutureMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getActiveMeeting,
  getComplitedMeetings
};
