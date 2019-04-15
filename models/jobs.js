var mongoose    = require("mongoose");

var jobSchema = new mongoose.Schema({
    title: String,
    company: String,
    type: String,
    location: String,
    description: String,
    requirements: String,
    applydate: String
});

module.exports = mongoose.model("Job", jobSchema);