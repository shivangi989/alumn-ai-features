const Organization = require('./schema')

const runStructuredQuery = async (filter, limit = 10) => {
  try {
    return await Organization.find(filter).limit(limit)
  } catch (err) {
    console.error('[ORG] Structured query failed:', err.message)
    return []
  }
}

const formatResults = (orgs) => {
  if (!orgs || orgs.length === 0) return null
  return orgs.map(o => `Name: ${o.name}\nType: ${o.type}\nIndustry: ${o.industry || 'N/A'}`).join('\n---\n')
}

module.exports = { runStructuredQuery, formatResults }