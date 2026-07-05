# Visor: Phased Team Tasks Checklist (VISOR Workspace)

This list details the engineering tasks required to build **Visor** from scratch in `c:\Users\Mukul\Desktop\VISOR`.

---

## Phase 1: Ingestion & Resume Intelligence (Foundations)
- [ ] **[AI Architect]** Create MiniMax API Integration Client
  - Configure standard `openai` SDK connection with `baseURL: "https://api.minimax.io/v1"`.
  - Set up `MINIMAX_API_KEY` and define default models (`MiniMax-M3` for chat, `embo-01` for embeddings).
- [ ] **[Database Engineer]** Define MongoDB Schemas
  - Create [Interview.js](file:///c:/Users/Mukul/Desktop/VISOR/backend/src/models/Interview.js) schema supporting `structuredResume`, `currentState`, and `scorecard` subdocuments.
- [ ] **[RAG Engineer]** Implement Structuring & Embeddings Service
  - Create [ragService.js](file:///c:/Users/Mukul/Desktop/VISOR/backend/src/services/ragService.js).
  - Implement `structureResume(resumeText)` using MiniMax to extract JSON structure (Skills, Exp, Projects).
  - Implement `chunkResume` (semantic paragraph parsing) and `generateEmbeddings`.
- [ ] **[Backend Engineer]** Implement RAG Ingestion API
  - Create [interviewRoutes.js](file:///c:/Users/Mukul/Desktop/VISOR/backend/src/routes/interviewRoutes.js) with `POST /start` to execute PDF text extraction, chunking, and embedding creation.
- [ ] **[DevOps]** Run Ingestion Verification Test
  - Create automated integration script `test-ingestion.js` in `backend/src/tests/` to verify PDF ingest is saved.

---

## Phase 2: State-Driven Adaptive Interview Loop
- [ ] **[Product Manager]** Define Company Modes & Pacing Specifications
  - Document behaviors and criteria for Google, Amazon, Startup CTO, and HR modes.
- [ ] **[AI Architect]** Design Adaptive Question Prompts
  - Build prompt templates in `minimaxService.js` that ingest RAG chunks + previous conversation history + difficulty context.
- [ ] **[Backend Engineer]** Implement State Transition Logic
  - Modify [interviewService.js](file:///c:/Users/Mukul/Desktop/VISOR/backend/src/services/interviewService.js) to track state (difficulty 1-5, topic index, consecutive correct responses).
  - Update `POST /:interviewId/answer` to retrieve context chunks, calculate answer score, update state, and generate the next adapted question.
- [ ] **[Frontend Engineer]** Build Interview Setup Configuration UI
  - Create [Interview.jsx](file:///c:/Users/Mukul/Desktop/VISOR/frontend/src/pages/Interview.jsx) setup page with selectors for Company Mode and starting difficulty level.

---

## Phase 3: Multi-Dimensional Evaluation Engine
- [ ] **[AI Architect]** Implement Structured Scorecard Prompting
  - Create a prompt that evaluates final transcript across 5 axes: Technical, Communication, Problem Solving, Confidence, and Consistency.
- [ ] **[Backend Engineer]** Build Roadmap & Weakness Generator
  - Extract weak topics from question logs and generate a structured Markdown Study Roadmap with resources.
- [ ] **[Backend Engineer]** Complete Interview API Hook
  - Update final question routing to trigger overall evaluation and save final scorecard to MongoDB.

---

## Phase 4: Frontend Scorecard Visualizer & UI Polish
- [ ] **[Frontend Engineer]** Build Scorecard Visual Dashboard
  - Redesign [InterviewSession.jsx](file:///c:/Users/Mukul/Desktop/VISOR/frontend/src/pages/InterviewSession.jsx) to render progress bars, scores, and recommendations.
- [ ] **[Frontend Engineer]** Implement Interactive Study Roadmap
  - Add tab in UI to show the generated Markdown Study roadmap.
- [ ] **[Frontend Engineer]** Micro-animations & Aesthetics
  - Integrate Framer Motion animations for active difficulty level and transition states.
