const User = require('./models/User')
const Group = require('./models/Group')
const Job = require('./models/Job')
const Course = require('./models/Course')  // NEW

const usersData = require('../mock-data/users.json')
const groupsData = require('../mock-data/groups.json')
const jobsData = require('../mock-data/jobs.json')
const coursesData = require('../mock-data/courses.json')  // NEW

const seedDB = async () => {
  const userCount = await User.countDocuments()
  if (userCount === 0) {
    await User.insertMany(usersData)
    await Group.insertMany(groupsData)
    await Job.insertMany(jobsData)
    await Course.insertMany(coursesData)  // NEW
    console.log('Database seeded with mock data')
  } else {
    console.log('Database already has data, skipping seed')
  }
}

module.exports = seedDB