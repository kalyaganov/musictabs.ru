# MusicTabs - Agent Guidelines

This document provides coding guidelines and build commands for agentic coding agents working on the MusicTabs codebase.

## Project Overview

MusicTabs is a guitar tab generation service with:
- **Frontend**: React 19 + TypeScript + Vite (in `frontend/`)
- **Backend**: FastAPI + SQLAlchemy + Celery + Redis (in `backend/`)
- **Infrastructure**: Docker Compose for local development

---

## Build/Lint/Test Commands

### Frontend (from `frontend/` directory)

```bash
# Development server
npm run dev

# Build (runs TypeScript check then Vite build)
npm run build

# Lint
npm run lint

# Type check only
npx tsc -b
```

### Backend (from `backend/` directory)

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload

# Run Celery worker
celery -A app.workers.generation_tasks worker --loglevel=info

# Lint with ruff
ruff check .

# Format with ruff
ruff format .
```

### Docker (from root directory)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up -d --build

# Stop all services
docker-compose down
```

### Testing

No test framework is currently configured. When adding tests:
- Frontend: Consider Vitest (Vite-native)
- Backend: Consider pytest with pytest-asyncio

---

## Code Style Guidelines

### Frontend (TypeScript/React)

#### Imports
```typescript
// Group imports: external → internal → types → styles
import { useState, useEffect } from 'react';
import type { GenerateSettings, TabResult } from './types';
import { generationApi } from './services/api';
import SettingsPanel from './components/SettingsPanel';
import './App.css';
```

- Use `import type` for type-only imports
- React hooks and utilities first, then third-party, then local modules
- CSS imports last

#### TypeScript
- Strict mode is enabled - all code must be type-safe
- Prefer `interface` for object types, `type` for unions/primitives
- Use `const` assertions for literal arrays used as constants
- Avoid `any` - use `unknown` with type guards when needed

```typescript
// Prefer
type Style = 'rock' | 'blues' | 'jazz';
interface GenerateSettings {
  tempo: number;
  style: Style;
}

// Avoid
const settings: any = {};
```

#### React Components
- Use function components (not class components)
- Destructure props in function signature
- Use descriptive component names in PascalCase

```typescript
interface SettingsPanelProps {
  settings: GenerateSettings;
  onChange: (settings: GenerateSettings) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

function SettingsPanel({ settings, onChange, onGenerate, isGenerating }: SettingsPanelProps) {
  // Component body
}
```

#### Naming Conventions
- Components: PascalCase (`SettingsPanel.tsx`)
- Utilities/services: camelCase (`api.ts`, `audio.ts`)
- Types: PascalCase for interfaces/types, camelCase for properties
- Constants: UPPER_SNAKE_CASE for true constants, camelCase otherwise
- CSS classes: kebab-case in CSS, camelCase/kebab-case in JSX

#### Error Handling
- Use try/catch with async operations
- Display user-friendly error messages
- Log errors to console in development

```typescript
try {
  const response = await generationApi.generate(settings);
  setCurrentJobId(response.job_id);
} catch (err) {
  console.error('Generation error:', err);
  setError('Failed to start generation. Please check if the backend is running.');
}
```

---

### Backend (Python/FastAPI)

#### Imports
```python
# Standard library
from typing import List, Optional
from datetime import datetime

# Third-party
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

# Local imports
from app.core.database import get_db
from app.core.config import settings
from app.models.generation_job import GenerationJob
```

- Group: standard library → third-party → local
- Alphabetize within groups

#### Naming Conventions
- Files: snake_case (`generation.py`, `midi_service.py`)
- Classes: PascalCase (`GenerationJob`, `MIDIService`)
- Functions/methods: snake_case (`get_job_status`, `create_midi`)
- Constants: UPPER_SNAKE_CASE
- Private methods: prefix with underscore (`_check_midi_lib`)

#### Pydantic Models
- Place request/response schemas in `app/schemas/`
- Use `Optional[T]` for nullable fields with `= None`
- Include example in `Config.json_schema_extra`

```python
class GenerateRequest(BaseModel):
    tempo: int = 120
    style: StyleEnum = StyleEnum.ROCK
    bars: int = 8

    class Config:
        json_schema_extra = {
            "example": {"tempo": 120, "style": "rock", "bars": 8}
        }
```

#### SQLAlchemy Models
- Place in `app/models/`
- Use `Column` with explicit types
- Include `__tablename__` class attribute

#### Async Patterns
- Use `async def` for all route handlers
- Use `AsyncSession` for database operations
- Use `async with` for context managers

```python
@router.get("/status/{job_id}")
async def get_job_status(job_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GenerationJob).where(...))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
```

#### Error Handling
- Raise `HTTPException` for API errors
- Use appropriate HTTP status codes
- Include descriptive error messages
- Log errors with module logger

```python
import logging
logger = logging.getLogger(__name__)

@router.get("/items/{item_id}")
async def get_item(item_id: str):
    item = await find_item(item_id)
    if not item:
        logger.warning(f"Item not found: {item_id}")
        raise HTTPException(status_code=404, detail="Item not found")
```

#### Docstrings
- Use triple-quoted docstrings for modules, classes, and public functions
- Include brief description and parameter documentation

```python
def create_midi(self, notes: List[GeneratedNote], tempo: int = 120) -> bytes:
    """
    Create a MIDI file from generated notes.

    Args:
        notes: List of GeneratedNote objects
        tempo: BPM tempo

    Returns:
        MIDI file as bytes
    """
```

---

## Project Structure

```
musictabs.ru/
├── docker-compose.yml      # Docker services configuration
├── AGENTS.md               # This file
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API and audio services
│   │   ├── types/          # TypeScript type definitions
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── backend/
    ├── app/
    │   ├── api/            # FastAPI route handlers
    │   ├── core/           # Config and database
    │   ├── models/         # SQLAlchemy models
    │   ├── schemas/        # Pydantic schemas
    │   ├── services/       # Business logic
    │   ├── workers/        # Celery tasks
    │   └── main.py         # FastAPI application
    ├── tests/              # Test files (empty)
    └── requirements.txt
```

---

## Environment Variables

### Frontend
- `VITE_API_URL`: Backend API URL (default: `http://localhost:8000/api`)

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `CELERY_BROKER_URL`: Celery broker URL
- `DEBUG`: Enable debug mode (default: `True`)
- `CORS_ORIGINS`: JSON array of allowed origins

---

## Key Dependencies

### Frontend
- React 19, React DOM
- TypeScript 5.9
- Vite 7
- ESLint 9 (flat config)
- Axios (HTTP client)
- Tone.js (Web Audio synthesis)

### Backend
- FastAPI
- SQLAlchemy (async)
- Celery + Redis
- Pydantic v2
- mido, pretty_midi (MIDI handling)
