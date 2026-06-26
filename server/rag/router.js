const { GoogleGenerativeAI } = require('@google/generative-ai')
const Groq = require('groq-sdk')
const { getAllEntityNames, getEntity } = require('../entities/registry')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY1)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const buildSchemaDescription = () => {
  return getAllEntityNames()
    .map(name => `- ${name}: ${getEntity(name).displayName}`)
    .join('\n')
}

const ROUTER_PROMPT_TEMPLATE = (query) => {
  const entityList = getAllEntityNames().join(', ')
  return `
You are a query router for ALUMNS, an alumni networking platform.

Available entities:
${buildSchemaDescription()}

Classify the query. Respond ONLY with valid JSON, no markdown:
{
  "entity": "<${entityList}, or GENERAL>",
  "intent": "<SEARCH, RECOMMEND, DISCOVER, SUMMARIZE, PLATFORM_HELP, GREETING>",
  "mode": "<STRUCTURED, SEMANTIC, HYBRID, GREETING>",
  "filters": { <mongodb filter if STRUCTURED/HYBRID, else {}> },
  "confidence": <0.0-1.0>
}

Rules:
- STRUCTURED: exact lookups (name, company, branch, batch, role)
- SEMANTIC: fuzzy/conceptual (interests, themes, recommendations)
- HYBRID: filter + semantic ranking together
- GREETING: hi/hello/casual talk
- GENERAL: off-topic or doesn't fit any entity
  

Examples:
"who works at Microsoft" → {"entity":"USER","intent":"SEARCH","mode":"STRUCTURED","filters":{"professional.company":{"$regex":"Microsoft","$options":"i"}},"confidence":0.95}
"find alumni interested in cybersecurity" → {"entity":"USER","intent":"SEARCH","mode":"SEMANTIC","filters":{},"confidence":0.85}
"find Microsoft employees interested in AI" → {"entity":"USER","intent":"SEARCH","mode":"HYBRID","filters":{"professional.company":{"$regex":"Microsoft","$options":"i"}},"confidence":0.85}
"hi" → {"entity":"GENERAL","intent":"GREETING","mode":"GREETING","filters":{},"confidence":1.0}
"recommend a mentor for ML" → {"entity":"USER","intent":"RECOMMEND","mode":"SEMANTIC","filters":{},"confidence":0.8}

Query: "${query}"
  `
}

const parseRouterResponse = (text) => {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return {
      entity: parsed.entity || 'GENERAL',
      intent: parsed.intent || 'SEARCH',
      mode: parsed.mode || 'SEMANTIC',
      filters: parsed.filters || {},
      confidence: parsed.confidence ?? 0.5
    }
  } catch (err) {
    console.error('[Router] Parse failed:', text)
    return { entity: 'GENERAL', intent: 'SEARCH', mode: 'SEMANTIC', filters: {}, confidence: 0 }
  }
}

const classifyQuery = async (query) => {
  const prompt = ROUTER_PROMPT_TEMPLATE(query)

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    return parseRouterResponse(result.response.text())
  } catch (err) {
    console.log('[Router] Gemini failed, trying Groq:', err.message)
  }

  try {
    console.log('[Router] Attempting Groq, key present:', !!process.env.GROQ_API_KEY)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300
    })
    console.log('[Router] Groq succeeded')
    return parseRouterResponse(completion.choices[0].message.content)
  } catch (groqErr) {
    console.log('[Router] Groq FAILED:', groqErr.message)
    return { entity: 'GENERAL', intent: 'SEARCH', mode: 'SEMANTIC', filters: {}, confidence: 0 }
  }
}

module.exports = { classifyQuery }