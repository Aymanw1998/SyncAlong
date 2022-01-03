const asyncHandler = require('../middleware/async');
const { Activity } = require('../models/activitys');
const { getFile } = require('./files');
const ErrorResponse = require('../utils/errorResponse');
const { successResponse } = require('../utils/successResponse');

// @desc    Get all Activitys
// @route   GET /api/activitys/
// @access  Public
const getActivitys = asyncHandler(async (req, res, next) => {
  const activitys = await Activity.find();
  return successResponse(req, res, { activitys });
});

// @desc    Get single Activity
// @route   GET /api/activitys/:name
// @access  Public
const getActivity = asyncHandler(async (req, res, next) => {
  const activity = await Activity.findOne({ name: req.params.name });
  return successResponse(req, res, { activity });
});

// @desc    Create new Activity
// @route   POST /api/activity/
// @access  Private with token
const createActivity = asyncHandler(async (req, res, next) => {
  //body:
  //      name
  //      url for file
  //      BasicBodyParts: Array

  const file = await getFile(req, res, next);
  let body = {
    name: req.body.name,
    file: file._id,
    BasicBodyParts: req.body.BasicBodyParts
  };
  const activity = await Activity.create(body);

  console.log('Activity:', activity);
  return successResponse(req, res, { activity: activity });
});

// @desc    Update Activitys
// @route   PUT /api/activity/:name
// @access  Private with token
const updateActivity = asyncHandler(async (req, res, next) => {
  //body: url, or BasicBodyParts, or anything
  const activity = await Activity.findOne({ name: req.params.name });
  var changed = false;
  if (activity) {
    if (req.body.url) {
      const file = await getFile(req, res, next);
      await activity.findOneAndUpdate(
        { _id: activity._id },
        { $addToSet: { file: file._id } }
      );
      changed = true;
    }
    if (req.body.BasicBodyParts) {
      await Activity.findOneAndUpdate(
        { _id: Activity._id },
        { $addToSet: { BasicBodyParts: req.body.BasicBodyParts } }
      );
      changed = true;
    }
  }
  activity = await Activity.findOne({ name: req.params.name });
  if (changed) {
    return successResponse(req, res, activity);
  } else {
    return next(new ErrorResponse(`missing url or BasicBodyParts`, 400));
  }
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

// @desc    ADD/Remove basic body parts
// @desc    id => _id for Activity,
//          activity => ["add" OR "remove"],
//          possibility => ["Prohibited" OR "Desirable"],
//          body_Part => ['head', 'right hand', 'left hand', 'right leg', 'left leg', 'left']
// @route
// @access  Private (For another functions)
const bodyPart = asyncHandler(async (id, activity, body_Part) => {
  var isCorrect = false;
  BodyPart.map((p) => {
    if (p === body_Part) {
      isCorrect = true;
    }
  });
  if (!isCorrect) {
    return false;
  }
  if (activity === 'add') {
    try {
      await Activity.findOneAndUpdate(
        { _id: id },
        { $addToSet: { BasicBodyParts: body_Part } }
      );
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  } else {
    // activity === "remove"
    try {
      await Activity.findOneAndUpdate(
        { _id: id },
        { $pull: { BasicBodyParts: body_Part } }
      );
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
});

// @decs    Add basic body parts for Activity
// @router  POST /api/activitys/:name/body
// @access  Private with token
const addBasicBodyPartsActivity = asyncHandler(async (req, res, next) => {
  let activity = await Activity.findOne({ name: req.params.name });
  const basic_body_parts = req.body.basicBodyParts; // Array
  if (basic_body_parts.length > 0) {
    basic_body_parts.map(async (part) => {
      let b = await bodyPart(activity._id, 'add', part);
    });
  }
  activity = await Activity.findOne({ id: activity._id });
  return successResponse(req, res, { activity });
});

// @decs    remove basic body parts for profile
// @router  DELET /api/activitys/body
// @access  Private with token
const removeBasicBodyPartsActivity = asyncHandler(async (req, res, next) => {
  let activity = await Activity.findOne({ name: req.params.name });
  const basic_body_parts = req.body.basicBodyPart; // Array
  if (basic_body_parts.length > 0) {
    basic_body_parts.map(async (part) => {
      let b = await bodyPart(activity._id, 'remove', part);
    });
  }
  activity = await Activity.findOne({ id: activity._id });
  return successResponse(req, res, { activity });
});


/**************************************************************************************/

const puseActivity = asyncHandler(async (req, res, next) => {

});

const stopActivity = asyncHandler(async (req, res, next) =>{

});

const continueActivity = asyncHandler(async (req, res, next) =>{

});

const changeActivity = asyncHandler(async (req, res, next) =>{

});


module.exports = {
  getActivitys,
  getActivity,
  updateActivity,
  createActivity,
  deleteActivity,
  addBasicBodyPartsActivity,
  removeBasicBodyPartsActivity
};
