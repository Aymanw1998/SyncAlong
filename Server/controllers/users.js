const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { createToken } = require('../utils/tokenResponse');
const { successResponse } = require('../utils/successResponse');
const { User } = require('../models/users');
const bcrypt = require('bcrypt');
const gravatar = require('gravatar');
const crypto = require('crypto');
const { authorize } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');


// @desc    Get all users
// @route   GET /api/users/
// @access  Public
const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  return successResponse(req, res, { users });
});

// @desc    Get all user with query
// @route   GET /api/users/search?password[lte]=1000 ,api/users/search?password[lte]=1000&user[gt]=1010 ,/api/users/search?user=shani
// @route   GET /api/users/search?selct=val1,val2,val3, /api/users/search?selct=user,email
// @route   GET /api/users/search?selct=user,email&sort=-user (in sort field minous or not - This reverses the sort order)
// @access  Public
const searchUserByQuery = asyncHandler(async (req, res, next) => {
  // try {
  let query;
  // Copy req.query
  let reqQuery = { ...req.query };
  //Fielde to exclude
  const removeFields = ['selct', 'sort'];
  // Loop over removeField and delete them from the reqQuery
  removeFields.forEach(pram => delete reqQuery[pram])
  // Create query string
  let querStr = JSON.stringify(req.query);
  // Create operators ($gt ,$gte etc)
  querStr = querStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)  //g refrisent glabal 

  //Finding resorce
  query = User.find(JSON.parse(querStr));

  //Select Fields
  if (req.query.select) {
    const fieldes = req.query.select.split(',').join(' ');
    query = query.select(fieldes)
  }
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy)
  } else {
    query = query.sort('-createdAt');
  }

  //Executing 
  const data = await query;
  res.status(200).json({
    success: true,
    count: data.length,
    data: data
  });
  // } catch (e) {
  //   next(new ErrorResponse('users not found', 404));
  // }
});

// @desc    Get single user
// @route   GET /api/users/loged
// @access  Privit with token
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req._id);
  return successResponse(req, res, { user });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Pablic
const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse(`user not found by id of: ${req.params.id}`, 404));
  }
  return successResponse(req, res, { user });
});

// @desc    Create new user
// @route   POST /api/users/
// @access  Pablic
const createUser = asyncHandler(async (req, res, next) => {
  //Defines the level of encryption
  let salt = await bcrypt.genSalt(Number(process.env.SALT_KEY));
  req.body.password = await bcrypt.hash(req.body.password, salt);
  //Create avater for poto:
  const avatar = gravatar.url(req.body.email, {
    s: '200',
    r: 'pg',
    d: 'mm'
  });
  req.body.avatar = avatar;

  //when logedIn user creating a frined - it is an elderly frind.
  if (req.user) {
    req.body.role = 'elderly';
    req.body.createdBy = req.user._id;
  }

  const user = await User.create(req.body);
  if (req.body.role === 'elderly') return user;
  else {
    res.status(201).json({
      success: true,
      data: user
    });
  }
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Pablic
const loginUser = asyncHandler(async (req, res, next) => {
  //validation of elements needed for logIn
  if (!req.body.email && !req.body.username) {
    if (!req.body.password)
      return next(new ErrorResponse(`Please provid email/username and password`, 401));
    return next(new ErrorResponse(`Please provid an email/username`, 401));
  }
  if (!req.body.password)
    return next(new ErrorResponse(`Please provid a password`, 401));

  // validation if user exists in db
  let user;
  if (req.body.email) user = await User.findOne({ email: req.body.email }).select('+password');
  else if (req.body.username) user = await User.findOne({ username: req.body.username }).select('+password');
  console.log(user);

  if (user) {
    // Checks if the password matches the user
    let validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
      return next(new ErrorResponse(`Password does not match`, 401));
    }
    else {
      sendTokenResponse(user, 200, res);
    }
  }
  else {
    if (req.body.email)
      return next(new ErrorResponse(`user not found by email of: ${req.body.email}`, 404));
    else if (req.body.username)
      return next(new ErrorResponse(`user not found by username of: ${req.body.username}`, 404));
  }
});

// @desc    Update user
// @route   PUT /api/users/
// @access  Private
const updateUser = asyncHandler(async (req, res, next) => {
  req.body.updateAt = Date.now();
  let data = await User.updateOne({ _id: req.user.id }, req.body);
  return successResponse(req, res, { data });
});

// @desc    Delete single user
// @route   DELET /api/users/
// @access  Private
const deleteUser = asyncHandler(async (req, res, next) => {
  //TO DO - handle user createdBy another user - need to delet  user in trainer array 
  //TO DO - delete all data related to this user._id in all colections in db 
  User.deleteOne({ _id: req.user.id }, (err, data) => {
    if (err) {
      return next(new ErrorResponse(`delet failed`, 400));
    }
    return successResponse(req, res, { data });
  })
});


// @desc    Create a frind - Elderly user with logIn-user account
// @route   POST /api/users/trainer
// @access  Private
const createFriend = asyncHandler(async (req, res, next) => {
  let user = await createUser(req, res, next);
  if (user) {
    try {
      let data = await User.findOneAndUpdate({ _id: req.user.id },
        { $addToSet: { trainerOf: user } });
      res.status(200).json({
        success: true,
        addUser: user,
        myUpdate: data,
      });
    }
    catch (err) {
      next(err);
    }
  }
  else return next(new ErrorResponse(`failed to craete elderly user`, 400));
});


// @desc    Update Elderly Friend
// @route   PUT /api/users/trainer/:id
// @access  Private
const updateFriend = asyncHandler(async (req, res, next) => {
  let isAuthorize = await authorize(req.params.id, req.user.trainerOf);
  if (!isAuthorize) return next(new ErrorResponse(`User is not authorize`, 403));

  req.body.updateAt = Date.now();
  let data = await User.updateOne({ _id: req.params.id }, req.body);
  return successResponse(req, res, { data });
});

// @desc    Delete Elderly Friend from list
// @route   DELETE /api/users/trainer/:id
// @access  Private
// ****not tested****
const deleteFriend = asyncHandler(async (req, res, next) => {
  let isAuthorize = await authorize(req.params.id, req.user.trainerOf);
  if (!isAuthorize) return next(new ErrorResponse(`User is not authorize`, 403));

  //delete from the array of user thet crared 
  //!!!!Remeber To Myself!!!!! in client-side need a pop-up saying to the user all documents,video and activity with this user._id will be deleted. 
  //If they will not be deleted the server may call a non-existent _id and throw an Error while trying to get simple data from db
  let data = await User.findOneAndUpdate({ _id: req.user.id },
    { $pull: { trainerOf: req.params.id } });
  if (data) {
    // delete user from db
    //TO DO-handle delete from all req from this delete user._id -from all colections in db
  }
});

// @desc    forgat password 
// @route   PUT /api/users/forgatPassword
// @access  Pablic
const forgatPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new ErrorResponse('There is no user with that email', 404));

  const resetToken = user.getResetPasswordToken();
  console.log(resetToken);
  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host',
  )}/api/users/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });
    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc      Reset password
// @route     PUT /api/users/resetpassword/:resettoken
// @access    Public
const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  let salt = await bcrypt.genSalt(Number(process.env.SALT_KEY));
  user.password = await bcrypt.hash(req.body.password, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;


  await user.save();

  sendTokenResponse(user, 200, res);
});


module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  loginUser,
  searchUserByQuery,
  forgatPassword,
  resetPassword,

  createFriend,
  updateFriend,
  deleteFriend
};


// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  let token = createToken(user._id, user.email, user.username);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};
