const mongoose = require('mongoose')

const OrganizationSchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    enum: ['Company', 'College', 'Startup', 'NGO']
  },
  description: String,
  industry: String,
  location: String,
  website: String,
  logo: String,
  employeeCount: Number,
  alumniCount: Number,
  organizationLink: String
})

module.exports = mongoose.model('Organization', OrganizationSchema)