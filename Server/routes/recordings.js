const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
  uploadRecording,
  deleteRecording
} = require('../controllers/recordings');

const storage = multer.memoryStorage({
  acl: 'public-read',
  destination: (req, file, callback) => {
    callback(null, '');
  }
});
const upload = multer({ storage }).single('file_data');

// router
//     .route('/upload')
// .get(upload,uploadfunction)

// sent file with name "file_data" to uploadfunction
router.route('/').post(upload, uploadRecording).delete(deleteRecording);

module.exports = router;
