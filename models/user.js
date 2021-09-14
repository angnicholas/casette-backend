const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  username: { required: true, type: String },
  password: { required: true, type: String },
  display_name: { default: "", type: String }
});

UserSchema.pre("save", async function (next) {
  const user = this;
  const hash = await bcrypt.hash(this.password, 10);

  this.password = hash;
  next();
});

UserSchema.methods.isValidPassword = async function (password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);

  return compare;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
