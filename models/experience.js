const mongoose = require("mongoose");

var experienceSchema = new mongoose.Schema({
  job_title: String,
  employer: String,
  job_location: String,
  start_date: Date,
  end_date: Date,
  state: String,
  description: String,
  user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
  }

});

module.exports = mongoose.model("Experience", experienceSchema);
