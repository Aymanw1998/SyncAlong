const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { array } = require('joi');


// const physical_movements = [
//   'Moving hands up and down',
//   'Moving hands to the sides',
//   'Lifting legs for a while',
//   'Raise both hands and move left and right'
// ];

// The type of activity in the area of ​​the body is not necessarily a measure calculated according to this area only ... 
//Upper back is measured according to the coordinates of the hands for example
//***An activity object represents a list of activity options by working on an area in the body */
// const activities = {
//   arms: [
//     'left heand up-down on y-axis',
//     'right heand up-down on y-axis',
//     'both heands up-down on y-axis',
//     'both heands close-open on x-axis',
//     'left heand bending at angles 180to0 on x-axis',
//     'right heand bending at angles 180to0 on x-axis',
//     'both heands rotation on x-axis'
//   ],
//   abdomen: ['squats', 'crunches'],
//   legs_knees: [
//     'shoulders to the sides of the body and legs to bend 90 degrees',
//     'lift right leg on Y-axis up-down',
//     'lift left leg on Y-axis up-down',
//     'lift right leg on Y-axis and rotatian for x-axis',
//     'lift left leg on Y-axis and rotatian for x-axis',
//   ],
//   lower_back: [
//     'center body area and upper-body moves to right-left side on X-axis',
//   ],
//   upper_back: [
//     'stretching hands up 90 degrees without moving',
//   ],
// }

//I think to update the body_areas to levels
// body_areas: 
//            hight: 'upper back', ................
//            normal: .......
//            low: ..........
const body_areas = [
  'none',
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
    // required: [true, 'Please Enter you full name']
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'activites'
  }],
  limitations: [{
      type: String,
      enum: body_areas
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
