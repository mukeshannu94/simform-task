const httpStatus = require('http-status-codes').StatusCodes;
const User = require('../models/User');
const UserToken = require('../models/UserToken');
const global = require('../resources/lang/en/global.json');
const responseManagement = require('../lib/responseManagement');

/**
 * User Login
 * @author Mukesh Sharma
 * @version 1.0
 * @param {string} email - Email of the User
 * @param {string} password - Password of the User
 */

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && user.validPassword(password)) {
      if (user.status) {
        const token = await user.generateJWT();
        const reqIp = req.connection.remoteAddress.split(':')[3] || '';
        const userToken = new UserToken({
          userId: user._id, token, reqIp, userAgent: req.headers['user-agent'],
        });
        await userToken.save();
        responseManagement.sendResponse(res, httpStatus.OK, '', { token });
      } else {
        responseManagement.sendResponse(res, httpStatus.UNAUTHORIZED, global.user_is_inactive);
      }
    } else {
      responseManagement.sendResponse(res, httpStatus.BAD_REQUEST, global.invalid_credentials);
    }
  } catch (error) {
    responseManagement.sendResponse(
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      global.internal_server_error,
    );
  }
};

/**
 * User Register
 * @author Mukesh Sharma
 * @version 1.0
 * @param {string} firstName - First Name of the User
 * @param {string} lastName - Last Name of the User
 * @param {string} email - Email of the User
 * @param {string} password - Password of the User
 */

module.exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      responseManagement.sendResponse(res, httpStatus.BAD_REQUEST, global.email_already_exist);
    } else {
      const newUser = new User(req.body);
      newUser.setPassword(password);
      await newUser.save();
      responseManagement.sendResponse(res, httpStatus.OK, global.user_register);
    }
  } catch (error) {
    responseManagement.sendResponse(
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      global.internal_server_error,
    );
  }
};

/**
 * Users List
 * @author Mukesh Sharma
 * @version 1.0
 */

module.exports.usersList = async (req, res) => {
  try {
    const {
      start, length, columns, order, search, draw, status,
    } = req.body;
    const sortColumn = columns[order[0].column].data;
    const sortOrder = order[0].dir;
    const searchValue = search.value;
    const searchQuery = [];
    const filter = { status: { $in: status } };
    for (let i = 0; i < columns.length; i += 1) {
      if (columns[i].searchable) {
        const key = columns[i].name;
        searchQuery.push({
          [key]: { $regex: searchValue, $options: 'i' },
        });
      }
    }
    const sortQuery = {
      [sortColumn]: sortOrder,
    };
    let query1;
    if (searchValue) {
      query1 = { $or: searchQuery };
    } else {
      query1 = {};
    }
    const users = await User.find(
      { $and: [query1, filter] },
      { salt: 0, hash: 0 },
      { sort: sortQuery, skip: start, limit: length },
    );
    const total = await User.countDocuments(filter);
    const stotal = await User.countDocuments({ $and: [query1, filter] });
    const newObj = {
      users, draw, recordsTotal: total, recordsFiltered: stotal,
    };
    responseManagement.sendResponse(
      res,
      httpStatus.OK,
      '',
      newObj,
    );
  } catch (error) {
    responseManagement.sendResponse(
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      global.internal_server_error,
    );
  }
};

/**
 * get user details
 * @author Mukesh Sharma
 * @version 1.0
 * @param {string} _id - id of the User
 */

module.exports.userDetail = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params._id }, { salt: 0, hash: 0 });
    if (!user) {
      responseManagement.sendResponse(res, httpStatus.BAD_REQUEST, global.user_not_found);
    } else {
      responseManagement.sendResponse(res, httpStatus.OK, '', { user });
    }
  } catch (error) {
    responseManagement.sendResponse(
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      global.internal_server_error,
    );
  }
};

/**
 * Update User
 * @author Mukesh Sharma
 * @version 1.0
 * @param {string} _id - id of the User
 * @param {string} firstName - First Name of the User
 * @param {string} lastName - Last Name of the User
 * @param {string} email - Email of the User
 * @param {string} password - Password of the User
 * @param {string} profileImage - Profile Image of the User
 */

module.exports.updateUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params._id });
    if (!user) {
      responseManagement.sendResponse(res, httpStatus.BAD_REQUEST, global.user_not_found);
    } else {
      if (req.body.password) {
        user.setPassword(req.body.password);
      }
      if (req.file) {
        user.profileImage = req.file.filename;
      }
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.email = req.body.email;
      user.status = req.body.status;
      await user.save();
      responseManagement.sendResponse(res, httpStatus.OK, global.user_updated);
    }
  } catch (error) {
    responseManagement.sendResponse(
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      global.internal_server_error,
    );
  }
};

/**
 * Logout User
 * @author Mukesh Sharma
 * @version 1.0
 */
module.exports.logout = async (req, res) => {
  try {
    const result = await UserToken.deleteOne({ userId: req.user._id, token: req.token });
    if (result) {
      responseManagement.sendResponse(res, httpStatus.OK, global.logged_out_successful);
    } else {
      responseManagement.sendResponse(res, httpStatus.UNAUTHORIZED, global.internal_server_error);
    }
  } catch (error) {
    responseManagement.sendResponse(
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      global.internal_server_error,
    );
  }
};
