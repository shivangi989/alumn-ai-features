const { GoogleGenerativeAI } = require('@google/generative-ai')

const assignGroup = async (user, groups, genAI, geminiWithRetry) => {
  let bestMatch = null
  let highestScore = 0
  let topMatches = []

  groups.forEach(group => {
    const score = user.skills.filter(skill =>
      group.keywords.some(k => k.toLowerCase() === skill.toLowerCase())
    ).length
    if (score > 0) topMatches.push({ group, score })
    if (score > highestScore) {
      highestScore = score
      bestMatch = group
    }
  })

  if (highestScore === 0) {
    const prompt = `
      Skills: ${user.skills.join(', ')}, Branch: ${user.branch}
      Groups: ${groups.map(g => g.name).join(', ')}
      Best group? Reply ONLY with group name.
    `
    const result = await geminiWithRetry('gemini-2.0-flash', prompt)
    const suggestion = result.text().trim()
    bestMatch = groups.find(g =>
      g.name.toLowerCase() === suggestion.toLowerCase()
    ) || groups[0]
  }

  topMatches.sort((a, b) => b.score - a.score)

  return {
    bestMatch,
    topMatches: topMatches.slice(0, 2),
    matchedBy: highestScore > 0 ? 'keyword-matching' : 'gemini-ai'
  }
}

module.exports = assignGroup