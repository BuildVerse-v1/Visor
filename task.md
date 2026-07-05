# Visor: Development Checklist (Building from Scratch)

Track your development progress through the scratch build milestones here.

---

## Milestone 1: Environment & Server Setup (Backend Setup)
- [ ] Initialize Node.js backend workspace in `backend/`
  - Create package.json and install: `express`, `mongoose`, `cors`, `dotenv`, `multer`, `openai`, `pdf-parse`, `morgan`, `helmet`, `express-rate-limit`.
- [ ] Create `src/config/config.js` to manage environments (MongoDB URI, MiniMax, Deepgram keys).
- [ ] Create `src/server.js` with Express setups, middlewares, and MongoDB Atlas connection hooks.
- [ ] Add `.env.example` with template keys.

---

## Milestone 2: Resume Ingestion & RAG Engine (RAG Service)
- [ ] Implement `src/services/pdfService.js` to parse PDF files into clean text strings.
- [ ] Implement `src/services/minimaxService.js` to initialize OpenAI SDK connecting to MiniMax completions (`MiniMax-M3`).
- [ ] Write MiniMax parser schema logic to extract structured JSON data from raw resume strings.
- [ ] Create `src/services/ragService.js` implementing semantic chunking.
- [ ] Integrate embedding generation (`embo-01`) and in-memory cosine similarity retrieval in `ragService.js`.

---

## Milestone 3: Database Models & Router Endpoints
- [ ] Define Mongoose models:
  - `src/models/User.js` (User registration).
  - `src/models/Interview.js` (Structured resume JSON, chunk embeddings array, QA history array, state parameters).
- [ ] Implement `src/routes/interviewRoutes.js` endpoints:
  - `POST /api/interview/start`: Triggers PDF parsing, chunking, database ingestion, and returns first question.
  - `GET /api/interview/:id`: Fetches complete session record and feedback dashboard data.

---

## Milestone 4: Adaptive Conversation Loop & Speech APIs
- [ ] Implement `src/services/deepgramService.js` using Nova-2 for voice-to-text.
- [ ] Implement `src/services/deepgramTTSService.js` using Aura-Asteria for text-to-voice.
- [ ] Code the adaptive state machine in `src/services/interviewService.js` (difficulty level modifications based on answer scores, context injections).
- [ ] Implement `POST /api/interview/:id/answer` to accept audio responses, transcribe, score, update state, and return follow-ups.

---

## Milestone 5: Scorecards & Customized Study Roadmaps
- [ ] Write overall evaluation prompt inside `minimaxService.js` to score metrics (Technical Accuracy, Communication, Problem Solving, Confidence, Consistency).
- [ ] Implement weakness roadmap compiling utility (generating study guides in Markdown).
- [ ] Hook evaluation script to compile and complete the interview session on the final turn.

---

## Milestone 6: Frontend Client Setup (Vite, Tailwind, Routing)
- [ ] Bootstrap Vite React application in `frontend/` folder.
- [ ] Configure Tailwind with custom dark-themed visual values.
- [ ] Implement basic routers (`App.jsx`) and route guard wrapper (`ProtectedRoute.jsx`).
- [ ] Build views: `LandingPage.jsx`, `Login.jsx` / `Register.jsx`, `Interview.jsx` (setup settings page).

---

## Milestone 7: Voice Recorder & Evaluation Dashboard (Frontend UI)
- [ ] Build `InterviewSession.jsx` incorporating Web MediaRecorder API recording logic and visual wave timers.
- [ ] Integrate API methods for next question queries and speech uploading.
- [ ] Design score metric visuals (custom bars/SVG charts) and render markdown study roadmaps in results panel.
