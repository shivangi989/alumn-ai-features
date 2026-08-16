const { rewriteQuestion } = require('./questionRewriter')
const { planQuery } = require('./queryPlanner')
const { classifyQuery } = require('./router')
const { getStore } = require('./vectorStoreManager')
const { getEntity } = require('../entities/registry')

const SCORE_THRESHOLD = 0.5

// ------------------------------------------------------
// Semantic Search
// ------------------------------------------------------

const semanticSearch = async (entityName, query, topK = 6) => {

  const store = getStore(entityName)

  if (!store) {
    console.log(`[Retrieval] No vector store for ${entityName}`)
    return []
  }

  const resultsWithScores =
    await store.similaritySearchWithScore(query, topK)

  console.log(`\n[Semantic Search] ${entityName}`)

  resultsWithScores.forEach(([doc, score]) => {
    console.log(
      `${doc.metadata.title} -> ${score.toFixed(4)}`
    )
  })

  return resultsWithScores
    .filter(([, score]) => score >= SCORE_THRESHOLD)
    .map(([doc]) => doc)
}

// ------------------------------------------------------
// Retrieve ONE planned sub-query
// ------------------------------------------------------

const retrieveSingleQuery = async (entityName, query) => {

  console.log(`\n[Sub-query] ${query}`)
  console.log(`[Sub-query Entity] ${entityName}`)

  const {
    entity,
    intent,
    mode,
    filters,
    confidence
  } = await classifyQuery(query)

  console.log(
    `[Router]\n` +
    `Entity      : ${entity}\n` +
    `Intent      : ${intent}\n` +
    `Mode        : ${mode}\n` +
    `Confidence  : ${confidence}`
  )

  // Use the planner's entity when available.
  // Router can still override it if it detects a more specific entity.
  const finalEntity =
    entity && entity !== 'GENERAL'
      ? entity
      : entityName

  // ----------------------------------------------------
  // GENERAL / GREETING
  // ----------------------------------------------------

  if (
    mode === 'GREETING' ||
    finalEntity === 'GENERAL'
  ) {
    return ''
  }

  // ----------------------------------------------------
  // Entity configuration
  // ----------------------------------------------------

  const entityConfig = getEntity(finalEntity)

  if (!entityConfig) {

    console.log(
      `[Retrieval] Unknown entity ${finalEntity} -> USER fallback`
    )

    const docs =
      await semanticSearch(
        'USER',
        query
      )

    return docs
      .map(doc => doc.pageContent)
      .join('\n---\n')
  }

  // ----------------------------------------------------
  // STRUCTURED
  // ----------------------------------------------------

  if (mode === 'STRUCTURED') {

    const results =
      await entityConfig.structured
        .runStructuredQuery(filters)

    const formatted =
      entityConfig.structured
        .formatResults(results)

    if (formatted) {

      console.log(
        `[Structured] ${results.length} records`
      )

      return formatted
    }

    console.log(
      '[Structured] Empty -> Semantic fallback'
    )
  }

  // ----------------------------------------------------
  // HYBRID
  // ----------------------------------------------------

  if (mode === 'HYBRID') {

    const candidates =
      await entityConfig.structured
        .runStructuredQuery(filters, 50)

    console.log(
      `[Hybrid] Structured candidates : ${candidates.length}`
    )

    if (candidates.length > 0) {

      const candidateIds =
        new Set(
          candidates.map(
            c => c._id.toString()
          )
        )

      const semanticDocs =
        await semanticSearch(
          finalEntity,
          query,
          10
        )

      const reranked =
        semanticDocs.filter(doc =>
          candidateIds.has(
            doc.metadata.entityId
          )
        )

      if (reranked.length > 0) {

        console.log(
          `[Hybrid] Final Results : ${reranked.length}`
        )

        return reranked
          .map(doc => doc.pageContent)
          .join('\n---\n')
      }

      console.log(
        '[Hybrid] Semantic empty -> Structured'
      )

      return entityConfig.structured
        .formatResults(
          candidates.slice(0, 6)
        )
    }

    console.log(
      '[Hybrid] No candidates -> Semantic fallback'
    )
  }

  // ----------------------------------------------------
  // SEMANTIC
  // ----------------------------------------------------

  const docs =
    await semanticSearch(
      finalEntity,
      query
    )

  console.log(
    `[Semantic] ${docs.length} documents`
  )

  return docs
    .map(doc => doc.pageContent)
    .join('\n---\n')
}

// ------------------------------------------------------
// Main Retrieval Pipeline
// ------------------------------------------------------

const retrieveContext = async (query, history = []) => {

  console.log('\n======================================')
  console.log(`[User Query] ${query}`)

  // ----------------------------------------------------
  // Rewrite follow-up question
  // ----------------------------------------------------

  const standaloneQuery =
    await rewriteQuestion(query, history)

  console.log(
    `[Standalone Query] ${standaloneQuery}`
  )

  // ----------------------------------------------------
  //Plan query into sub-queries
  // ----------------------------------------------------

  const plannedQueries =
    await planQuery(standaloneQuery)

  console.log(
    '\n[Query Planner]'
  )

  plannedQueries.forEach((item, index) => {
    console.log(
      `${index + 1}. ${item.entity} -> ${item.query}`
    )
  })

  // ----------------------------------------------------
  //Greeting detection
  // ----------------------------------------------------

  if (
    plannedQueries.length === 1 &&
    plannedQueries[0].entity === 'GENERAL'
  ) {

    const {
      mode
    } = await classifyQuery(standaloneQuery)

    if (mode === 'GREETING') {

      return {
        context: '',
        isGreeting: true
      }
    }
  }

  // ----------------------------------------------------
  // Retrieve every sub-query
  // ----------------------------------------------------

  const contexts = []

  for (const planned of plannedQueries) {

    try {

      const context =
        await retrieveSingleQuery(
          planned.entity,
          planned.query
        )

      if (context && context.trim()) {

        contexts.push({
          entity: planned.entity,
          query: planned.query,
          context
        })
      }

    } catch (err) {

      console.error(
        `[Retrieval] Sub-query failed: ${planned.query}`,
        err.message
      )
    }
  }

  // ----------------------------------------------------
  // Combine all retrieved contexts
  // ----------------------------------------------------

  if (contexts.length === 0) {

    return {
      context: '',
      isGreeting: false
    }
  }

  const combinedContext =
    contexts
      .map(item => `
SOURCE ENTITY: ${item.entity}
QUERY: ${item.query}

${item.context}
      `.trim())
      .join('\n\n====================\n\n')

  console.log(
    `\n[Retrieval] Combined ${contexts.length} context(s)`
  )

  return {
    context: combinedContext,
    isGreeting: false
  }
}

module.exports = {
  retrieveContext
}