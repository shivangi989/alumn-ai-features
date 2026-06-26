const User = require('./entities/profile/schema')
const Group = require('./entities/group/schema')
const Job = require('./entities/job/schema')
const Course = require('./entities/course/schema')  
const Organization = require('./entities/organization/schema')
const organizationsData = require('../mock-data/organizations.json')
const usersData = require('../mock-data/users.json')
const groupsData = require('../mock-data/groups.json')
const jobsData = require('../mock-data/jobs.json')
const coursesData = require('../mock-data/courses.json') 

const seedDB = async () => {
  const userCount = await User.countDocuments()
  if (userCount === 0) {
    await User.insertMany(usersData)
    await Group.insertMany(groupsData)
    await Job.insertMany(jobsData)
    await Course.insertMany(coursesData)
    await Organization.insertMany(organizationsData)
    console.log('Database seeded with mock data')
  } else {
    console.log('Database already has data, skipping seed')
  }
}

module.exports = seedDB