const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { createToken } = require('../utils/tokenResponse');
const { successResponse } = require('../utils/successResponse');
const { Profile } = require('../models/profiles');
const bcrypt = require('bcrypt');
const gravatar = require('gravatar');
const crypto = require('crypto');
const { authorize } = require('../middleware/auth');

const { deleteFriend } = require('./users');
const { User } = require('../models/users');

const { getMeetings } = require('./meetings');

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
  let profile = await Profile.findById(req.user.profile_id);

  if (profile && !req.params.id) {
    return next(
      new ErrorResponse('you have profile, you must not create another', 401)
    );
  }

  profile = await Profile.create(req.body);

  if (req.body.PM) {
    req.body.PM.map(async (p) => {
      await Profile.findByIdAndUpdate(profile._id, {
        $addToSet: { physical_movements: p }
      });
    });
  }
  if (req.body.BP) {
    req.body.BP.map(async (b) => {
      await Profile.findByIdAndUpdate(profile._id, {
        $addToSet: { body_pains: b }
      });
    });
  }
  if (req.params.id) return profile;
  else req.user.profile_id = profile.id;

  let data = await User.findByIdAndUpdate(req.user._id, {
    profile_id: profile._id
  });

  profile = await Profile.findById(profile._id);
  successResponse(req, res, profile);
});

// @desc    Update profile
// @route   PUT /api/profiles/
// @access  Private with token
const updateProfile = asyncHandler(async (req, res, next) => {
  req.body.updateAt = Date.now();

  let profile = await Profile.findById(req.user.profile_id);
  if (req.body.PM) {
    profile.physical_movements.map(async (p) => {
      await Profile.findByIdAndUpdate(profile._id, {
        $pull: { physical_movements: p }
      });
    });
    req.body.PM.map(async (p) => {
      await Profile.findByIdAndUpdate(profile._id, {
        $addToSet: { physical_movements: p }
      });
    });
  }
  if (req.body.BP) {
    profile.body_pains.map(async (b) => {
      await Profile.findByIdAndUpdate(profile._id, {
        $pull: { body_pains: b }
      });
    });
    req.body.BP.map(async (b) => {
      await Profile.findByIdAndUpdate(profile._id, {
        $addToSet: { body_pains: b }
      });
    });
  }
  let data = await Profile.updateOne({ _id: profile._id }, req.body);
  return successResponse(req, res, 'update done!');
});

// @desc    Delete profile
// @route   DELETE /api/profiles/
// @access  Private with token
const deleteProfile = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'elderly') {
    return next(
      new ErrorResponse(`you cannot delete yourself, you are elderly`, 401)
    );
  } else {
    //TO DO - delete your trainees
    const profile = await Profile.findById(req.user.profile_id);
    const trainerOf = profile.trainerOf;
    if (trainerOf.length > 0) {
      for (var i = 0; i < trainerOf.length; i++) {
        let id = trainerOf[i]; //user elderly
        console.log('id', id);
        req.params.id = id;
        await deleteProfileFriend(req, res,next);
      }
    }
    //TO DO - delete all data related to this user._id in all colections in db
    await Profile.deleteOne({ _id: req.user.profile_id }, (err, data) => {
      if (err) {
        return next(new ErrorResponse(`delete failed`, 400));
      }
      return successResponse(req, res, { data });
    });
  }
});

const getProfileFriend = asyncHandler(async (req, res, next) => {
  if (!req.user.profile_id) {
    return next(
      new ErrorResponse(`Cannot get friend before create your elderlys`, 400)
    );
  } else if (req.user.role === 'elderly') {
    return next(
      new ErrorResponse(`Cannot get friend becuse you are elderly`, 400)
    );
  }
  const profile = await Profile.findById(req.user.profile_id);
  const trainerOf = profile.trainerOf;
  let isAuthorize = await authorize(req.params.id, trainerOf);
  if (!isAuthorize)
    return next(new ErrorResponse(`User is not authorize`, 403));

  if (trainerOf.length > 0) {
    for (var i = 0; i < trainerOf.length; i++) {
      if (trainerOf[i] == req.params.id) {
        let userTra = await User.findById(req.params.id);
        let profileTra = await Profile.findById(userTra.profile_id);
        return successResponse(req, res, profileTra);
      }
    }
  }
  return next(
    new ErrorResponse(
      `the user don't have elderly with id: ${req.params.id}`,
      401
    )
  );
});

// @desc Create elderly profile
// @route POST /api/profiles/trainer/:id (id user)
// @access Private with token
const createProfileFriend = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'elderly') {
    return next(
      new ErrorResponse(`Cannot create friend becuse you are elderly`, 400)
    );
  }
  let testExistUser = await User.findById(req.params.id);
  if (!testExistUser) {
    return next(
      new ErrorResponse(
        `The user with id: ${req.params.id} does not exist`,
        400
      )
    );
  }
  let profileFriend = await createProfile(req, res, next);
  if (profileFriend) {
    try {
      //connection between the profile and his user
      let data = await User.findByIdAndUpdate(req.params.id, {
        profile_id: profileFriend._id
      });
      // connection between add traineeOf on profileElderly
      data = await Profile.findByIdAndUpdate(profileFriend._id, {
        traineeOf: req.user._id
      });
      // connection between add trainerOf on profileTrainer
      data = await Profile.findByIdAndUpdate(req.user.profile_id, {
        $addToSet: { trainerOf: req.params._id }
      });

      profileFriend = await Profile.findById(profileFriend._id);
      successResponse(req, res, profileFriend);
    } catch (e) {
      next(e);
    }
  }
});

