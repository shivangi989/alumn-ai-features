const { Document } = require('@langchain/core/documents')

const ingest = (courses) => courses.map(c => new Document({
  pageContent: `
    Course: ${c.title}
    Instructor: ${c.instructor}
    Skills: ${c.skills.join(', ')}
    Duration: ${c.duration}
    Course Link: ${c.courseLink}
    `.trim(),
  metadata: { entityType: 'COURSE', entityId: c._id.toString(), title: c.title, tags: c.skills }
}))

module.exports = ingest