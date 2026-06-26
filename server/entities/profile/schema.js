const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['student', 'alumnus', 'recruiter', 'mentor'],
    default: 'alumnus'
  },
  name: String,
  email: String,
  phone: String,
  address: String,
  branch: String,
  batch: String,
  skills: [String],
  education: String,
  professional: {
    company: String,
    designation: String,
    experience: String
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  resumeLink: String,
  profileLink: String,
  assignedGroup: [String]
})

module.exports = mongoose.model('Profile', ProfileSchema)