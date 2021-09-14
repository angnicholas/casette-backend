const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");

const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

const User = require("./models/user");
require("dotenv").config();

//Login Authentication
passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },

    async (username, password, done) => {
      try {
        const user = await User.findOne({ username });

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const validate = await user.isValidPassword(password);

        if (!validate) {
          return done(null, false, { message: "Wrong Password" });
        }

        return done(null, user, { message: "Logged in Successfully" });
      } catch (error) {
        return done(error);
      }
    }
  )
);

//Javascript Web Token Authentication - when user is logged in already and wants to access secure site
passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.SECRET,
      //secretOrKey: "lmaoxd",
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);

//Sign up for new user
passport.use(
  "signup",
  new localStrategy(
    {
      usernameField: "username",
      passwordField: "password"
    },
    async (username, password, done) => {
      try {
        
        user = {username, password}

        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

//Include router object
const indexRouter = require("./routes/index");

//Include Mongo DB configuration and connect to the database
const mongoDB = process.env.MONGO_DB_URL

mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

//Create the app
const app = express();

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

//Serves images uploaded from multer to client as static files
//https://stackoverflow.com/questions/48914987/send-image-path-from-node-js-express-server-to-react-client
app.use('/uploads', express.static('uploads'));

//Error handling function
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json("404 not found");
});

module.exports = app;