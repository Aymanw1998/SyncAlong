const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const roomSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  name: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "can't be blank"],
    index: true
  },
  url: {
    type: String,
    lowercase: true
  },
  peer1Id: {
    type: String,
    required: true,
    Length: 9
  },
  peer2Id: {
    type: String,
    required: true,
    Length: 9
  }
});

const Room = mongoose.model('rooms', roomSchema);

module.exports = { Room };
