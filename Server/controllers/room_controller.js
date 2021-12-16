const path = require('path');
const { validate, room } = require('../models/rooms');

// @desc    Get all rooms
// @route   GET /api/rooms/
// @access  Public
const getRooms = async (req, res, next) => {
  try {
    const AllRoom = await room.find().select('-__v');
    res.status(200).json({
      success: true,
      AllRooms: AllRoom
    });
  } catch (e) {
    res.status(err.status).json({
      success: false,
      msg: err.message
    });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
const getRoom = async (req, res, next) => {
  try {
    console.log('Hi');
    const Room = await room.findOne({ id: req.params.id }).select('-__v');
    console.log(Room);
    res.status(200).json({
      success: true,
      room: Room
    });
  } catch (err) {
    res.status(err.status).json({
      success: false,
      msg: err.message
    });
  }
};

// @desc    Create new room
// @route   POST /api/rooms/
// @access  Private
const createRoom = async (req, res, next) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message.red);
    }
    const Room = new room(req.body);
    console.log(Room);
    await Room.save();
    res.status(200).json({
      success: true,
      msg: 'Create new room'
    });
  } catch (err) {
    res.status(err.status).json({
      success: false,
      msg: err.message
    });
  }
};

// @desc    Update room
// @route   PUT /api/users/:id
// @access  Private
const updateRoom = async (req, res, next) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res.status(error.status).send(error);
    }
    console.log('Hi');
    const { id, name, url, peer1Id, peer2Id } = req.body;
    const Room = await room
      .findOne({ id: req.params.id })
      .select('-__v');
    if (req.params.id !== id) {
      return res.status(401).json({
        success: false,
        msg: 'room is not match in url and body'
      });
    }
    const updateRoom = new room({
      _id: Room._id,
      id: id,
      url: url,
      peer1Id: peer1Id,
      peer2Id: peer2Id
    });
    console.log(updateRoom);
    await room.updateOne({ _id: updateRoom._id }, updateRoom);
    res.status(200).json({
      success: true,
      msg: `Update room with id: ${req.params.id}`,
      room: updateRoom
    });
  } catch (err) {
    res.status(err.status).json({
      success: false,
      msg: err.message
    });
  }
};

// @desc    Delete single room
// @route   DELET /api/rooms/:id
// @access  Private
const deleteRoom = async (req, res, next) => {
    try {
        console.log('Hi');
        const Room = await user.findOne({ id: req.params.id}).select('-__v');
        if(!Room){
            return res.status(401).json({
                success: false,
                msg: "the room with id: " +req.params.username + " is not exist"
              });
        }
        console.log(User);
        await user.deleteOne({_id: User._id});
        res.status(200).json({
          success: true,
          msg: `Delete user with username: ${id}`,
        });
      } catch (err) {
        res.status(err.status).json({
          success: false,
          msg: err.message
        });
      }
}

module.exports = {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
};
