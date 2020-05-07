var mongoose = require("mongoose");

var logSchema = mongoose.Schema({
	completed: String,
	note: String,
	date: String
});


module.exports = mongoose.model("Log", logSchema);