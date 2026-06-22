const mongoose = require('mongoose')

const GroupSchema = new mongoose.Schema({
  name: String,
  description: String,
  keywords: [String],
  members: Number,
  groupLink: String
})

module.exports = mongoose.model('Group', GroupSchema)