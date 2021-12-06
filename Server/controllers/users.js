const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { createToken } = require('../utils/tokenResponse');
const { successResponse } = require('../utils/successResponse');

const { validate, User } = require('../models/users');
const bcrypt = require('bcrypt');
const gravatar = require('gravatar');

// @desc    Get all users
// @route   GET /api/users/
// @access  Public
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    return successResponse(req, res, { users });
  } catch (e) {
    next(new ErrorResponse('users not found', 404));
  }
};

// @desc    Get all user with query
// @route   GET /api/users/search?password[lte]=1000 ,api/users/search?password[lte]=1000&val[gt]=1010 ,/api/users/search?user=shani
// @route   GET /api/users/search?selct=val1,val2,val3, /api/users/search?selct=user,email
// @route   GET /api/users/search?selct=user,email&sort=-user (in sort field minous or not - This reverses the sort order)
// @access  Public
const searchUserByQuery = async (req, res, next) => {
  try {
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
const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse(`user not found by id of: ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    user: user
  });
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

  const user = await User.create(req.body);
  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Pablic
const loginUser = async (req, res, next) => {
  try {
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
    if (req.body.email) user = await User.findOne({ email: req.body.email })
    else if (req.body.username) user = await User.findOne({ username: req.body.username })
    console.log(user);

    if (user) {
      // Checks if the password matches the user
      let validPass = await bcrypt.compare(req.body.password, user.password);
      if (!validPass) {
        return next(new ErrorResponse(`Password does not match`, 401));
      }
      else {
        let token = createToken(user._id, user.email, user.username);
        console.log(token);
        res.status(200).json({
          success: true,
          token: token
        });
      }
    }
    else {
      if (req.body.email)
        return next(new ErrorResponse(`user not found by email of: ${req.body.email}`, 404));
      else if (req.body.username)
        return next(new ErrorResponse(`user not found by username of: ${req.body.username}`, 404));
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
  loginUser,
  searchUserByQuery
};
