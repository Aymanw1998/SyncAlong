const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { array } = require('joi');

const body_areas = ['arms', 'abdomen', 'legs_knees', 'lower_back', 'upper_back', 'none']

// const body_areas = [
//   'none',
//   'upper back high', 'upper back normal', 'upper back low',
//   'lower back high', 'lower back normal', 'lower back low',
//   'right shoulder high', 'right shoulder normal', 'right shoulder low',
//   'left shoulder hight', 'left shoulder normal', 'left shoulder low',
//   'right knee hight', 'right knee normal', 'right knee low',
//   'left knee hight', 'left knee normal', 'left knee low',
//   'ankle hight', 'ankle normal', 'ankle low',
//   'joint hight', 'joint normal', 'joint low',
//   'chest hight', 'chest normal', 'chest low',
//   'neck hight', 'neck normal', 'neck low',
//   'right hand hight', 'right hand normal', 'right hand low',
//   'left hand hight', 'left hand normal', 'left hand low',
//   'right leg hight', 'right leg normal', 'right leg low',
//   'left leg hight', 'left leg normal', 'left leg low',
//   'right foot hight', 'right foot normal', 'right foot low',
//   'left foot hight', 'left foot normal', 'left foot low'
// ];

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  trainerOf: [
    {
      //Indicates of the user-manager of trainee user who craeted by this.user._id (i can open user to my grama & naibar)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    }
  ],
  traineeOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  priority_activities: [{
    type: String,
    enum: body_areas
  }],
  limitations: [{
    type: String,
    enum: body_areas,
  }],
  meetings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'meetings'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updateAt: {
    type: Date,
    default: Date.now
  }
});

const Profile = mongoose.model('profiles', profileSchema);
module.exports = { Profile };
