const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { successResponse } = require('../utils/successResponse');
const { Profile } = require('../models/profiles');
const { User } = require('../models/users');
const { authorize } = require('../middleware/auth');
const { getMeetings } = require('./meetings');

let activities = {
  arms: [
    'left heand up-down on y-axis',
    'right heand up-down on y-axis',
    'both heands up-down on y-axis',
    'both heands close-open on x-axis',
    'left heand bending at angles 180to0 on x-axis',
    'right heand bending at angles 180to0 on x-axis',
    'both heands rotation on x-axis'
  ],
  abdomen: ['squats', 'crunches'],
  legs_knees: [
    'shoulders to the sides of the body and legs to bend 90 degrees',
    'lift right leg on Y-axis up-down',
    'lift left leg on Y-axis up-down',
    'lift right leg on Y-axis and rotatian for x-axis',
    'lift left leg on Y-axis and rotatian for x-axis',
  ],
  lower_back: [
    'center body area and upper-body moves to right-left side on X-axis',
  ],
  upper_back: [
    'stretching hands up 90 degrees without moving',
  ],
}
const settingActivity = (reqbody) => {
  if (reqbody.limitations) {
    Object.keys(activities)
      .filter(key => !reqbody.limitations.includes(key))
      .reduce((obj, key) => {
        obj[key] = activities[key];
        reqbody.system_activity_offers = obj;
        return obj;
      }, {});
    console.log(reqbody.system_activity_offers);
  }
  //all activity is good
  else {
    reqbody.system_activity_offers = activities;
    return activities;
  }
}

// @desc    Get all Profiles
// @route   GET /api/profiles/
// @access  Public
const getProfiles = asyncHandler(async (req, res, next) => {
  const profiles = await Profile.find();
  return successResponse(req, res, { profiles: profiles });
});

// @desc    Get single profile
// @route   GET /api/profiles/
// @access  Private with token
const getProfile = asyncHandler(async (req, res, next) => {
  if (!req.user.profile_id) {
    return next(
      new ErrorResponse(
        'you do not have profile, create profile for you befor that',
        401
      )
    );
  }
  const profile = await Profile.findById(req.user.profile_id);
  return successResponse(req, res, profile);
});

// @desc    Create new profile
// @route   POST /api/profiles/
// @access  Private with token
const createProfile = asyncHandler(async (req, res, next) => {
  let profile = null;
  //ckack if loged user has profile_id
  if (req.user.profile_id) {
    profile = await Profile.findById(req.user.profile_id);
    if (profile && !req.params.id) { //chack for req.param for validat when call came from creatTrinee()
      return next(
        new ErrorResponse('you have profile, you must not create another', 401)
      );
    }
  }
  //creat system_activity_offers with req.body.limitations
  //settingActivity(req.body); //may be Unnecessary to set elemet activity in profile modle

  profile = await Profile.create(req.body);
  //handel craet trainee
  if (req.params.id) return profile;
  //handle creat user tariner -when profile craeted seccsefuly 
  // set up the user of profile_id
  if (profile) {
    //update user his new profile_id
    let data = await User.findByIdAndUpdate(req.user._id, { profile_id: profile._id });
    if (data)
      successResponse(req, res, profile);
  }
});

// @desc    Update profile
// @route   PUT /api/profiles/
// @access  Private with token
const updateProfile = asyncHandler(async (req, res, next) => {
  req.body.updateAt = Date.now();
  let profile = await Profile.findById(req.user.profile_id);
  if (profile) {
    //when limitations elment exists alrady 
    // profile.limitations =['arms', 'baly','legs','niee'  ];
    // req.body.limitations =['arms' ,'legs', 'abdomen' ]; //abdomen is new to push
    // output new profile.limitations = ['arms' ,'legs', 'abdomen' ]
    //   if (profile.limitations) {
    //     req.body.limitations.map(element => {
    //       let i = null;
    //       console.log('element', element);
    //       i = profile.limitations.find(el => el == element)
    //       let index = profile.limitations.indexOf(i);
    //       console.log('i', i);
    //       console.log('iindex', index);

    //       console.log('s', profile.limitations);
    //       console.log('333s', profile.limitations.find(el => el == element));
    //       if (!i && profile.limitations.find(el => el == element)) {
    //         //profile.limitations.indexOf(index);
    //         console.log(profile.limitations);
    //         profile.limitations.splice(index, 1); //remove
    //         console.log(profile.limitations);
    //       }
    //       else if (!i) profile.limitations.push(element);
    //     })
    //   }
    //   else if (!profile.limitations)
    //     profile.limitations = req.body.limitations;
    //   // user.save();
    //   // res.status(200).json(user)
    // }
    //profile.priority_areas = req.body.priority_areas;
    let updated = await Profile.updateOne({ _id: profile._id }, req.body);
    if (updated) return successResponse(req, res, req.body);
    else return next(new ErrorResponse('call error', 501));
  }
});

