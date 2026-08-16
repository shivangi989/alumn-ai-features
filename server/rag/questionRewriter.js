const { generate } = require('../llm/llmManager')

// ------------------------------------------------------
// Build only the useful recent conversation
// ------------------------------------------------------

const buildConversation = (history = []) => {
  return history
    .slice(-8)
    .map(msg => {
      const role =
        msg.role === 'model' || msg.role === 'assistant'
          ? 'Assistant'
          : 'User'

      const text =
        msg.parts?.[0]?.text ||
        msg.text ||
        ''

      return `${role}: ${text}`
    })
    .join('\n')
}

// ------------------------------------------------------
// Decide whether the query actually needs conversation
// ------------------------------------------------------

const needsContext = (query) => {

  const q = query.toLowerCase().trim()

  // Direct references to previous conversation
  const referenceWords = [
    'he',
    'she',
    'they',
    'them',
    'him',
    'her',
    'his',
    'their',
    'it',
    'this',
    'that',
    'these',
    'those',
    'there',
    'here'
  ]

  const words = q.split(/\s+/)

  if (words.some(word => referenceWords.includes(word))) {
    return true
  }

  // Common conversational follow-ups
  const followUpPatterns = [
    'what about',
    'how about',
    'tell me more',
    'more about',
    'more information',
    'what else',
    'anything else',
    'are you sure',
    'really',
    'is that',
    'and then',
    'where does',
    'where do',
    'when did',
    'how did',
    'why did',
    'what does',
    'what is her',
    'what is his',
    'what are her',
    'what are his',
    'does she',
    'does he',
    'is she',
    'is he',
    'can she',
    'can he'
  ]

  if (followUpPatterns.some(pattern => q.startsWith(pattern))) {
    return true
  }

  // Very short conversational questions are often follow-ups
  if (
    words.length <= 4 &&
    (
      q === 'are you sure' ||
      q === 'tell me more' ||
      q === 'what else' ||
      q === 'more info' ||
      q === 'more information'
    )
  ) {
    return true
  }

  return false
}

// ------------------------------------------------------
// Prompt only when context is actually required
// ------------------------------------------------------

const PROMPT = (history, query) => `
You are a query rewriting assistant for ALUMNS.

Your ONLY task is to rewrite the user's latest message into a completely standalone query.

Use the conversation history ONLY to resolve references to things already mentioned.

Examples of references:
- he
- she
- they
- them
- him
- her
- his
- their
- it
- this
- that
- these
- those
- there
- here
- this company
- this course
- that group
- the instructor
- the person
- the alumni
- more about them
- are you sure
- what else

Rules:

1. Preserve the user's original intent.
2. Never answer the question.
3. Never retrieve information.
4. Never invent names or facts.
5. Use ONLY names/entities that appear in the conversation.
6. If the reference is clear, replace it with the correct entity.
7. If the reference is ambiguous, keep the original wording rather than guessing.
8. Return ONLY the rewritten question.
9. Do not add explanations.
10. Do not answer the question.

Conversation:

${history}

Latest User Question:

${query}

Standalone Question:
`

// ------------------------------------------------------
// Main function
// ------------------------------------------------------

const rewriteQuestion = async (query, history = []) => {

  // No history → nothing to resolve
  if (!history || history.length === 0) {
    return query
  }

  // IMPORTANT:
  // Most questions do NOT need an LLM rewrite.
  // This prevents unnecessary API calls.
  if (!needsContext(query)) {
    return query
  }

  const conversation = buildConversation(history)

  if (!conversation.trim()) {
    return query
  }

  try {

    const prompt = PROMPT(conversation, query)

    const result = await generate(prompt)

    const rewritten = result.text().trim()

    if (!rewritten) {
      return query
    }

    console.log(
      `[Rewriter] "${query}" -> "${rewritten}"`
    )

    return rewritten

  } catch (err) {

    console.error(
      '[Rewriter] Failed:',
      err.message
    )

    // VERY IMPORTANT:
    // If rewriting fails, do not break Alma.
    // Just continue with the original query.
    return query
  }
}

module.exports = {
  rewriteQuestion
}