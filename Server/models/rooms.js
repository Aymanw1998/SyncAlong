const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "can't be blank"],
    index: true
  },
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'meeting'
  },
  sockets: [{
    type: String
  }],
  listPoses:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:'poses'
  }]
});

const Room = mongoose.model('rooms', roomSchema);

module.exports = { Room };
