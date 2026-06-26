const { Document } = require('@langchain/core/documents')

const ingest = (orgs) => {
  return orgs.map(org => new Document({
    pageContent: `
      Name: ${org.name}
      Type: ${org.type}
      Industry: ${org.industry || 'N/A'}
      Location: ${org.location || 'N/A'}
      Description: ${org.description || ''}
    `.trim(),
    metadata: {
      entityType: 'ORGANIZATION',
      entityId: org._id.toString(),
      title: org.name,
      tags: [org.type, org.industry].filter(Boolean)
    }
  }))
}

module.exports = ingest