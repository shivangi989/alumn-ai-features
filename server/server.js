const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { GoogleGenerativeAI } = require('@google/generative-ai')
const connectDB = require('./config/db')
const seedDB = require('./seed')
const User = require('./models/User')
const Group = require('./models/Group')
const Job = require('./models/Job')

const app = express()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

app.use(cors())
app.use(express.json())

// ─────────────────────────────────────────
// GET all users
// ─────────────────────────────────────────
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Could not load users' })
  }
})

// ─────────────────────────────────────────
// ROUTE 1: Auto-Group one user
// ─────────────────────────────────────────


if (!userId) return res.status(400).json({ error: 'userId is required' })
if (!message || message.trim() === '') return res.status(400).json({ error: 'message is required' })


app.post('/api/auto-group', async (req, res) => {
  const { userId } = req.body
  if (!userId) return res.status(400).json({ error: 'userId is required' })

  try {
    // production-identical query
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const groups = await Group.find()

    // keyword matching logic — unchanged
    let bestMatch = null
    let highestScore = 0

    groups.forEach(group => {
      const score = user.skills.filter(skill =>
        group.keywords.some(k => k.toLowerCase() === skill.toLowerCase())
      ).length
      if (score > highestScore) {
        highestScore = score
        bestMatch = group
      }
    })

    // Gemini fallback
    if (highestScore === 0) {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      const prompt = `
        Skills: ${user.skills.join(', ')}, Branch: ${user.branch}
        Groups: ${groups.map(g => g.name).join(', ')}
        Best group? Reply ONLY with group name.
      `
      const result = await model.generateContent(prompt)
      const suggestion = result.response.text().trim()
      bestMatch = groups.find(g =>
        g.name.toLowerCase() === suggestion.toLowerCase()
      ) || groups[0]
    }

    // save assigned group to user — production-identical
    user.assignedGroup = bestMatch.name
    await user.save()

    res.json({
      userId: user._id,
      userName: user.name,
      skills: user.skills,
      assignedGroup: bestMatch.name,
      matchedBy: highestScore > 0 ? 'keyword-matching' : 'gemini-ai'
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────
// ROUTE 2: Auto-Group ALL users
// ─────────────────────────────────────────

if (!userId) return res.status(400).json({ error: 'userId is required' })
if (!message || message.trim() === '') return res.status(400).json({ error: 'message is required' })


app.post('/api/auto-group-all', async (req, res) => {
  try {
    const users = await User.find()
    const groups = await Group.find()
    const results = []

    for (const user of users) {
      let bestMatch = null
      let highestScore = 0

      groups.forEach(group => {
        const score = user.skills.filter(skill =>
          group.keywords.some(k => k.toLowerCase() === skill.toLowerCase())
        ).length
        if (score > highestScore) {
          highestScore = score
          bestMatch = group
        }
      })

      if (highestScore === 0) {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
        const prompt = `Skills: ${user.skills.join(', ')}, Branch: ${user.branch}. Groups: ${groups.map(g => g.name).join(', ')}. Best group? Reply ONLY group name.`
        const result = await model.generateContent(prompt)
        const suggestion = result.response.text().trim()
        bestMatch = groups.find(g =>
          g.name.toLowerCase() === suggestion.toLowerCase()
        ) || groups[0]
      }

      // save to DB — production-identical
      user.assignedGroup = bestMatch.name
      await user.save()

      results.push({
        userId: user._id,
        userName: user.name,
        assignedGroup: bestMatch.name,
        matchedBy: highestScore > 0 ? 'keyword' : 'gemini'
      })
    }

    res.json(results)

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────
// ROUTE 3: Smart Chat Assistant
// ─────────────────────────────────────────

if (!userId) return res.status(400).json({ error: 'userId is required' })
if (!message || message.trim() === '') return res.status(400).json({ error: 'message is required' })
  
app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'message is required' })
  }

  try {
    // fetch fresh from DB every time — production-identical
    const users = await User.find()
    const groups = await Group.find()
    const jobs = await Job.find()

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `
        Your name is Alma. You are the smart assistant for ALUMNS,
        the alumni networking platform of MNNIT Allahabad.
        When someone asks your name, say "I'm Alma, the ALUMNS network assistant."

        You have access to this platform data:
        USERS: ${JSON.stringify(users)}
        GROUPS: ${JSON.stringify(groups)}
        JOBS: ${JSON.stringify(jobs)}

        Behavior rules:
        - If someone greets you, greet back and ask how you can help
        - If message is informal or casual, respond casually but still be helpful
        - If asked about people, search USERS data
        - If asked about groups or domains, search GROUPS data
        - If asked about jobs or careers, search JOBS data
        - If question is unrelated to platform, politely say you only help with alumni network queries
        - Keep responses short and friendly
      `
    })

    const chat = model.startChat({ history })
    const result = await chat.sendMessage(message)

    res.json({
      reply: result.response.text(),
      newHistoryEntry: {
        role: 'user',
        parts: [{ text: message }]
      }
    })

  } catch (err) {
    console.error('Gemini error:', err.message)
    if (err.message.includes('503') || err.message.includes('overloaded')) {
      return res.status(503).json({
        error: 'Alma is busy right now. Please try again in a few seconds.'
      })
    }
    res.status(500).json({ error: err.message })
  }
})


// ─────────────────────────────────────────
// Start server — connect DB first, then seed, then listen
// ─────────────────────────────────────────
const PORT = process.env.PORT || 5000

connectDB().then(async () => {
  await seedDB()
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
})

// ─────────────────────────────────────────
// Prevent server crash
// ─────────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message)
})
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message)
})


