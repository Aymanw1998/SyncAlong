const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  user: {
    type: String,
    required: [true, 'Please add a user name'],
  },
  username: {
    type: String,
    unique: true,
    required: [true, "Please add a nick name"],
    index: true
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please add an email"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
    index: true
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false
  },
  avatar: String,
  createdAt: {
    type: Date, default: Date.now
  },
  updateAt: {
    type: Date, default: Date.now
  },
  role: {
    type: String,
    enum: ['user', 'elderly'],
    default: 'user',
  },
  trainerOf: [{  //Indicates of the user-manager of elderly user who craeted by this.user._id (i can open user to my grama & naibar)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});


// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Generate email confirm token
userSchema.methods.generateEmailConfirmToken = function (next) {
  // email confirmation token
  const confirmationToken = crypto.randomBytes(20).toString('hex');

  this.confirmEmailToken = crypto
    .createHash('sha256')
    .update(confirmationToken)
    .digest('hex');

  const confirmTokenExtend = crypto.randomBytes(100).toString('hex');
  const confirmTokenCombined = `${confirmationToken}.${confirmTokenExtend}`;
  return confirmTokenCombined;
};


const User = mongoose.model('users', userSchema);
module.exports = { User };