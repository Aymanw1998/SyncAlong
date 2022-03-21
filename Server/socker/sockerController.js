const { Server } = require('socket.io');

const {
  addUser, getUsers, joinUser,
  getUser,
  removeUser,
  getUsersInRoom,
} = require('./users');

const { procrustes_analysis } = require('../syncAlgorithm/procrustes_analysis');
const { angles_between_joints } = require('../syncAlgorithm/angles_between_joints');

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
    });

    socket.on('joinUser', (from, to, roomId, callback) => {
      socket.join(roomId);
      joinUser(from, roomId);
      let users = getUsersInRoom(roomId);
      //callback(users)
      let res = roomId;
      io.to(roomId).emit("responsRoomId", res);

      // const user = getUser(to);
      // user && io.to(user?.socketId).emit("callAccepted", {
      //   joind: from,
      //   roomId: roomId,
      //   participantsInRoom: users
      // });
    });

    socket.on("callUser", ({ userToCall, signalData, from, name }) => {
      io.to(userToCall).emit("callUser", { signal: signalData, from, name });
    });

    socket.on("ourDelay", data => {
      io.to(data.to).emit("ourDelay", data.delay);
    });

    socket.on("answerCall", (data) => {
      io.to(data.to).emit("callAccepted", data.signal, data.start_delay)
    });

    socket.on("sendPoses", (data) => {
      io.to(data.to).emit("resivingPoses", data)
    })

    //when peer2 gets the massage he does a messag him self and retuen the respons to all in the room
    socket.on('sendOurPoses', (data) => {
      // sync_score = number between 0-1
      //  console.log('befor sync algorithem ', new Date());
      let sync_score = procrustes_analysis(data);
      // console.log('after sync algorithem ', new Date());
      //let sync_angals = angles_between_joints(data);
      //save in db of both usesr 

      //send back to bouth in room
      io.to(data.roomId).emit("syncScore", sync_score);
    });

    socket.on("sendNotification", (data) => {
      let notification = data.notification;
      console.log('notification', notification);
      io.to(data.roomId).emit("notification", notification);
    });

    socket.on("peer1inFrame", (roomId) => {
      console.log('peer1inFrame');
      io.to(roomId).emit("peer1inFrame", roomId);
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