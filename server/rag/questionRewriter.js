const { generate } =require('../llm/llmManager')
const Groq = require('groq-sdk')


const buildConversation = (history = []) => {
  return history
    .slice(-8) // last 8 messages (user + assistant)
    .map(msg => {
      const role = msg.role === 'model' ? 'Assistant' : 'User'
      const text = msg.parts?.[0]?.text || ''
      return `${role}: ${text}`
    })
    .join('\n')
}

const PROMPT = (history, query) => `
You are a query rewriting assistant for ALUMNS.

Your ONLY task is to rewrite the user's latest message into a completely standalone query.

Use the conversation history ONLY to resolve references like:

- he
- she
- they
- them
- him
- her
- it
- this company
- this course
- that group
- there
- here
- these
- those

Rules:

1. Preserve the user's original intent.
2. Never answer the question.
3. Never retrieve information.
4. Never invent names not present in the conversation.
5. If the latest question is already standalone, return it unchanged.
6. Return ONLY the rewritten question.
7. If history is empty, simply return the latest question.

Conversation:

${history}

Latest User Question:

${query}

Standalone Question:
`

const rewriteQuestion = async (query, history = []) => {

  if (!history || history.length === 0)
    return query

  const conversation = buildConversation(history)

  const prompt = PROMPT(conversation, query)
 
    const result = await generate(prompt)

return result.text().trim()
}

module.exports = {
  rewriteQuestion
}