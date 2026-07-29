# mongoose is an ODM object document mapper maps js objects to mongodb doc

# MongoDB is the database itself

### stores data.

## It is responsible for

## storing data
## retrieving data
## updating data
## deleting data


# Mongoose is NOT a database.

## It is a JavaScript library that talks to MongoDB.

Mongoose provides

Schemas
Models
Validation
Middleware
Relationships

# MongoMemoryServer starts a temporary MongoDB inside RAM.

# MongoDB Atlas is cloud MongoDB.

| Technology        | What is it?              |
| ----------------- | ------------------------ |
| MongoDB           | Database                 |
| Mongoose          | Library to use MongoDB   |
| MongoMemoryServer | Temporary MongoDB in RAM |
| MongoDB Atlas     | Cloud-hosted MongoDB     |


Uniform Resource Identifier-URI

## entities

### "Recommend courses for React developers."

The system goes through these steps:

courses.json
        │
        ▼
Seed MongoDB
        │
        ▼
Course Collection
        │
        ├──────────────┐
        ▼              ▼
structured.js      ingest.js
        │              │
        ▼              ▼
MongoDB        Vector Store
        │              │
        └──────┬───────┘
               ▼
          retrieval.js
               ▼
           Gemini Answer

## 1.schema .js

Creates a blueprint.

Think of Schema as:

"Every Course document should look like this."


## 2. structured.js

This file is NOT AI.
It is normal MongoDB searching

formatResults()

Gemini doesn't understand MongoDB objects well.
So convert into text.


structured.js

↓

MongoDB Retrieval

↓

Formatting

↓

LLM


## 3.ingest.js

Every course

↓

becomes one document.

this is what ingest does ->

Mongo Document

↓

LangChain Document

↓

Embedding

↓

Vector

A LangChain Document has only two important parts:

├── pageContent: This is what gets embedded. Gemini converts this into a vector.
│
└── metadata:Metadata is NOT embedded,stays as extra information.



## schema.js defines the MongoDB data model. structured.js handles exact retrieval from MongoDB using indexed queries, which is efficient for deterministic questions. ingest.js transforms each course into a LangChain Document with pageContent for embeddings and metadata for traceability. This allows the system to support both structured database queries and semantic RAG retrieval depending on the user's intent.`


# RAG is 

 User
      ↓
Retriever
      ↓
Relevant Documents
      ↓
LLM
      ↓
Answer

### The LLM doesn't search your database.

### It only knows what you send in the prompt.

# entire system 

                    User Query
                        │
                        ▼
                 classifyQuery()
                 (router.js)
                        │
      ┌─────────────────┴────────────────┐
      │                                  │
      ▼                                  ▼
Entity?                          Retrieval Mode?
(USER/GROUP/...)      (STRUCTURED / SEMANTIC / HYBRID)
      │                                  │
      └───────────────┬──────────────────┘
                      ▼
               retrieveContext()
               (retrieval.js)
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
 Structured Lookup         Vector Search
   (MongoDB)              (Embeddings)
         │                         │
         └────────────┬────────────┘
                      ▼
               Relevant Context
                      ▼
                  Gemini/Groq
                      ▼
                    Response


## registry.js

This file is actually implementing a Registry Pattern.
The retrieval code doesn't care what entity it is.

This is called polymorphism through configuration.

Very common in backend architecture.


# vectorStoreManager.js

This file runs once when the server starts.
This object simply keeps every vector database in memory.

# router.js

This file is probably the smartest part.

"How should this query be searched?"
It is acting as an AI query planner.

Think of it as the SQL query optimizer, but for AI.


# retrieval.js

This is the orchestrator.
Everything comes together here.

 suppose querry 
 Find Microsoft employees interested in AI

 retrieveContext()

↓

classifyQuery()

↓

Gemini

↓

{

entity:"USER",

mode:"HYBRID",

filters:
{
company:"Microsoft"
}

}

↓

Registry

↓

User config

↓

Structured Query

↓

MongoDB

↓

Microsoft Employees

↓

Semantic Search

↓

Find AI-related employees

↓

Context

↓

Gemini

↓

Answer


# overall
Imagine the user asks:

"Find Microsoft employees interested in AI."


Browser
    │
    ▼
Express Route
    │
    ▼
retrieveContext()
    │
    ▼
router.js
(Gemini/Groq)
    │
    ▼
{
 entity: USER,
 mode: HYBRID,
 filters: { company: "Microsoft" }
}
    │
    ▼
registry.js
    │
    ▼
Gets USER configuration
    │
    ▼
structured.js
    │
    ▼
MongoDB
    │
    ▼
All Microsoft employees
    │
    ▼
vectorStoreManager.js
    │
    ▼
USER Vector Store
    │
    ▼
similaritySearch("AI")
    │
    ▼
Top AI-related Microsoft employees
    │
    ▼
Convert to context string
    │
    ▼
Gemini
    │
    ▼
Natural language answer
    │
    ▼
Frontend


## autogrouping feature
User

↓

Keyword Matching

↓

Found?

↓

YES

↓

Done

↓

NO

↓

Gemini

↓

Done


1) we first retrieve only relevant information
2) Router removes hardcoding.
3) gemini decides  
<
{
 "entity":"USER",
 "intent":"SEARCH",
 "mode":"HYBRID",
 "filters":
 {
   "professional.company":
   {
      "$regex":"Microsoft"
   }
 }
}
4) gemini-embedding-001


pipeline

Router
     ↓
Registry
     ↓
Structured Retrieval
     ↓
Semantic Retrieval
     ↓
Context Construction
     ↓
LLM
