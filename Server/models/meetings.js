const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const meetingSchema = new mongoose.Schema({
  name: {
    type: String,
    index: true,
    required: [true, 'Enter name for the meeting']
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  }],
  date: {
      type: Date,
      default: Date.now
  },
  status: {
    type: Boolean, 
    default: false
  },
  list_activity_id: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'activities',
  }],
  room:{
    type: String,
    required: [true, 'Enter your name room']
  },
  urlRoom:{
    type: String,
  }
});


const Meeting = mongoose.model('meetings', meetingSchema);
module.exports = { Meeting };