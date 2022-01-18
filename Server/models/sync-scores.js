const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const syncscoreSchema = new mongoose.Schema({
  id: {
    type: 'string',
    index: true,
    required: true
  },
  poses_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'poses',
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  }],
  result: {
    type: String, 
    required: true
  },
  createdAt: {
      type: Date,
      default: Date.now
  },  
});


const SyncScore = mongoose.model('syncscores', syncscoreSchema);
module.exports = { SyncScore };