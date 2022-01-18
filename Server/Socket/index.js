const {Server} = require('socket.io');
let IO;

module.exports.initIO = (server) => {
    IO = new Server(server);

    IO.use((socket, next) => {
        let userName = socket.handshake.query.name;
        socket.user = userName;
        next();
    });
    IO.on('connection', (socket)=> {
        console.log(socket.user, " connected");
        socket.on('join', ({ name, room }, callback) => {
            //useEffect emit join
            console.log("joined");
            const existRoom = hasRoom(room);
            let type = 'create';
            if (existRoom) {
              type = 'join';
            }
            const { error, user } = addUser({ id: socket.id, name, room, type });
            if (error) {
              return callback(error);
            }
      
            socket.join(user.room);
      
            //socket.emit('message', {me: user.id, text: `${user.id}, welcome to the room`});
      
            //socket.broadcast.to(user.room).emit('message', {you: user.id, text: `${user.id}, has joined!`});
      
            socket.to(user.room).emit('peers', { users: getUsersInRoom(user.room) });
            io.to(user.room).emit('roomData', {
              room: user.room,
              users: getUsersInRoom(user.room)
            });
      
            callback();
          });
      
          socket.on('sendMessage', (message, callback) => {
            const user = getUser(socket.id);
            io.to(user.room).emit('message', { user: user.id, text: message });
            callback();
          });
      
          socket.on('disconnect', () => {
            const user = getUser(socket.id);
            if (user.type == 'create') {
              const data = removeRoom(user.room);
              socket.to(user.room).emit('leave');
              return callback('all Users leaved');
            } else {
              removeUser(socket.id);
              socket.emit('leave');
              return callback(`the user ${user.id} leaved`);
            }
          });
    })
}

module.exports.getIO = () => {
    if(!IO) {
    } else IO;
}