const express = require('express');

const {
    getRooms,
    getRoom,
    createRoom,
    updateRoom, 
    deleteRoom
} = require('../../controllers/rooms')
const router = express.Router();

router
    .route('/')
    .get(getRooms)
    .post(createRoom);

router
    .route('/:name')
    .get(getRoom)
    .put(updateRoom)
    .delete(deleteRoom)
    
module.exports = router;