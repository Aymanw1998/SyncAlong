const users = [];
//users is type of : {userId, socketId, roomId, mediapipe}

const addUser = (userId, socketId, roomId) => {
  //when exists - replace his socket id to curr socket 
  users.find((user) => {
    if (user.userId === userId) {
      user.socketId = socketId;
      return;
    }
  });
  //add user to array only if he is not there
  let mediapipe = [];
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId, roomId, mediapipe });
};

const joinUser = (userId, roomId) => {
  users.find(user => {
    if (user.userId == userId)
      user.roomId = roomId;
  })
}

const closeRoom = (roomId) => {
  //close for both users in the room
  users.map(user => {
    if (user.roomId === roomId)
      user.roomId = undefined;
  })
}

const removeUser = (socketId) => {
  //find if this user is in a room meeting
  let found_user = null;
  users.find((user) => {
    if (user.socketId === socketId) {
      found_user = user;
    }
  });
  //fillter out the user 
  console.log('users', users);
  const index = users.findIndex(v => v.socketId === socketId);
  console.log(index);
  if (index < 0) return null;
  users.splice(index, 1);
  console.log('num after filter ', users);
  //when this user is in a session then notify the outher in the room
  if (found_user?.roomId) return found_user
  else return null;
};

const getUserBySocketId = (socketId) => {
  let found_user = null;
  users.find((user) => {
    if (user.socketId === socketId) {
      found_user = user;
    }
  });
  return found_user;
}

const getUser = (userId) => {
  let found_user = null;
  users.find((user) => {
    if (user.userId === userId) {
      found_user = user;
    }
  });
  return found_user;
}

const getUsersInRoom = (roomId) => {
  let usersInRoom = users.filter((user) => user.roomId === roomId)
  //console.log('usersInRoom', usersInRoom);
  return usersInRoom;
};

const getUsers = () => { return users; }

const pushMediaPipe = (data, mySocketId, yourSocketId, trainer, activity, roomId) => {
  // typeof data= {
  //   poses: posesArry,
  //   time : timeOfColectionPose,
  // }
  users.find(user => {
    if (user.socketId == mySocketId) {
      user.mediapipe.push(data);
      console.log('user', user);
    }
  })

  let found_el = null;
  if (trainer) {
    let found = false;
    let found_user = null;

    users.find(user => {
      if (user.socketId == yourSocketId)
        found_user = user;
    });
    console.log('trainee-P2', found_user);

    while (!found) {
      if (found_user && found_user.mediapipe.length >= 2) {
        if (found_user.mediapipe[found_user.mediapipe.length - 2].time === data.time) {
          found_el = found_user.mediapipe[found_user.mediapipe.length - 2];
        }
        else {
          found_el = found_user.mediapipe[found_user.mediapipe.length - 1];
        }
      }
      else return null;
      if (found_el) found = true
    }
    if (found_el) {
      let dataToSync = {
        me: data,
        you: found_el,
        activity,
        time: data.time,
        roomId,
        // frame
      }
      return dataToSync;
    }
    else return null;
  }
  else return null;
}


module.exports = {
  addUser,
  joinUser,
  getUsers,
  removeUser,
  getUser,
  getUsersInRoom,
  closeRoom,
  pushMediaPipe,
  getUserBySocketId
};
