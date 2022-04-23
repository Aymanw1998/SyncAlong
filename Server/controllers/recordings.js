const s3 = require('../utils/S3');
const { v4: uuid } = require('uuid');
const { Recording } = require('../models/recordings');
const { Meeting } = require('../models/meetings');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { successResponse } = require('../utils/successResponse');
// חשבתי שאנחנו נשמור ןידי ןגם תמונות אז בגלל ככה עשיתי אותו דינמי
// @desc    get Recording
// @route   
// @access  Private
const getRecording = asyncHandler(async (res, req, next) => {
  // body: url
  const url = req.body.url;
  if (!url) {
    return false;
  }
  let recording = Recording.findOne({ url: url });
  return recording;
});

// @desc    Upload Recording to AWS S3 storage
// @route   POST /api/Recordings/
// @access  Private
const uploadRecording = asyncHandler(async (req, res, next) => {
  // the Recording sent
  console.log('req.Recording: ', req.file);
  // myRecording is array [name,type]
  let myFile = req.file.originalname.split('.');
  // save the type file in the variable
  const typeMyFile = myFile[myFile.length - 1];

  // Params is json type to sent to the S3 storage (AWS)
  // Bucket is the name for bucket (for identify a location to be saved)
  // We want save file, so we also ship:
  // key (name file/ unigue identifier)
  // Body/buffer (the information or data)

  const buffer = req.file.buffer;
  const key = `Recordings/${uuid()}.${typeMyFile}`;
  const bucket = process.env.AWS_BUCKET_NAME;
  await s3.write(buffer, key, bucket);
  console.log('uploaded');
  const url = await s3.getSignedURL(process.env.AWS_BUCKET_NAME, key, 60);
  console.log('url: ', url);
  data = await Recording.create({
    name: key,
    meeting_id: req.params.id,
    url: url
  });

  let dateEnd = new Date();
  let meeting = await Meeting.updateOne({ _id: req.params.id }, {
    status: false,
    urlRoom: url,
    dateEnd
  });
  console.log('meeting', meeting);
  if (!meeting)
    return next(new ErrorResponse('meeting', 401));
  return successResponse(req, res, { url, meeting_id: req.params.id, dateEnd });

  // return successResponse(req, res, meeting);
});

// @desc    Delete Recording from AWS S3 storage
// @route   DELETE /api/Recordings/
// @access  Private
const deleteRecording = async (req, res) => {
  const request = await s3.delete(process.env.AWS_BUCKET_NAME, req.body.url);
  return successResponse(req, res, { status: 'ok' });
};

module.exports = {
  getRecording,
  uploadRecording,
  deleteRecording
};
