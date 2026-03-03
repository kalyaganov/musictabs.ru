---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
status: complete
completedAt: '2026-03-03'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/project-context.md
workflowType: 'architecture'
project_name: 'musictabs.ru'
user_name: 'Alexey'
date: '2026-03-03'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:** 32 requirements across 6 categories:

| Category | Count | Key Capabilities |
|----------|-------|------------------|
| User Management | 7 | Auth, onboarding, skill assessment |
| Tab Generation & Adaptation | 7 | AI tabs, adaptive difficulty, feedback |
| Gamification & Progression | 6 | XP, levels, celebrations |
| Practice & Learning | 5 | Session tracking, history |
| Progress Visualization | 4 | Dashboard, charts, comparisons |
| Admin Operations | 3 | Metrics, logs, admin interface |

**Non-Functional Requirements:** 16 requirements across 5 categories:

| Category | Key Constraints |
|----------|-----------------|
| Performance | Page load < 3s, Tab gen < 30s, API < 1s |
| Security | HTTPS, hashed passwords, session tokens, 30-day expiry |
| Scalability | 100-500 concurrent users, horizontal scaling |
| Reliability | 99% uptime, no silent failures, immediate persistence |
| Integration | AI service timeout/retry, error logging |

**Scale & Complexity:**
- **Primary domain:** Full-stack web application (SPA + API)
- **Complexity level:** Low-Medium
- **Estimated architectural components:** 8-12 core services/modules

### Technical Constraints & Dependencies

**Existing Stack (from project-context.md):**
- **Frontend:** React 19, TypeScript (strict), Vite 7, Axios, Tone.js
- **Backend:** FastAPI, SQLAlchemy 2.0 (async), Pydantic v2, Celery + Redis
- **Database:** PostgreSQL 15-alpine
- **Infrastructure:** Docker Compose (5 services)

**Key Architectural Constraints:**
- Async database operations required (`AsyncSession`)
- Background job pattern for CPU-intensive MIDI generation
- No authentication implemented yet (critical gap)
- CORS currently localhost-only

### Cross-Cutting Concerns Identified

| Concern | Impact |
|---------|--------|
| **Authentication/Authorization** | Must be added before public deployment; affects all user-facing endpoints |
| **Background Job Processing** | Celery pattern established; used for tab generation |
| **State Management** | React state in App.tsx; may need scaling for gamification complexity |
| **Error Handling** | Consistent patterns needed across frontend/backend |
| **Session Persistence** | Practice data must never be lost (NFR13) |
| **Polling Pattern** | Job status polling at 1s intervals; may need backoff |

### Architectural Implications from User Journeys

| Journey | Technical Requirements |
|---------|----------------------|
| Maya (Beginner) | Onboarding flow, adaptive algorithm, real-time XP tracking |
| Jake (Stuck) | Skill assessment, progress dashboard, level-up triggers |
| Alex (Returning) | Re-engagement system, streak recovery, notifications |
| Sarah (Admin) | Admin dashboard, metrics aggregation, monitoring |

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack Web Application (SPA + API)** based on project requirements analysis.

### Existing Foundation

The project already has an established technical foundation. No new starter template selection is required.

**Frontend Stack (React 19 + Vite 7):**
| Component | Version | Notes |
|-----------|---------|-------|
| React | 19.2.0 | Latest stable, concurrent rendering support |
| TypeScript | 5.9.3 | Strict mode enabled |
| Vite | 7.3.1 | ES modules, fast HMR |
| Axios | 1.13.5 | HTTP client |
| Tone.js | 15.1.22 | Web Audio API for audio playback |
| ESLint | 9.39.1 | Flat config |

**Backend Stack (FastAPI):**
| Component | Version | Notes |
|-----------|---------|-------|
| FastAPI | 0.109.0 | Async framework |
| SQLAlchemy | 2.0.25 | Async with asyncpg |
| Pydantic | 2.5.3 | v2 syntax |
| Celery | 5.3.6 | Background job processing |
| PostgreSQL | 15-alpine | Primary database |
| Redis | 5.0.1 | Cache + message broker |

**Infrastructure:**
- Docker Compose (5 services: db, redis, backend, celery-worker, frontend)
- Node 20+ (ES2022 target)

### Team Evaluation Summary

**Architectural Review (Winston):**
> "Your stack is solid. React 19 with Vite 7 is exactly what I'd recommend for a 2026 SPA. The async SQLAlchemy pattern with FastAPI is production-ready."
> 
> Alternative considered: Next.js for SSR marketing pages. Rejected due to clean separation of concerns already established.

