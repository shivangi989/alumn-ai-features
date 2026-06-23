# ALUMNS AI Features

AI-powered enhancements developed for the **ALUMNS Alumni Networking Platform** at **MNNIT Allahabad**.

This project introduces intelligent recommendation and assistance capabilities to improve alumni engagement, networking, and information discovery on the platform.

---

## Overview

The project consists of two major AI-driven features:

### 1. AI Auto Grouping

An intelligent recommendation system that helps alumni discover and join relevant groups based on their skills, interests, and professional domains.

### 2. Alma – Smart AI Assistant

A conversational assistant that helps users find:

* Relevant alumni profiles
* Domain-specific groups
* Job opportunities
* Platform-related information

---

## AI Auto Grouping

### Problem

As the alumni network grows, manually discovering relevant groups becomes difficult and time-consuming.

### Solution

A hybrid recommendation system combining:

#### Rule-Based Matching

* Skill and keyword extraction from alumni profiles
* Group profile analysis
* Match score calculation using JavaScript-based similarity logic
* Automatic recommendations when confidence is high

#### LLM-Based Recommendation

When rule-based confidence falls below a predefined threshold:

* Profile information is analyzed using Google Gemini
* Semantic understanding is used to identify relevant groups
* Recommendations are generated even when exact keyword matches are unavailable

### Benefits

* Faster group discovery
* Improved recommendation accuracy
* Reduced dependency on AI calls
* Cost-efficient hybrid architecture

---

## Alma – Smart AI Assistant

### Purpose

Alma acts as an AI-powered assistant for the ALUMNS platform.

Users can ask questions such as:

* "Which alumni work in Machine Learning?"
* "Show me groups related to Web Development."
* "Find job opportunities in software engineering."
* "Suggest alumni with similar interests."

### Retrieval-Augmented Generation (RAG)

To support future platform growth, Alma uses a Retrieval-Augmented Generation (RAG) architecture.

Instead of sending the entire database to the LLM:

1. Relevant information is retrieved based on the user's query.
2. Only the most relevant context is provided to the LLM.
3. The model generates accurate and context-aware responses.

### Advantages of RAG

* Faster response generation
* Lower token consumption
* Better scalability
* More accurate answers
* Efficient handling of large alumni datasets

---

## System Architecture

User Query
↓
Retriever (RAG)
↓
Relevant Alumni / Groups / Jobs
↓
Gemini LLM
↓
Generated Response

---

## Tech Stack

### Frontend

* React
* Vite

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* mongodb-memory-server (development)

### AI & Intelligence

* Google Gemini API
* Hybrid Recommendation Engine
* Retrieval-Augmented Generation (RAG)

---

## Project Structure

```text
client/
├── src/
├── pages/
└── components/

server/
├── models/
├── routes/
├── services/
├── rag/
│   ├── ingest.js
│   ├── query.js
│   └── setup.js
└── server.js

mock-data/
├── users.json
├── groups.json
├── jobs.json
└── courses.json
```

## Installation

### Backend

```bash
cd server
npm install
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key
```

Start the server:

```bash
node server.js
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## Production Deployment

For production environments:

* Replace `mongodb-memory-server` with a dedicated MongoDB instance.
* Configure secure environment variables.
* Deploy backend and frontend independently.
* Enable scalable vector storage for large-scale RAG retrieval.

---


## Author

Project Focus:

* AI-powered recommendation systems
* Retrieval-Augmented Generation (RAG)
* Alumni networking intelligence

