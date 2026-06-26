const Group = require('./schema')

const runStructuredQuery = async (filter, limit = 10) => {
  try { return await Group.find(filter).limit(limit) } catch (err) { return [] }
}

const formatResults = (groups) => {
  if (!groups || groups.length === 0) return null
  return groups.map(g => `Group: ${g.name}\nDescription: ${g.description}\nLink: ${g.groupLink}`).join('\n---\n')
}

module.exports = { runStructuredQuery, formatResults }