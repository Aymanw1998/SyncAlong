//File to video
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: {
    type: String
  },
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'rooms',
  },
  array_sync_time:[{
    type: Date, 
  }],
  url: {
    type: String
  }
});

const File = mongoose.model('files', fileSchema);
module.exports = { File };
