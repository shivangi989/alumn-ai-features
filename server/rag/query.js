const { getVectorStore } = require('./setup')

// retrieves top-k relevant documents for a given query
const retrieveContext = async (query, topK = 4) => {
  const vectorStore = getVectorStore()
  if (!vectorStore) {
    throw new Error('Vector store not initialized. Did you call setupRAG() on server start?')
  }

  const results = await vectorStore.similaritySearch(query, topK)

  const context = results
    .map(doc => doc.pageContent)
    .join('\n---\n')

  return context
}

module.exports = retrieveContext