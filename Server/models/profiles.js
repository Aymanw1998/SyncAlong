const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const physical_movements = [
  'Moving hands up and down',
  'Moving hands to the sides',
  'Lifting legs for a while',
  'Raise both hands and move left and right'
];

const body_pains = [
  'upper back',
  'lower back',
  'right shoulder',
  'left shoulder',
  'right knee',
  'left knee',
  'ankle',
  'joint',
  'chest',
  'neck',
  'right hand',
  'left hand',
  'right leg',
  'left leg',
  'right foot',
  'left foot'
];
const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Enter you full name']
  },
  trainerOf: [
    {
      //Indicates of the user-manager of elderly user who craeted by this.user._id (i can open user to my grama & naibar)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    }
  ],
  traineeOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  physical_movements: [{
    type: String
  }],
  body_pains: [{
    type: String
  }],
  future_meeting_id: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'meetings'
    }
  ],
  performed_meeting_id: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'meetings'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updateAt: {
    type: Date,
    default: Date.now
  }
});
//רוצה להראות ל?
const Profile = mongoose.model('profiles', profileSchema);
module.exports = { Profile };
