const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { createToken } = require('../utils/tokenResponse');
const { successResponse } = require('../utils/successResponse');
const { Profile, BodyPart } = require('../models/profiles');
const bcrypt = require('bcrypt');
const gravatar = require('gravatar');
const crypto = require('crypto');
const { authorize } = require('../middleware/auth');

const { deleteFriend } = require('./users');
const { User } = require('../models/users');

const {getMeetings} = require('./meetings')

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
  if(!req.user.profile_id){
    return next(new ErrorResponse('you do not have profile, create profile for you befor that', 401));
  }
  const profile = await Profile.findById(req.user.profile_id);
  return successResponse(req, res, profile);
});

// @desc    Create new profile
// @route   POST /api/profiles/
// @access  Private with token
const createProfile = asyncHandler(async (req, res, next) => {
  if(req.user.profile_id && !req.params.id){
    return next(new ErrorResponse('you have profile, you must not create another', 401));
  }
  let profile = await Profile.create(req.body);

  if (req.params.id) return profile;

  let data = await User.findByIdAndUpdate(req.user._id, {
    profile_id: profile._id,
  });
  profile = await Profile.findById(profile._id)
  successResponse(req, res,profile);
});

// @desc    Update profile
// @route   PUT /api/profiles/
// @access  Private with token
const updateProfile = asyncHandler(async (req, res, next) => {
  req.body.updateAt = Date.now();
  let data = await Profile.updateOne({ _id: req.user.profile_id }, req.body);
  return successResponse(req, res, data);
});

// @desc    Delete profile
// @route   DELETE /api/profiles/
// @access  Private with token
const deleteProfile = asyncHandler(async (req, res, next) => {
  Profile.deleteOne({ user: req.user.id }, (err, data) => {
    if (err) {
      return next(new ErrorResponse(`delete failed`, 400));
    }
    return successResponse(req, res, { data });
  });
});

// @desc Create elderly profile
// @route POST /api/profiles/trainer/:id (id user)
// @access Private with token
const createProfileFriend = asyncHandler(async (req, res, next) => {
  if(req.user.role === 'elderly'){
    return next(
      new ErrorResponse(`Cannot create friend becuse you are elderly`, 400)
    );
  }
  let testExistUser = await User.findById(req.params.id);
  if(!testExistUser){
    return next(
      new ErrorResponse(`The user with id: ${req.params.id} does not exist`, 400)
    );
  }
  let profileFriend = await createProfile(req, res, next);
  if (profileFriend) {
    try {
      //connection between the profile and his user
      let data = await User.findByIdAndUpdate(
        req.params.id,
        {profile_id: profileFriend._id});
      // connection between add traineeOf on profileElderly
      data = await Profile.findByIdAndUpdate(
        profileFriend._id,
        { traineeOf: req.user._id }
      );
      // connection between add trainerOf on profileTrainer
      data = await Profile.findByIdAndUpdate(
        req.user.profile_id,
        {$addToSet: { trainerOf: req.params._id}}
      );

      profileFriend = await Profile.findById(profileFriend._id);
      successResponse(req, res,profileFriend);
    } catch (e) {
      next(e);
    }
  }
});

// @desc Update elderly profile
// @route PUT /api/profiles/trainer/:id (id user)
// @access Private with token
const updateProfileFriend = asyncHandler(async (req, res, next) => {
  if(req.user.role === 'elderly'){
    return next(
      new ErrorResponse(`Cannot update friend becuse you are elderly`, 400)
    );
  }
  const myProfile = await Profile.findById(req.user.profile_id);
  const trainerOf = myProfile.trainerOf;
  let isAuthorize = await authorize(req.params.id, trainerOf);
  if (!isAuthorize)
    return next(new ErrorResponse(`User is not authorize`, 403));

  req.body.updateAt = Date.now();
  const friendUser = await User.findById(req.params.id); 
  let data = await Profile.findByIdUpdate(friendUser.profile_id, req.body);
  return successResponse(req, res, { data });
});

// @desc Delete elderly profile
// @route DELETE /api/profiles/trainer/:id
// @access Private with token
const deleteProfileFriend = asyncHandler(async (req, res, next) => {
  let isAuthorize = await authorize(req.params.id, req.user.trainerOf);
  if (!isAuthorize)
    return next(new ErrorResponse(`User is not authorize`, 403));

  // Delete user friend
  deleteFriend(req, res, next);

  //Delete profile
});

