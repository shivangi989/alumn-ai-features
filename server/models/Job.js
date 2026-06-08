const mongoose = require('mongoose')

const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  skills: [String],
  type: String
})

module.exports = mongoose.model('Job', JobSchema)