// @desc Update elderly profile
// @route PUT /api/profiles/trainer/:id (id user)
// @access Private with token
const updateProfileFriend = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'elderly') {
    return next(
      new ErrorResponse(`Cannot update friend becuse you are elderly`, 400)
    );
  }
  let testExistUser = await User.findById(req.params.id);
  if (!testExistUser) {
    return next(
      new ErrorResponse(
        `The user with id: ${req.params.id} does not exist`,
        400
      )
    );
  }
  const myProfile = await Profile.findById(req.user.profile_id);
  const trainerOf = myProfile.trainerOf;
  let isAuthorize = await authorize(req.params.id, trainerOf);
  if (!isAuthorize)
    return next(new ErrorResponse(`User is not authorize`, 403));

  req.body.updateAt = Date.now();
  req.body.updateAt = Date.now();

  let profile = undefined;
  if (trainerOf.length > 0) {
    var b = false;
    for (var i = 0; i < trainerOf.length && !b; i++) {
      if (trainerOf[i] == req.params.id) {
        let user = await User.findById(req.params.id);
        profile = await Profile.findById(user.profile_id);
        b = true;
      }
    }
  }
  if (!profile) {
    return next(new ErrorResponse(`the profile is not exist`, 403));
  }
  if (req.body.PM) {
    profile.physical_movements.map(async (p) => {
      await Profile.findByIdAndUpdate(profile._id, {
        $pull: { physical_movements: p }
      });
    });
    req.body.PM.map(async (p) => {
      await Profile.findByIdAndUpdate(profile._id, {
        $addToSet: { physical_movements: p }
      });
    });
  }
  if (req.body.BP) {
    profile.body_pains.map(async (b) => {
      await Profile.findByIdAndUpdate(profile._id, {
        $pull: { body_pains: b }
      });
    });
    req.body.BP.map(async (b) => {
      await Profile.findByIdAndUpdate(profile._id, {
        $addToSet: { body_pains: b }
      });
    });
  }
  let data = await Profile.updateOne({ _id: profile._id }, req.body);
  return successResponse(req, res, 'update done!');
});

// @desc Delete elderly profile
// @route DELETE /api/profiles/trainer/:id
// @access Private with token
const deleteProfileFriend = asyncHandler(async (req, res, next) => {
  if (!req.user.profile_id) {
    return next(
      new ErrorResponse(
        `Cannot delete friend before create profile to your user`,
        400
      )
    );
  }
  const profile = await Profile.findById(req.user.profile_id);
  const trainerOf = profile.trainerOf;
  let isAuthorize = await authorize(req.params.id, trainerOf);
  if (!isAuthorize)
    return next(new ErrorResponse(`User is not authorize`, 403));

  //delete from the array of user thet crared
  //!!!!Remeber To Myself!!!!! in client-side need a pop-up saying to the user all documents,video and activity with this user._id will be deleted.
  //If they will not be deleted the server may call a non-existent _id and throw an Error while trying to get simple data from db
  const objId = new ObjectId(req.params.id);
  let data = await Profile.findOneAndUpdate(
    { _id: req.user.profile_id },
    { $pull: { trainerOf: objId} }
  );
  if (data) {
    const user = await User.findById(objId);
    await Profile.deleteOne({_id: user.profile_id });
  }

  return successResponse(req, res,`delete all data for user with id: ${req.params.id}`);
});

// @decs    get all meetings for profile
// @router  GET /api/profiles/scheduled/
// @access  Private with token
const scheduledMeetings = asyncHandler(async (req, res, next) => {
  let meetings = [];
  const myProfile = await Profile.findById(req.user.profile_id);
  if (myProfile) {
    const future_meeting_id = myProfile.future_meeting_id;
    const performed_meeting_id = myProfile.performed_meeting_id;

    for (let i = 0; i < future_meeting_id.length; i++) {
      req.params.id = future_meeting_id[i];
      const meeting = await getMeetings(req, res, next);
      meetings.push(meeting);
    }
    for (let i = 0; i < future_meeting_id.length; i++) {
      req.params.id = future_meeting_id[i];
      const meeting = await getMeetings(req, res, next);
      meetings.push(meeting);
    }
    successResponse(req, res, { meetings });
  }
});

// @decs    get meeting for profile
// @router  GET /api/profiles/scheduled/:id
// @access  Private with token
const scheduledMeeting = asyncHandler(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorResponse('missing id param', 401));
  }

  await getMeetings(req, res, next)
    .then((data) => {
      let meeting = data.meetings.filter((meet) => meet._id === req.params.id);
      if (!meeting)
        return next(
          new ErrorResponse(`don't have meeting with id: ${req.params.id}`, 401)
        );
      return successResponse(req, res, { meeting });
    })
    .catch((err) => {
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
  getProfileFriend,
  createProfileFriend,
  updateProfileFriend,
  deleteProfileFriend,
  scheduledMeetings,
  scheduledMeeting
};
