const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  tariner: { //trainer need fixing text error.
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  trainee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: [true, "Please add a trainee"],

  },
  date: {
    type: Date,
    required: [true, "Please add a date by -> new Date(y, m, d, h, m)"],
  },
  status: {
    type: Boolean,
    default: false
  },
  activities: [{
    type: String
  }],
  urlRoom: {
    type: String,
  }
});


const Meeting = mongoose.model('meetings', meetingSchema);
module.exports = { Meeting };