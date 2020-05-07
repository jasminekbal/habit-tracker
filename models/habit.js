var mongoose = require("mongoose");

var habitSchema = new mongoose.Schema ({
	title: String,
	image: String,
	motivation: String,
	logs: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Log"
      }
   ]
});

module.exports = mongoose.model("Habit", habitSchema);