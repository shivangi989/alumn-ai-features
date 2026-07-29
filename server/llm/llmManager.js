const { GoogleGenerativeAI } = require('@google/generative-ai')
const Groq = require('groq-sdk')

const geminiKeys = [
  process.env.GEMINI_API_KEY1,
  process.env.GEMINI_API_KEY2
].filter(Boolean)

if (geminiKeys.length === 0) {
  throw new Error('No Gemini API Keys found')
}

let currentKey = 0

let genAI = new GoogleGenerativeAI(geminiKeys[currentKey])

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

function rotateKey() {
  currentKey = (currentKey + 1) % geminiKeys.length
  genAI = new GoogleGenerativeAI(geminiKeys[currentKey])

  console.log(`[LLM] Switched Gemini Key -> ${currentKey + 1}`)
}

async function callGemini(
  prompt,
  model = 'gemini-2.5-flash',
  retries = 2
) {

  for (let i = 0; i <= retries; i++) {

    try {

      const llm = genAI.getGenerativeModel({ model })

      const result = await llm.generateContent(prompt)

      return {
        text: ()=> result.response.text(),
        provider: 'gemini'
      }

    }

    catch (err) {

      const msg = err.message || ''

      if (
        msg.includes('429') ||
        msg.includes('503')
      ) {

        console.log('[LLM] Gemini overloaded')

        rotateKey()

        await new Promise(r => setTimeout(r, 1500))

        continue

      }

      throw err

    }

  }

  throw new Error('Gemini Failed')

}

async function callGroq(
  prompt,
  model = 'llama-3.3-70b-versatile'
) {

  const completion =
    await groq.chat.completions.create({

      model,

      messages: [

        {
          role: 'user',
          content: prompt
        }

      ]

    })

  return {

    text: ()=> completion.choices[0].message.content,

    provider: 'groq'

  }

}

async function generate(prompt, model = 'gemini-2.5-flash') {

  try {

    return await callGemini(prompt, model)

  }

  catch (err) {

    console.log('[LLM] Falling back to Groq')

    return await callGroq(prompt)

  }

}

module.exports = {

  generate,

  callGemini,

  callGroq

}