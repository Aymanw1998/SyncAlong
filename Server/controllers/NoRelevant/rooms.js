const path = require('path');
const { Room } = require('../models/rooms');
const ErrorResponse = require('../utils/errorResponse');
const { successResponse } = require('../utils/successResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all rooms
// @route   GET /api/rooms/
// @access  Public
const getRooms = asyncHandler(async (req, res, next) => {
  const rooms = await Room.find().select('-__v');
  successResponse(req, res, rooms);
});

// @desc    Get single room
// @route   GET /api/rooms/:name
// @access  Public
const getRoom = asyncHandler(async (req, res, next) => {
  console.log('Hi');
  const room = await Room.findOne({ name: req.params.name }).select('-__v');
  console.log(room);
  successResponse(req, res, room);
});

// @desc    Create new room
// @route   POST /api/rooms/
// @access  Private
const createRoom = asyncHandler(async (req, res, next) => {
  const { error } = validate(req.body);
  if (error) {
    return next(new ErrorResponse(error, error.status));
  }
  const room = await Room.create(req.body);
  successResponse(req, res, room);
});

// @desc    Update room
// @route   PUT /api/users/:name
// @access  Private
const updateRoom = asyncHandler(async (req, res, next) => {
  const { error } = validate(req.body);
  if (error) {
    return next(new ErrorResponse(error, error.status));
  }
  const room = await Room.findOne({ name: req.params.name }).select('-__v');
  if (req.params.name !== room.name) {
    return next(new ErrorResponse('room is not match in url and body', 404));
  }
  const updateRoom = await Room.findOneAndUpdate(
    { _id: room._id },
    {
      $addToSet: { meeting: req.body.meeting },
      $addToSet: { listPoses: req.body.listPoses }
    }
  );
  successResponse(req, res, updateRoom);
});

// @desc    Delete single room
// @route   DELET /api/rooms/:name
// @access  Private
const deleteRoom = asyncHandler(async (req, res, next) => {
  console.log('Hi');
  const room = await Room.deleteOne({ name: req.user.name }, (err, data) => {
    if (err) {
      return next(new ErrorResponse(`delete failed`, 400));
    }
    return successResponse(req, res, { data });
  });
});

module.exports = {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom
};
