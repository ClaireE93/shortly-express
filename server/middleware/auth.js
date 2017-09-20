const models = require('../models');
const Promise = require('bluebird');
const mysql = require('mysql');
const db = Promise.promisifyAll(require('../db'));
const utils = require('../lib/hashUtils');

module.exports.createSession = (req, res, next) => {
};

const userExists = (username) => {
  const queryString = `SELECT * FROM users WHERE username = "${username}"`;
  db.queryAsync(queryString)
  .then((results) => {
    if (results.length > 0) {
      console.log('returning true');
      return true;
    } else {
      return false;
    }
  })
  .catch((err) => {
    console.error('ERROR in userExists', err);
    return false;
  });
};

module.exports.addUser = (req, res, next) => {
  const inputPass = req.body.password;
  const newSalt = utils.createRandom32String();
  const newPass = utils.createHash(inputPass, newSalt);
  const queryString = 'INSERT INTO users SET ?';
  const newUser = {
    username: req.body.username,
    password: newPass,
    salt: newSalt,
  };
  db.queryAsync(queryString, newUser)
  .then((results) => {
    console.log('returning!');
    res.statusCode = 200;
    res.end();
  })
  .catch((err) => {
    res.statusCode = 400;
    res.end(err.toString());
  });
};



/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
