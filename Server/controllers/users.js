const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { createToken } = require('../utils/tokenResponse');

const { validate, User } = require('../models/users');
const bcrypt = require('bcrypt');
const gravatar = require('gravatar');

// @desc    Get all users
// @route   GET /api/users/
// @access  Public
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      users: users
    });
  } catch (e) {
    next(new ErrorResponse('users not found', 404));
  }
};

// @desc    Get single user
// @route   GET /api/users/
// @access  Privit with token
const getUser = async (req, res, next) => {
  console.log('ddddd', req._id);
  try {
    const user = await User.findById(req._id);
    res.status(200).json({
      success: true,
      user: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Pablic
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ErrorResponse(`user not found by id of: ${req.params.id}`, 404));
    }
    res.status(200).json({
      success: true,
      user: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new user
// @route   POST /api/users/
// @access  Pablic
const createUser = async (req, res, next) => {
  try {
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

    const user = await User.create(req.body);
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Login user
// @route   POST /api/users/login
// @access  Pablic
const loginUser = async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.body.email })
    if (user) {
      // Checks if the password matches the user
      let validPass = await bcrypt.compare(req.body.password, user.password);
      if (!validPass) {
        return next(new ErrorResponse(`Password does not match`, 401));
      }
      else {
        let token = createToken(user._id, user.email, user.user);
        console.log(token);
        res.status(200).json({
          success: true,
          token: token
        });
      }
    }
    else {
      return next(new ErrorResponse(`user not found by email of: ${req.body.email}`, 404));
    }
  } catch (err) {
    next(err);
  }
};


// @desc    Update user
// @route   PUT /api/users/
// @access  Private
const updateUser = async (req, res, next) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res.status(error.status).send(error);
    }
    const { username, password, email } = req.body;
    const user = await User.findById(req._id);
    if (req.params.username !== username) {
      return res.status(401).json({
        success: false,
        msg: "username is not match in url and body"
      });
    }
    const updateUser = new user({
      _id: User._id,
      username: username,
      password: password,
      email: email,
    });
    console.log(updateUser);
    await user.updateOne({ _id: updateUser._id }, updateUser);
    res.status(200).json({
      success: true,
      msg: `Update user with username: ${req.params.username}`,
      user: updateUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete single user
// @route   DELET /api/users/
// @access  Private
const deleteUser = async (req, res, next) => {
  try {
    console.log('Hi');
    const User = await user.findOne({ username: req.params.username }).select('-__v');
    if (!User) {
      return res.status(401).json({
        success: false,
        msg: "the user with username: " + req.params.username + " is not exist"
      });
    }
    console.log(User);
    await user.deleteOne({ _id: User._id });
    res.status(200).json({
      success: true,
      msg: `Delete user with username: ${id}`,
    });
  } catch (err) {
    res.status(err.status).json({
      success: false,
      msg: err.message
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  loginUser
};
