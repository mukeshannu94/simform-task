const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  token: { type: String },
  reqIp: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('UserToken', Schema);
