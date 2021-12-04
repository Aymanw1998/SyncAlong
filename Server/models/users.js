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
    minlength: [6, 'password must be 6 digits long'],
    required: [true, "Please add a password"],
  },
  avatar: String,
  createdAt: {
    type: Date, default: Date.now
  },
  role: {
    type: String,
    enum: ['user', 'elderly'],
    default: 'user',
  },
});

userSchema.methods.generateAuthToken = () => {
  const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY);
  return token;
};
const User = mongoose.model('users', userSchema);

const validate = (user) => {
  const schema = Joi.object({
    user: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  return schema.validate(user);
};

module.exports = { User, validate };
