const express = require("express");
const post_controller = require("../controllers/postController");
const user_controller = require("../controllers/userController");
const passport = require("passport");
const router = express.Router();
const multer = require("multer");

//File upload using multer
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
  },
  fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname)
      if (ext !== '.jpg' && ext !== '.png' && ext !== '.mp4') {
          return cb(res.status(400).end('only jpg, png, mp4 is allowed'), false);
      }
      cb(null, true)
  }
});

const upload = multer({ storage: storage }).single("file");

router.post("/uploadfiles", (req, res) => {
  upload(req, res, err => {
    try{
      return res.json({ success: true, url: res.req.file.path, fileName: res.req.file.filename });
    }catch(err){
      return res.json({ success: false, err });
    }      
  });
});



// ROUTES

/* index route*/
router.get("/", function (req, res, next) {
  res.redirect("/posts");
});

// create post - posts
router.post(
  "/posts",
  passport.authenticate("jwt", { session: false }),
  post_controller.create_post
);

router.get(
  "/allposts", 
  passport.authenticate("jwt", { session: false }),
  post_controller.get_posts_elevated
);

// read/get all posts - posts
router.get("/posts", post_controller.get_posts_noob);

// read/get post - posts/:id
router.get("/posts/:id", post_controller.get_single_post);

// update post - posts/:postid
router.put(
  "/posts/:id",
  passport.authenticate("jwt", { session: false }),
  post_controller.update_post
);

// delete post - posts/:postid
router.delete(
  "/posts/:id",
  passport.authenticate("jwt", { session: false }),
  post_controller.delete_post
);

// user sign up
router.post("/sign-up", user_controller.signup);

// user login
router.post("/login", user_controller.login);

// user logout
router.get("/logout", user_controller.logout);

module.exports = router;
