const mongoose = require("mongoose");

var courseSchema = new mongoose.Schema({
    course_name: String,
    course_code: String,

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }  
});

module.exports = mongoose.model("Course", courseSchema);
