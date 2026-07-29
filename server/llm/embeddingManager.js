const { GoogleGenerativeAIEmbeddings } =
require('@langchain/google-genai')

const embeddings =
new GoogleGenerativeAIEmbeddings({

    apiKey: process.env.GEMINI_API_KEY1,

    model: 'gemini-embedding-001'

})

module.exports = embeddings