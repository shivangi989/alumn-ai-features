
const { MemoryVectorStore } = require('@langchain/classic/vectorstores/memory')
const { getAllEntities } = require('../entities/registry')

const stores = {}

const embeddings =
require('../llm/embeddingManager')

const initAllVectorStores = async () => {
  const entities = getAllEntities()

  for (const [entityName, config] of Object.entries(entities)) {
    const records = await config.model.find()
    const docs = config.ingest(records)

    if (docs.length === 0) {
      console.log(`[VectorStore] ${entityName}: no records, skipped`)
      continue
    }

    stores[entityName] = await MemoryVectorStore.fromDocuments(docs, embeddings)
    console.log(`[VectorStore] ${entityName}: ${docs.length} docs indexed`)
  }
}

const getStore = (entityName) => stores[entityName] || null

module.exports = { initAllVectorStores, getStore }