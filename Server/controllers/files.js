const s3 = require('../utils/S3');
const { v4: uuid } = require('uuid');
const { File } = require('../models/files');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { successResponse } = require('../utils/successResponse');
// חשבתי שאנחנו נשמור ןידי ןגם תמונות אז בגלל ככה עשיתי אותו דינמי
// @desc    get file
// @route   
// @access  Private
const getFile = asyncHandler(async (res, req, next) => {
    // body: url
    const url = req.body.url;
    if(!url){
      return false;
    }
    let file = File.findOne({url: url});
    return file;
});

// @desc    Upload file to AWS S3 storage
// @route   POST /api/files/
// @access  Private
const uploadFile = asyncHandler(async (req, res, next) => {
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
    await File.create({
      name: key,
      url: url
    });
    return successResponse(req, res, {url: url});
});

// @desc    Delete file from AWS S3 storage
// @route   DELETE /api/files/
// @access  Private
const deleteFile = async (req, res) => {
  const request = await s3.delete(process.env.AWS_BUCKET_NAME, req.body.url);
  return successResponse(req, res, {status: 'ok'});
};

module.exports = {
  getFile,
  uploadFile,
  deleteFile
};