// @desc    ADD/Remove body parts
// @desc    id => _id,
//          Activity => ["add" OR "remove"],
//          possibility => ["Prohibited" OR "Desirable"],
//          p => ["Upper" OR "Bottom"]
//          body_Part => ['head', 'right hand', 'left hand', 'right leg', 'left leg', 'left']
// @route
// @access  Private (For another functions)
const bodyPart = async (id, Activity, possibility, p, body_Part) => {
  var isCorrect = false;
  BodyPart.map((p) => {
    if (p === body_Part) {
      isCorrect = true;
    }
  });

  if (!isCorrect) {
    return false;
  }
  if (Activity === 'add') {
    if (
      (possibility === 'Desirable' || possibility === 'desirable') &&
      (p === 'Upper' || p === 'upper')
    ) {
      try {
        let profile = await Profile.findOneAndUpdate(
          { _id: id },
          {
            $addToSet: { DesirableBodyUpper: body_Part },
            $pull: { ProhibitedBodybodyUpper: body_Part }
          }
        );
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    } else if (
      (possibility === 'Desirable' || possibility === 'desirable') &&
      (p === 'Bottom' || p === 'Bottom')
    ) {
      try {
        let profile = await Profile.findOneAndUpdate(
          { _id: id },
          {
            $addToSet: { DesirableBodyBottom: body_Part },
            $pull: { ProhibitedBodybodyBottom: body_Part }
          }
        );
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    } else {
      // possibility === "prohibited"
      if (p === 'Upper' || p === 'upper') {
        try {
          let profile = await Profile.findOneAndUpdate(
            { _id: id },
            {
              $addToSet: { ProhibitedBodyUpper: body_Part },
              $pull: { DesirableBodyUpper: body_Part }
            }
          );
          return true;
        } catch (e) {
          console.log(e);
          return false;
        }
      } else {
        //p === 'Bootom' || p === 'bottom'
        try {
          let profile = await Profile.findOneAndUpdate(
            { _id: id },
            {
              $addToSet: { ProhibitedBody: body_Part },
              $pull: { DesirableBody: body_Part }
            }
          );
          return true;
        } catch (e) {
          console.log(e);
          return false;
        }
      }
    }
  } else {
    // Activity === "remove"
    if (
      (possibility === 'Desirable' || possibility === 'desirable') &&
      (p === 'Upper' || p === 'upper')
    ) {
      try {
        let profile = await Profile.findOneAndUpdate(
          { _id: id },
          { $pull: { DesirableBodyUpper: body_Part } }
        );
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    } else if (
      (possibility === 'Desirable' || possibility === 'desirable') &&
      (p === 'Bottom' || p === 'bottom')
    ) {
      try {
        let profile = await Profile.findOneAndUpdate(
          { _id: id },
          { $pull: { DesirableBodyBottom: body_Part } }
        );
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    } else {
      // possibility === "prohibited"
      if (p === 'Upper' || p === 'upper') {
        try {
          let profile = await Profile.findOneAndUpdate(
            { _id: id },
            { $pull: { ProhibitedBodyUpper: body_Part } }
          );
          return true;
        } catch (e) {
          console.log(e);
          return false;
        }
      } else {
        try {
          let profile = await Profile.findOneAndUpdate(
            { _id: id },
            { $pull: { ProhibitedBodyBottom: body_Part } }
          );
          return true;
        } catch (e) {
          console.log(e);
          return false;
        }
      }
    }
  }
};

// @decs    Add body parts for profile
// @router  POST /api/profiles/body
// @access  Private with token
const addBodyPartsProfile = asyncHandler(async (req, res, next) => {
  const possibility = req.body.possibility; // "Prohibited" OR "Desirable"
  const p = req.body.p; // "Upper" OR "Bottom"
  const body_parts = req.body.bodyPart; // Array
  if (body_parts.length > 0) {
    body_parts.map(async (part) => {
      let b = await bodyPart(req.user.profile_id, 'add', possibility, p ,part);
    });
  }
  const profile = await Profile.findById(req.user.profile_id);
  return successResponse(req, res, profile);
});

// @decs    remove body parts for profile
// @router  DELET /api/profiles/body
// @access  Private with token
const removeBodyPartsProfile = asyncHandler(async (req, res, next) => {
  const possibility = req.body.possibility; // "Prohibited" OR "Desirable"
  const p = req.body.p; // "Upper" OR "Bottom"
  const body_parts = req.body.bodyPart; // Araddray
  if (body_parts.length > 0) {
    body_parts.map(async (part) => {
      let b = await bodyPart(req.user.profile_id, 'remove', p, possibility, part);
    });
  }
  const profile = await Profile.findById(req.user.profile_id);
  return successResponse(req, res, profile);
});

// @decs    Add body parts for elderly profile
// @router  POST /api/profiles/body/trainer/:id
// @access  Private with token
const addBodyPartsProfileFriend = asyncHandler(async (req, res, next) => {
  if(req.user.role === 'elderly'){
    return next(
      new ErrorResponse(`Cannot add/delete body parts friend becuse you are elderly`, 400)
    );
  }
  const myProfile = await Profile.findById(req.user.profile_id);
  const trainerOf = myProfile.trainerOf;
  let isAuthorize = await authorize(req.params.id, trainerOf);
  if (!isAuthorize)
    return next(new ErrorResponse(`User is not authorize`, 403));

  
  let userFriend = await User.findById(req.params.id);
  const possibility = req.body.possibility; // "Prohibited" OR "Desirable"
  const p = req.body.p; // "Upper" OR "Bottom"
  const body_parts = req.body.bodyPart; // Array
  if (body_parts.length > 0) {
    body_parts.map(async (part) => {
      let b = await bodyPart(userFriend.profile_id, 'add', possibility, p, part);
    });
  }
  const profile = await Profile.findById(userFriend.profile_id);
  return successResponse(req, res, profile);
});

// @decs    remove body parts for elderly profile
// @router  DELET /api/profiles/body/trainer/:id
// @access  Private with token
const removeBodyPartsProfileFriend = asyncHandler(async (req, res, next) => {
  if(req.user.role === 'elderly'){
    return next(
      new ErrorResponse(`Cannot add/delete body parts friend becuse you are elderly`, 400)
    );
  }
  const myProfile = await Profile.findById(req.user.profile_id);
  const trainerOf = myProfile.trainerOf;
  let isAuthorize = await authorize(req.params.id, trainerOf);
  if (!isAuthorize)
    return next(new ErrorResponse(`User is not authorize`, 403));

  
  let userFriend = await User.findById(req.params.id);
  const possibility = req.body.possibility; // "Prohibited" OR "Desirable"
  const p = req.body.p; // "Upper" OR "Bottom"
  const body_parts = req.body.bodyPart; // Array
  if (body_parts.length > 0) {
    body_parts.map(async (part) => {
      let b = await bodyPart(userFriend.profile_id, 'remove', possibility, p, part);
    });
  }
  const profile = await Profile.findById(userFriend.profile_id);
  return successResponse(req, res, profile);
});

// @decs    get all meetings for profile
// @router  GET /api/profiles/scheduled/
// @access  Private with token
const scheduledMeetings = asyncHandler(async(req, res, next)=> {
  let meetings = [];
  const myProfile = await Profile.findById(req.user.profile_id);
  if(myProfile){
    const future_meeting_id = myProfile.future_meeting_id;
    const performed_meeting_id = myProfile.performed_meeting_id;

    for(let i=0; i<future_meeting_id.length; i++){
      req.params.id = future_meeting_id[i];
      const meeting = await getMeetings(req, res, next);
      meetings.push(meeting);
    }
    for(let i=0; i<future_meeting_id.length; i++){
      req.params.id = future_meeting_id[i];
      const meeting = await getMeetings(req, res, next);
      meetings.push(meeting);
    }
    successResponse(req, res, {meetings});
}});

// @decs    get meeting for profile
// @router  GET /api/profiles/scheduled/:id
// @access  Private with token
const scheduledMeeting = asyncHandler(async(req, res, next)=> {
  if(!req.params.id){
    return next(new ErrorResponse('missing id param', 401));
  }

  await getMeetings(req, res, next)
  .then(data => {
    let meeting = data.meetings.filter(meet => meet._id === req.params.id);
    if(!meeting)
      return next(new ErrorResponse(`don't have meeting with id: ${req.params.id}`, 401));
    return successResponse(req, res, { meeting });
  })
  .catch(err => {
    console.error(err);
    return next(new ErrorResponse(err, 401));
  });
});


module.exports = {
  getProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  createProfileFriend,
  updateProfileFriend,
  deleteProfileFriend,

  addBodyPartsProfile,
  addBodyPartsProfileFriend,

  removeBodyPartsProfile,
  removeBodyPartsProfileFriend,

  scheduledMeetings,
  scheduledMeeting
};
