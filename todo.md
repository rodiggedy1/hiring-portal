# Hiring Portal Susan — TODO

## Source & Design
- [x] Clone LeadFlow source repo (github.com/rodiggedy1/leadflow-railway)
- [x] Extract exact hiring UI files from LeadFlow source

## Database Schema
- [x] Candidates table (exact LeadFlow schema: firstName, lastName, phone, email, address, specialties, stage, aiScore, aiSummary, videoUrl, statusToken, etc.)
- [x] InterviewChunks table (for AI interview transcript storage)
- [x] Push all migrations via webdev_execute_sql

## Server
- [x] hiringRouter.ts: submitApplication (public), getCandidates (admin), updateStage, archiveCandidate, deleteCandidate, getPipelineStats, getInterviewConfig, saveInterviewCallId, getSessionByPhone, getStatusByToken, getInterviewChunks, saveInterviewChunk, scoreInterview
- [x] admin router: setUserRole
- [x] AI scoring on application submit (LLM, non-blocking)
- [x] Owner notification on new application
- [x] agentProcedure alias for adminProcedure
- [x] SMS stub (opens native sms: link, no external dependency)

## Frontend (exact LeadFlow files)
- [x] Apply.tsx — multi-step application form (contact info → work requirements → AI interview → done)
- [x] HiringPipeline.tsx — admin kanban board with drag-and-drop, candidate detail panel
- [x] HiringStatus.tsx — candidate magic-link status page (/hiring-status/:token)
- [x] AIInterview.tsx — Vapi AI voice interview page (/ai-interview/:token)
- [x] AdminHeader.tsx stub — minimal header with hiring tab
- [x] AgentDashboard.tsx stub — no-op (ConversationDrawer removed)
- [x] App.tsx routing: /, /apply, /hiring, /hiring-status/:token, /ai-interview/:token

## Cleanup
- [x] Remove all ConversationDrawer and LeadFlow-specific session/SMS dependencies
- [x] Remove dead if(false) blocks
- [x] Zero TypeScript errors

## Tests
- [x] 10 Vitest tests passing (auth.logout, auth.me, admin.setUserRole RBAC, hiring.getCandidates RBAC, hiring.submitApplication public access)

- [x] Add Wistia video (ioczkvlwma) to thank you page — same pattern as landing page video
- [x] Fix cleaning supplies photo upload on thank you page — upload to S3 and save to candidate record
- [x] Show suppliesPhotoUrl thumbnail in HiringPipeline candidate detail card
- [x] Mark "Supplies photo" hiringSteps card as done after successful upload in ThankYouStep
- [x] Add Login button to the app navbar (top-right)
- [x] Auto-promote owner (OWNER_OPEN_ID) to admin role on first sign-in
- [x] Add ADMIN_USERNAME and ADMIN_PASSWORD secrets
- [x] Build /login page with username/password form
- [x] Add adminLogin tRPC procedure that validates credentials and issues a session cookie
- [x] Protect /hiring route — redirect to /login if not authenticated
- [x] Replace "Admin Login" navbar button to link to /login
- [x] Remove broken dashboard link from the app
- [x] Auto-select most recent applicant on pipeline load so detail panel opens by default
- [x] Move Admin Login link from top-right navbar to the footer
- [x] Replace top-right navbar slot with something more compelling (e.g. social proof / CTA)
- [x] Fix storage proxy 404 in production — changed /manus-storage/* to /manus-storage/:path(*) for Express 4 named wildcard compatibility
