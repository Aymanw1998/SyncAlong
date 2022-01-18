const mongoose = require('mongoose');
const BodyPart = [
  'head',
  'right hand',
  'left hand',
  'right leg',
  'left leg',
  'left'
];

const activityUserFeedbackSchema = new mongoose.Schema({
  meeting_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'meetings'
  },
  Description: {
    type: String
  },
  title: {
    type: String
  },
  sync_level: {
    type: Number
  },
  status: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ActivityUserFeedback = mongoose.model('activityUserFeedback', activityUserFeedbackSchema);
module.exports = { ActivityUserFeedback };
