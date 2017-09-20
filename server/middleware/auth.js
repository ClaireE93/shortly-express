const models = require('../models');
const Promise = require('bluebird');
const mysql = require('mysql');
const db = Promise.promisifyAll(require('../db'));
const utils = require('../lib/hashUtils');
const User = require('../models/user');

module.exports.createSession = (req, res, next) => {
};

module.exports.addUser = (req, res, next) => {

  // Create new user in database
  const cb = (req, res) => {
    User.create(req.body)
    .then(() => {
      res.statusCode = 200;
      res.setHeader('location', '/');
      res.redirect('/');
    })
    .catch((err) => {
      res.statusCode = 400;
      res.end(err.toString());
    });
  };

  // Check if username exists
  User.get(req.body.username)
  .then((results) => {
    if (results) {
      res.setHeader('location', '/signup');
      res.redirect('/signup');
    } else {
      cb(req, res);
    }
  })
  .catch((err) => {
    console.error(err);
  });

};

module.exports.checkLogin = (req, res, next) => {
  const { username, password } = req.body;

  // Check if input password is correct
  const cb = (data) => {
    const isRightPassword = User.compare(password, data.password, data.salt);
    if (isRightPassword) {
      res.setHeader('location', '/');
      res.redirect('/');
    } else {
      res.setHeader('location', '/login');
      res.redirect('/login');
    }
  };

  // Check if user exists
  User.get(username)
  .then((results) => {
    if (results) {
      cb(results);
    } else {
      res.setHeader('location', '/login');
      res.redirect('/login');
    }
  })
  .catch((err) => {
    console.error(err);
  });

};



/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
