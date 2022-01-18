const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const meetingSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  host_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  participants_id: [{
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
  list_Activity_id: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'activities',
  }],
  urlRoom:{
    type: String,
  }
});


const Meeting = mongoose.model('meetings', meetingSchema);
module.exports = { Meeting };