const Profile = require('./profile/schema')
const Organization = require('./organization/schema')
const Group = require('./group/schema')
const Job = require('./job/schema')
const Course = require('./course/schema')

const profileIngest = require('./profile/ingest')
const organizationIngest = require('./organization/ingest')
const groupIngest = require('./group/ingest')
const jobIngest = require('./job/ingest')
const courseIngest = require('./course/ingest')

const profileStructured = require('./profile/structured')
const organizationStructured = require('./organization/structured')
const groupStructured = require('./group/structured')
const jobStructured = require('./job/structured')
const courseStructured = require('./course/structured')

const ENTITY_REGISTRY = {
  USER: {
    model: Profile,
    ingest: profileIngest,
    structured: profileStructured,
    displayName: 'Alumni/Student/Mentor'
  },
  ORGANIZATION: {
    model: Organization,
    ingest: organizationIngest,
    structured: organizationStructured,
    displayName: 'Company/College'
  },
  GROUP: {
    model: Group,
    ingest: groupIngest,
    structured: groupStructured,
    displayName: 'Group'
  },
  JOB: {
    model: Job,
    ingest: jobIngest,
    structured: jobStructured,
    displayName: 'Job'
  },
  COURSE: {
    model: Course,
    ingest: courseIngest,
    structured: courseStructured,
    displayName: 'Course'
  }
}

const getEntity = (name) => ENTITY_REGISTRY[name] || null
const getAllEntityNames = () => Object.keys(ENTITY_REGISTRY)
const getAllEntities = () => ENTITY_REGISTRY

module.exports = { getEntity, getAllEntityNames, getAllEntities }