**Implementation Assessment (Barry):**
> "The scaffolding is done. Ship it. The only gap: no tests."

**Code Quality Review (Amelia):**
> "The separation is clean. TypeScript strict mode is enabled. Pydantic v2 syntax is correct."
> 
> Future consideration: WebSockets for real-time gamification updates (MVP uses polling).

**Business Reality Check (John):**
> "The current stack can handle 1,000-10,000 active users. Priority concerns: Authentication not implemented (blocks all user journeys)."

### Decision: Keep Existing Foundation

**Rationale:**
- Stack is current and production-ready
- Clean separation of concerns (frontend/backend)
- Docker Compose orchestration already configured
- No need to rebuild what's working

### Gaps Identified for Implementation

| Gap | Priority | Recommendation |
|-----|----------|----------------|
| Authentication | 🚨 Critical | Implement before MVP launch |
| Testing Framework | 🚨 High | Vitest (frontend) + pytest (backend) |
| WebSocket Support | 📅 Future | Consider for Phase 2 gamification |

### Initialization Commands (Reference Only)

**Frontend (if recreating):**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install axios tone.js
```

**Backend (if recreating):**
```bash
pip install fastapi uvicorn sqlalchemy asyncpg pydantic celery redis
```

**Note:** These commands are for reference only. The project already has a working implementation that will be extended.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- ✅ Authentication method: JWT with refresh tokens
- ✅ Testing framework: Vitest + pytest

**Important Decisions (Shape Architecture):**
- ✅ State management: React state + Context
- ✅ API patterns: Consistent envelope with error codes
- ✅ UI design style: Vibrant & Block-based

**Deferred Decisions (Post-MVP):**
- Hosting platform (Vercel, Railway, AWS)
- Monitoring/observability stack
- WebSocket for real-time gamification

### Authentication & Security

| Decision | Choice | Version |
|----------|--------|---------|
| Auth Method | JWT with refresh tokens | - |
| Auth Library | python-jose | Latest |
| Login Providers | Email/password + Google + GitHub | - |
| Password Hashing | bcrypt | Latest |
| Token Storage | Redis (refresh tokens) | 5.0.1 |
| Access Token Expiry | 15-30 minutes | - |
| Refresh Token Expiry | 30 days | - |

**Security Patterns:**
- All endpoints require HTTPS (NFR6)
- User authentication required for personal data (NFR7)
- Session tokens expire after 30 days inactivity (NFR8)
- Passwords hashed with bcrypt (NFR5)

### Testing Strategy

| Layer | Framework | Key Dependencies |
|-------|-----------|------------------|
| Frontend Unit | Vitest | @testing-library/react, @testing-library/user-event, jsdom |
| Frontend Coverage | @vitest/coverage-v8 | - |
| Backend Unit | pytest | pytest-asyncio, httpx |
| Backend Integration | pytest | AsyncClient, test database |

**Test Database Strategy:**
- Separate test database: `musictabs_test`
- Clean isolation between test runs
- Migrations applied before test suite

**Frontend Test Location:** `frontend/src/**/*.test.ts(x)`
**Backend Test Location:** `backend/tests/**/*.py`

### State Management

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary State | React state + Context | Simple, no dependencies, MVP-appropriate |
| Persistence | localStorage + backend sync | Fast loads, reliable backup |
| State Library | None (defer Zustand) | Add only if prop drilling becomes painful |

**Context Usage:**
- User session (auth state, profile)
- Gamification (XP, level, streaks)
- UI preferences (theme, settings)

**Persistence Pattern:**
1. Write to localStorage immediately (optimistic)
2. Debounce backend sync (500ms)
3. On login: fetch from backend, cache to localStorage

### UI Design Style

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Visual Style | Vibrant & Block-based | Engaging, modern, gamification-friendly |

**Design Principles:**

| Principle | Implementation |
|-----------|----------------|
| **Vibrant** | Bold saturated colors, playful gradients, celebratory animations |
| **Block-based** | Card components, clear sections, grid layouts, generous spacing |

**Component Styling:**

| Element | Style |
|---------|-------|
| Cards | Rounded corners (8-12px), subtle shadow, white background |
| Buttons | Bold colors, rounded, clear hover/active states |
| XP/Progress Bars | Gradient fills, animated transitions |
| Level Badges | Colorful, distinctive icons per level |
| Navigation | Block-style tabs, active state highlighted |
| Forms | Clean inputs with clear labels, block layout |

**Color Palette:**

| Role | Color Direction |
|------|-----------------|
| Primary | Vibrant purple/blue (CTAs, branding) |
| Secondary | Energetic orange/yellow (XP, achievements) |
| Accent | Teal/green (success, progress) |
| Neutral | Soft grays (backgrounds, text) |
| Background | Light with subtle gradients |

**Gamification Visual Elements:**
- XP bars with animated fill on gain
- Level-up celebrations with confetti/pulse animation
- Streak counters with fire icons
- Achievement badges with distinct colors per tier

### API & Communication Patterns

**Response Envelope:**

```json
{
  "success": true|false,
  "data": { ... },
  "error": { ... },
  "request_id": "uuid"
}
```

**Error Structure:**

```json
{
  "success": false,
  "error": {
    "code": "CATEGORY_DESCRIPTION",
    "message": "Human-readable message",
    "details": { ... }
  },
  "request_id": "uuid"
}
```

**Error Code Convention:**

| Prefix | Category | Examples |
|--------|----------|----------|
| `AUTH_` | Authentication | AUTH_INVALID_TOKEN, AUTH_EXPIRED, AUTH_INVALID_CREDENTIALS |
| `VAL_` | Validation | VAL_REQUIRED_FIELD, VAL_INVALID_EMAIL, VAL_PASSWORD_TOO_SHORT |
| `RES_` | Resources | RES_NOT_FOUND, RES_ALREADY_EXISTS, RES_FORBIDDEN |
| `SYS_` | System | SYS_INTERNAL_ERROR, SYS_SERVICE_UNAVAILABLE, SYS_RATE_LIMITED |

**API Documentation:** OpenAPI auto-generated at `/docs` (FastAPI built-in)

### Decision Impact Analysis

**Implementation Sequence:**

1. **Authentication** (Critical - blocks all user features)
   - Implement JWT middleware
   - Create user registration/login endpoints
   - Add Google/GitHub OAuth flows
   - Set up refresh token rotation

2. **Testing Infrastructure** (Critical - quality foundation)
   - Configure Vitest for frontend
   - Configure pytest for backend
   - Create test database setup
   - Write initial test utilities

3. **API Standardization** (Important - agent consistency)
   - Create response envelope middleware
   - Implement error code system
   - Add request ID generation
   - Document patterns in project-context.md

4. **State Persistence** (Important - user experience)
   - Implement localStorage utilities
   - Create sync middleware
   - Add Context providers for shared state

5. **UI Component Library** (Important - visual consistency)
   - Define color palette as CSS variables
   - Create base card/button components
   - Build gamification visual components (XP bar, badges)
   - Establish animation patterns

**Cross-Component Dependencies:**

```
Authentication → State Management → API Patterns
      ↓                ↓                ↓
   Testing        Testing          Testing
      ↓
