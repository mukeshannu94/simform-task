const { celebrate, Joi } = require('celebrate');
const objectId = require('mongoose').Types.ObjectId;

module.exports.login = celebrate({
  body: Joi.object().options({ abortEarly: false }).keys({
    email: Joi.string().required().pattern(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/),
    password: Joi.string().required(),
  }),
});

module.exports.register = celebrate({
  body: Joi.object().options({ abortEarly: false }).keys({
    firstName: Joi.string().required().pattern(/^[a-zA-Z]+$/)
      .min(2)
      .max(30),
    lastName: Joi.string().required().pattern(/^[a-zA-Z]+$/).min(2)
      .max(30),
    password: Joi.string().required().min(8)
      .max(12)
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/),
    email: Joi.string().required().pattern(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/),
  }),
});

module.exports.userDetail = celebrate({
  params: Joi.object().options({ abortEarly: false }).keys({
    _id: Joi.string().required().custom((value, helper) => {
      if (!objectId.isValid(value)) {
        return helper.message('Id must be 24 character hex string');
      }
      return value;
    }),
  }),
});
module.exports.updateUser = celebrate({
  params: Joi.object().options({ abortEarly: false }).keys({
    _id: Joi.string().required().custom((value, helper) => {
      if (!objectId.isValid(value)) {
        return helper.message('Id must be 24 character hex string');
      }
      return value;
    }),
  }),

  body: Joi.object().options({ abortEarly: false }).keys({
    firstName: Joi.string().required().pattern(/^[a-zA-Z]+$/)
      .min(2)
      .max(30),
    lastName: Joi.string().required().pattern(/^[a-zA-Z]+$/).min(2)
      .max(30),
    status: Joi.number().required(),
    password: Joi.any().required(),
    email: Joi.string().required().pattern(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/),
  }),
});
