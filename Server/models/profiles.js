const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const BodyPart = ['head', 'right hand', 'left hand', 'right leg', 'left leg', 'left'];

const profileSchema = new mongoose.Schema({
  name: {
      type: String,
      required: [true, "Please Enter you full name"],
  },
  trainerOf: [{  //Indicates of the user-manager of elderly user who craeted by this.user._id (i can open user to my grama & naibar)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }],
  traineeOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  ProhibitedBodyUpper: [{ // Prohibited areas in the body
    type: String,
    enum: BodyPart,
  }],
  DesirableBodyUpper: [{ // Desirable areas in the body
    type: String,
    enum: BodyPart,
  }],
  ProhibitedBodyBottom: [{ // Prohibited areas in the body
    type: String,
    enum: BodyPart,
  }],
  DesirableBodyBottom: [{ // Desirable areas in the body
    type: String,
    enum: BodyPart,
  }],
  future_meeting_id:[{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'meetings'
  }],
  performed_meeting_id:[{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'meetings'
  }],
  createdAt: {
    type: Date, default: Date.now
  },
  updateAt: {
    type: Date, default: Date.now
  },
  });
//רוצה להראות ל?
const Profile = mongoose.model('profiles', profileSchema);
module.exports = { Profile, BodyPart };