# Exercise Tracker
https://victordrumond-exercise-tracker.herokuapp.com/

## Technologies
`HTML` `CSS` `JavaScript` `Node.js` `Express.js` `Mongoose`

## About
* A [project](https://www.freecodecamp.org/learn/back-end-development-and-apis/back-end-development-and-apis-projects/exercise-tracker) from freeCodeCamp's Back End Development and APIs Certification.
* Make POST requests to add users and exercises to the database.
* Make GET requests to the API endpoint `[url]/api/users` to receive an array containing all users on the database.
* Make GET requests to the API endpoint `[url]/api/users/:id/logs?[from][&to][&limit]` to receive the exercise log of a specific user. Note that you can add `from`, `to` and `limit` as optional parameters to retrieve part of the exercise log of any user. The first two are dates in yyyy-mm-dd format while the last is an integer of how many logs to send back.
* Database hosted on [MongoDB Atlas](https://www.mongodb.com/atlas).
* App running on Heroku. [Learn more](https://devcenter.heroku.com/articles/getting-started-with-nodejs).

## Running Locally
In the project directory, you can run:

```
$ npm install
$ npm start
```

The app should now be running on [http://localhost:3000](http://localhost:3000).

**Important**: You need to create a .env file in the project directory and store the following variable:

`MONGO_URI='mongodb+srv://<username>:<password>@cluster0.uxh57.mongodb.net/<database>?retryWrites=true&w=majority'`

This will connect the project to a MongoDB database. Be sure to change `<username>`, `<password>` and `<database>` to your own MongoDB information.