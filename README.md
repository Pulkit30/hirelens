# HireLens

Upload a resume and a job description, get an ATS score (0–100) with a component breakdown,
matched/missing keywords, formatting warnings, and improvement suggestions.

**Stack:** React (Vite + TS) · FastAPI · LangChain · MongoDB (Beanie) · local embedding/rerank models

## Status

| Phase | Scope | Status |
|---|---|---|
| 1 | Foundation: FastAPI skeleton, config, logging, MongoDB models, health checks | Done |
| 2 | Parsing: resume/JD parsing, sections, ATS format checks | Done |
| 3 | Extraction: LLM structured extraction, skill normalization | — |
| 4 | Scoring engine | — |
| 5 | Report, suggestions, `/scans` API with SSE | — |
| 6 | Frontend | — |
| 7 | Evaluation | — |
| 8 | Auth, polish, deploy | — |

## Run the backend locally

Requires Python 3.13 and [uv](https://docs.astral.sh/uv/), plus MongoDB on `localhost:27017`.

```bash
cd backend
cp .env.example .env        # first time only
uv sync
uv run uvicorn app.main:app --reload
```

- API docs: http://localhost:8000/docs
- Liveness: `GET /api/health`
- Readiness (checks MongoDB): `GET /api/health/ready`
- Parse a resume: `POST /api/parse/resume` (multipart `file`: PDF, DOCX or TXT)
- Parse a job description: `POST /api/parse/job-description` (form `text` **or** multipart `file`)

Try them from the interactive docs at `/docs` with your own resume.

## How resume parsing works

1. **File type is detected from content**, not the extension (PDF, DOCX, TXT; legacy `.doc` is rejected).
2. **PDF:** PyMuPDF extracts every line with its position and font. A gutter search finds
   two-column layouts and reads them column by column. Fragments on one row (a job title and
   its right-aligned date) are joined.
   **DOCX:** python-docx reads paragraphs and tables in order, plus text boxes and
   headers/footers from the raw XML.
3. **Sections:** heading lines are matched against ~90 resume and ~55 job-description aliases
   ("Work History" → experience, "What you'll do" → responsibilities).
   Text before the first heading becomes the `header` section (name, contact).
4. **Contact details:** email, phone, LinkedIn and GitHub, including hyperlink targets.
5. **ATS format check:** rule-based issues (scanned PDF, columns, tables, text boxes, contact
   in the page header, missing sections, non-standard headings, length). Score = 100 minus
   penalties (critical 40, warning 8, info 3).

> PyMuPDF is AGPL-3.0 licensed. That's fine for an open-source/portfolio project; a closed-source
> commercial deployment would need a commercial license or a switch to pypdf/pdfplumber.

## Run with Docker

```bash
docker compose up --build
```

This starts `mongodb/mongodb-atlas-local` (Atlas engine, with Vector Search for later phases)
and the API on port 8000. Stop any local `mongod` first; both use port 27017.

## Tests and lint

```bash
cd backend
uv run pytest
uv run ruff check app tests && uv run ruff format --check app tests
```

## Backend layout

```
backend/app/
├── api/           # routers + dependencies (HTTP only)
├── core/          # config, db, logging, errors, middleware
├── models/        # Beanie documents: Scan, User, SkillSynonym
├── schemas/       # request/response models
├── repositories/  # MongoDB access (Phase 2+)
├── services/      # file storage, upload reading; scan orchestration later
└── pipeline/      # pure functions: parse → sections → contact → format check
                   # (extraction, embeddings and scoring are added next)
```
