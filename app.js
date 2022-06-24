//jshint esversion:6
require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

main().catch(err => console.log(err));
 
async function main() {
  await mongoose.connect('mongodb://localhost:27017/userDB');
  }

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("user", userSchema);


app.get("/", function (req, res) {
    res.render("home", {});
});

app.get("/login", function (req, res) {
    res.render("login", {});
});

app.post("/login", function (req, res) {
    User.findOne({username: req.body.username.trim()}, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else if (foundUser) {
            if (foundUser.password === req.body.password.trim()) {
                res.render("secrets", {});
            }
        }
    })
})

app.get("/register", function (req, res) {
    res.render("register", {});
});

app.post("/register", function (req, res) {
    const newUser = new User({
        username: req.body.username.trim(),
        password: req.body.password.trim()
    });

    newUser.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.render("secrets", {});
        }
    })
});



app.listen(3000, function () {
    console.log("Server started on port 3000...");
});