// @desc    Delete profile
// @route   DELETE /api/profiles/
// @access  Private with token
// not tested!!!!!!!!
const deleteProfile = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'trainee') { //elderly cant delete himself
    return next(
      new ErrorResponse(`you cannot delete yourself, you are trainee`, 401)
    );
  }
  //TO DO
  //when i delete my profile it delets the list of my trainess ....
  // need to handle when creating profile if any user has my user._id as there trinerOf element in profile modle
  //if there is -needs to add them in my trainerOf list when insert new profile 
  // NEED TO DO IN craeteProfile()
  //NOt handled yet......

  //when user has profile
  if (req.user.profile_id) {
    //clear profile elemet in user modle
    let profile_user = await User.updateOne({ profile_id: req.user.profile_id }, undefined)
    if (!profile_user)
      return next(new ErrorResponse(`set profie_id to undifined failed`, 402));

    //it mait 
    // delete profile of user
    await Profile.deleteOne({ _id: req.user.profile_id }, (err, data) => {
      if (err) {
        return next(new ErrorResponse(`delete failed`, 400));
      }
      return successResponse(req, res, data);
    });
  }
  else
    return next(new ErrorResponse(`no profile id conected to this user`, 404));
});

// @desc    Delete profile
// @route   DELETE /api/profiles/trainee/:id
// @access  Private with token
// not tested!!!!!!!!
const deleteTraineeProfile = asyncHandler(async (req, res, next) => {
  //chack me -if im valid 
  const profile = await Profile.findById(req.user.profile_id);
  //chack the the user-trainee has a profile to delete 
  const trainee_profile = await User.findById(req.params.id);
  if (trainee_profile?.profile_id && profile) {
    let isAuthorize = await authorize(req.params.id, profile.trainerOf);
    if (!isAuthorize) return next(new ErrorResponse(`User is not authorize for chang deffrant user`, 403));

    let profile_user = await User.updateOne({ profile_id: trainee_profile._id }, undefined)
    if (!profile_user)
      return next(new ErrorResponse(`set profie_id to undifined failed`, 402));

    //when ok- delete user from db
    await Profile.deleteOne({ _id: trainee_profile.profile_id }, (err, data) => {
      if (err) {
        return next(new ErrorResponse(`delete failed`, 400));
      }
      return successResponse(req, res, data);
    });
  }
});

// @desc    Delete profile
// @route   GRT /api/profiles/trainee/:id
// @access  Private with token
const getTraineeProfile = asyncHandler(async (req, res, next) => {
  if (!req.user.profile_id) {
    return next(
      new ErrorResponse(`Cannot get friend before create your elderlys`, 400)
    );
  }
  else if (req.user.role === 'trainee') {
    return next(
      new ErrorResponse(`Cannot get friend becuse you are elderly`, 400)
    );
  }

  //chack the the user-trainee has a profile to delete 
  const trainee_profile = await User.findById(req.params.id);
  console.log(trainee_profile);
  if (trainee_profile?.profile_id) {
    let isAuthorize = await authorize(req.params.id, profile.trainerOf);
    if (!isAuthorize) return next(new ErrorResponse(`User is not authorize for chang deffrant user`, 403));
    else
      return successResponse(req, res, trainee_profile);
  }
  else return new ErrorResponse(`must has a profile before!`, 404)

});

