const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  branch: String,
  batch: String,
  address: String,
  skills: [String],
  education: String,
  professional: {
    company: String,
    designation: String,
    experience: String
  },
  resumeLink: String,
  profileLink: String,
  assignedGroup: [String]
})

module.exports = mongoose.model('User', UserSchema)