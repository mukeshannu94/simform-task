const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/config.json');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First Name is required!'],
    match: [/^[a-zA-Z]+$/, 'Please enter a valid First Name'],
  },
  lastName: {
    type: String,
    required: [true, 'Last Name is required!'],
    match: [/^[a-zA-Z]+$/, 'Please enter a valid Last Name'],
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, 'Email is required!'],
    match: [/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/, 'Please enter a valid email'],
    index: true,
  },
  profileImage: { type: String },
  hash: { type: String },
  salt: { type: String },
  status: { type: Number, default: 1 },
}, { timestamps: true });

UserSchema.methods.validPassword = function validPassword(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.setPassword = function setPassword(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.generateJWT = function generateJWT() {
  return jwt.sign(
    {
      firstName: this.firstName,
      mobile: this.mobile,
      email: this.email,
    },
    config.secretKey,
  );
};

module.exports = mongoose.model('User', UserSchema);
