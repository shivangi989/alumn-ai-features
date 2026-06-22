const { Document } = require('@langchain/core/documents')

const ingestData = (users, groups, jobs, courses) => {
  const docs = []

  users.forEach(user => {
    const groupsJoined = Array.isArray(user.assignedGroup)
      ? user.assignedGroup.join(', ')
      : (user.assignedGroup || 'none')

    docs.push(new Document({
      pageContent: `
        Name: ${user.name}
        Branch: ${user.branch}
        Batch: ${user.batch}
        Skills: ${user.skills.join(', ')}
        Education: ${user.education}
        Company: ${user.professional?.company}
        Designation: ${user.professional?.designation}
        Experience: ${user.professional?.experience}
        Groups Joined: ${groupsJoined}
        Profile Link: ${user.profileLink}
        Resume Link: ${user.resumeLink}
      `.trim(),
      metadata: { type: 'user', id: user._id.toString(), name: user.name }
    }))
  })

  groups.forEach(group => {
    docs.push(new Document({
      pageContent: `
        Group: ${group.name}
        Description: ${group.description}
        Keywords: ${group.keywords.join(', ')}
        Members: ${group.members}
        Group Link: ${group.groupLink}
      `.trim(),
      metadata: { type: 'group', id: group._id.toString(), name: group.name }
    }))
  })

  jobs.forEach(job => {
    docs.push(new Document({
      pageContent: `
        Job Title: ${job.title}
        Company: ${job.company}
        Required Skills: ${job.skills.join(', ')}
        Type: ${job.type}
        Location: ${job.location}
        Apply Link: ${job.applyLink}
      `.trim(),
      metadata: { type: 'job', id: job._id.toString(), title: job.title }
    }))
  })

  // NEW — courses
  courses.forEach(course => {
    docs.push(new Document({
      pageContent: `
        Course: ${course.title}
        Instructor: ${course.instructor}
        Skills Taught: ${course.skills.join(', ')}
        Duration: ${course.duration}
        Course Link: ${course.courseLink}
      `.trim(),
      metadata: { type: 'course', id: course._id.toString(), title: course.title }
    }))
  })

  return docs
}

module.exports = ingestData