UI Components (use auth state, display XP/levels)
```

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 6 categories with 20+ specific rules where AI agents could make different choices.

### Naming Patterns

**Database Naming:**
| Element | Convention | Example |
|---------|------------|---------|
| Tables | Plural snake_case | `users`, `practice_sessions`, `generation_jobs` |
| Columns | snake_case | `user_id`, `skill_level`, `xp_total` |
| Foreign keys | `{table}_id` | `user_id`, `session_id` |
| Primary keys | `id` | Integer or UUID |
| Timestamps | `created_at`, `updated_at` | Auto-managed by SQLAlchemy |
| Indexes | `idx_{table}_{columns}` | `idx_users_email`, `idx_sessions_user_id` |

**API Naming:**
| Element | Convention | Example |
|---------|------------|---------|
| Endpoints | Singular | `/api/user`, `/api/session`, `/api/tab` |
| Nested resources | Singular with parent | `/api/user/{id}/sessions` |
| Path parameters | `{param}` (FastAPI) | `/api/user/{id}` |
| Query params | snake_case | `?user_id=1&skill_level=beginner` |
| JSON fields | snake_case | `{ "user_id": 1, "created_at": "..." }` |

**Code Naming:**
| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `SettingsPanel.tsx`, `XPBar.tsx` |
| Utilities/services | camelCase | `api.ts`, `validation.ts` |
| Backend files | snake_case | `generation.py`, `user_service.py` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_TEMPO` |
| CSS classes | kebab-case | `.xp-bar`, `.level-badge` |
| State variables | camelCase | `isLoading`, `xpTotal`, `currentUser` |
| Event handlers | `on{Event}` | `onGenerate`, `onLogin`, `onLevelUp` |
| Contexts | `{Feature}Context` | `AuthContext`, `GamificationContext` |
| Hooks | `use{Feature}` | `useAuth`, `useGamification`, `useApi` |
| Boolean states | `is{State}` / `has{Property}` | `isLoading`, `hasCompletedOnboarding` |
| Private methods | Prefix `_` | `_validate_token()`, `_hash_password()` |

