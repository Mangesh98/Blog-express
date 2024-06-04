const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
	res.render("index");
});
app.post("/register", async (req, res) => {
	let { name, username, email, password, age } = req.body;
	let user = await userModel.findOne({ email });
	if (user) return res.status(500).send("User Already Registered");
	bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(password, salt, async (err, hash) => {
			let user = await userModel.create({
				name,
				username,
				email,
				password: hash,
				age,
			});

			let token = jwt.sign(
				{ email: email, userId: user._id },
				process.env.JWT_SECRET
			);
			res.cookie("token", token, { httpOnly: true });
			res.send("Registered Successfully");
		});
	});
});

app.listen(3000);
