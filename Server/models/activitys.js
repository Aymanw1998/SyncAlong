const mongoose = require('mongoose');
const BodyPart = ['head', 'right hand', 'left hand', 'right leg', 'left leg', 'left'];

const activitySchema = new mongoose.Schema({
  
  name: {
    type: String
  },
  file: { //IMAGE OR VEDIO
    type: mongoose.Schema.Types.ObjectId,
    ref: 'files'
  },
  BasicBodyParts: [{
    type: String,
    enum: BodyPart,
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Activity = mongoose.model('activitys', activitySchema);
module.exports = { Activity };
