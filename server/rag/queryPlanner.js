const { generate } = require('../llm/llmManager')

const planQuery = async (query) => {

  const prompt = `
You are the query planning component of the ALUMNS chatbot.

Your task is to analyze the user's latest standalone query and split it into independent sub-queries when necessary.

Available entities:
- USER = alumni, students, mentors, people, skills, branch, company, profile
- GROUP = groups, communities, memberships, group links
- COURSE = courses, instructors, duration, course links
- JOB = jobs, job openings, roles
- ORGANIZATION = companies, colleges, organizations
- GENERAL = platform/help/general questions

Rules:

1. If the query contains multiple independent requests, create multiple sub-queries.
2. If the query contains only one request, return exactly one sub-query.
3. Each sub-query must have ONE primary entity.
4. Preserve the meaning and names from the original query.
5. Do not answer the questions.
6. Do not invent information.
7. Do not create unnecessary sub-queries.
8. Return ONLY valid JSON.
9. The output must be a JSON array.
10. Each object must contain exactly:
   - "entity"
   - "query"

Example:

User query:
"What are Sneha Gupta's skills and which group is she a member of?"

Return:
[
  {
    "entity": "USER",
    "query": "What are Sneha Gupta's skills?"
  },
  {
    "entity": "GROUP",
    "query": "Which group is Sneha Gupta a member of?"
  }
]

Another example:

User query:
"Suggest a course for FEM and tell me who teaches it"

Return:
[
  {
    "entity": "COURSE",
    "query": "Suggest a course for FEM"
  },
  {
    "entity": "USER",
    "query": "Who teaches the recommended FEM course?"
  }
]

Another example:

User query:
"Who works at Tata Motors?"

Return:
[
  {
    "entity": "USER",
    "query": "Who works at Tata Motors?"
  }
]

User query:
${query}

Return ONLY the JSON array.
`

  try {

    const result = await generate(prompt)

    const raw = result.text()

    const cleaned = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()

    const planned = JSON.parse(cleaned)

    if (!Array.isArray(planned) || planned.length === 0) {
      return [
        {
          entity: 'GENERAL',
          query
        }
      ]
    }

    return planned.filter(item =>
      item &&
      typeof item.entity === 'string' &&
      typeof item.query === 'string' &&
      item.entity.trim() &&
      item.query.trim()
    )

  } catch (err) {

    console.error('[Query Planner] Failed:', err.message)

    // Safe fallback:
    // If planning fails, continue with the original query.
    return [
      {
        entity: 'GENERAL',
        query
      }
    ]
  }
}

module.exports = {
  planQuery
}