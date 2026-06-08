const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: String,
  branch: String,
  batch: String,
  skills: [String],
  assignedGroup: { type: String, default: null }
})

module.exports = mongoose.model('User', UserSchema)