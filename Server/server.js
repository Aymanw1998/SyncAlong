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
const multer = require('multer')

// Load env vars
dotenv.config({ path: './config/.env' });

// Create app
const app = express();

//Conect to DB
connectDB();

//Middleware
app.use(express.json());

//app.use(express.urlencoded({ extended: false }));
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use('/avatars', express.static('image'))

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
const users = require('./routes/users');
const profiles = require('./routes/profiles');
const recordings = require('./routes/recordings');
const meetings = require('./routes/meetings');
const syncScores = require('./routes/sync-scores');
app.use('/api/users', users);
app.use('/api/profiles', profiles);
app.use('/api/recordings', recordings);
app.use('/api/meetings', meetings);
app.use('/api/syncscores', syncScores);

//uploud imgs to server (for avatar potos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("img"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    console.error(error);
  }
});

//must be after routes call
//for catch 500-400 errors
app.use(errorHandler);

//socket connection
const httpServer = http.createServer(app)
const socker = require('./socker');
socker(httpServer);

//lisining....
const PORT = process.env.PORT || 5000;
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
