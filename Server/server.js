const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const errorHandler = require('./middleware/err');
const connectDB = require('./config/db');


const socket = require('socket.io');
// Load env vars
dotenv.config({ path: './config/.env' });

//Connect to database
connectDB();

// Route files
const user_route = require('./routes/user_route');
const aws_storage_route = require('./routes/aws_storage_route');
const room_route = require('./routes/room_route');

// Create app
const app = express();

app.use(express.json());

// Set Static folder
app.use(express.static('public'));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/users', user_route);
app.use('/api/files', aws_storage_route);
app.use('/api/rooms', room_route);

app.use(errorHandler);

const PORT = process.env.PORT || 2021;
const NODE_ENV = process.env.NODE_ENV;
const server = app.listen(
  PORT,
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`.blue.bold)
);

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Socket setup
var io = socket(server);

io.on('connection', (socket) => {
    console.log(`Connect`, socket.id);
    socket.on('join-room',(roomId, userId) => {
      socket.join(roomId);
      socket.broadcast.emit('user-connected', userId);
      socket.on('disconnect', () => {
      socket.broadcast.emit('user-disconnected', userId)
    })
    })
})
