const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const mongoose = require("mongoose");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const { User } = require("./models/user");
const { Log } = require("./models/log");

function done(res, err, data) {
  if (err) {
    return res.status(400).send(err.message);
  } else if (data) {
    return res.json(data);
  }
  res.end();
}

app.post("/api/users", (req, res) => {
  let user = new User(req.body);
  user.save(function (err, user) {
    done(res, err, { username: user.username, _id: user._id });
  });
});

app.get("/api/users", (req, res) => {
  User.find({}, "_id username", function (err, users) {
    done(res, err, users);
  });
});

app.post("/api/users/:_id/exercises", (req, res) => {
  let _id = req.params._id;

  User.findById(_id, function (err, user) {
    if (err) return done(res, err);
    if (!user) return done(res, new Error("Unknown userId"));

    let log = new Log({
      userId: user._id,
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date || undefined,
    });

    log.save(function (err, log) {
      done(res, err, {
        _id: user._id,
        username: user.username,
        date: log?.date,
        duration: log?.duration,
        description: log?.description,
      });
    });
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  let _id = req.params._id;

  User.findById(_id, function (err, user) {
    if (err) return done(res, err);
    if (!user) return done(res, new Error("Unknown userId"));

    let query = Log.find({ userId: user._id }).select("-_id -userId -__v");

    if (req.query.limit) query = query.limit(parseInt(req.query.limit));
    if (req.query.from) query = query.where('date').gt(req.query.from);
    if (req.query.to) query = query.where('date').lt(req.query.to);

    query.exec(function (err, logs) {
      done(res, err, {
        _id: user._id,
        username: user.username,
        count: logs.length,
        log: logs,
      });
    });
  });
});

mongoose.connect(
  "mongodb://localhost:27017/exercisetracker2",
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) throw err;

    Log.deleteMany({ date: null }, function (err) {
      console.log("🚀 ~ file: server.js ~ line 74 ~ err", err);
    });

    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log("Your app is listening on port " + listener.address().port);
    });
  }
);
