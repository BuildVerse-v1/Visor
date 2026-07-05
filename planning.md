# Visor: AI Interview Intelligence Platform
## Architectural Blueprint & Planning Document (Building from Scratch)

Visor is a stateful, RAG-enabled AI Mock Interview and Intelligence platform. Unlike simple AI wrappers, Visor extracts structured knowledge from a candidate's resume, indexes it semantically using vector embeddings, drives an adaptive multi-turn interview, evaluates performance across multiple dimensions, and provides customized study roadmaps.

---

## 1. Technology Stack

*   **Frontend**: React (Vite) + Tailwind CSS (curated harmonious color palette, sleek dark/glassmorphic components, and smooth Framer Motion micro-animations).
*   **Backend**: Node.js + Express.js.
*   **AI API**: MiniMax API (OpenAI-compatible SDK wrapper pointing to `https://api.minimax.io/v1`).
    *   **Chat Completions Model**: `MiniMax-M3` (supports deep reasoning and thinking).
    *   **Text Embeddings Model**: `embo-01`.
*   **Audio STT**: Deepgram Nova-2 (captures filler words and speech markers for communication analysis).
*   **Audio TTS**: Deepgram Aura-Asteria (text-to-speech synthesis for question playback).
*   **Database**: MongoDB Atlas (fully online managed cloud instance).
*   **Vector Search**: Local Node.js In-Memory Cosine Similarity Retriever for low-latency session-level queries.

---

## 2. Visor Project Structure (Target Directory Layout)

```text
visor/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── config.js              # Environment variables (MiniMax, Deepgram, MongoDB)
│   │   │   └── firebaseadmin.js       # Firebase SDK config (optional for OAuth)
│   │   ├── middleware/
│   │   │   └── authMiddleware.js      # JWT & Firebase bearer token validation
│   │   ├── models/
│   │   │   ├── User.js                # Candidate profiles
│   │   │   └── Interview.js           # Stateful interviews, structured resume, scorecards
│   │   ├── routes/
│   │   │   ├── authRoutes.js          # Authentication (login/register)
│   │   │   ├── userRoutes.js          # User profile settings
│   │   │   └── interviewRoutes.js     # Interview session management, audio uploads
│   │   ├── services/
│   │   │   ├── minimaxService.js      # MiniMax LLM completions & evaluations
│   │   │   ├── ragService.js          # Chunking, embo-01 embeddings, local vector search
│   │   │   ├── pdfService.js          # pdf-parse text extraction
│   │   │   ├── deepgramService.js     # Speech-to-text (Nova-2)
│   │   │   └── deepgramTTSService.js  # Text-to-speech (Aura-Asteria)
│   │   ├── tests/
│   │   │   ├── test-rag.js            # RAG pipeline test script
│   │   │   └── test-adaptive.js       # Adaptive engine simulation
│   │   └── server.js                  # App gateway & DB initialization
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Sleek navigation header
│   │   │   ├── Footer.jsx             # Styled footers
│   │   │   ├── ProtectedRoute.jsx     # Route guard
│   │   │   └── RecordingBlob.jsx      # Voice recording wave animation
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx        # Auth state management
│   │   │   └── ThemeContext.jsx       # Theme preferences (default dark)
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx        # Hero page
│   │   │   ├── Login.jsx              # Credentials portal
│   │   │   ├── Register.jsx           # Sign up form
│   │   │   ├── Interview.jsx          # Setup (role, company mode, starting difficulty)
│   │   │   ├── InterviewSession.jsx   # Active interview dashboard & voice recorder
│   │   │   └── MyInterviews.jsx       # List of past session evaluations & roadmaps
│   │   ├── services/
│   │   │   └── api.js                 # API handler mapping to backend endpoints
│   │   ├── App.jsx                    # Routing configuration
│   │   ├── index.css                  # Tailwinds directives and custom variables
│   │   └── main.jsx                   # Entry point
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 3. Core Engine Mechanics

### A. The RAG Pipeline
1.  **Parsing & Structuring**: Raw text from PDF is passed to MiniMax with a strict schema prompt to extract a JSON containing:
    *   `skills`: List of tools and programming languages.
    *   `projects`: Titles, technologies, and action bullet points.
    *   `experience`: Company names, roles, and achievements.
2.  **Semantic Chunking**: The raw resume text is split into overlapping chunks (~200-400 characters).
3.  **Embeddings**: Each chunk is passed to MiniMax `embo-01` to generate a vector. Chunks and vectors are saved under the `Interview` document as subdocuments or a linked collection.
4.  **Retrieval**: Prior to generating a question, the active topic is embedded and compared against resume chunk vectors using Cosine Similarity. The top-K chunks are injected as prompt context.

### B. The Stateful Adaptive Loop
*   Each interview runs for 5–8 questions depending on the chosen **Company Mode**:
    *   *Google Mode*: Hard technical depth, algorithmic tradeoffs.
    *   *Startup Mode*: Pragmatic developer decisions, architectural scalability.
    *   *HR Mode*: Behavioral scenarios, communication, conflict resolution.
*   **Adaptive Flow**:
    *   Starts at a chosen baseline difficulty (1–5 scale).
    *   For a correct/accurate response (Score $\ge 8/10$), difficulty increases.
    *   For a weak/inaccurate response (Score $\le 5/10$), difficulty decreases and the system focuses on validating fundamental concepts before pivoting.
    *   Maintains memory of the last 3 QA turns to prevent circular questions.

### C. Multi-Dimensional Scorecard & Learning Path
Upon completion, the system executes a final synthesis prompt evaluating:
1.  **Technical Knowledge**: Accuracy of architectural and algorithmic answers.
2.  **Communication**: Sentence structure, clarity of speech, and filler word frequency.
3.  **Problem Solving**: Critical thinking when challenged with harder follow-ups.
4.  **Confidence**: Assertiveness and tone consistency (derived from audio analytics & speech pattern).
5.  **Resume Consistency**: Cross-referencing answer details against claimed projects in the structured resume.

It generates:
*   A **Scorecard** with radar-chart compliant scores (1-10) for each axis.
*   A **Learning Roadmap** formatted in Markdown detailing weak topics, step-by-step revision timelines, and links to official documentations/guides.

---

## 4. Phase-by-Phase Execution Plan

### Phase 1: Database Setup & Resume Structuring (Backend)
*   Initialize node package files and connect to MongoDB Atlas.
*   Define Mongoose model classes.
*   Set up PDF parse service.
*   Write MiniMax client wrapper mapping completions and `embo-01` embedding endpoints.
*   Build `ragService.js` (chunking, embeddings cache, in-memory cosine similarity search).

### Phase 2: Adaptive Orchestrator (Backend API)
*   Write the state machine tracking difficulty, active focus areas, and history logs.
*   Integrate Deepgram Nova-2 (STT) and Aura-Asteria (TTS).
*   Create interview start and progression endpoints (`POST /api/interview/start` and `POST /api/interview/:id/answer`).

### Phase 3: Visual Interface & Audio Workspace (Frontend)
*   Bootstrap React + Vite + Tailwind application.
*   Design custom auth wrappers (JWT/Firebase Auth).
*   Implement Web MediaRecorder API to record high-fidelity voice responses and upload audio chunks.
*   Build the interview configuration screen (Company Mode, baseline difficulty, resume parser trigger).

### Phase 4: Scorecards & Interactive Roadmaps (Fullstack)
*   Implement final evaluation synthesis inside the backend.
*   Build frontend dashboard pages with custom animated bars or SVG Radar graphs representing metrics.
*   Render detailed markdown curriculum for custom study paths.
