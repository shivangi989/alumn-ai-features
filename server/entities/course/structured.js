const Course = require('./schema')

const runStructuredQuery = async (filter, limit = 10) => {
  try { return await Course.find(filter).limit(limit) } catch (err) { return [] }
}

const formatResults = (courses) => {
  if (!courses || courses.length === 0) return null
  return courses.map(c => `Course: ${c.title}\nInstructor: ${c.instructor}\nLink: ${c.courseLink}`).join('\n---\n')
}

module.exports = { runStructuredQuery, formatResults }