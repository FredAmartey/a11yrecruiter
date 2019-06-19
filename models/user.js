const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");


var UserSchema = new mongoose.Schema({
	google: {
		id: String,
		token: String,
		email: { type: String, require: true, index:true, unique:true,sparse:true},
		fullName: String,
		firstName: String,
		lastName:String
	},
	    firstName: String,
	    lastName: String,
	    email: { type: String, require: true, index:true, unique:true,sparse:true},
	    password: { type: String, require:true },
			avatar: String,
			resetPasswordToken: String,
			resetPasswordExpires: Date

});

UserSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model("User", UserSchema);
