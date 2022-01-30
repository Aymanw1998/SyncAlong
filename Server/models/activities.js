const mongoose = require('mongoose');
const bodyPart = [
  'upper back',
  'lower back',
  'right shoulder',
  'left shoulder',
  'right knee',
  'left knee',
  'ankle',
  'joint',
  'chest',
  'neck',
  'right hand',
  'left hand',
  'right leg',
  'left leg',
  'right foot',
  'left foot'
];

const activitySchema = new mongoose.Schema({
  
  name: {
    type: String,
    index: true,
    required: [true, 'Enter the name of the activity'],
  },
  type: {
    type: String,
  },
  time: {
    type: Number,
    required: [true, 'Enter the time of the activity']
  },
  bodyArea: {
    type: String,
    enum: ['upper', 'lower'],
    default: 'upper'
  },
  bodyPart: [{
    type: String,
  }],
  demo: { //VEDIO
    type: String,
    required: [true, 'Add a demo about this activity'],
  },
  feedback_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'feedbacks',
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updateAt: {
    type: Date, 
    default: Date.now,
  }
});

const Activity = mongoose.model('activities', activitySchema);
module.exports = { Activity };
