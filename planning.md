# Visor: AI Interview Intelligence Platform
## Master Plan for Building from Scratch

This planning document outlines the architecture, data models, API integrations, and step-by-step development roadmap to build **Visor** from a clean slate.

---

## 1. Core Objectives & Scope

Visor is a stateful RAG-enabled platform designed to assess, score, and guide candidates through mock interviews. The key features to build are:
1.  **Resume Parsing & Structuring**: Converting uploaded PDFs into structured JSON profiles (skills, projects, experience).
2.  **RAG Semantic Search**: Chunking resume text, generating embeddings using MiniMax, and retrieving context chunks matching the interview questions.
3.  **Adaptive Interview Machine**: A state-machine loop that generates interview questions dynamically, adjusting the difficulty (1 to 5) and topic based on the candidate's previous performance.
4.  **Multi-Dimensional Scorecard**: Detailed feedback along 5 axes (Technical Accuracy, Communication, Problem Solving, Confidence, and Consistency) with radar chart visuals.
5.  **Personalized Learning Roadmaps**: Generating a customized study path (Markdown format) based on detected weaknesses.

---

## 2. Directory Layout & Bootstrapping

We will organize the repository into a clean monorepo structure:

```text
visor/
├── backend/                  # Node.js + Express API server
│   ├── src/
│   │   ├── config/           # Database & API configuration keys
│   │   ├── middleware/       # Authentication guards (JWT/Firebase)
│   │   ├── models/           # Mongoose schemas (User, Interview, ResumeChunk)
│   │   ├── routes/           # Express router endpoints
│   │   ├── services/         # Business logic (MiniMax, RAG, Deepgram)
│   │   └── server.js         # Entry point & DB connection
│   ├── .env.example          # Template for environment configurations
│   └── package.json          # Server dependencies
│
└── frontend/                 # React client (Vite + Tailwind CSS)
    ├── src/
    │   ├── components/       # Layouts, recorder widgets, custom charts
    │   ├── contexts/         # Authentication and theme states
    │   ├── pages/            # Core views (Landing, Auth, Setup, Active Session, Results)
    │   ├── services/         # Axios wrapper and API functions
    │   ├── App.jsx           # Client-side router configuration
    │   ├── index.css         # Styling directives and custom color systems
    │   └── main.jsx          # UI entry point
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 3. Tech Stack Details

*   **API & Backend**: Node.js, Express.js.
*   **Database**: MongoDB Atlas (hosted cloud database).
*   **AI SDK**: `openai` (Official SDK wrapper configured to talk to the MiniMax OpenAI-compatible endpoint).
    *   **Base URL**: `https://api.minimax.io/v1`
    *   **API Key Config**: `MINIMAX_API_KEY`
    *   **Text/Chat Model**: `MiniMax-M3` (supports deep thinking/reasoning).
    *   **Embeddings Model**: `embo-01`.
*   **Speech Services**:
    *   **Transcription (STT)**: Deepgram Nova-2 (configured to include filler words and structural paragraphs).
    *   **Synthesis (TTS)**: Deepgram Aura-Asteria (text-to-speech for reading questions).
*   **State Management**: React Context API for global states, Mongoose for backend session persistence.

---

## 4. Detailed Step-by-Step Milestones

### Milestone 1: Environment & Server Setup (Backend Setup)
*   **Goal**: Initialize a Node.js + Express backend with Mongoose connections and base security features.
*   **Tasks**:
    1.  Create `backend/package.json` and install core packages: `express`, `mongoose`, `cors`, `dotenv`, `multer`, `openai`, `pdf-parse`, `morgan`, `helmet`, `express-rate-limit`.
    2.  Write `backend/src/config/config.js` to load env configurations (MongoDB URI, MiniMax Key, Deepgram Key).
    3.  Create `backend/src/server.js` establishing the Express app, body parsers, CORS headers, rate limiters, and MongoDB connection hooks.

### Milestone 2: Resume Ingestion & RAG Engine (RAG Service)
*   **Goal**: Extract raw PDF strings, parse structured data, chunk, and index for semantic retrieval.
*   **Tasks**:
    1.  Create `pdfService.js` using `pdf-parse` to convert file buffers into raw text strings.
    2.  Create `minimaxService.js` initializing the OpenAI client wrapper with `https://api.minimax.io/v1`. Write a parser utility that calls `MiniMax-M3` requesting a rigid JSON output matching our resume schema.
    3.  Create `ragService.js` to implement semantic paragraph chunking (e.g., 200–400 character paragraphs with overlaps).
    4.  Implement `generateEmbeddings(chunks)` using MiniMax's `embo-01` endpoint to output vector arrays.
    5.  Build an in-memory/local Cosine Similarity function that matches a query string embedding with stored resume chunks.

