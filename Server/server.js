const path = require('path');
const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');

const errorHandler = require('./middleware/err');
const connectDB = require('./config/db');
const socket = require('socket.io');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');

// Load env vars
dotenv.config({ path: './config/.env' });

// Create app
const app = express();

// Create server
const server = http.createServer(app);

//Conect to DB
connectDB();

//Middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie parser when login user the token is saved in the server and send to http client
app.use(cookieParser());

//Prevent attects
app.use(mongoSanitize()); // Sanitize data for privent NoSql injection attack
app.use(helmet()); // Set security headers
app.use(xss()); // Prevent XSS attacks

// Enable CORS
app.use(cors());
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
const profiles = require('./routes/profiles');
const aws_storage_route = require('./routes/aws_storage_route');
const room_route = require('./routes/room_route');
app.use('/api/users', users);
app.use('/api/profiles', profiles);
app.use('/api/files', aws_storage_route);
app.use('/api/rooms', room_route);

//must be after routes call
//for catch 500-400 errors
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV;

// two servers are created.
// 1. app - listening to HTTP requests.
app.listen(PORT, console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`.blue.bold));

// Socket setup
// var io = socket(server);
const socker = require('./socker');
socker(server);

// 2. server - listening to WebSockets connections.
server.listen(PORT + 1, () => {
  console.log(`Socker listening on port ${PORT + 1}!`);
});

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});