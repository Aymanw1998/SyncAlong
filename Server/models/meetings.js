const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const meetingSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }],
  date: {
      type: Date,
  },
  urlRoom: {
    type: URL,
  }
});


const Meeting = mongoose.model('meetings', meetingSchema);
module.exports = { Meeting };