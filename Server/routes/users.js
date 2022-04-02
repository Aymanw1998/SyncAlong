const express = require('express');
const { protect } = require('../middleware/auth');
const multer = require('multer');
//var upload = multer({ dest: 'image/' })

var upload = multer({
      storage: multer.diskStorage({
            filename: (req, file, cb) => {
                  console.log('file', file);
                  cb(null, Date.now() + '.' + file.originalname.split('.').pop())
            },
            destination: (req, file, cb) => {
                  return cb(null, 'image/')
            }
      })
})


const { getUsers, getUser, createUser, getUserById, updateUser, deleteUser,
      getTrainee, createTrainee, updateTrainee, getAllTrainees, deleteTrainee,
      loginUser, searchUserByQuery, getMyTrainer, updateAvatar,
      forgatPassword, resetPassword } = require('../controllers/users');

const router = express.Router();

router
      .route('/all')
      .get(getUsers);

// CRUD Trainer
router
      .route('/')
      .get(protect, getUser)
      .post(createUser)
      .put(protect, upload.single('img'), updateUser)
      .delete(protect, deleteUser);

router
      .route('/:id')
      .get(getUserById);

router
      .route('/avatar')
      .put(protect, upload.single('img'), async (req, res) => {
            // req.body.img = `https://sync-along-api.herokuapp.com/avatars/${req.file.filename}`
            req.body.img = `http://localhost:5000/avatars/${req.file.filename}`;
            req.body.avatar = req.body.img;
            updateAvatar(req, res);
      })

router
      .route('/file')
      .post(protect, upload.single('img'), async (req, res) => {
            res.json(req.file.filename)
      })

//CRUD Trainee
router
      .route('/trainee')
      .get(protect, getAllTrainees)
      .post(protect, createTrainee);

router
      .route('/trainee/mytrainer')
      .get(protect, getMyTrainer);
router
      .route('/trainee/:id')
      .get(protect, getTrainee)
      .put(protect, updateTrainee)
      .delete(protect, deleteTrainee);

router.route('/search').get(searchUserByQuery);
router.route('/login').post(loginUser);
router.route('/forgatpass').post(forgatPassword);
router.route('/resetpassword/:resettoken').put(resetPassword);

module.exports = router;

