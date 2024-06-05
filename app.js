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
app.get("/logout", (req, res) => {
	res.cookie("token", "");
	res.redirect("/login");
});
app.get("/login", (req, res) => {
	res.render("login");
});
app.post("/register", async (req, res) => {
	let { name, userName, email, password, age } = req.body;
	let user = await userModel.findOne({ email });
	if (user) return res.status(500).send("User Already Registered");
	bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(password, salt, async (err, hash) => {
			let user = await userModel.create({
				name,
				userName,
				email,
				password: hash,
				age,
			});

			let token = jwt.sign(
				{ email: email, userId: user._id },
				process.env.JWT_SECRET
			);
			res.cookie("token", token, { httpOnly: true });
			res.redirect("/profile");
		});
	});
});
app.post("/login", async (req, res) => {
	let { email, password } = req.body;
	let user = await userModel.findOne({ email });
	if (!user) return res.status(500).send("Something went wrong !");
	bcrypt.compare(password, user.password, (err, result) => {
		if (err) return res.status(500).send("Something went wrong !");
		if (!result) return res.status(500).send("Something went wrong !");
		let token = jwt.sign(
			{ email: email, userId: user._id },
			process.env.JWT_SECRET
		);
		res.cookie("token", token, { httpOnly: true });
		res.redirect("/profile");
	});
});

app.post("/post", auth, async (req, res) => {
	let content = req.body.content.trim();
	let user = await userModel.findById(req.user.userId, "-password");
	if (!user) return res.status(500).send("Something went wrong !");
	if (content === "") return res.redirect("/profile");

	let post = await postModel.create({
		user: user._id,
		content,
	});
	user.posts.push(post._id);
	await user.save();
	res.redirect("/profile");
});

app.get("/profile", auth, async (req, res) => {
	let user = await userModel.findById(req.user.userId, "-password").populate("posts");
	console.log(user);
	res.render("profile", { user });
});

function auth(req, res, next) {
	const token = req.cookies.token;
	if (!token || token === "") return res.redirect("/login");
	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) return res.redirect("/login");
		req.user = user;
	});
	next();
}

app.listen(3000);
