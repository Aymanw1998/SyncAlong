const socketio = require('socket.io');
const Room = require('./roomManager.js');

const socker = (server) => {
  const io = new socketio.Server(server,
    {
        transports: ['websocket'], // To avoid sticky sessions when using multiple servers
        path: '/classic',
        rememberUpgrade: true,
    });
//   io.on('connection', (socket) => {
//     console.log(`Connect`, socket.id);
//     socket.on('join-room', (roomId, userId) => {
//       socket.join(roomId);
//       socket.broadcast.emit('user-connected', userId);
//       socket.on('disconnect', () => {
//         socket.broadcast.emit('user-disconnected', userId);
//       });
//     });
//   });
    io.on('connection', async(socket) => {
        const {username, roomId, password, action} = socket.handshake.query;
        var room = new Room(io, socket, username, roomId, password, action);
        console.log("type: ", type(room));
        const joinedRoom = await room.init(username);
        console.info('Client Connected');
        if(joinedRoom) {
            //start
        }
        else{
            room.onDisconnect();
        }
    });
    return io;
};

module.exports = socker;