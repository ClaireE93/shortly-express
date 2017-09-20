
const parseString = (string) => {
  const final = {};
  const pairedValArr = string.split(';');
  pairedValArr.forEach((pair) => {
    const keyValArr = pair.trim().split('=');
    final[keyValArr[0]] = keyValArr[1];
  });

  return final;
};

const parseCookies = (req, res, next) => {
  const { cookie } = req.headers;
  if (!cookie) {
    req.cookies = {};
    next();
  } else {
    const cookieObj = parseString(cookie);
    req.cookies = cookieObj;
    next();
  }
};



module.exports = parseCookies;
