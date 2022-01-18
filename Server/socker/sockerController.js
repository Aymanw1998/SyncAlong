const {Server} = require('socket.io');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  hasRoom,
  removeRoom
} = require('./users');

const socker = (server) => {
  const io = new Server(server,{
      cors: {
          original: '*',
          methods: ["GET", "POST"] 
      }
  });
  io.on('connection',(socket) => {
    console.log("Hi socket", socket.id);
    socket.on('join', ({ name, room }, callback) => {
      //useEffect emit join
      console.log("Hi joined");
      const existRoom = hasRoom(room);
      let type = 'create';
      if (existRoom) {
        type = 'join';
      }
      console.log("type: ", type);
      const { error, user } = addUser({ id: socket.id, name, room, type });
      console.log("user: ", user);
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
      try{
        if (user.type == 'create') {
          const data = removeRoom(user.room);
          socket.to(user.room).emit('leave');
          return callback('all Users leaved');
        } else {
          removeUser(socket.id);
          socket.emit('leave');
          return callback(`the user ${user.id} leaved`);
        }
      }catch(e) {
        console.log(e.red);
      }
    });
    // socket.on('sendIdPoses', (data, callback) =>{
    //     io.broadcast.to(getUser(socket.id).room).emit('resivingIdPoses', data);
    //     callback();
    // })
  });

  return io;
};

module.exports = socker;
