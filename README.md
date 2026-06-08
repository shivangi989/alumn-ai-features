# ALUMNS AI Features

Two AI-powered features for the ALUMNS alumni networking platform of MNNIT Allahabad.

## Features
- **AI Auto Grouping** — assigns alumni to domain groups based on skills
  using keyword matching with Gemini AI fallback
- **Alma** — smart chat assistant with context about users, groups, and jobs

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB (mock: mongodb-memory-server)
- AI: Google Gemini API

## Setup
- cd server && npm install
- Add GEMINI_API_KEY in server/.env
- node server.js

- cd client && npm install
- npm run dev

## Production Integration
Replace mongodb-memory-server with real MongoDB URI in config/db.js.
Auto grouping triggers automatically on skill update.
RAG pipeline to be added in v2 for scalable chat context.