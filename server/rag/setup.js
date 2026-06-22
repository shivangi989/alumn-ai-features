const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai')
const { MemoryVectorStore } = require('@langchain/classic/vectorstores/memory')
const ingestData = require('./ingest')

let vectorStore = null

const setupRAG = async (users, groups, jobs, courses) => {  // ADD courses param
  const docs = ingestData(users, groups, jobs, courses)  // PASS courses

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY1,
    model: 'gemini-embedding-001'
  })

  vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings)
  console.log(`RAG ready — indexed ${docs.length} documents`)
  return vectorStore
}

const getVectorStore = () => vectorStore

module.exports = { setupRAG, getVectorStore }