### Milestone 3: Database Models & Router Endpoints
*   **Goal**: Design persistence schemas for candidates and state-driven interview sessions.
*   **Tasks**:
    1.  Create `models/User.js` supporting standard register fields.
    2.  Create `models/Interview.js` containing:
        *   `structuredResume`: JSON object containing parsed Projects, Skills, Exp.
        *   `resumeChunks`: Array of subdocuments containing chunk text and vector embeddings.
        *   `questions`: Array containing question text, candidate transcript, and individual rating scorecard.
        *   `currentState`: `{ difficulty: Number (1-5), topicIndex: Number, weakTopics: Array, consecutiveSuccess: Number }`
        *   `scorecard`: Complete multi-metric evaluation scorecard.
        *   `roadmap`: Markdown text study roadmap.
    3.  Write `routes/interviewRoutes.js` establishing:
        *   `POST /api/interview/start`: Receives uploaded PDF resume, runs the RAG ingestion pipeline, saves database document, and returns the first question.
        *   `GET /api/interview/:id`: Retrieves full session history and evaluation scorecard.

### Milestone 4: Adaptive Conversation Loop & Speech APIs
*   **Goal**: Implement the dynamic dialogue flow that escalates difficulty and integrates voice transcriptions.
*   **Tasks**:
    1.  Create `services/deepgramService.js` using the Deepgram Nova-2 API for low-latency speech-to-text.
    2.  Create `services/deepgramTTSService.js` to synthesize generated questions into voice MP3 files.
    3.  Write the adaptive logic inside `services/interviewService.js`:
        *   Read the previous question's evaluation score.
        *   If score $\ge 8/10$: Increase difficulty level (max 5) and progress topics.
        *   If score $\le 5/10$: Decrease difficulty (min 1) and focus on fundamental concepts.
        *   Embed the search query -> run local vector search on the current resume -> inject top context chunks into the prompt -> generate next question.
    4.  Create `POST /api/interview/:id/answer`: Receives recorded audio file, transcribes it, scores it, triggers state machine, and returns next question (text + synthesized audio path) or redirects to completion.

### Milestone 5: Scorecards & customized Learning Roadmaps
*   **Goal**: Generate multi-dimensional feedback scorecards and revision plans.
*   **Tasks**:
    1.  Create the final evaluation prompt inside `minimaxService.js` to score the overall transcript across: Technical Knowledge, Communication, Problem Solving, Confidence, and Consistency.
    2.  Implement weakness matching against the parsed resume profile to compile a custom **Learning Roadmap** (Markdown format) showing reading references, tutorial guides, and timelines.
    3.  Hook this evaluation pipeline into `POST /api/interview/:id/answer` when the question count reaches the limit (e.g. 5 questions).

### Milestone 6: Frontend Client Setup (Vite, Tailwind, routing)
*   **Goal**: Bootstrap Vite application and design core page views.
*   **Tasks**:
    1.  Initialize Vite app: `npm create vite@latest frontend -- --template react`
    2.  Install packages: `tailwindcss`, `postcss`, `autoprefixer`, `framer-motion`, `lucide-react`, `react-router-dom`.
    3.  Configure Tailwind variables with a dark-mode palette.
    4.  Write components: `Navbar`, `Footer`, `ProtectedRoute`.
    5.  Build views: `LandingPage.jsx`, `Login.jsx`/`Register.jsx`, `Interview.jsx` (setup options screen).

### Milestone 7: Voice Recorder & Evaluation Dashboard (Frontend UI)
*   **Goal**: Build active audio recorder session page and final metrics dashboard.
*   **Tasks**:
    1.  Create the audio recording workspace in `InterviewSession.jsx` using Web MediaRecorder API. Include interactive wave visualizations, elapsed timers, and controls.
    2.  Implement audio upload and next-question handlers.
    3.  Design the final results page to display the scorecard values with custom CSS progress circles or SVGs and render the markdown-formatted Learning Roadmap.
