const { classifyQuery } = require('./router')
const { getStore } = require('./vectorStoreManager')
const { getEntity } = require('../entities/registry')

const SCORE_THRESHOLD = 0.5

const semanticSearch = async (entityName, query, topK = 6) => {
  const store = getStore(entityName)
  if (!store) {
    console.log(`[Retrieval] No store for ${entityName}`)
    return []
  }

  const resultsWithScores = await store.similaritySearchWithScore(query, topK)
  console.log(`[Retrieval] ${entityName} scores:`)
  resultsWithScores.forEach(([doc, score]) => {
    console.log(`  ${doc.metadata.title} — ${score.toFixed(4)}`)
  })

  return resultsWithScores
    .filter(([_, score]) => score >= SCORE_THRESHOLD)
    .map(([doc]) => doc)
}

const retrieveContext = async (query) => {
  console.log(`\n[Retrieval] Query: "${query}"`)

  const { entity, intent, mode, filters, confidence } = await classifyQuery(query)
  console.log(`[Retrieval] entity=${entity} intent=${intent} mode=${mode} confidence=${confidence}`)

  if (mode === 'GREETING' || entity === 'GENERAL') {
    console.log('[Retrieval] Skipped — greeting/general')
    return { context: '', isGreeting: mode === 'GREETING' }
  }

  const entityConfig = getEntity(entity)
  if (!entityConfig) {
    console.log(`[Retrieval] Unknown entity "${entity}", fallback to USER semantic`)
    const docs = await semanticSearch('USER', query)
    return { context: docs.map(d => d.pageContent).join('\n---\n'), isGreeting: false }
  }

  if (mode === 'STRUCTURED') {
    const results = await entityConfig.structured.runStructuredQuery(filters)
    const formatted = entityConfig.structured.formatResults(results)
    if (formatted) {
      console.log(`[Retrieval] STRUCTURED — ${results.length} results`)
      return { context: formatted, isGreeting: false }
    }
    console.log('[Retrieval] STRUCTURED empty, falling back to SEMANTIC')
  }

  if (mode === 'HYBRID') {
    const candidates = await entityConfig.structured.runStructuredQuery(filters, 50)
    console.log(`[Retrieval] HYBRID pre-filter — ${candidates.length} candidates`)

    if (candidates.length > 0) {
      const candidateIds = new Set(candidates.map(c => c._id.toString()))
      const semanticResults = await semanticSearch(entity, query, 10)
      const reranked = semanticResults.filter(doc => candidateIds.has(doc.metadata.entityId))

      if (reranked.length > 0) {
        console.log(`[Retrieval] HYBRID reranked — ${reranked.length} final`)
        return { context: reranked.map(d => d.pageContent).join('\n---\n'), isGreeting: false }
      }
      const formatted = entityConfig.structured.formatResults(candidates.slice(0, 6))
      return { context: formatted, isGreeting: false }
    }
    console.log('[Retrieval] HYBRID filter empty, falling back to SEMANTIC')
  }

  const docs = await semanticSearch(entity, query)
  console.log(`[Retrieval] SEMANTIC — ${docs.length} results`)
  return { context: docs.map(d => d.pageContent).join('\n---\n'), isGreeting: false }
}

module.exports = { retrieveContext }