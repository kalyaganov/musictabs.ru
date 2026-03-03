---
project_name: 'musictabs.ru'
user_name: 'Alexey'
date: '2026-03-03'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'code_quality', 'workflow_rules', 'critical_rules']
status: 'complete'
rule_count: 35
optimized_for_llm: true
existing_patterns_found: 12
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Frontend
- React 19.2.0, TypeScript 5.9.3 (strict mode), Vite 7.3.1
- Axios 1.13.5 (HTTP), Tone.js 15.1.22 (Web Audio)
- ESLint 9.39.1 (flat config), no Prettier configured

### Backend
- FastAPI 0.109.0, SQLAlchemy 2.0.25 (async with asyncpg)
- Pydantic 2.5.3 (v2 syntax required), Celery 5.3.6 + Redis 5.0.1
- PostgreSQL 15-alpine, mido 1.2.6, pretty_midi 0.2.10

### Infrastructure
- Docker Compose: 5 services (db, redis, backend, celery-worker, frontend)
- Node 20+ required (ES2022 target)

---

## Critical Implementation Rules

### Language-Specific Rules

#### TypeScript (Frontend)
- Use `import type` for type-only imports (enforced by `verbatimModuleSyntax`)
- No `any` types - use `unknown` with type guards when type is uncertain
- Prefer `interface` for object types, `type` for unions/primitives
- Use `const` assertions for literal arrays used as constants

#### Python (Backend)
- All API route handlers must use `async def`
- Use `AsyncSession` from `sqlalchemy.ext.asyncio` for database operations
- Pydantic v2: Use `class Config:` with `json_schema_extra` (not `schema_extra`)
- Private methods prefix with underscore: `_private_method()`
- Module-level logger: `logger = logging.getLogger(__name__)`

### Framework-Specific Rules

#### React (Frontend)
- Use function components only - no class components
- Destructure props in function signature: `function Component({ prop1, prop2 }: Props)`
- Wrap async callbacks in `useCallback` to prevent unnecessary re-renders
- Polling pattern: Use `setInterval` in `useEffect` with cleanup function
- State lives in App.tsx, passed down via props (no global state manager)

#### FastAPI (Backend)
- Use `@asynccontextmanager` lifespan for startup/shutdown (not `on_event`)
- Routes: `@router.get()`, `@router.post()` on `APIRouter()` instances
- Dependency injection: `db: AsyncSession = Depends(get_db)`
- Error handling: Raise `HTTPException(status_code=..., detail="...")`
- Include routers: `app.include_router(api_router, prefix="/api")`

#### Testing
- No test framework configured yet
- Frontend: Use Vitest (Vite-native) - install with `npm install -D vitest @testing-library/react`
- Backend: Use pytest + pytest-asyncio - add to requirements.txt
- Test locations: `frontend/src/**/*.test.ts(x)`, `backend/tests/**/*.py`
- Test async routes with `AsyncClient` from `httpx`

### Code Quality & Style Rules

#### Linting
- Frontend: ESLint 9 flat config - run `npm run lint` before committing
- Backend: Ruff - run `ruff check .` and `ruff format .` before committing
- TypeScript: Run `npx tsc -b` to type-check before building

#### Import Organization
- Frontend: external → internal → types → CSS (CSS imports last)
- Backend: stdlib → third-party → local (alphabetize within groups)

#### Naming Conventions
- Components: PascalCase (`SettingsPanel.tsx`)
- Utilities/services: camelCase (`api.ts`, `midi_service.py`)
- Backend files: snake_case (`generation.py`)
- Constants: UPPER_SNAKE_CASE for true constants
- CSS classes: kebab-case in CSS files

#### Documentation
- Python: Triple-quoted docstrings for modules, classes, public functions
- Include Args/Returns in docstrings for complex functions

### Development Workflow Rules

#### Build & Run Commands
- Frontend dev: `cd frontend && npm run dev`
- Backend dev: `cd backend && uvicorn app.main:app --reload`
- Celery worker: `cd backend && celery -A app.workers.generation_tasks worker --loglevel=info`
- Full stack: `docker-compose up -d` (starts all 5 services)

#### Environment Variables
- Frontend: `VITE_API_URL` (default: `http://localhost:8000/api`)
- Backend: `DATABASE_URL`, `REDIS_URL`, `CELERY_BROKER_URL`, `DEBUG`, `CORS_ORIGINS`
- Use `.env` files for local configuration (Python: `python-dotenv`)

#### Before Committing
1. Run `npm run lint` in frontend/
2. Run `npx tsc -b` in frontend/
3. Run `ruff check .` and `ruff format .` in backend/

#### Ports
- Frontend: 5173, Backend: 8000, PostgreSQL: 5432, Redis: 6379

### Critical Don't-Miss Rules

#### Anti-Patterns (Never Do)
- Never use `any` type in TypeScript - use `unknown` with type guards
- Never use `@app.on_event("startup")` - use `lifespan` context manager
- Never forget `useEffect` cleanup for intervals/listeners
- Never use sync DB calls in async routes - always use `AsyncSession`

#### Edge Cases
- Celery workers are separate processes - no shared in-memory state
- Job polling: 1 second interval in frontend - consider backoff for scale
- MIDI generation is CPU-intensive - always use background job pattern

#### Security
- CORS: Currently limited to localhost - never use `["*"]` in production
- No auth implemented - add authentication before public deployment
- Secrets: docker-compose has plaintext credentials - use env vars/secrets

#### Performance Limits
- `MAX_CONCURRENT_JOBS=3` - tune based on server capacity
- Redis: One connection per request - consider connection pooling for scale

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

**Last Updated:** 2026-03-03
