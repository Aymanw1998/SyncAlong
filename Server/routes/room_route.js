const express = require('express');

const {viewRoom,
    getRooms,
    getRoom,
    createRoom,
    updateRoom, deleteRoom} = require('../controllers/room_controller')
const router = express.Router();

router
    .route('/')
    .get(getRooms)
    .post(createRoom);

router
    .route('/:id')
    .get(getRoom)
    .put(updateRoom)
    .delete(deleteRoom)
    .post(viewRoom); // Not work now
    
module.exports = router;