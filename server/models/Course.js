const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
  title: String,
  instructor: String,
  skills: [String],
  duration: String,
  courseLink: String
})

module.exports = mongoose.model('Course', CourseSchema)