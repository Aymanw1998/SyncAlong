const asyncHandler = require('../middleware/async');

const { validate, user } = require('../models/user_model');
const bcrypt = require('bcrypt');

// @desc    Get all users
// @route   GET /api/users/
// @access  Public
const getUsers = async (req, res, next) => {
  try {
    const AllUser = await user.find().select('-__v');
    res.status(200).json({
      success: true,
      AllUsers: AllUser
    });
  } catch (e) {
    res.status(err.status).json({
      success: false,
      msg: err.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:username
// @access  Public
const getUser = async (req, res, next) => {
 try {
    console.log('Hi');
    const User = await user.findOne({ username: req.params.username }).select('-__v');
    console.log(User);
    res.status(200).json({
      success: true,
      user: User
    });
  } catch (err) {
    res.status(err.status).json({
      success: false,
      msg: err.message
    });
  }
};

// @desc    Create new user
// @route   POST /api/users/
// @access  Private
const createUser = async (req, res, next) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message.red);
    }
    const User = new user(req.body);
    const salt = await bcrypt.genSalt(Number(process.env.SALT_KEY));
    console.log(User.password);
    User.password = await bcrypt.hash(User.password, salt);
    console.log(User);
    await User.save();
    res.status(200).json({
      success: true,
      msg: 'Create new user'
    });
  } catch (err) {
    res.status(err.status).json({
      success: false,
      msg: err.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:username
// @access  Private
const updateUser = async (req, res, next) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res.status(error.status).send(error);
    }
    console.log('Hi');
    const {username, password, email} = req.body;
    const User = await user.findOne({ username: req.params.username }).select('-__v');
    if(req.params.username !== username){
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
    await user.updateOne({_id: updateUser._id}, updateUser);
    res.status(200).json({
      success: true,
      msg: `Update user with username: ${req.params.username}`,
      user: updateUser
    });
  } catch (err) {
    res.status(err.status).json({
      success: false,
      msg: err.message
    });
  }
};

// @desc    Delete single user
// @route   DELET /api/users/:username
// @access  Private
const deleteUser = async (req, res, next) => {
    try {
        console.log('Hi');
        const User = await user.findOne({ username: req.params.username }).select('-__v');
        if(!User){
            return res.status(401).json({
                success: false,
                msg: "the user with username: " +req.params.username + " is not exist"
              });
        }
        console.log(User);
        await user.deleteOne({_id: User._id});
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
  deleteUser
};
