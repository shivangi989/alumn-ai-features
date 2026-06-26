const { Document } = require('@langchain/core/documents')

const ingest = (jobs) => jobs.map(j => new Document({
  pageContent: `Job: ${j.title}\nCompany: ${j.company}\nSkills: ${j.skills.join(', ')}\nType: ${j.type}`,
  metadata: { entityType: 'JOB', entityId: j._id.toString(), title: j.title, tags: j.skills }
}))

module.exports = ingest