const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { array } = require('joi');

//Important settings:
//Setting the activity of time for a single activity, the amount of activity per session
//Defined in a meeting model.

// A profile should contain all the information needed to produce a list of activities
// - If there is no such then the list is random with a maximum size of 10 activities

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

// The type of activity in the area of ​​the body is not necessarily a measure calculated according to this area only ... 
//Upper back is measured according to the coordinates of the hands for example
//***An activity object represents a list of activity options by working on an area in the body */
const activities = {
  arms: [
    'left heand up-down on y-axis',
    'right heand up-down on y-axis',
    'both heands up-down on y-axis',
    'both heands close-open on x-axis',
    'left heand bending at angles 180to0 on x-axis',
    'right heand bending at angles 180to0 on x-axis',
    'both heands rotation on x-axis'
  ],
  abdomen: ['squats', 'crunches'],
  legs_knees: [
    'shoulders to the sides of the body and legs to bend 90 degrees',
    'lift right leg on Y-axis up-down',
    'lift left leg on Y-axis up-down',
    'lift right leg on Y-axis and rotatian for x-axis',
    'lift left leg on Y-axis and rotatian for x-axis',
  ],
  lower_back: [
    'center body area and upper-body moves to right-left side on X-axis',
  ],
  upper_back: [
    'stretching hands up 90 degrees without moving',
  ],
}
//body_areas represents the possible areas that can be worked on in the system
const body_areas = ['arms', 'abdomen', 'legs and knees', 'lower back', 'upper back', 'none']


const profileSchema = new mongoose.Schema({
  name: {
    type: String,
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
  limitations: [{
    type: String,
    enum: body_areas,
    required: [true, "Please set your limitations from the list"],
  }],
  priority_areas: [{
    type: String,
    enum: body_areas,
  }],
  // system_activity_offers: {
  //   //based on the user data, if none data then is random array
  //   // Separate reading - after the information enters the DB then the system will make from this information only an array based on the constraints
  //   type: Object,
  //   enum: activities, //object of arrays by the key of the body_area.
  // },
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
