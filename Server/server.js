const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');

const errorHandler = require('./middleware/err');
const connectDB = require('./config/db');
const socket = require('socket.io');
// Load env vars
dotenv.config({ path: './config/.env' });

// Create app
const app = express();

//Conect to DB
connectDB();

//Middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Set Static folder
app.use(express.static('public'));

// Cookie parser when login user
app.use(cookieParser());

// Enable CORS
app.all('*', function (req, res, next) {
  if (!req.get('Origin')) return next();
  res.set('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.set('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,authorization');
  next();
});

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Route middleware
const users = require('./routes/users');
const aws_storage_route = require('./routes/aws_storage_route');
const room_route = require('./routes/room_route');
app.use('/api/users', users);
app.use('/api/files', aws_storage_route);
app.use('/api/rooms', room_route);

//must be after routes call
//for catch 500-400 errors
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
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
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.emit('user-connected', userId);
    socket.on('disconnect', () => {
      socket.broadcast.emit('user-disconnected', userId)
    })
  })
})
