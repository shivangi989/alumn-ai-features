
# ALUMNS AI Features

AI-powered enhancements developed for the **ALUMNS Alumni Networking Platform** at **MNNIT Allahabad**.

The project integrates intelligent recommendation systems, Retrieval-Augmented Generation (RAG), and Large Language Models (LLMs) to enhance alumni networking, information discovery, and user engagement.

---

# 🚀 Overview

The AI module consists of two major features:

## 1. AI Auto Grouping

An intelligent hybrid recommendation engine that automatically suggests the most relevant alumni groups based on a user's skills, interests, and professional background.

## 2. Alma – Smart AI Assistant

A conversational AI assistant powered by Retrieval-Augmented Generation (RAG) that helps users discover alumni, organizations, groups, jobs, courses, and platform information using natural language.

---

# 🤖 AI Auto Grouping

## Problem

As the alumni network expands, manually finding relevant communities becomes increasingly difficult.

Users often miss valuable networking opportunities because suitable groups are buried among hundreds of options.

## Solution

The platform implements a **hybrid recommendation pipeline** combining deterministic matching with LLM-powered semantic reasoning.

### Rule-Based Recommendation

The first stage performs fast local matching using:

* Skills extracted from alumni profiles
* Group keywords
* Domain overlap scoring
* JavaScript similarity calculations

When a strong match exists, recommendations are generated instantly without calling an LLM.

### LLM-Based Recommendation

If rule-based confidence falls below a predefined threshold:

* Google Gemini analyzes the alumni profile
* Understands semantic relationships between skills and domains
* Recommends the most relevant communities even without exact keyword matches

This hybrid architecture minimizes API usage while maintaining recommendation quality.

---

## Benefits

* Faster recommendations
* Lower AI API costs
* Reduced latency
* Improved recommendation quality
* Better scalability

---

# 🧠 Alma – Smart AI Assistant

## Purpose

Alma is an AI-powered assistant designed specifically for the ALUMNS platform.

Users can interact using natural language, for example:

* "Who works at Microsoft?"
* "Find Python developer jobs."
* "Show alumni interested in Machine Learning."
* "Recommend cybersecurity groups."
* "Suggest courses for Data Science."
* "Tell me about Google."

---

# 🔍 Retrieval-Augmented Generation (RAG)

Instead of sending the complete database to the LLM, Alma follows a Retrieval-Augmented Generation (RAG) workflow.

### Step 1 — Query Classification

An LLM-based router analyzes the user's query and determines:

* Target entity
* User intent
* Retrieval strategy

Supported entities:

* USER
* ORGANIZATION
* GROUP
* JOB
* COURSE

Supported retrieval modes:

* Structured
* Semantic
* Hybrid
* Greeting

---

### Step 2 — Retrieval

Depending on the query type:

**Structured Retrieval**

Uses MongoDB filters for exact searches such as:

* Company
* Branch
* Batch
* Role
* Skills

**Semantic Retrieval**

Uses vector embeddings to retrieve conceptually similar documents.

**Hybrid Retrieval**

Combines MongoDB filtering with semantic ranking for greater accuracy.

---

### Step 3 — Context Generation

Only the most relevant records are selected and converted into concise context.

This dramatically reduces prompt size while improving answer quality.

---

### Step 4 — Response Generation

The selected context is passed to the LLM, which generates an accurate, grounded, and context-aware response.

---

# 🏗️ System Architecture

```text
                    User Query
                         │
                         ▼
               AI Query Router (LLM)
                         │
         ┌───────────────┼────────────────┐
         │               │                │
         ▼               ▼                ▼
   Structured       Semantic         Hybrid Search
   (MongoDB)      (Vector Search)   (Mongo + Vector)
         │               │                │
         └───────────────┴────────────────┘
                         │
                         ▼
              Context Construction
                         │
                         ▼
               Google Gemini / Groq
                         │
                         ▼
                Context-Aware Response
```

---

# ⚡ AI Pipeline

```
User Query
      │
      ▼
Query Classification
      │
      ▼
Entity Selection
      │
      ▼
Retrieval Strategy
      │
      ▼
MongoDB / Vector Store
      │
      ▼
Relevant Context
      │
      ▼
Gemini / Groq
      │
      ▼
Generated Answer
```

---

# ✨ Intelligent Features

## Hybrid Recommendation Engine

* Rule-based recommendations
* LLM-assisted recommendations
* Automatic fallback

## Entity-Based Knowledge Retrieval

Supports querying:

* Alumni Profiles
* Organizations
* Groups
* Jobs
* Courses

## AI Query Router

Automatically detects:

* Intent
* Entity
* Retrieval mode
* Search filters

## Vector Search

Uses Google Gemini embeddings with LangChain's Memory Vector Store for semantic similarity search.

## Multi-LLM Support

Primary model:

* Google Gemini 2.5 Flash

Fallback model:

* Groq Llama 3.3 70B

Includes:

* Automatic retry logic
* API key rotation
* Graceful fallback

---

# 🛠️ Tech Stack

## Frontend

* React
* Vite

## Backend

* Node.js
* Express.js

## Database

* MongoDB
* mongodb-memory-server (Development)

## AI & Machine Learning

* Google Gemini API
* Groq API
* LangChain.js
* Google Gemini Embeddings
* Retrieval-Augmented Generation (RAG)
* Hybrid Recommendation Engine

## Vector Search

* LangChain Memory Vector Store
* Semantic Search
* Embedding-based Retrieval

---

# 📂 Project Structure

```text
client/
├── src/
├── pages/
└── components/

server/
├── config/
├── entities/
│   ├── profile/
│   ├── organization/
│   ├── group/
│   ├── job/
│   ├── course/
│   └── registry.js
├── rag/
│   ├── vectorStoreManager.js
│   ├── retrieval.js
│   └── router.js
├── services/
├── seed.js
└── server.js

mock-data/
├── users.json
├── organizations.json
├── groups.json
├── jobs.json
└── courses.json
```

---

# ⚙️ Installation

## Backend

```bash
cd server
npm install
```

Create a `.env` file:

```env
GEMINI_API_KEY1=your_primary_gemini_key
GEMINI_API_KEY2=your_secondary_gemini_key
GROQ_API_KEY=your_groq_api_key
```

Start the backend:

```bash
node server.js
```

---

## Frontend

```bash
cd client
npm install
npm run dev
```

---

# 👨‍💻 Author

**AI Module for ALUMNS**

Developed as part of the **ALUMNS Alumni Networking Platform** at **MNNIT Allahabad**.

### Focus Areas

* Artificial Intelligence
* Retrieval-Augmented Generation (RAG)
* Large Language Models (LLMs)
* Semantic Search
* Recommendation Systems
* Alumni Networking Intelligence
* Full-Stack AI Development

