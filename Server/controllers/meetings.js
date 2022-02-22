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
  meetings = await Meeting.find({ tariner: req.user._id }).populate('tariner trainee', '_id user role').sort({ date: -1 })
  console.log(req.user._id, 'meetings', meetings.length);
  if (meetings.length === 0 || meetings === null)
    meetings = await Meeting.find({ trainee: req.user._id }).populate('tariner trainee', '_id user role').sort({ date: -1 })

  if (meetings.length === 0 || meetings === null)
    return next(new ErrorResponse('no meetings found by user id', 401));
  return successResponse(req, res, meetings);
});

// @desc    Get single meeting
// @route   GET /api/meetings/:id
// @access  Private with token
const getMeeting = asyncHandler(async (req, res, next) => {
  const meeting = await Meeting.findById(req.params.id);
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

  // let date = null;
  // if (req.body.date) {
  //   if (req.body.date.length != 5) {
  //     return next(
  //       ErrorResponse(
  //         'the date must be array: [year, month, day, houre, minute]'
  //       )
  //     );
  //   }
  //   const year = req.body.date[0];
  //   const month = req.body.date[1] - 1;
  //   const day = req.body.date[2];
  //   const hourse = req.body.date[3] + (3); // +3h for israel country
  //   const mountes = req.body.date[4];
  //   date = new Date(year, month, day, hourse, mountes);
  // } else {
  //   date = new Date();
  // }

  // //chack if the meeting reqested to crect dosent mauch with exixting meeting (10 min around the meething time)
  // let meeting = await Meeting.findOne({
  //   tariner: req.user._id,
  //   $or: [
  //     //same date and time
  //     { date: date.toISOString() },
  //     //date +10 min
  //     { date: new Date(date.getTime() + 1 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() + 2 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() + 3 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() + 4 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() + 5 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() + 6 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() + 7 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() + 8 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() + 9 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() + 10 * 60 * 1000).toISOString() },
  //     //date -10min
  //     { date: new Date(date.getTime() - 1 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() - 2 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() - 3 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() - 4 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() - 5 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() - 6 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() - 7 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() - 8 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() - 9 * 60 * 1000).toISOString() },
  //     { date: new Date(date.getTime() - 10 * 60 * 1000).toISOString() }
  //   ]
  // });
  // if (meeting) {
  //   return next(new ErrorResponse('choose another time, allrady has a meeting around this time'));
  // }

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

  let meeting = await Meeting.create(req.body);

  // meeting = await Meeting.create({
  //   name: req.body.name,
  //   users: [req.user._id, req.body.participant],
  //   date: date.toISOString(),
  //   list_activity_id: req.body.list_activity_id,
  //   urlRoom: `http://localhost:3000/videochat/room=${room}`
  // });

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
        return next(new ErrorResponse(`User is not authorize, choose another participant or just keep with old participant`, 403));
      }
      else {
        for (let i = 0; i < meeting.users.length; i++) {
          if (meeting.users[i] != req.user._id) {
            let user = User.findById(meeting.users[i]);
            let data = Profile.findByIdAndUpdate(user.profile_id, { $pull: { meetings: meeting._id } });
            meeting.users.splice(i, 1); // delete old participant
            meeting.users.push(req.body.participant);
            user = User.findById(req.body.participant);
            data = Profile.findByIdAndUpdate(user.profile_id, { $pull: { meetings: meeting._id } });

            data = Meeting.findByIdAndUpdate(meeting._id, { users: meeting.users });
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
    const month = req.body.date[1] - 1;
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

  let data = await Meeting.findByIdAndUpdate(meeting._id, {
    date: date.toISOString(),
    list_activity_id: req.body.list_activity_id
  });

  meeting = await Meeting.findOne({ name: req.params.name });
  return successResponse(req, res, meeting);

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
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting
};
