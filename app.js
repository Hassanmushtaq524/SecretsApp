//jshint esversion:6
require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

app.use(passport.initialize());
app.use(passport.session());

// mongoose connection
main().catch(err => console.log(err));
 
async function main() {
  await mongoose.connect('mongodb://localhost:27017/userDB');
  }

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("user", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
    res.render("home", {});
});

app.get("/login", function (req, res) {
    res.render("login", {});
});

app.post("/login", function (req, res) {
    
})

app.get("/register", function (req, res) {
    res.render("register", {});
});

app.post("/register", function (req, res) {
    User.register({username: req.body.username.trim()}, req.body.password.trim(), function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            password.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            })
        }
    })
});

app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.render("login");
    }
});


app.listen(3000, function () {
    console.log("Server started on port 3000...");
});