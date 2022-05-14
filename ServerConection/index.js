const path = require('path');
const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');

const connectDB = require('./config/db');
const socket = require('socket.io');
const cors = require('cors');

/*
 * TESTING SYNC ALGORITEM OUTPUTS
  **********************************
const { both_down, right_leg_up, left_leg_up } = require('./tests/legs/t1');
const { both_hands_down, both_hands_up_90, left_hand_90, right_hand_90 } = require('./tests/hands/t1');
const { testLefts, testRights, testwithActive, testAngels } = require('./tests/index');
// const similarity = testwithActive(both_hands_down, both_hands_up_90, "hands-x");
const similarity = testAngels(both_hands_down, both_hands_up_90, "right-hand-up");
*************************************************************************
 */


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


const curve1 = [
  { x: 0.5765262842178345, y: 0.14779333770275116, z: -0.0755385160446167, visibility: 0.99934321641922 },
  { x: 0.5284646153450012, y: 0.2930644452571869, z: -0.00021727068815380335, visibility: 0.9800726175308228 },
  { x: 0.5345808863639832, y: 0.42657777667045593, z: -0.1141095906496048, visibility: 0.9699611663818359 }

];
const curve2 = [
  { x: 324.2261505126953, y: 78.7223768234253, z: -0.11577855050563812, visibility: 0.9985460638999939 },
  { x: 272.1331214904785, y: 92.62448072433472, z: -0.305399090051651, visibility: 0.9634328484535217 },
  { x: 216.1219596862793, y: 75.58308362960815, z: -0.6688438057899475, visibility: 0.9209961891174316 }
];

const curve3 = [
  { x: 301.4681053161621, y: 87.02701091766357, z: -0.11761732399463654, visibility: 0.9995912313461304 },
  { x: 282.33240127563477, y: 147.5662136077881, z: -0.1301490217447281, visibility: 0.9740296602249146 },
  { x: 279.41930770874023, y: 210.7275152206421, z: -0.23120906949043274, visibility: 0.9385502934455872 }
]
const curve4 = [
  { x: 387.4319839477539, y: 73.33464860916138, z: -0.060670871287584305, visibility: 0.9995757341384888 },
  { x: 328.0849075317383, y: 89.63305234909058, z: -0.15146350860595703, visibility: 0.9743751883506775 },
  { x: 259.2135238647461, y: 96.7852234840393, z: -0.3933405876159668, visibility: 0.9646807312965393 }
]
// const similarity = shapeSimilarity(curve3, curve4);
//console.log('similarity', similarity);


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
