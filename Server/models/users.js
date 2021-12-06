const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

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
    index: true
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
  director: {  //Indicates of the user-manager of this user (only one menger!)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }
});
const User = mongoose.model('users', userSchema);
module.exports = { User };
