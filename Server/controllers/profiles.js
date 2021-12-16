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

// @desc    Get all Profiles
// @route   GET /api/profiles/
// @access  Public
const getProfiles = asyncHandler(async (req, res, next) => {
  const profiles = await Profile.find();
  return successResponse(req, res, { profiles });
});

// @desc    Get single profile
// @route   GET /api/profile/loged
// @access  Private with token
const getProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({ user: req._id });
  return successResponse(req, res, { profile });
});

// @desc    Create new profile
// @route   POST /api/profiles/
// @access  Private with token
const createProfile = asyncHandler(async (req, res, next) => {
  //I have user and _id and email
  const profile = await Profile.create(req.body);

  if (req.params.id) return profile;

  let data = await Profile.findOneAndUpdate(
    { _id: profile._id },
    { $addToSet: { user: req.user._id } }
  );
  res.status(201).json({
    success: true,
    data: {
      profile: profile,
      user: req.user
    }
  });
});

// @desc    Update profile
// @route   PUT /api/profiles/
// @access  Private with token
const updateProfile = asyncHandler(async (req, res, next) => {
  req.body.updateAt = Date.now();
  let data = await Profile.updateOne({ user: req.user.id }, req.body);
  return successResponse(req, res, { data });
});

const deleteProfile = asyncHandler(async (req, res, next) => {
  Profile.deleteOne({ user: req.user.id }, (err, data) => {
    if (err) {
      return next(new ErrorResponse(`delete failed`, 400));
    }
    return successResponse(req, res, { data });
  });
});

// @desc Create elderly profile
// @route POST /api/profiles/trainer/:id
// @access Private with token
const createProfileFriend = asyncHandler(async (req, res, next) => {
  let isAuthorize = await authorize(req.params.id, req.user.trainerOf);
  if (!isAuthorize)
    return next(new ErrorResponse(`User is not authorize`, 403));

  let profile = createProfile(req, res, next);
  let data = await Profile.findOneAndUpdate(
    { _id: profile._id },
    { $addToSet: { user: req.params.id } }
  );
  res.status(201).json({
    success: true,
    data: {
      profile: profile,
      user: req.user
    }
  });
});

// @desc Update elderly profile
// @route PUT /api/profiles/trainer/:id
// @access Private with token
const updateProfileFriend = asyncHandler(async (req, res, next) => {
  let isAuthorize = await authorize(req.params.id, req.user.trainerOf);
  if (!isAuthorize)
    return next(new ErrorResponse(`User is not authorize`, 403));

  req.body.updateAt = Date.now();
  let data = await Profile.updateOne({ _id: req.params.id }, req.body);
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
//          action => ["add" OR "remove"],
//          possibility => ["Prohibited" OR "Desirable"],
//          body_Part => ['head', 'right hand', 'left hand', 'right leg', 'left leg', 'left']
// @route
// @access  Private (For another functions)
const bodyPart =async (id, action, possibility, body_Part) => {
  var isCorrect = false;
  BodyPart.map(p => {
    if(p === body_Part){
      isCorrect = true;
    }
  });

  if (!isCorrect) {
    return false;
  }
  if (action === 'add') {
    if (possibility === 'Desirable' || possibility === 'desirable') {
      try {
        let profile = await Profile.findOneAndUpdate(
          { _id: id },
          { 
            $addToSet: { Dbody: body_Part },
            $pull: {Pbody: body_Part }
          }
        );
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    } else {
      // possibility === "prohibited"
      try {
        let profile = await Profile.findOneAndUpdate(
          { _id: id },
          { 
            $addToSet: { Pbody: body_Part },
            $pull: {Dbody: body_Part }          
          }
        );
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    }
  } else {
    // action === "remove"
    if (possibility === 'Desirable' || possibility === 'desirable') {
      try {
        let profile = await Profile.findOneAndUpdate(
          { _id: id },
          { $pull: { Dbody: body_Part } }
        );
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    } else {
      // possibility === "prohibited"
      try {
        let profile = await Profile.findOneAndUpdate(
          { _id: id },
          { $pull: { Pbody: body_Part } }
        );
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    }
  }
};

// @decs    Add body parts for profile
// @router  POST /api/profiles/body
// @access  Private with token
const addBodyPartsProfile = asyncHandler(async (req, res, next) => {
  let profile = await Profile.findOne({ user: req._id });
  const possibility = req.body.possibility; // "Prohibited" OR "Desirable"
  const body_parts = req.body.bodyPart; // Array
  if(body_parts.length > 0)
  {
    body_parts.map(async(part) => {
      let b = await bodyPart(profile._id, 'add', possibility, part);
    });
  }
  profile = await Profile.findOne({ user: req._id });
  return successResponse(req, res, { profile });
});

// @decs    remove body parts for profile
// @router  DELET /api/profiles/body
// @access  Private with token
const removeBodyPartsProfile = asyncHandler(async (req, res, next) => {
  let profile = await Profile.findOne({ user: req._id });
  const possibility = req.body.possibility; // "Prohibited" OR "Desirable"
  const body_parts = req.body.bodyPart; // Araddray
  if(body_parts.length > 0)
  {
    body_parts.map(async(part) => {
      let b = await bodyPart(profile._id, 'remove', possibility, part);
    });
  }
  profile = await Profile.findOne({ user: req._id });
  return successResponse(req, res, { profile });
});

// @decs    Add body parts for elderly profile
// @router  POST /api/profiles/body/trainer/:id
// @access  Private with token
const addBodyPartsProfileFriend = asyncHandler(async (req, res, next) => {
  let isAuthorize = await authorize(req.params.id, req.user.trainerOf);
  if (!isAuthorize)
    return next(new ErrorResponse(`User is not authorize`, 403));

  let profile = await Profile.findOne({ _id: req.params.id });
  const possibility = req.body.possibility; // "Prohibited" OR "Desirable"
  const body_parts = req.body.bodyPart; // Array
  if(body_parts.length > 0)
  {
    body_parts.map(async(part) => {
      let b = await bodyPart(profile._id, 'add', possibility, part);
    });
  }
  profile = await Profile.findOne({ _id: req.params.id });
  return successResponse(req, res, { profile });
});

// @decs    remove body parts for elderly profile
// @router  DELET /api/profiles/body/trainer/:id
// @access  Private with token
const removeBodyPartsProfileFriend = asyncHandler(async (req, res, next) => {
  let isAuthorize = await authorize(req.params.id, req.user.trainerOf);
  if (!isAuthorize)
    return next(new ErrorResponse(`User is not authorize`, 403));

  let profile = await Profile.findOne({ _id: req.params.id });
  const possibility = req.body.possibility; // "Prohibited" OR "Desirable"
  const body_parts = req.body.bodyPart; // Araddray
  if(body_parts.length > 0)
  {
    body_parts.map(async(part) => {
      let b = await bodyPart(profile._id, 'remove', possibility, part);
    });
  }
  profile = await Profile.findOne({ _id: req.params.id });
  return successResponse(req, res, { profile });
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
  removeBodyPartsProfileFriend
};