// @desc Create elderly profile
// @route POST /api/profiles/trainee/:id (id user)
// @access Private with token
const createTraineeProfile = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'trainee') {
    return next(
      new ErrorResponse(`Cannot create friend becuse you are elderly`, 400)
    );
  }
  let testExistUser = await User.findById(req.params.id);
  console.log('testExistUser', testExistUser);
  if (!testExistUser) {
    return next(
      new ErrorResponse(`The user not exist`, 404));
  }
  req.body.traineeOf = req.user._id;
  let profileFriend = await Profile.create(req.body);
  console.log(profileFriend);
  if (profileFriend) {
    try {
      //upata the new profile trainee in user modle
      let data = await User.findByIdAndUpdate(req.params.id, { profile_id: profileFriend._id });
      if (data) {
        console.log(data);
        //upade trainer and add id.trainee to list of tainees
        data = await Profile.findByIdAndUpdate({ _id: req.user.profile_id }, {
          $addToSet: { trainerOf: req.params._id }
        });
        if (data) successResponse(req, res, profileFriend);
        else return next(new ErrorResponse(`filed upade trainer`, 402));
      }
      else return next(new ErrorResponse(`filed upade trainee`, 402));
    }
    catch (error) {
      console.error(error);
      return next(new ErrorResponse(`error catch`, 402));
    }
  }
});

// @desc Update elderly profile
// @route PUT /api/profiles/trainee/:id (id user)
// @access Private with token
const updateTraineeProfile = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'trainee') {
    return next(
      new ErrorResponse(`Cannot update friend becuse you are elderly`, 400)
    );
  }
  let testExistUser = await User.findById(req.params.id);
  console.log(testExistUser);

  if (!testExistUser) {
    return next(new ErrorResponse(`The user with id: ${req.params.id} does not exist`, 404));
  }
  const myProfile = await Profile.findById(req.user.profile_id);
  const trainerOf = myProfile.trainerOf;
  let isAuthorize = await authorize(req.params.id, trainerOf);
  if (!isAuthorize)
    return next(new ErrorResponse(`User is not authorize`, 403));

  req.body.updateAt = Date.now();

  if (testExistUser?.profile_id) {
    let updated = await Profile.findByIdAndUpdate({ _id: testExistUser.profile_id }, req.body);
    if (updated) return successResponse(req, res, req.body);
    else return next(new ErrorResponse('call error', 501));
  }
  else return next(new ErrorResponse('profile not found', 40));
});



// // @decs    get all meetings for profile
// // @router  GET /api/profiles/scheduled/
// // @access  Private with token
// const scheduledMeetings = asyncHandler(async (req, res, next) => {
//   let meetings = [];
//   const myProfile = await Profile.findById(req.user.profile_id);
//   if (myProfile) {
//     const future_meeting_id = myProfile.future_meeting_id;
//     const performed_meeting_id = myProfile.performed_meeting_id;

//     for (let i = 0; i < future_meeting_id.length; i++) {
//       req.params.id = future_meeting_id[i];
//       const meeting = await getMeetings(req, res, next);
//       meetings.push(meeting);
//     }
//     for (let i = 0; i < future_meeting_id.length; i++) {
//       req.params.id = future_meeting_id[i];
//       const meeting = await getMeetings(req, res, next);
//       meetings.push(meeting);
//     }
//     successResponse(req, res, { meetings });
//   }
// });

// // @decs    get meeting for profile
// // @router  GET /api/profiles/scheduled/:id
// // @access  Private with token
// const scheduledMeeting = asyncHandler(async (req, res, next) => {
//   if (!req.params.id) {
//     return next(new ErrorResponse('missing id param', 401));
//   }

//   await getMeetings(req, res, next)
//     .then((data) => {
//       let meeting = data.meetings.filter((meet) => meet._id === req.params.id);
//       if (!meeting)
//         return next(
//           new ErrorResponse(`don't have meeting with id: ${req.params.id}`, 401)
//         );
//       return successResponse(req, res, { meeting });
//     })
//     .catch((err) => {
//       console.error(err);
//       return next(new ErrorResponse(err, 401));
//     });
// });

module.exports = {
  getProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  deleteTraineeProfile,
  getTraineeProfile,
  createTraineeProfile,
  updateTraineeProfile,
  // scheduledMeetings,
  // scheduledMeeting
};
