const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
  uploadFile,
  deleteFile
} = require('../controllers/files');

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
router.route('/').post(upload, uploadFile).delete(deleteFile);

module.exports = router;
