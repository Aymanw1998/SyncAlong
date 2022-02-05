const users = [];
//{userId, socketId, roomId, type}

const addUser = (userId, socketId, roomId) => {
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

const removeUser = (socketId) => {
  console.log(users.length);
  users = users.filter((user) => user.socketId !== socketId);
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
  getUsersInRoom
};
