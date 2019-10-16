const mongoose = require("mongoose");

var profileSchema = new mongoose.Schema({
  fullname: {
      id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
      },
      firstname: String,
      lastname: String
  },
  education: [
     {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Education"
     }
  ],
  experience: [
      {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Experience"
      }
  ],

  course: [
     {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Course"
     }
  ]

});
module.exports = mongoose.model("Profile", profileSchema);
