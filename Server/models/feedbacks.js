const mongoose = require('mongoose');
const BodyPart = ['head', 'right hand', 'left hand', 'right leg', 'left leg', 'left'];

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String
  },
  AR: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Feedback = mongoose.model('feedbacks', feedbackSchema);
module.exports = { Feedback };
