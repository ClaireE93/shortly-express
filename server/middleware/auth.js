const models = require('../models');
// const Promise = require('bluebird');
// const mysql = require('mysql');
// const db = Promise.promisifyAll(require('../db'));
const utils = require('../lib/hashUtils');
const User = require('../models/user');
const cookies = require('./cookieParser');
const Session = require('../models/session');

module.exports.createSession = (req, res, next) => {
  const createSessionWithNewCookie = () => {
    Session.create()
    .then((result) => {
      return result.insertId;
    })
    .then((id) => {
      return Session.get({ id });
    })
    .then((result) => {
      const { hash } = result;
      req.session = {};
      req.session.user = {};
      req.session.hash = hash;
      res.cookies['shortlyid'] = { value: hash};
      next();
    });
  };

  if (req.cookies.shortlyid) {
    const hash = req.cookies.shortlyid; //NOTE: Assume this is always the name
    Session.get({ hash })
    .then((results) => {
      if (results) {
        req.session = {};
        req.session.user = {};
        req.session.hash = hash;
        req.session.userId = results.userId;
        req.session.user.username = results.userId ? results.user.username : undefined;
        next();
      } else {
        createSessionWithNewCookie();
      }
    });
  } else if (!req.session) {
    createSessionWithNewCookie();
  } else {
    next();
  }
};

module.exports.addUser = (req, res, next) => {

  // Create new user in database
  const cb = (req, res) => {
    User.createUser(req.body)
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
  User.get({username: req.body.username})
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
  User.get({username})
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
