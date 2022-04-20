const { SyncScore } = require('../models/sync-scores');

const {
  addUser, getUsers, joinUser,
  getUser,
  removeUser,
  getUsersInRoom,
  pushMediaPipe,
  closeRoom,
  getUserBySocketId,
} = require('./users');

const { procrustes_analysis } = require('../syncAlgorithm/procrustes_analysis');
const { angles_between_joints } = require('../syncAlgorithm/angles_between_joints');

const socker = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`user conectted! socket= ${socket.id}`.green.bold);
    const socketId = socket.id;
    const users = getUsers();
    io.to(socketId).emit("connected",  socketId, users);

   // io.emit("connected", socketId, users);

    //when im enttering the system i have diffrent socket id 
    socket.on('addUser', (user_id, room_id) => {
      addUser(user_id, socket.id, room_id); //Resets the new socket associated with the user
      let users = getUsers();
      let user = getUser(user_id);
      console.log('added', user);
      console.log(`num of users in: ${users.length}`.green.bold);
      console.log(users);
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

    socket.on("calltoTrainee", yourSocketId => {
      console.log('calltoTrainee');
      let data = true;
      io.to(yourSocketId).emit("calltoTrainee", data);
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

    ///test for Eyal -passing data per frames
    //Each user sends to the server his information. The server maintains a list of points 
    //and forwards a synchronization calculation based on recent times received from both users
    socket.on("sendPosesByPeers", (data, mySocketId, yourSocketId, trainer, activity, roomId) => {
      console.log("sendPosesByPeers", new Date(), mySocketId, yourSocketId, trainer, activity, roomId);
      let dataToSync = pushMediaPipe(data, mySocketId, yourSocketId, trainer, activity, roomId);

      console.log('dataToSync', dataToSync, new Date());
      if (dataToSync) {
        //sync alg
        console.log(" before sendPosesByPeers", new Date());
        let sync_score = procrustes_analysis(dataToSync);
        console.log("after sendPosesByPeers", new Date(), 'sync_score send : ', sync_score);
        io.to(roomId).emit("resivingSyncScoure", sync_score);
      }
    })


    //when peer2 gets the massage he does a messag him self and retuen the respons to all in the room
    socket.on('sendOurPoses', async (data) => {
      // sync_score = number between 0-1
      let sync_score = procrustes_analysis(data);

      let d = {
        me: { poses: [{ x: 2, y: 1.5 }, { x: 4, y: 3 }] },
        you: { poses: [{ x: -2, y: -1.5 }, { x: -4, y: -3 }] }
      }
      // let sync_score = angles_between_joints(d);
      console.log('sync_angals', sync_score);
      //send back to bouth in room
      io.to(data.roomId).emit("syncScore", sync_score);

      //save in db of both usesr
      if (sync_score === undefined || sync_score == null) return;
      let dataToDB = { meeting_id: data.roomId, result: sync_score, time: data.time, activity: data.activity }
      const syncscore = await SyncScore.create(dataToDB);
    });

    socket.on("sendNotification", (data) => {
      let notification = data.notification;
      console.log('notification', notification);
      io.to(data.roomId).emit("notification", notification);
    });

    socket.on("peer1inFrame", (yourSocketId) => {
      console.log('peer1inFrame');
      io.to(yourSocketId).emit("peer1inFrame", yourSocketId);
    });

    socket.on("accseptScheduleMeetingCall", (yourSocketId) => {
      console.log('accseptScheduleMeetingCall', yourSocketId);
      let id = true
      io.to(yourSocketId).emit("accseptScheduleMeetingCall", id);
    });


    socket.on("t", (data) => {
      console.log(data);
      console.log('t', data.yourSocketId);
      let id = true
      console.log('socket undifined', data.roomId);
      const users = getUsersInRoom(data.roomId);
      console.log(users);
      users.map(user => {
        console.log(user.socketId, socket.id);
        if (user.socketId !== socket.id) {
          console.log('t', user.socketId);
          io.to(user.socketId).emit("t", id);
          return;
        }
      })
      io.to(data.yourSocketId).emit("t", id);
    });

    socket.on("error", (err) => {
      console.log(`Error socket server: ${err}`);
    });

    socket.on("closeRoom", (roomId) => {
      console.log('closeRoom', roomId);
      //notify to the room about this action...
      //case user close the room and another is in the room waiting for his to reconect
      io.to(roomId).emit("closeRoom", roomId);
      console.log('closeRoom', roomId);
      closeRoom(roomId);
    });

    socket.on("reconect", (userId, roomId) => {
      addUser(userId, socket.id, roomId); //Resets the new socket associated with the user
      console.log('reconect userId', userId);
      roomId && socket.join(roomId);
      let user = getUser(userId);
      let users = getUsersInRoom(roomId);
      console.log('reconect user', user);
      console.log('all users in room', roomId, users)
      //notify to the room about this action...
      //case user close the room and another is in the room waiting for his to reconect
      io.to(roomId).emit("reconect", users);
    });


    socket.on("disconnectLogout", (userId) => {
      //handele when clicked on logout
      console.log('userId', userId);
      let user_disconrct = null
      if (userId) user_disconrct = getUser(userId);
      if (user_disconrct) {
        console.log(`a user disconnected! socket= ${user_disconrct.socketId}`.red.underline.bold);
        let user_in_seeion = removeUser(user_disconrct.socketId);
        if (user_in_seeion) { //notiffy the roomId
          let userId = user_in_seeion.userId;
          io.to(user_in_seeion.roomId).emit("userLeft", userId);
        }
        else   //else this user has roomId=undifind (retuend null) so no need to notify to anyone he left 
          console.log('No notify sended - user left and clear out from users lists');
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`a user disconnected! socket= ${socket.id}`.red.underline.bold);
      console.log(`reason ====> ${reason}`.yellow.bold);

      let user = getUserBySocketId(socket.id);
      console.log('user ', user);
      if(user === null) return;
      if (reason === "ping timeout") {
        console.log('ocket.id', socket.id);
        io.to(user.roomId).emit("disconnected", reason);
      }

      let user_in_seeion = removeUser(socket.id);

      if (user_in_seeion) { //notiffy the roomId
        let userId = user_in_seeion.userId;
        io.to(user_in_seeion.roomId).emit("userLeft", userId, reason);
      }
      else   //else this user has roomId=undifind (retuend null) so no need to notify to anyone he left 
        console.log('No notify sended - user left and clear out from users lists');
    });
  });

  return io;
};

module.exports = socker;