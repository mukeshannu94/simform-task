const jwt = require('jsonwebtoken');
const config = require('../config/config.json');
const User = require('../models/User');
const UserToken = require('../models/UserToken');

const auth = async (req, res, next) => {
  try {
    if (req.header('Authorization')) {
      const token = req.header('Authorization').replace('Bearer ', '');
      const data = jwt.verify(token, config.secretKey);
      const user = await User.findOne({ email: data.email });
      if (user && user.status) {
        const session = await UserToken.findOne({ userId: user._id, token });
        if (session) {
          req.user = user;
          req.token = token;
          next();
        } else {
          throw new Error();
        }
      } else {
        throw new Error();
      }
    } else {
      throw new Error();
    }
  } catch (error) {
    res.status(401).send({ statusCode: 401, message: 'Not authorized to access this resource' });
  }
};
module.exports = auth;
