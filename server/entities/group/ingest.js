const { Document } = require('@langchain/core/documents')

const ingest = (groups) => groups.map(g => new Document({
  pageContent: `
Group: ${g.name}
Description: ${g.description}
Keywords: ${(g.keywords || []).join(', ')}
Group Link: ${g.groupLink || 'N/A'}
  `.trim(),

  metadata: {
    entityType: 'GROUP',
    entityId: g._id.toString(),
    title: g.name,
    tags: g.keywords || []
  }
}))

module.exports = ingest