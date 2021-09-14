const Post = require("../models/post");
const { body, validationResult } = require("express-validator");

//Method to create a new post
exports.create_post = [
  body("author_name", "Empty name").trim().escape(),
  body("title", "text").trim(),

  function (req, res, next) {

    //console.log(req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({
        data: req.body,
        errors: errors.array(),
      });
      //console.log("SOME ERRORS", errors);
      return;
    }
    // title, date - default to created time, author, published - default to false
    const { author_name, title, text, published, cover_image_url } = req.body;
    const post = new Post({
      date_created:Date.now(),
      date_modified:Date.now(),
      author_name,
      title,
      text,
      published,
      cover_image_url
    });
    post.save((err) => {
      if (err) {
        //console.log("SOME ERRORS", err);
        return next(err);
      }
      res.status(200).json({ msg: "post sent" });
    });
  },
];

//Method to get list of all posts for elevated users (admin)
exports.get_posts_elevated = async function (req, res, next) {
  try {
    const posts = await Post.find({});
    if (!posts) {
      return res.status(404).json({ err: "posts not found" });
    }
    res.status(200).json({ posts });
  } catch (err) {
    //console.log(err)
    next(err);
  }
};

//Get posts method for unelevated users (Public)
exports.get_posts_noob = async function (req, res, next) {
  try {
    const posts = await Post.find({}).where('published').equals(true);
    if (!posts) {
      return res.status(404).json({ err: "posts not found" });
    }
    res.status(200).json({ posts });
  } catch (err) {
    //console.log(err)
    next(err);
  }
}

//Method to retrieve data about a single post
exports.get_single_post = async function (req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ err: `post with id ${req.params.id} not found` });
    }
    res.status(200).json({ post });
  } catch (err) {
    next(err);
  }
};

//Method to update a post
exports.update_post = async function (req, res, next) {

  try {
    const { author_name, title, text, published, cover_image_url } = req.body;
    
    let payload = null;

    if(cover_image_url){ //if the field is filled with an image url send it over
      payload = {
        date_modified:Date.now(),
        author_name,
        title,
        text,
        published,
        cover_image_url
      }

    } else { //do not update the cover image url
      payload = {
        date_modified:Date.now(),
        author_name,
        title,
        text,
        published
      }
    }

    const post = await Post.findByIdAndUpdate(req.params.id, payload);

    if (!post) {
      return res.status(404).json({ msg: "could not update" });
    }else{
      return res.status(200).json({ msg: "updated sucessfuly" });
    }      

  } catch (err) {
    //console.log(err);
    next(err);
  }
};

//Method to remove a post
exports.delete_post = async function (req, res, next) {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ err: `posts with id ${req.params.id} not found` });
    }
    res.status(200).json({ msg: `post ${req.params.id} deleted sucessfuly` });
  } catch (err) {
    next(err);
  }
};
