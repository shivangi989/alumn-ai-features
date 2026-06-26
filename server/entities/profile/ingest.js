const { Document } = require('@langchain/core/documents')

const ingest = (profiles) => {
  return profiles.map(p => {
    const groupsJoined = Array.isArray(p.assignedGroup)
      ? p.assignedGroup.join(', ')
      : (p.assignedGroup || 'none')

    return new Document({
      pageContent: `
        Name: ${p.name}
        Role: ${p.role}
        Branch: ${p.branch || 'N/A'}
        Batch: ${p.batch || 'N/A'}
        Skills: ${(p.skills || []).join(', ')}
        Education: ${p.education || 'N/A'}
        Company: ${p.professional?.company || 'N/A'}
        Designation: ${p.professional?.designation || 'N/A'}
        Groups Joined: ${groupsJoined}
      `.trim(),
      metadata: {
        entityType: 'USER',
        entityId: p._id.toString(),
        title: p.name,
        tags: p.skills || []
      }
    })
  })
}

module.exports = ingest