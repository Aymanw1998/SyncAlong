const mongoose = require('mongoose');
const BodyPart = ['head', 'right hand', 'left hand', 'right leg', 'left leg', 'left'];

const socialNetworkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }],
  connected: {
    type: Boolean,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updateAt: {
    type:Date, 
    default: Date.now
  }
});

const SocialNetwork = mongoose.model('socialnetworks', socialNetworkSchema);
module.exports = { SocialNetwork };