### Structure Patterns

**Frontend Project Organization:**
```
frontend/src/
├── components/
│   ├── Auth/
│   │   ├── AuthContext.tsx
│   │   ├── LoginForm.tsx
│   │   └── hooks/
│   │       └── useAuth.ts
│   ├── Gamification/
│   │   ├── GamificationContext.tsx
│   │   ├── XPBar.tsx
│   │   └── hooks/
│   │       └── useXP.ts
│   └── ui/                    # Shared UI components
│       ├── Button.tsx
│       └── Card.tsx
├── hooks/                     # Shared hooks
│   ├── useApi.ts
│   └── useLocalStorage.ts
├── services/                  # API services
│   └── api.ts
├── types/                     # TypeScript types
├── utils/                     # Utility functions
├── App.tsx
└── main.tsx
```

**Backend Project Organization:**
```
backend/
├── app/
│   ├── api/          # Route handlers
│   ├── core/         # Config and database
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # Business logic
│   └── workers/      # Celery tasks
└── tests/            # Mirror app structure
    ├── conftest.py
    ├── api/
    ├── services/
    └── models/
```

**Test File Location:**
- Frontend: Co-located `*.test.ts(x)` next to source files
- Backend: `tests/` directory mirroring `app/` structure

### Format Patterns

**API Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "request_id": "uuid"
}
```

**API Error Format:**
```json
{
  "success": false,
  "error": {
    "code": "CATEGORY_DESCRIPTION",
    "message": "Human-readable message",
    "details": { ... }
  },
  "request_id": "uuid"
}
```

**Data Format Rules:**
| Element | Convention | Example |
|---------|------------|---------|
| Dates | ISO 8601 | `"2026-03-03T10:30:00Z"` |
| Booleans | `true`/`false` | `{ "is_active": true }` |
| Null values | Explicit `null` | `{ "nickname": null }` |
| Empty arrays | Send `[]` | `{ "sessions": [] }` |
| JSON fields | snake_case | `{ "user_id": 1 }` |

### Process Patterns

**Error Handling:**
| Layer | Responsibility |
|-------|----------------|
| Service layer | Catch API errors, transform to user-friendly messages |
| Component | Manage `error` state, display to user |
| Toast | General/async errors (temporary, dismissible) |
| Inline | Form validation errors (persistent, near field) |

**Loading State Pattern:**
```typescript
// Standard component state
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Service Layer Error Handling:**
```typescript
// api.ts
async function generateTab(settings: GenerateSettings): Promise<TabResult> {
  try {
    const response = await axios.post('/api/tab/generate', settings);
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.error?.message || 'Generation failed';
    throw new Error(message);
  }
}
```

**Component Error Handling:**
```typescript
const handleGenerate = async () => {
  setIsLoading(true);
  setError(null);
  try {
    await generateTab(settings);
    toast.success('Tab generated!');
  } catch (err) {
    setError(err.message);
    toast.error(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

### Enforcement Guidelines

**All AI Agents MUST:**

1. Use snake_case for all database tables, columns, and API fields
2. Use singular endpoint paths (`/api/user` not `/api/users`)
3. Use camelCase for frontend state variables and handlers
4. Use `on{Event}` naming for event handlers
5. Place shared hooks in `src/hooks/`, feature hooks co-located
6. Place contexts co-located with their feature
7. Handle errors at service layer, display at component layer
8. Use `{ isLoading, error }` pattern for async state
9. Send explicit `null` and `[]` in JSON responses
10. Use ISO 8601 format for all dates

**Pattern Verification:**
- ESLint rules enforce naming conventions
- TypeScript strict mode catches type mismatches
- PR review checklist includes pattern compliance
- Test file structure mirrors source

### Pattern Examples

**Good Examples:**

```typescript
// ✅ Correct state naming
const [isLoading, setIsLoading] = useState(false);
const [xpTotal, setXpTotal] = useState(0);

// ✅ Correct event handler
const onGenerate = async () => { ... };

