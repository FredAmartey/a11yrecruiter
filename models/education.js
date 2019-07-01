const mongoose = require("mongoose");


var educationSchema = new mongoose.Schema({
   name: String,
   major: String,
   school_year: String,
   start_date: Date,
   end_date: Date,
   gpa: String,
   coursework: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
      }
   ],
   user_id: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User"
   }
});


module.exports = mongoose.model("Education", educationSchema);
