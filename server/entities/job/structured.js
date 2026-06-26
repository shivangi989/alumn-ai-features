const Job = require('./schema')

const runStructuredQuery = async (filter, limit = 10) => {
  try { return await Job.find(filter).limit(limit) } catch (err) { return [] }
}

const formatResults = (jobs) => {
  if (!jobs || jobs.length === 0) return null
  return jobs.map(j => `Job: ${j.title}\nCompany: ${j.company}\nLink: ${j.applyLink}`).join('\n---\n')
}

module.exports = { runStructuredQuery, formatResults }