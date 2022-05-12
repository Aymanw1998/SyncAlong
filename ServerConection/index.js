const path = require('path');
const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');

const connectDB = require('./config/db');
const socket = require('socket.io');
const cors = require('cors');

// Load env vars
dotenv.config({ path: './config/.env' });

// Create app
const app = express();

//Conect to DB
connectDB();

//Middleware
app.use(express.json());

// Enable CORS
app.use(cors());
app.all('*', function (req, res, next) {
  if (!req.get('Origin')) return next();
  res.set('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.set(
    'Access-Control-Allow-Headers',
    'X-Requested-With,Content-Type,authorization'
  );
  next();
});

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Route middleware
app.get('/', (req, res) => { res.send('Server is up and running'); });

//for catch 500-400 errors
//app.use(errorHandler);

//socket connection
const httpServer = http.createServer(app);
const socker = require('./socker');
socker(httpServer);

//lisining....
const PORT = 5500;
const NODE_ENV = process.env.NODE_ENV;
httpServer.listen(
  PORT,
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`.blue.bold)
);


//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});
