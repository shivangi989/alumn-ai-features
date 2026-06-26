const { Document } = require('@langchain/core/documents')

const ingest = (groups) => groups.map(g => new Document({
  pageContent: `Group: ${g.name}\nDescription: ${g.description}\nKeywords: ${g.keywords.join(', ')}`,
  metadata: { entityType: 'GROUP', entityId: g._id.toString(), title: g.name, tags: g.keywords }
}))

module.exports = ingest