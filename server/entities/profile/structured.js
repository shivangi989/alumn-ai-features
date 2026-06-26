const Profile = require('./schema')

const runStructuredQuery = async (filter, limit = 10) => {
  try {
    return await Profile.find(filter).limit(limit)
  } catch (err) {
    console.error('[PROFILE] Structured query failed:', err.message)
    return []
  }
}

const formatResults = (profiles) => {
  if (!profiles || profiles.length === 0) return null
  return profiles.map(p => `
    Name: ${p.name}
    Role: ${p.role}
    Branch: ${p.branch || 'N/A'}
    Batch: ${p.batch || 'N/A'}
    Skills: ${(p.skills || []).join(', ')}
    Company: ${p.professional?.company || 'N/A'}
    Profile Link: ${p.profileLink}
  `.trim()).join('\n---\n')
}

module.exports = { runStructuredQuery, formatResults }