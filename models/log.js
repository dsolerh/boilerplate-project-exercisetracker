const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.ObjectId, required: true },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

logSchema.path('date').get(function (v) {
  if (!v) return v;
  const dateArr = v.toUTCString().split(" ").filter((x,i) => i<4);
  const newDateArr = [dateArr[0], dateArr[2], dateArr[1], dateArr[3]];
  return newDateArr.join(" ").replace(',','');
});

logSchema.post("save", function (error, doc, next) {
  if (
    error.name === "ValidationError" &&
    Object.keys(error.errors).length &&
    Object.keys(error.errors).length > 0
  ) {
    next(error.errors[Object.keys(error.errors)[0]]);
  } else {
    next(error);
  }
});

logSchema.set('toJSON', { getters: true, virtuals: false });
logSchema.set('toObject', { getters: true });

exports.Log = mongoose.model("Log", logSchema);
