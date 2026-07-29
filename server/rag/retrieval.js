const { rewriteQuestion } = require('./questionRewriter')
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
    .filter(([_, score]) => score >= SCORE_THRESHOLD)
    .map(([doc]) => doc)

}

// ------------------------------------------------------
// Main Retrieval Pipeline
// ------------------------------------------------------

const retrieveContext = async (query, history = []) => {

  console.log('\n======================================')
  console.log(`[User Query] ${query}`)

  // Step 1
  // Rewrite follow-up question into standalone question

  const standaloneQuery =
    await rewriteQuestion(query, history)

  console.log(
    `[Standalone Query] ${standaloneQuery}`
  )

  // Step 2
  // Decide retrieval strategy

  const {
    entity,
    intent,
    mode,
    filters,
    confidence
  } = await classifyQuery(standaloneQuery)

  console.log(
    `[Router]
Entity      : ${entity}
Intent      : ${intent}
Mode        : ${mode}
Confidence  : ${confidence}`
  )

  // Step 3
  // Greeting / General

  if (
    mode === 'GREETING' ||
    entity === 'GENERAL'
  ) {

    return {
      context: '',
      isGreeting: mode === 'GREETING'
    }

  }

  // Step 4
  // Entity lookup

  const entityConfig = getEntity(entity)

  if (!entityConfig) {

    console.log(
      '[Retrieval] Unknown entity -> USER fallback'
    )

    const docs =
      await semanticSearch(
        'USER',
        standaloneQuery
      )

    return {

      context: docs
        .map(doc => doc.pageContent)
        .join('\n---\n'),

      isGreeting: false

    }

  }

  // ====================================================
  // STRUCTURED
  // ====================================================

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

      return {

        context: formatted,

        isGreeting: false

      }

    }

    console.log(
      '[Structured] Empty -> Semantic fallback'
    )

  }

  // ====================================================
  // HYBRID
  // ====================================================

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
          entity,
          standaloneQuery,
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

        return {

          context:
            reranked
              .map(doc => doc.pageContent)
              .join('\n---\n'),

          isGreeting: false

        }

      }

      console.log(
        '[Hybrid] Semantic empty -> Structured'
      )

      return {

        context:
          entityConfig
            .structured
            .formatResults(
              candidates.slice(0, 6)
            ),

        isGreeting: false

      }

    }

    console.log(
      '[Hybrid] No candidates -> Semantic fallback'
    )

  }

  // ====================================================
  // SEMANTIC
  // ====================================================

  const docs =
    await semanticSearch(
      entity,
      standaloneQuery
    )

  console.log(
    `[Semantic] ${docs.length} documents`
  )

  return {

    context:
      docs
        .map(doc => doc.pageContent)
        .join('\n---\n'),

    isGreeting: false

  }

}

module.exports = {
  retrieveContext
}