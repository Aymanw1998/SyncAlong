const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const poseSchema = new mongoose.Schema({
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'rooms'
  },
  user: {
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
  Activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activitys',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Pose = mongoose.model('poses', poseSchema);
module.exports = { Pose };