// ✅ Correct API response
{ "success": true, "data": { "user_id": 1, "created_at": "2026-03-03T10:30:00Z" } }
```

**Anti-Patterns:**

```typescript
// ❌ Wrong: snake_case in frontend state
const [is_loading, set_is_loading] = useState(false);

// ❌ Wrong: handle prefix for events
const handleGenerate = async () => { ... };

// ❌ Wrong: plural endpoints
GET /api/users/{id}

// ❌ Wrong: camelCase in API
{ "userId": 1, "createdAt": "..." }
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
musictabs.ru/
├── AGENTS.md                          # Agent guidelines (existing)
├── docker-compose.yml                 # Docker orchestration
├── .gitignore
├── .env.example                       # Environment template
│
├── frontend/                          # React + TypeScript SPA
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── vite.config.ts
│   ├── eslint.config.js               # ESLint 9 flat config
│   ├── index.html
│   ├── .env.example
│   │
│   ├── src/
│   │   ├── main.tsx                   # Entry point
│   │   ├── App.tsx                    # Root component
│   │   ├── App.css
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                    # Shared UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── XPBar.tsx
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   │
│   │   │   ├── Auth/                  # User Management (FR1-7)
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   ├── OAuthCallback.tsx
│   │   │   │   ├── OnboardingFlow.tsx
│   │   │   │   ├── SkillAssessment.tsx
│   │   │   │   └── hooks/
│   │   │   │       ├── useAuth.ts
│   │   │   │       └── useOnboarding.ts
│   │   │   │
│   │   │   ├── TabGenerator/          # Tab Generation (FR8-14)
│   │   │   │   ├── TabGenerator.tsx
│   │   │   │   ├── TabDisplay.tsx
│   │   │   │   ├── TabViewer.tsx
│   │   │   │   ├── SongSearch.tsx
│   │   │   │   ├── FeedbackButtons.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── useTabGeneration.ts
│   │   │   │
│   │   │   ├── Gamification/          # Gamification (FR15-20)
│   │   │   │   ├── GamificationContext.tsx
│   │   │   │   ├── XPDisplay.tsx
│   │   │   │   ├── LevelBadge.tsx
│   │   │   │   ├── LevelUpCelebration.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── useXP.ts
│   │   │   │
│   │   │   ├── Practice/              # Practice & Learning (FR21-25)
│   │   │   │   ├── PracticeSession.tsx
│   │   │   │   ├── SessionTimer.tsx
│   │   │   │   ├── PracticeHistory.tsx
│   │   │   │   ├── PracticeStats.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── usePracticeSession.ts
│   │   │   │
│   │   │   ├── Dashboard/             # Progress Visualization (FR26-29)
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── ProgressChart.tsx
│   │   │   │   ├── SkillTimeline.tsx
│   │   │   │   └── StatsCard.tsx
│   │   │   │
│   │   │   └── Admin/                 # Admin Operations (FR30-32)
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── MetricsPanel.tsx
│   │   │       └── ErrorLogs.tsx
│   │   │
│   │   ├── hooks/                     # Shared hooks
│   │   │   ├── useApi.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   └── useToast.ts
│   │   │
│   │   ├── services/                  # API services
│   │   │   ├── api.ts                 # Base API client + response envelope
│   │   │   ├── authApi.ts
│   │   │   ├── tabApi.ts
│   │   │   ├── practiceApi.ts
│   │   │   └── gamificationApi.ts
│   │   │
│   │   ├── types/                     # TypeScript types
│   │   │   ├── index.ts
│   │   │   ├── auth.ts
│   │   │   ├── tab.ts
│   │   │   ├── gamification.ts
│   │   │   └── practice.ts
│   │   │
│   │   ├── utils/                     # Utility functions
│   │   │   ├── date.ts
│   │   │   ├── validation.ts
│   │   │   └── formatters.ts
│   │   │
│   │   └── styles/                    # Global styles
│   │       ├── variables.css          # Color palette, spacing
│   │       └── animations.css         # Celebration animations
│   │
│   └── public/
│       └── favicon.ico
│
├── backend/                           # FastAPI + SQLAlchemy
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── .env.example
│   │
│   ├── app/
│   │   ├── main.py                    # FastAPI app + lifespan
│   │   │
│   │   ├── core/                      # Config and infrastructure
│   │   │   ├── __init__.py
│   │   │   ├── config.py              # Settings via Pydantic
│   │   │   ├── database.py            # AsyncSession setup
│   │   │   ├── security.py            # JWT, password hashing
│   │   │   └── response.py            # Response envelope middleware
│   │   │
│   │   ├── api/                       # Route handlers
│   │   │   ├── __init__.py
│   │   │   ├── router.py              # APIRouter aggregation
│   │   │   ├── auth.py                # FR1-7: Login, register, OAuth
│   │   │   ├── user.py                # FR4-7: Profile, skill level
│   │   │   ├── generation.py          # FR8-14: Tab generation
│   │   │   ├── practice.py            # FR21-25: Sessions, history
│   │   │   ├── gamification.py        # FR15-20: XP, levels
│   │   │   ├── progress.py            # FR26-29: Dashboard data
│   │   │   └── admin.py               # FR30-32: Admin endpoints
│   │   │
│   │   ├── models/                    # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── user.py                # users table
│   │   │   ├── generation_job.py      # generation_jobs table
│   │   │   ├── practice_session.py    # practice_sessions table
│   │   │   ├── user_progress.py       # user_progress table
│   │   │   └── tab_feedback.py        # tab_feedback table
│   │   │
│   │   ├── schemas/                   # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── generation.py
│   │   │   ├── practice.py
│   │   │   ├── gamification.py
│   │   │   └── common.py              # Response envelope schemas
│   │   │
│   │   ├── services/                  # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── generation_service.py
│   │   │   ├── midi_service.py
│   │   │   ├── practice_service.py
│   │   │   ├── xp_service.py
│   │   │   └── stats_service.py
│   │   │
│   │   └── workers/                   # Celery tasks
│   │       ├── __init__.py
│   │       ├── celery_app.py
│   │       └── generation_tasks.py
│   │
│   └── tests/                         # Test suite (mirrors app/)
│       ├── conftest.py                # Fixtures, test DB setup
│       ├── __init__.py
│       ├── api/
│       │   ├── test_auth.py
│       │   ├── test_generation.py
│       │   └── test_practice.py
│       ├── services/
│       │   ├── test_auth_service.py
│       │   └── test_xp_service.py
│       └── models/
│           └── test_models.py
│
├── docs/                              # Documentation
│   └── (project documentation)
│
└── _bmad/                             # BMAD framework
    └── (workflow configuration)
