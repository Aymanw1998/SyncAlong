const s3 = require('../utils/S3');
const { v4: uuid } = require('uuid');
const asyncHandler = require('../middleware/async');
const { Activity } = require('../models/activities');
const { getRecording } = require('./recordings');
const ErrorResponse = require('../utils/errorResponse');
const { successResponse } = require('../utils/successResponse');
const path = require('path');
const fs = require('fs');
const { url } = require('inspector');
// @desc    Get all Activities
// @route   GET /api/activities/
// @access  Public
const getActivities = asyncHandler(async (req, res, next) => {
  const activities = await Activity.find();
  return successResponse(req, res, { activities });
});

// @desc    Get single Activity
// @route   GET /api/activities/:name
// @access  Public
const getActivity = asyncHandler(async (req, res, next) => {
  const activity = await Activity.findOne({ name: req.params.name });
  return successResponse(req, res, { activity });
});

// @desc    Create new Activity
// @route   POST /api/activity/
// @access  Private with token
const createActivity = asyncHandler(async (req, res, next) => {
  let url = null;
  if (!req.body.url) {
    return next(new ErrorResponse('send path about the demo', 401));
  } else {
    let activity = Activity.findOne({ name: req.body.name });
    if (activity) {
      return next(
        new ErrorResponse(
          `the activity with the name: [${req.body.name}] is exist`
        )
      );
    }
    await fs.readFile(req.body.url, async (err, data) => {
      if (err) {
        console.log(err);
        res.status(err.code).send(err.message);
      }
      console.log(data);
      let myFile = req.body.url.split('.');
      const typeMyFile = null;
      try {
        typeMyFile = myFile[myFile.length - 1];
      } catch (e) {
        typeMyFile = req.body.url.split('.').at(-1);
      }
      const buffer = data;
      const key = `demo/${uuid()}.${typeMyFile}`;
      const bucket = process.env.AWS_BUCKET_NAME;
      await s3.write(buffer, key, bucket);
      console.log('uploaded');
      url = await s3.getSignedURL(bucket, key, 60);
      console.log(url);
      await Activity.create({
        name: req.body.name,
        type: req.body.type,
        time: req.body.time,
        bodyArea: req.body.bodyArea,
        demo: url,
        feedback: req.body.feedback,
      });

      activity = await Activity.findOne({ name: req.body.name });
      return successResponse(req, res, activity);
    });
  }
});

// @desc    Update activities
// @route   PUT /api/activity/:name
// @access  Private with token
const updateActivity = asyncHandler(async (req, res, next) => {
  const activity = await Activity.findOne({ name: req.params.name });
  var changed = false;
  if (activity) {
    if (req.body.url) {
      await fs.readFile(req.body.url, async (err, data) => {
        if (err) {
          console.log(err);
          res.status(err.code).send(err.message);
        }
        console.log(data);
        let myFile = req.body.url.split('.');
        const typeMyFile = null;
        try {
          typeMyFile = myFile[myFile.length - 1];
        } catch (e) {
          typeMyFile = req.body.url.split('.').at(-1);
        }
        const buffer = data;
        const key = `demo/${uuid()}.${typeMyFile}`;
        const bucket = process.env.AWS_BUCKET_NAME;
        await s3.write(buffer, key, bucket);
        console.log('uploaded');
        url = await s3.getSignedURL(bucket, key, 60);
        console.log(url);
        changed = true;
      });
    }
  }
  activity = await Activity.findByIdAndUpdate(activity._id, {
    type: req.body.type,
    time: req.body.time,
    bodyArea: bodyArea,
    demo: url,
    feedback: req.body.feedback,
  });
  activity = await Activity.findOne({ name: req.params.name });
  return successResponse(req, res, activity);
});

// @desc    DELETE Activity
// @route   DELETE /api/activity/:name
// @access  Private with token
const deleteActivity = asyncHandler(async (req, res, next) => {
  Activity.deleteOne({ name: req.params.name }, (err, data) => {
    if (err) {
      return next(new ErrorResponse(`delete failed`, 400));
    }
    
    return successResponse(req, res, { data });
  });
});
module.exports = {
  getActivities,
  getActivity,
  updateActivity,
  createActivity,
  deleteActivity,
};
