# Hiring Portal Susan — TODO

## Database Schema
- [x] Jobs table (id, title, department, location, type, description, requirements, status, createdAt)
- [x] Candidates table (id, userId, name, email, phone, skills, resumeKey, resumeUrl, createdAt)
- [x] Applications table (id, jobId, candidateId, status, coverLetter, createdAt, updatedAt)
- [x] ApplicationNotes table (id, applicationId, authorId, content, createdAt)
- [x] Push all migrations via webdev_execute_sql
- [x] Sample job listings seeded (5 published positions)

## Server Routers
- [x] jobs router: list (public), getById (public), create/update/delete (admin)
- [x] applications router: submit (authenticated), listByJob (admin), listMine (candidate), updateStatus (admin)
- [x] candidates router: getProfile, updateProfile, uploadResume
- [x] notes router: addNote, listNotes (admin)
- [x] notifications: email owner on new application via notifyOwner
- [x] Role-based access: adminProcedure guard on admin routes
- [x] Duplicate application prevention

## Public Frontend (LeadFlow clone)
- [x] Global theme: dark bg #141a24, accent #c1ffdf, Satoshi font, pill buttons radius 1600px
- [x] Navbar: LeadFlow logo, nav links, Login + Sign Up buttons
- [x] Careers landing page: hero, values section, open positions list, why work with us, CTA, footer
- [x] Job detail page: pill tags (type + location), large title, description, APPLY NOW button, more positions section
- [x] Multi-step application form (step 1: personal info, step 2: experience/skills, step 3: cover letter)
- [x] Thank you page after submission
- [x] My Applications page (candidate pipeline view)

## Admin Dashboard
- [x] Admin dashboard: stats cards (active jobs, total applicants, pipeline counts)
- [x] Job management: create, edit, publish/unpublish, delete jobs
- [x] Applications pipeline: kanban-style view by status (Applied, Screening, Interview, Offer, Hired, Rejected)
- [x] Candidate review: view profile, resume link, notes, move through pipeline
- [x] Notes/comments on applications

## Auth & Access Control
- [x] Role-based access: admin vs candidate routes
- [x] Candidate: can apply, view own applications
- [x] Admin: full management access
- [x] Admin auto-promoted via OWNER_OPEN_ID env var

## Tests
- [x] Vitest tests for jobs router (list, getById, create with RBAC)
- [x] Vitest tests for applications router (submit, auth guard)
- [x] Vitest tests for admin dashboard (stats, RBAC)
- [x] Vitest tests for auth.logout