```

### Architectural Boundaries

**API Boundaries:**

| Boundary | Location | Description |
|----------|----------|-------------|
| Public API | `backend/app/api/*.py` | REST endpoints at `/api/*` |
| Auth Middleware | `backend/app/core/security.py` | JWT validation, token refresh |
| Response Envelope | `backend/app/core/response.py` | Wraps all responses in `{ success, data, error, request_id }` |

**Component Boundaries:**

| Boundary | Location | Description |
|----------|----------|-------------|
| Auth State | `frontend/src/components/Auth/AuthContext.tsx` | User session, tokens |
| Gamification State | `frontend/src/components/Gamification/GamificationContext.tsx` | XP, level, streaks |
| API Layer | `frontend/src/services/*.ts` | All backend communication |

**Service Boundaries:**

| Boundary | Location | Description |
|----------|----------|-------------|
| User Service | `backend/app/services/user_service.py` | User CRUD, skill management |
| Generation Service | `backend/app/services/generation_service.py` | Tab generation orchestration |
| XP Service | `backend/app/services/xp_service.py` | Gamification calculations |
| MIDI Service | `backend/app/services/midi_service.py` | MIDI file generation |

**Data Boundaries:**

| Boundary | Location | Description |
|----------|----------|-------------|
| Users | `backend/app/models/user.py` | User accounts, credentials |
| Generation Jobs | `backend/app/models/generation_job.py` | Async tab generation status |
| Practice Sessions | `backend/app/models/practice_session.py` | Session tracking, duration |
| User Progress | `backend/app/models/user_progress.py` | XP, level, skill metrics |

### Requirements to Structure Mapping

**User Management (FR1-7):**

| Requirement | Frontend | Backend |
|-------------|----------|---------|
| FR1: Create account | `components/Auth/RegisterForm.tsx` | `api/auth.py` → `services/auth_service.py` |
| FR2-3: Login/Logout | `components/Auth/LoginForm.tsx`, `AuthContext.tsx` | `api/auth.py` |
| FR4: Profile | `components/Auth/ProfileSettings.tsx` | `api/user.py` |
| FR5-6: Onboarding | `components/Auth/OnboardingFlow.tsx`, `SkillAssessment.tsx` | `api/user.py` |
| FR7: Skill level | `components/Auth/SkillAssessment.tsx` | `services/user_service.py` |

**Tab Generation (FR8-14):**

| Requirement | Frontend | Backend |
|-------------|----------|---------|
| FR8-9: Generate/view tabs | `components/TabGenerator/TabGenerator.tsx`, `TabDisplay.tsx` | `api/generation.py`, `workers/generation_tasks.py` |
| FR10-11: Adaptive difficulty | `hooks/useTabGeneration.ts` | `services/generation_service.py` |
| FR12: Simplified versions | `components/TabGenerator/TabDisplay.tsx` | `api/generation.py` |
| FR13: Feedback | `components/TabGenerator/FeedbackButtons.tsx` | `api/generation.py` |
| FR14: Song search | `components/TabGenerator/SongSearch.tsx` | `api/generation.py` |

**Gamification (FR15-20):**

| Requirement | Frontend | Backend |
|-------------|----------|---------|
| FR15-16: XP | `components/Gamification/XPDisplay.tsx`, `GamificationContext.tsx` | `api/gamification.py`, `services/xp_service.py` |
| FR17-19: Levels | `components/Gamification/LevelBadge.tsx`, `LevelUpCelebration.tsx` | `services/xp_service.py` |
| FR20: Progress bar | `components/Gamification/ProgressBar.tsx` | `api/gamification.py` |

**Practice & Learning (FR21-25):**

| Requirement | Frontend | Backend |
|-------------|----------|---------|
| FR21-23: Sessions | `components/Practice/PracticeSession.tsx`, `SessionTimer.tsx` | `api/practice.py` |
| FR24-25: History/stats | `components/Practice/PracticeHistory.tsx`, `PracticeStats.tsx` | `api/practice.py` |

**Progress Visualization (FR26-29):**

| Requirement | Frontend | Backend |
|-------------|----------|---------|
| FR26-29: Dashboard | `components/Dashboard/` | `api/progress.py`, `services/stats_service.py` |

**Admin Operations (FR30-32):**

| Requirement | Frontend | Backend |
|-------------|----------|---------|
| FR30-32: Admin | `components/Admin/` | `api/admin.py`, `services/admin_service.py` |

### Integration Points

**Internal Communication:**

```
Frontend                          Backend
├── services/api.ts ──────────→  API Routes (api/*.py)
│   (Axios + response envelope)      │
│                                    ├── services/*.py (business logic)
│                                    │       │
│                                    │       └── models/*.py (SQLAlchemy)
│                                    │
│                                    └── workers/*.py (Celery)
│                                            │
└── hooks/useApi.ts ←────────────────────────┘
    (polling for job status)
```

**External Integrations:**

| Integration | Location | Purpose |
|-------------|----------|---------|
| Google OAuth | `backend/app/services/auth_service.py` | Social login |
| GitHub OAuth | `backend/app/services/auth_service.py` | Social login |
| AI Tab Generation | `backend/app/services/generation_service.py` | Tab content generation |
| Redis | `backend/app/core/database.py` | Refresh tokens, Celery broker |
| PostgreSQL | `backend/app/core/database.py` | Primary database |

**Data Flow:**

```
User Action → Component → Service (api.ts) → Backend API
                                                    │
                      ←── Response Envelope ────────┘
                              │
                              ├── Success: Update state, cache to localStorage
                              └── Error: Show toast, set error state
```

### File Organization Patterns

**Configuration Files:**

| File | Location | Purpose |
|------|----------|---------|
| `docker-compose.yml` | Root | Container orchestration |
| `.env.example` | Root, frontend/, backend/ | Environment template |
| `package.json` | frontend/ | npm dependencies |
| `requirements.txt` | backend/ | Python dependencies |
| `tsconfig.json` | frontend/ | TypeScript config |
| `vite.config.ts` | frontend/ | Build config |
| `eslint.config.js` | frontend/ | Linting (flat config) |

**Source Organization:**

| Layer | Frontend | Backend |
|-------|----------|---------|
| Entry | `main.tsx` | `main.py` |
| Routes/Pages | `App.tsx`, components | `api/*.py` |
| Business Logic | `services/*.ts` | `services/*.py` |
| Data Models | `types/*.ts` | `models/*.py`, `schemas/*.py` |
| Shared Utilities | `utils/*.ts` | `core/*.py` |

**Test Organization:**

| Type | Frontend | Backend |
|------|----------|---------|
| Unit | Co-located `*.test.ts(x)` | `tests/api/`, `tests/services/` |
| Integration | - | `tests/` with `AsyncClient` |
| Fixtures | - | `tests/conftest.py` |
| Test DB | - | `musictabs_test` (separate database) |

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are compatible and represent a modern, production-ready stack:
- React 19 + Vite 7 + TypeScript 5.9: Current, well-integrated frontend stack
- FastAPI + SQLAlchemy 2.0 (async) + Pydantic v2: Modern async Python backend
- Celery + Redis + PostgreSQL: Standard task queue and persistence layer
- JWT + bcrypt + Redis: Industry-standard authentication pattern

**Pattern Consistency:**
Implementation patterns are consistent across all layers:
- snake_case used consistently in API and database (no transformation layer)
- camelCase used consistently in frontend state and handlers
- Response envelope applied to all API responses
- Error codes follow `CATEGORY_DESCRIPTION` convention throughout

**Structure Alignment:**
Project structure fully supports all architectural decisions:
- Feature-based component organization supports React state + Context
- Layered backend structure supports async SQLAlchemy patterns
- Test structure mirrors source for easy navigation
- Docker Compose orchestrates all services correctly

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
| Category | Requirements | Coverage |
|----------|--------------|----------|
| User Management | FR1-7 | 100% - Auth, onboarding, profile, skill assessment |
| Tab Generation | FR8-14 | 100% - Generate, view, adapt, feedback, search |
| Gamification | FR15-20 | 100% - XP, levels, celebrations, progress |
| Practice & Learning | FR21-25 | 100% - Sessions, timer, history, stats |
| Progress Visualization | FR26-29 | 100% - Dashboard, charts, timeline, comparisons |
| Admin Operations | FR30-32 | 100% - Metrics, logs, admin interface |

**Non-Functional Requirements Coverage:**
| Category | NFRs | Architectural Support |
|----------|------|----------------------|
| Performance | NFR1-4 | ✅ Vite (fast builds), Celery (async jobs), async SQLAlchemy |
| Security | NFR5-8 | ✅ bcrypt, JWT, HTTPS, 30-day token expiry |
| Scalability | NFR9-11 | ✅ Stateless auth, Redis caching, horizontal scaling ready |
| Reliability | NFR12-14 | ✅ Error codes, immediate persistence, 99% uptime design |
| Integration | NFR15-16 | ✅ Celery retry logic, structured error logging |

### Implementation Readiness Validation ✅

**Decision Completeness:**
- ✅ All technologies specified with versions
- ✅ Authentication stack fully documented
- ✅ Testing frameworks with dependencies listed
- ✅ UI design style with color palette defined
- ✅ State management approach clarified

**Structure Completeness:**
- ✅ Complete directory tree with all files
- ✅ Component boundaries clearly mapped
- ✅ API endpoints mapped to files
- ✅ Database models mapped to tables
- ✅ Requirements-to-structure mapping complete

**Pattern Completeness:**
- ✅ Naming conventions for all contexts (DB, API, code)
- ✅ Error handling pattern with examples
- ✅ Loading state pattern with examples
- ✅ Response envelope format specified
- ✅ 10 mandatory rules for AI agents

### Gap Analysis Results

**Critical Gaps:** None

**Important Gaps (Addressed):**
| Gap | Recommendation |
|-----|----------------|
| Toast notification library | Use `react-hot-toast` or `sonner` for notifications |
| Date formatting | Use native `Intl.DateTimeFormat` or `date-fns` |

**Deferred Items (Post-MVP):**
| Item | Reason |
|------|--------|
| CI/CD pipeline | Infrastructure decision, not MVP-blocking |
| Monitoring/observability | Operational concern, add after launch |
| WebSocket support | Phase 2 feature for real-time gamification |

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Low-Medium)
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented with examples

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
- Modern, well-integrated technology stack
- Comprehensive pattern documentation prevents AI agent conflicts
- All 32 functional requirements architecturally supported
- Clear implementation sequence defined
- Consistent naming conventions throughout

**Areas for Future Enhancement:**
- Add WebSocket support for real-time gamification (Phase 2)
- Implement monitoring/observability stack post-launch
- Consider Zustand if state management complexity grows

### Implementation Handoff

**AI Agent Guidelines:**
1. Follow all architectural decisions exactly as documented
2. Use implementation patterns consistently across all components
3. Respect project structure and boundaries
4. Refer to this document for all architectural questions
5. Apply the 10 mandatory rules from Enforcement Guidelines

**First Implementation Priority:**
1. Initialize project structure (create directories)
2. Implement authentication system (blocks all user features)
3. Configure testing infrastructure (quality foundation)
4. Build API standardization layer (agent consistency)
