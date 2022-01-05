// Require dependencies
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

// Basic configuration
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS so API is remotely testable by freeCodeCamp 
app.use(cors());

// Basic routing
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// MongoDB & Mongoose: connect to the database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define schemas & models
const userSchema = new mongoose.Schema({
  username: String
});
const exerciseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: String },
  username: { type: String }
});
const UserModel = mongoose.model('User', userSchema);
const ExerciseModel = mongoose.model('Exercise', exerciseSchema);

// Body parser: parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// POST request: create new user
app.post('/api/users', (req, res) => {
  UserModel.find({ username: req.body.username }, (err, docs) => {
    if (err) {
      console.log(err);
    } else if (docs.length === 0) {
      let newUser = new UserModel({ username: req.body.username });
      newUser.save((err, user) => {
        if (err) {
          console.log(err);
        } else {
          res.json({
            username: user.username,
            _id: user._id
          });
        };
      });
    } else if (req.body.username === '') {
      res.json('Username cannot be empty. Please try a different one.');
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
    UserModel.findById(req.body.id, (err, docs) => {
    if (err || !docs) {
      res.json('There was an error processing your request. Please try again.');
    } else if (req.body.description === '') {
      res.json('Description is required.');
    } else if (req.body.duration === '' || isNaN(Number(req.body.duration))) {
      res.json('Duration is required and must be a number.');
    } else if (req.body.date !== '' && isNaN(Date.parse(req.body.date))) {
      res.json('Date is not required but if present must be a valid JavaScript string date.');
    } else {
      let newExercise = new ExerciseModel({
        username: docs.username,
        description: req.body.description,
        duration: parseInt(req.body.duration),
        date: req.body.date === '' ? new Date().toUTCString() : new Date(Date.parse(req.body.date)).toUTCString(),
        userId: docs._id
      });
      newExercise.save((err, exercise) => {
        if (err) {
          console.log(err);
        } else {
          res.json({
            username: exercise.username,
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date,
            _id: exercise.userId
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