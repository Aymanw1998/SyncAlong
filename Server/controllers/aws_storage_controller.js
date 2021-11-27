const s3 = require('../utils/S3');
const { v4: uuid } = require('uuid');

// @desc    Upload file to AWS S3 storage
// @route   POST /api/files/
// @access  Private
const uploadfunction = async (req, res, next) => {
  try {
    // the file sent
    console.log('req.file: ', req.file);
    // myFile is array [name,type]
    let myFile = req.file.originalname.split('.');
    // save the type file in the variable
    const typeMyFile = myFile[myFile.length - 1];

    // Params is json type to sent to the S3 storage (AWS)
    // Bucket is the name for bucket (for identify a location to be saved)
    // We want save file, so we also ship:
    // key (name file/ unigue identifier)
    // Body/buffer (the information or data)

    const buffer = req.file.buffer;
    const key = `${uuid()}.${typeMyFile}`;
    const bucket = process.env.AWS_BUCKET_NAME;
    await s3.write(buffer, key, bucket);
    console.log('uploaded');
    const url = await s3.getSignedURL(process.env.AWS_BUCKET_NAME, key, 60);
    console.log('url: ', url);
    res.status(200).json({
      url: url
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

module.exports = {
  uploadfunction
};
