const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

mongoose
	.connect(process.env.DB_URL)
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch((error) => {
		console.error("Error connecting to MongoDB:", error);
	});

const userSchema = mongoose.Schema({
	userName: String,
	name: String,
	age: Number,
	email: String,
	password: String,
	posts: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "post",
	}],
});

module.exports = mongoose.model("user", userSchema);
