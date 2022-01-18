const mongoose = require('mongoose');
const BodyPart = ['head', 'right hand', 'left hand', 'right leg', 'left leg', 'left'];

const activitySchema = new mongoose.Schema({
  
  name: {
    type: String
  },
  video_id: { //VEDIO
    type: mongoose.Schema.Types.ObjectId,
    ref: 'recordings'
  },
  BasicBodyParts: [{
    type: String,
    enum: BodyPart,
  }],
  feedback_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'feedbacks'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Activity = mongoose.model('activities', activitySchema);
module.exports = { Activity };
