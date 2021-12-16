const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const BodyPart = ['head', 'right hand', 'left hand', 'right leg', 'left leg', 'left'];

const profileSchema = new mongoose.Schema({
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: [true, "Please choose the gender"],
  },
  weight: {
      type: Number,
      required: [true, "Please add a weight"],
  },
  height: {
      type: Number,
      required: [true, "Please add a height"],
  },
  createdAt: {
    type: Date, default: Date.now
  },
  updateAt: {
    type: Date, default: Date.now
  },
  Pbody: [{ // Prohibited areas in the body
    type: String,
    enum: BodyPart,
  }],
  Dbody: [{ // Desirable areas in the body
    type: String,
    enum: BodyPart,
  }],
});


const Profile = mongoose.model('profiles', profileSchema);
module.exports = { Profile, BodyPart };