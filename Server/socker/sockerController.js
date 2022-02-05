const { Server } = require('socket.io');
const {
  addUser, getUsers, joinUser,
  getUser,
  removeUser,
  getUsersInRoom,
} = require('./users');

const socker = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log("user conectted! socket=", socket.id);
    //when im enttering the system i have diffrent socket id 
    socket.on('addUser', (user_id, room_id) => {
      addUser(user_id, socket.id, room_id);
      let users = getUsers();
      let user = getUser(user_id);
      console.log('user in the app', users);
      console.log('user added', user);
      //io.emit("getUsers", users);
      //io.broadcast.emit("getNewUserAddToApp", user);
      io.emit("getNewUserAddToApp", user);
    });

    socket.on('me', (user_id) => {
      console.log('user_id', user_id);
      console.log('aalll', getUsers());
      let user = getUser(user_id);
      console.log('userrrrr', user);
      io.emit("mySocketId", user);
      // io.emit("yourSocketId", user);
    });

    socket.on('getSocketId', (user_id, callback) => {
      let user = getUser(user_id);
      console.log('userrrrr', user_id, user);
      callback(user)
      // io.emit("yourSocketId", user);
    });

    socket.on('joinUser', (from, to, roomId, callback) => {
      //console.log(from, to, roomId);
      joinUser(from, roomId);
      let users = getUsersInRoom(roomId);
      //console.log('users from joinUser', users);
      callback(users)

      const user = getUser(to);
      user && io.to(user?.socketId).emit("callAccepted", {
        joind: from,
        roomId: roomId,
        participantsInRoom: users
      });
    });


    socket.on("callUser", ({ userToCall, signalData, from, name }) => {
      // callback(users)
      //console.log('calll user ', userToCall, signalData, from, name);
      io.to(userToCall).emit("callUser", { signal: signalData, from, name });
    });

    socket.on("answerCall", (data) => {
      io.to(data.to).emit("callAccepted", data.signal)
    });

    //send of peer1 the list of his pose 
    socket.on('sendPoseMessage', (senderId, receiverId, message) => {
      const user = getUser(receiverId);
      io.to(user.socketId).emit("getPoseMessage", {
        senderId,
        message //including date, time, array, action 
      });
    });
    //when peer2 gets the massage he does a messag him self and retuen the respons to all in the room
    socket.on('sendBouthPoses', (senderId, receiverId, roomId, message) => {
      //{
      // do sync algoritem and retrn a number value....
      // sync algorutem will be in the sync modle controllers
      // sync_score = number between 0-1
      // }
      const sync_score = null;
      const user = getUser(receiverId);

      io.to(user.socketId).emit("getSyncScore", {
        sync_score
      });

      //peer2 to himself
      io.emit("getSyncScore", {
        sync_score
      });
      // const user = getUser(socket.id);
      // io.to(user.roomId).emit('message', { user: user.id, text: message });
    });

    //for hand marks and for a pop-up to user when his tainer set up a meeting with him
    socket.on("sendNotification", ({ senderId, receiverId, type }) => {
      const receiver = getUser(receiverId);
      io.to(receiver.socketId).emit("getNotification", {
        senderId,
        type,
      });
    });

    socket.on("disconnect", () => {
      console.log("a user disconnected! socket=", socket.id);
      //removeUser(socket.id);
      // let users = getUsersInRoom();
      // io.emit("getUsers", users);
    });
  });

  return io;
};

module.exports = socker;
