const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  listPose: [],
  date_time: {
    type: Date, default: Date.now
  },
  user: {
    type: String,
  }
});
const testModel = mongoose.model("tests", testSchema);
exports.TestModel = testModel;
