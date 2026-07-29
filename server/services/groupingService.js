const { generate } = require('../llm/llmManager')

const assignGroup = async (user, groups) => {

    let highestScore = 0

    const scoredGroups = groups.map(group => {

        const score = user.skills.filter(skill =>
            group.keywords.some(keyword =>
                keyword.toLowerCase() === skill.toLowerCase()
            )
        ).length

        if (score > highestScore)
            highestScore = score

        return {
            group,
            score
        }

    })

    scoredGroups.sort((a, b) => b.score - a.score)

    const recommendedGroups = scoredGroups
        .filter(g => g.score > 0)
        .slice(0, 4)

    const shouldSuggestNewGroup =
        highestScore < 2 ||
        recommendedGroups.length < 3

    let suggestedNewGroup = null

    if (shouldSuggestNewGroup) {

        const prompt = `
You are an AI community manager.

User Information

Branch:
${user.branch}

Skills:
${user.skills.join(", ")}

Existing Groups:

${groups.map(g =>
`Name: ${g.name}
Description: ${g.description}
Keywords: ${g.keywords.join(", ")}
`).join("\n")}

Task:

Decide whether a NEW group should be created.

If existing groups already satisfy the user,
return

{
  "createGroup": false,
  "name": "",
  "description": ""
}

Otherwise return

{
  "createGroup": true,
  "name": "<new group name>",
  "description": "<short description>"
}

Return ONLY valid JSON.
`

        try {

            const result = await generate(prompt)

           const raw = result.text()

const cleaned = raw
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()

const response = JSON.parse(cleaned)

            if (response.createGroup) {

                suggestedNewGroup = {
                    name: response.name,
                    description: response.description
                }

            }

        }

        catch (err) {

            console.log("LLM Group Suggestion Failed:", err.message)

        }

    }

    return {

        bestMatch:
            recommendedGroups.length > 0
                ? recommendedGroups[0].group
                : null,

        recommendedGroups: recommendedGroups.map(item => ({

            name: item.group.name,

            description: item.group.description,

            members: item.group.members,

            groupLink: item.group.groupLink,

            score: item.score

        })),

        suggestedNewGroup,

        allowCreateGroup: true,

        createGroupRecommended: suggestedNewGroup !== null,

        matchedBy:
            highestScore > 0
                ? "keyword-matching"
                : "llm"

    }

}

module.exports = assignGroup