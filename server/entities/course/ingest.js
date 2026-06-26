const { Document } = require('@langchain/core/documents')

const ingest = (courses) => courses.map(c => new Document({
  pageContent: `Course: ${c.title}\nInstructor: ${c.instructor}\nSkills: ${c.skills.join(', ')}`,
  metadata: { entityType: 'COURSE', entityId: c._id.toString(), title: c.title, tags: c.skills }
}))

module.exports = ingest