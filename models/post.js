const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  date_created: { default: Date.now(), type: Date },
  date_modified: { default: Date.now(), type: Date },
  text: { required: true, type: String },
  author_name: { required: true, type: String },
  published: { default: false, type: Boolean },
  cover_image_url: { default: "default.webp", type: String }
});

PostSchema.virtual("date_formated").get(function () {
  return this.date.toLocaleDateString("en-gb", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minutes: "2-digit",
  });
});

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
