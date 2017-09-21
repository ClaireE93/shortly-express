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
      res.cookies = res.cookies ? res.cookies : {};
      res.cookies['shortlyid'] = { value: hash};
      res.cookie('shortlyid', hash);
      // next(result.id);
      next();
    });
  };

  if (req.cookies && req.cookies.shortlyid) {
    const hash = req.cookies.shortlyid; //NOTE: Assume this is always the name
    Session.get({ hash })
    .then((results) => {
      if (results) {
        req.session = {};
        req.session.user = {};
        req.session.hash = hash;
        req.session.userId = results.userId ? results.userId : null;
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


module.exports.loginRedirect = (req, res, next) => {
  let cookieObj;
  cookies(req, res, () => {
    cookieObj = req.cookies;
    curHash = cookieObj.shortlyid;
    Session.get({hash: curHash})
    .then((results) => {
      if (!results) {
        res.setHeader('location', '/login');
        res.redirect(301, '/login');
      } else {
        next();
      }
    })
    .catch((err) => {
      console.error(err);
    });
  });
};

module.exports.addUser = (req, res, next) => {
  // Create new user in database
  const cb = (req, res) => {
    User.createUser(req.body)
    .then((results) => {
      module.exports.createSession(req, res, () => {
        const hash = res.cookies.shortlyid.value;
        Session.update({ hash }, {userId: results.insertId})
        .then((results) => {
          res.setHeader('location', '/');
          res.redirect('/');
        });
      });
    })
    .catch((err) => {
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

module.exports.handleLogout = (req, res, next) => {
  let cookieObj;
  cookies(req, res, () => {
    cookieObj = req.cookies;
    for (let cookie in cookieObj) {
      const curHash = cookieObj[cookie];
      Session.delete({hash: curHash})
      .catch((err) => {
        console.error(err);
      });
    }

    module.exports.createSession(req, res, () => {
      next();
    });
  });
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.headers.cookie) {
    res.setHeader('location', '/login');
    res.redirect('/login');
  } else {
    next();
  }
};
