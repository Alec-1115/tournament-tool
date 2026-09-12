const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  globalName: {
    type: String,
    default: null,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
