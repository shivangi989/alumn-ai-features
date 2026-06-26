const mongoose = require('mongoose')

const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  skills: [String],
  type: String,
  location: String,
  applyLink: String
})

module.exports = mongoose.model('Job', JobSchema)