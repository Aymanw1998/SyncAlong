const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const poseSchema = new mongoose.Schema({
  meeting_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'meetings'
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  user_socket: {
    type: String,
    required: true
  },
  array_pose: [
    {
      type: Number
    }
  ],
  activity_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'activities',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Pose = mongoose.model('poses', poseSchema);
module.exports = { Pose };