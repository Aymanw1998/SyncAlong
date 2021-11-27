const express = require('express');
const router = express.Router();
const multer = require('multer');

const { uploadfunction } = require('../controllers/aws_storage_controller');


const storage = multer.memoryStorage(
    {
        destination: (req, file, callback) => {
            callback(null, '');
        }
    }
);
const upload = multer({storage}).single('file_data');

// router
//     .route('/upload')
    // .get(upload,uploadfunction)

// sent file with name "file_data" to uploadfunction
router.post('/', upload, uploadfunction);

module.exports = router;