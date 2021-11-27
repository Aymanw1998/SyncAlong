const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const RoomSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    index: true,
    length: 9
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

// UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});
const room = mongoose.model('Room', RoomSchema);

const validate = (room) => {
  const schema = Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    peer1Id: Joi.string().required(),
    peer2Id: Joi.string().required()
  });

  return schema.validate(room);
};
module.exports = { room, validate };
