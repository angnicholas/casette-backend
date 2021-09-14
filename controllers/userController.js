const User = require("../models/user");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

exports.signup = [
  body("username", "Empty name")
    .trim()
    .escape()
    .custom(async (username) => {
      try {
        const existingUsername = await User.findOne({ username: username });
        if (existingUsername) {
          throw new Error("username already in use");
        }
      } catch (err) {
        throw new Error(err);
      }
    }),
  body("secret").isLength(6).custom((value, {req})=>{
    if(value !== process.env.SIGNUPSECRET){
      return next("No entry!");
    }
    return true
    
  }),
  body("display_name").trim(),
  body("password").isLength(6).withMessage("Minimum length 6 characters"),
  body("confirm-password").custom((value, { req }) => {
    if (value !== req.body.password) {
      return next("Password confirmation does not match password");
    }
    // Indicates the success of this synchronous custom validator
    return true;
  }),
  async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        username: req.body.username,
        errors: errors.array(),
      });
    }else{
      passport.authenticate("signup", { session: false }, async (err, user, info) => {
        
        if (err) {
          return next(err);
          //console.log(err);
        }

        const {username, password} = user;
        display_name = req.body.display_name;

        //console.log(user);
        //console.log(req.body.display_name);

        const newuser = await User.create({ username, password, display_name });

        // const newuser = User.findByIdAndUpdate(user._id, {
        //   display_name: req.body.display_name
        // });

        //console.log(newuser)

        res.json({
          message: "Signed-up sucessfuly",
          user: req.user,
        });

      })(req, res, next);
    }
  }
];

exports.login = async (req, res, next) => {
  //console.log(req.body);
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err || !user) {
        const error = new Error("An error occurred.");
        //console.log(user);
        //console.log(err);
        //console.log(error);
        return next(error);
      }

      req.login(user, { session: false }, async (error) => {
        if (error) {return next(error);} 

        const body = { _id: user._id, username: user.username };
        const token = jwt.sign({ user: body }, process.env.SECRET, {
          expiresIn: "1d",
        });

        return res.json({ token, user });
      });
    } catch (error) {
      //console.log(error);
      return next(error);
    }
  })(req, res, next);
};

exports.logout = function (req, res) {
  req.logout();
  res.redirect("/");
};
