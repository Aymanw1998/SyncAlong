const users = [];
//{userId, socketId, roomId, type}

const addUser = (userId, socketId, roomId) => {
  //when exists - replace his socket id to curr socket 
  users.find((user) => {
    if (user.userId === userId) {
      user.socketId = socketId;
      return;
    }
  });
  //add user to array only if he is not there
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId, roomId });
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
  console.log(users);
  const index = users.findIndex(v => v.socketId === socketId);
  console.log(index);
  if(index < 0) return null;
  users.splice(index, 1);
  console.log('num after filter ', users);
  //when this user is in a session then notify the outher in the room
  if (found_user?.roomId) return found_user
  else return null;
};

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

module.exports = {
  addUser,
  joinUser,
  getUsers,
  removeUser,
  getUser,
  getUsersInRoom,
  closeRoom,
};
