const User = require('./models/User')
const Group = require('./models/Group')
const Job = require('./models/Job')

const usersData = require('../mock-data/users.json')
const groupsData = require('../mock-data/groups.json')
const jobsData = require('../mock-data/jobs.json')

const seedDB = async () => {
  // clear existing data
  await User.deleteMany()
  await Group.deleteMany()
  await Job.deleteMany()

  // insert mock data
  await User.insertMany(usersData)
  await Group.insertMany(groupsData)
  await Job.insertMany(jobsData)

  console.log('Mock database seeded')
}

module.exports = seedDB