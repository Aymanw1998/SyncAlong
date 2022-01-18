const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { successResponse } = require('../utils/successResponse');
const { SocialNetwork } = require('../models/social_networks');
const { User } = require('../models/users');
// @desc    Get all socialnetworks
// @route   GET /api/socialnetworks/
// @access  Public
const getSocialNetworks = asyncHandler(async (req, res, next) => {
  const social = await SocialNetwork.find();
  return successResponse(req, res, { social });
});

// @desc    Get single socialnetwork
// @route   GET /api/socialnetworks/my
// @access  Private with token
const getSocialNetwork = asyncHandler(async (req, res, next) => {
  const social = await SocialNetwork.findOne({ user: req.user._id });
  return successResponse(req, res, { social });
});

// @desc    Create new socialnetwork
// @route   POST /api/socialnetworks/
// @access  Private with token body is nothing
const createSocialNetwork = asyncHandler(async (req, res, next) => {
  let body = {
    user: req.user._id,
    followers: [],
    following: [],
    connected: false
  };
  const social = await SocialNetwork.create(body);
  return successResponse(req, res, social);
});

// @desc    Update socialnetwork
// @route   PUT /api/socialnetworks/
// @access  Private with token
const updateSocialNetwork = asyncHandler(async (req, res, next) => {
  let data = await SocialNetwork.updateOne({ user: req.user._id }, req.body, {
    $addToSet: { updateAt: Date.now() }
  });
  return successResponse(req, res, { data });
});

// @desc    Delete socialnetwork
// @route   DELETE /api/socialnetworks/
// @access  Private with token
const deleteSocialNetwork = asyncHandler(async (req, res, next) => {
  SocialNetwork.deleteOne({ user: req.user._id }, (err, data) => {
    if (err) {
      return next(new ErrorResponse(`delete failed`, 400));
    }
    return successResponse(req, res, { data });
  });
});

// @desc    ADD following
// @route   POST /api/socialnetworks/following/:username
// @access  Private with token
const addFollowing = asyncHandler(async (req, res, next) => {
  const following = await User.findOne({ username: username });

  const mysocial = SocialNetwork.findOneAndUpdate(
    { user: req.user._id },
    {
      $addToSet: { following: following._id },
      $addToSet: { updateAt: Date.now() }
    }
  );
  const anothersocial = SocialNetwork.findOneAndUpdate(
    { user: following._id },
    {
      $addToSet: { followers: req.user._id },
      $addToSet: { updateAt: Date.now() }
    }
  );
  return successResponse(req, res, {
    mysocial: mysocial,
    anothersocial: anothersocial
  });
});

// @desc    Remove following
// @route   DELETE /api/socialnetworks/following/:username
// @access  Private with token
const removeFollowing = asyncHandler(async (req, res, next) => {
  const following = await User.findOne({ username: username });

  const mysocial = await SocialNetwork.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { following: following._id }, $addToSet: { updateAt: Date.now() } }
  );
  const anothersocial = await SocialNetwork.findOneAndUpdate(
    { user: following._id },
    { $pull: { followers: req.user._id }, $addToSet: { updateAt: Date.now() } }
  );
  return successResponse(req, res, {
    mysocial: mysocial,
    anothersocial: anothersocial
  });
});

// @desc    change connection
// @route   PUT /api/socialnetworks/connection/
// @access  Private with token
const changeConnection = asyncHandler(async (req, res, next) => {
  const mysocial = await SocialNetwork.findOne({ user: req.user._id });
  if (mysocial) {
    const connected = !mysocial.connected;
    mysocial = await SocialNetwork.findOneAndUpdate(
      { user: req.user._id },
      {
        $addToSet: { connected: connected },
        $addToSet: { updateAt: Date.now() }
      }
    );
    return successResponse(req, res, {
        mysocial: mysocial
    });
  } else {
    return next(new ErrorResponse('dont have social', 401));
  }
});
module.exports = {
  getSocialNetworks,
  getSocialNetwork,
  createSocialNetwork,
  updateSocialNetwork,
  deleteSocialNetwork,
  addFollowing,
  removeFollowing,
  changeConnection
};
