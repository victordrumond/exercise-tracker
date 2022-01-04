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
const UserModel = mongoose.model("User", userSchema);

// Body parser: parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// POST request: create new user
app.post('/api/users', (req, res) => {
  UserModel.find({ username: req.body.username }, (err, docs) => {
    if (err) {
      console.log(err);
    } else if (docs.length === 0) {
      let newUser = new UserModel({ username: req.body.username });
      newUser.save((err, room) => {
        if (err) {
          console.log(err);
        } else {
          res.json({
            username: room.username,
            _id: room._id.toString()
          });
        };
      });
    } else {
      res.json("Username already in use. Please try a different one.");
    };
  });
});

// GET request: show all users
app.get('/api/users', async (req, res) => {
  const users = await UserModel.find().select('-__v');
  res.json(users);
});

// Listen connection on port
const listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});