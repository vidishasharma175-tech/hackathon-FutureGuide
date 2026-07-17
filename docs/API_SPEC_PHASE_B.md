# EduPath — Phase B API Spec (Dashboards, Aggregation, RBAC)

Builds on Phase A (see `API_SPEC.md`). All Phase B routes are protected by basic
RBAC (see `src/middleware/rbac.js` — demo-grade, not production auth).

## Auth

### POST /api/auth/login
```json
{ "username": "teacher1", "password": "demo123" }
```
**Response 200**: `{ token, role, linkedId }`. Send the token on subsequent requests:
`Authorization: Bearer <token>`

**Demo users** (`src/data/users.json`):
| username | password | role | linkedId |
|---|---|---|---|
| teacher1 | demo123 | teacher | tch-01 |
| teacher2 | demo123 | teacher | tch-02 |
| parent1 | demo123 | parent | par-01 |
| school_admin1 | demo123 | school_admin | sch-100 |
| ngo_admin | demo123 | admin | — |

`admin` role passes every RBAC check regardless of the route's required roles.

---

## Teacher Dashboard

### GET /api/teacher/:teacherId/class-analytics
Requires role: `teacher` or `school_admin`.
Returns weakness heatmap, stream/career-interest distribution, per-student learning
trends. `?format=csv` streams a CSV of student trend rows instead.

### GET /api/teacher/:teacherId/needs-counselling
Requires role: `teacher` or `school_admin`.
Flags students with an undecided stream, 2+ weak subjects, or no stated career
interest, with human-readable `reasons` per student.

---

## Parent Dashboard

### GET /api/parent/:parentId/children
Requires role: `parent`. Lists the parent's linked children.

### GET /api/parent/child/:studentId/summary
Requires role: `parent`, `teacher`, or `school_admin`.
Returns strengths/weak subjects, top 3 scholarship matches, learning trend, latest
passport (if any), and a plain-language summary suitable for display as-is.

---

## School Analytics

### GET /api/school/:schoolId/analytics
Requires role: `school_admin` or `teacher`.
Returns stream distribution, weakest subjects, average scholarship eligibility per
student, and two mock composite indices:
- **aiReadinessIndex** — % of students with a finalized stream (proxy for how much of
  the student body has actionable AI-guided data).
- **employabilityIndex** — % of students with a stated career interest.
Both are simple, documented placeholder formulas — swap for a validated model once
pilot data is available. `?format=csv` exports one flattened summary row.

---

## Impact Dashboard (admin only)

### GET /api/impact/summary
### GET /api/impact/district/:district
### GET /api/impact/state/:state

Aggregated, anonymized metrics: total students registered, students guided, streams
recommended, scholarships recommended + estimated value unlocked (parsed from
`benefits` strings — rough estimate, not exact), schemes recommended, career
assessments completed, plans created, students showing improvement, rural &
government school counts, parent/teacher engagement counts.

`MAU/WAU` and `recommendationAccuracyFeedback` are **not** computed — they require
live session and feedback tracking not yet wired into this demo dataset. The
response includes a `note` field saying so explicitly rather than fabricating numbers.

`?format=csv` on `/summary` exports one flattened row.

---

## Success Tracker

### POST /api/success-tracker/:studentId
```json
{ "eventType": "scholarship-received", "description": "Received NMMS scholarship.", "metadata": {} }
```
`eventType` must be one of: `correct-stream-selection`, `scholarship-received`,
`admission`, `internship`, `certification`, `placement`, `performance-improvement`,
`other`.

### GET /api/success-tracker/:studentId
Returns the full outcome timeline, oldest first.

---

## Social Impact Report Generator (downloadable PDFs)

### GET /api/reports/school/:schoolId
Requires role: `school_admin` or `teacher`. Renders a PDF of that school's analytics.

### GET /api/reports/impact?district=...&state=...
Requires admin. No query params → national report. Renders a PDF.

### GET /api/reports/download/:filename
Streams the generated PDF.

---

## Data model additions

- `src/data/schools.json`, `teachers.json`, `parents.json`, `students.json` — seeded
  relational demo data linking students to schools/teachers/parents.
- `src/data/users.json` — demo login accounts for RBAC.
- `src/models/SuccessEvent.js` — Mongoose schema (used only if `MONGO_URI` is set).
- `scripts/seedDemoData.js` (`npm run seed`) — populates sample assessment history
  and success events so dashboards return non-trivial numbers immediately in JSON
  fallback/demo mode.

## RBAC caveat

Tokens are base64-encoded JSON, **not signed** — anyone can forge one by encoding
their own `{username, role, linkedId}`. This is intentional MVP/hackathon-demo scope
per the original feature doc ("basic RBAC"). Before handling real student data, swap
`src/middleware/rbac.js` for signed JWTs (`jsonwebtoken`) and hash passwords
(`bcrypt`) in `src/data/users.json` / a real user store.

