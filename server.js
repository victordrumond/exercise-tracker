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
  date: String
});
const UserModel = mongoose.model('User', userSchema);
const ExerciseModel = mongoose.model('Exercise', exerciseSchema);

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
  // Search new username input on database
  UserModel.find({ username: req.body.username }, (err, data) => {
    if (err) {
      console.log(err);
      // If input is an empty string we return an error message
    } else if (req.body.username === '') {
      res.json('Username cannot be empty. Please try a different one.');
      // If username is not on database we save it and return it as JSON
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
      // If username is already on database we return an error message
    } else {
      res.json('Username already in use. Please try a different one.');
    };
  });
});

// GET request: show all users
app.get('/api/users', async (req, res) => {
  // Find all users on database and return them withou the "__v" property automatically created by MongoDB
  const users = await UserModel.find().select('-__v');
  res.json(users);
});

// POST request: add exercise
app.post('/api/users/:id/exercises', (req, res) => {
  // Search id input on database
  UserModel.findById(req.params.id, (err, data) => {
    // Id, description and duration are required. Duration must be a number
    // Date is not required but if present it must be a valid JavaScript string date. If not present the current date is used
    if (err || !data) {
      res.json('There was an error processing your request. Please try again.');
    } else if (req.body.description === '') {
      res.json('Description is required.');
    } else if (req.body.duration === '' || isNaN(parseInt(req.body.duration))) {
      res.json('Duration is required and must be a number.');
    } else if (req.body.date && isNaN(new Date(req.body.date))) {
      res.json('Date is not required but if present must be a valid JavaScript string date.');
    } else {
      // Save new exercise on database and return it as JSON
      let newExercise = new ExerciseModel({
        "username": data.username,
        "description": req.body.description,
        "duration": req.body.duration,
        "date": !(req.body.date) ? new Date().toDateString() : new Date(req.body.date).toDateString()
      });
      newExercise.save((err, exercise) => {
        if (err) {
          console.log(err);
        } else {
          res.json({
            "username": exercise.username,
            "_id": req.params.id,
            "description": exercise.description,
            "duration": exercise.duration,
            "date": exercise.date
          });
        };
      });
    };
  });
});

// GET request: exercise log
app.get('/api/users/:id/logs', async (req, res) => {
  // First we have to check if the provided id matches an user on the database
  const user = await UserModel.find({ _id: req.params.id });
  if (user.length === 0) {
    // If not present we return an error message
    res.json('User not found. Please try a different id.');
  } else {
    // If present
    // Save "from", "to" and "limit" - optional parameters that may be present on the GET request
    const { from, to, limit } = req.query;
    let fromDate, toDate;
    // Define variables to the date range. These variables must be Date Objects so we can make comparisons below
    if (from === undefined && to === undefined) {
      fromDate = new Date(0);
      toDate = new Date();
    } else if (from !== undefined && to === undefined) {
      fromDate = new Date(from);
      toDate = new Date();
    } else if (from === undefined && to !== undefined) {
      fromDate = new Date(0);
      toDate = new Date(to);
    } else if (from !== undefined && to !== undefined) {
      fromDate = new Date(from);
      toDate = new Date(to);
    };
    // Find all exercises from the requested user on database
    ExerciseModel.find({ username: user[0].username }, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        // Filter by date range
        let filteredData = data.filter(item => new Date(Date.parse(item.date)) >= fromDate && new Date(Date.parse(item.date)) <= toDate);
        // Limit the number of results using the optional parameter providaded on the GET request
        let outputLength;
        if (limit <= filteredData.length) {
          outputLength = limit;
        } else {
          outputLength = filteredData.length
        };
        // Create a log array from the filtered data - only "description", "duration" and "date" properties are needed
        let log = [];
        if (filteredData.length > 0) {
          for (let i = 0; i < outputLength; i++) {
            let newItem = {
              "description": filteredData[i].description,
              "duration": filteredData[i].duration,
              "date": filteredData[i].date
            };
            log.push(newItem);
          };
        };
        // Return the result as JSON
        res.json({
          "username": user[0].username,
          "_id": req.params.id,
          "count": log.length,
          "log": log
        });
      };
    });
  };
});

// Listen connection on port
const listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});