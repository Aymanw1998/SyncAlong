const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const BodyPart = ['head', 'right hand', 'left hand', 'right leg', 'left leg', 'left'];

const profileSchema = new mongoose.Schema({
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
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
  ProhibitedBodyUpper: [{ // Prohibited areas in the body
    type: String,
    enum: BodyPart,
  }],
  DesirableBodyUpper: [{ // Desirable areas in the body
    type: String,
    enum: BodyPart,
  }],
  ProhibitedBodyBottom: [{ // Prohibited areas in the body
    type: String,
    enum: BodyPart,
  }],
  DesirableBodyBottom: [{ // Desirable areas in the body
    type: String,
    enum: BodyPart,
  }],
  //פעילות רצויה באזורים בגוף
});
//רוצה להראות ל?
const Profile = mongoose.model('profiles', profileSchema);
module.exports = { Profile, BodyPart };