const models = require('../models');
const Promise = require('bluebird');
const mysql = require('mysql');
const db = Promise.promisifyAll(require('../db'));
const utils = require('../lib/hashUtils');

module.exports.createSession = (req, res, next) => {
};

module.exports.addUser = (req, res, next) => {

  const cb = (req, res) => {
    const inputPass = req.body.password;
    const newSalt = utils.createRandom32String();
    const newPass = utils.createHash(inputPass, newSalt);
    const queryString = 'INSERT IGNORE INTO users SET ?';
    const newUser = {
      username: req.body.username,
      password: newPass,
      salt: newSalt,
    };
    db.queryAsync(queryString, newUser)
    .then((results) => {
      res.statusCode = 200;
      res.setHeader('location', '/');
      res.redirect('/');
    })
    .catch((err) => {
      res.statusCode = 400;
      res.end(err.toString());
    });
  };

  const checkString = `SELECT * FROM users WHERE username = "${req.body.username}"`;
  db.queryAsync(checkString)
  .then(([rows, cols]) => {
    if (rows.length) {
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
  // Query username. If exists, get salt
  // Run hashing on salt to get encrypted password
  // compare to input password

  const cb = (data) => {
    const retrievedPass = data.password;
    const retrievedSalt = data.salt;
    const hashedPassword = utils.createHash(password, retrievedSalt);
    if (hashedPassword === retrievedPass) {
      res.setHeader('location', '/');
      res.redirect('/');
    } else {
      res.setHeader('location', '/login');
      res.redirect('/login');
    }
  };

  const checkString = `SELECT * FROM users WHERE username = "${username}"`;
  db.queryAsync(checkString)
  .then(([rows, cols]) => {
    if (rows.length) {
      cb(rows[0]);
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
