
const parseString = (string) => {

};

const parseCookies = (req, res, next) => {
  const { cookie } = req.headers;
  if (!cookie) {
    res.cookies = {};
    next();
  } else {
    const cookieObj = parseString(cookie);
    next();
  }
};



module.exports = parseCookies;
