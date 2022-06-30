//jshint esversion:6
require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");



app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {}
}))

app.use(passport.initialize()); // initializing passport
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
userSchema.plugin(findOrCreate);


const User = new mongoose.model("user", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

// HOME ROUTE

app.get("/", function (req, res) {
    res.render("home", {});
});

// LOGIN

app.get("/login", function (req, res) {
    res.render("login", {});
});

app.post("/login", function (req, res) {
    const user = new User ({
        username: req.body.username.trim(),
        password: req.body.password.trim()
    })

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate('local')(req, res, function () {
                res.redirect("/secrets");
            })
        }
    })
})

app.get("/auth/google", 
    passport.authenticate("google", {scope: ["profile"]})
);

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  });


// REGISTER

app.get("/register", function (req, res) {
    res.render("register", {});
});

app.post("/register", function (req, res) {
    User.register({username: req.body.username.trim()}, req.body.password.trim(), function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            });
        }
    })
});

// SECRETS

app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

// LOGOUT

app.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) {
            console.log(err);
        }
    });
    res.redirect("/");
})


app.listen(3000, function () {
    console.log("Server started on port 3000...");
});