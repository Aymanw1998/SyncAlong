const users = [];
//מערך ששומר יוזירים שהם בפגישות

const addUser = ({ id, name, meeting, type }) => {
  const usersInRoom = getUsersInRoom(room);
  if (usersInRoom.length < 2) {
    const existingUser = users.find(
      (user) => user.room === room && user.id === room.id
    );

    if (existingUser) {
      return { error: 'User is taken' };
    }

    const user = { id, name, room, type };
    users.push(user);
    return { user };
  } else return { error: 'Room is full' };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
  return null;
};

const getUser = (id) => users.find((user) => user.id === id);

const removeRoom = (room) => {
  const usersInRoom = getUsersInRoom(room);
  for (const user of usersInRoom) {
    removeUser(user.id);
  }
};
const getUsersInRoom = (room) => users.filter((user) => user.room === room);

const hasRoom = (room) => {
  const list = getUsersInRoom(room);
  if (list.length > 0) {
    return true;
  } else return false;
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom, hasRoom, removeRoom };
