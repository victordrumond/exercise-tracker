// Require dependencies & basic configuration
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const generateUniqueId = require('generate-unique-id');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

// MongoDB & Mongoose: connect to the database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define schemas & models
const userSchema = new mongoose.Schema({
  username: String,
  _id: String
});
const exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date
});
const logSchema = new mongoose.Schema({
  username: String,
  count: Number,
  log: Array
});
const UserModel = mongoose.model('User', userSchema);
const ExerciseModel = mongoose.model('Exercise', exerciseSchema);
const LogModel = mongoose.model('Log', logSchema);

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// POST request: create new user
app.post('/api/users', (req, res) => {
  UserModel.find({ username: req.body.username }, (err, data) => {
    if (err) {
      console.log(err);
    } else if (req.body.username === '') {
      res.json('Username cannot be empty. Please try a different one.');
    } else if (data.length === 0) {
      let newUser = new UserModel({
        "username": req.body.username,
        "_id": generateUniqueId({
          length: 20,
          useLetters: true,
          useNumbers: true
        })
      });
      newUser.save((err, user) => {
        if (err) {
          console.log(err);
        } else {
          res.json({
            "username": user.username,
            "_id": user._id
          });
        };
      });
    } else {
      res.json('Username already in use. Please try a different one.');
    };
  });
});

// GET request: show all users
app.get('/api/users', async (req, res) => {
  const users = await UserModel.find().select('-__v');
  res.json(users);
});

// POST request: add exercise
app.post('/api/users/:_id/exercises', (req, res) => {

  const dealWithDate = (date) => {
    if (date instanceof Date && !isNaN(date)) {
      return new Date(date);
    } else {
      return new Date();
    };
  };

  UserModel.findById(req.body.id, (err, data) => {

    let description = req.body.description;
    let duration = req.body.duration;
    let date = dealWithDate(req.body.date);

    if (err) {
      console.log(err);
    } else {
      let newExercise = new ExerciseModel({
        "username": data.username,
        "description": description,
        "duration": duration,
        "date": date.toDateString()
      });
      newExercise.save((err, exercise) => {
        if (err) {
          console.log(err);
        } else {
          res.json({
            "_id": req.body.id,
            "username": exercise.username,
            "description": exercise.description,
            "duration": exercise.duration,
            "date": exercise.date
          });
        };
      });
    };
  });
});

// Listen connection on port
const listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});