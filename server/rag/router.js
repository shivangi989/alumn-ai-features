const { generate } = require('../llm/llmManager')
const { getAllEntityNames, getEntity } = require('../entities/registry')

// ------------------------------------------------------
// Build Entity Description
// ------------------------------------------------------

const buildSchemaDescription = () => {

  return getAllEntityNames()
    .map(name => `- ${name}: ${getEntity(name).displayName}`)
    .join('\n')

}

// ------------------------------------------------------
// Router Prompt
// ------------------------------------------------------

const ROUTER_PROMPT_TEMPLATE = (query) => {

  const entityList = getAllEntityNames().join(', ')

  return `
You are a query router for ALUMNS, an alumni networking platform.

Available entities:

${buildSchemaDescription()}

Classify the CURRENT query below.

Respond ONLY with valid JSON.

{
  "entity":"<${entityList}, or GENERAL>",
  "intent":"<SEARCH, RECOMMEND, DISCOVER, SUMMARIZE, PLATFORM_HELP, GREETING>",
  "mode":"<STRUCTURED, SEMANTIC, HYBRID, GREETING>",
  "filters":{},
  "confidence":0.95
}

Rules:

- STRUCTURED
Exact lookup.
Examples:
• person name
• company
• branch
• batch
• role
• email
• course name
• job title

Examples:

Who works at Microsoft?

Find Rahul Sharma

Students from CSE

-----------------------------------

SEMANTIC

Meaning-based search.

Examples:

Find AI researchers

Recommend a mentor for ML

Who knows cybersecurity?

People interested in startups

-----------------------------------

HYBRID

Combination of exact filters + semantic ranking.

Examples:

Microsoft employees interested in AI

ECE alumni working on robotics

2022 graduates interested in GATE

-----------------------------------

GREETING

Hi
Hello
Good Morning
Thanks

-----------------------------------

GENERAL

Anything outside ALUMNS.

-----------------------------------

Generate MongoDB filters whenever mode is STRUCTURED or HYBRID.

Current Query:

"${query}"

JSON:
`

}

// ------------------------------------------------------
// Parse JSON
// ------------------------------------------------------

const parseRouterResponse = (text) => {

  try {

    const cleaned =
      text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()

    const parsed = JSON.parse(cleaned)

    return {

      entity: parsed.entity || 'GENERAL',

      intent: parsed.intent || 'SEARCH',

      mode: parsed.mode || 'SEMANTIC',

      filters: parsed.filters || {},

      confidence: parsed.confidence ?? 0.5

    }

  }

  catch (err) {

    console.log('[Router] Parse Failed')

    console.log(text)

    return {

      entity: 'GENERAL',

      intent: 'SEARCH',

      mode: 'SEMANTIC',

      filters: {},

      confidence: 0

    }

  }

}

// ------------------------------------------------------
// Main Router
// ------------------------------------------------------

const classifyQuery = async (query) => {

  try {

    const prompt =
      ROUTER_PROMPT_TEMPLATE(query)

    const result =
      await generate(prompt)

    return parseRouterResponse(
      result.text()
    )

  }

  catch (err) {

    console.error(
      '[Router]',
      err.message
    )

    return {

      entity: 'GENERAL',

      intent: 'SEARCH',

      mode: 'SEMANTIC',

      filters: {},

      confidence: 0

    }

  }

}

module.exports = {
  classifyQuery
}