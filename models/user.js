const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  }
});

userSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    next(new Error("Username already taken"));
  } else if (
    error.name === "ValidationError" &&
    Object.keys(error.errors).length &&
    Object.keys(error.errors).length > 0
  ) {
    next(error.errors[Object.keys(error.errors)[0]]);
  } else {
    next(error);
  }
});

exports.User = mongoose.model("User", userSchema);
