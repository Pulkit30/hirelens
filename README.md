# HireLens

Upload a resume and a job description, get an ATS score (0–100) with a component breakdown,
matched/missing keywords, formatting warnings, and improvement suggestions.

**Stack:** React (Vite + TS) · FastAPI · Claude (Anthropic SDK) · LangChain · MongoDB (Beanie) · local embedding/rerank models

## Status

| Phase | Scope | Status |
|---|---|---|
| 1 | Foundation: FastAPI skeleton, config, logging, MongoDB models, health checks | Done |
| 2 | Parsing: resume/JD parsing, sections, ATS format checks | Done |
| 3 | Extraction: LLM structured extraction, skill normalization | Done |
| 4 | Scoring engine | Done |
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
- Extract a resume profile (LLM): `POST /api/extract/resume`
- Extract job requirements (LLM): `POST /api/extract/job-description`
- **Score a resume against a JD:** `POST /api/score` (multipart `resume` + `jd_text` or `jd_file`)

The extract endpoints need an Anthropic API key: set `ANTHROPIC_API_KEY` in `backend/.env`.

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

## How extraction works

1. **Redact:** email, phone, links and the candidate's name are removed before anything is
   sent to the LLM. Extraction never needs them.
2. **Extract:** Claude (official Anthropic SDK, structured outputs validated against Pydantic
   schemas) returns roles with dates, skills, education and certifications for a resume, and
   must-have / nice-to-have skills, minimum years, seniority and education for a JD. The
   document is passed as tagged, untrusted data. Refusals, truncation, auth and rate-limit
   errors map to clean API errors. Model and effort are set in `.env`
   (`LLM_MODEL`, default `claude-opus-5-5`; `LLM_EFFORT`, default `low`).
3. **Compute in code, not by the LLM:** experience years from role dates (overlaps counted
   once, internships separate), highest education level.
4. **Normalize skills:** 139 canonical skills with ~280 aliases ("ReactJS", "react.js" →
   React; "k8s" → Kubernetes), seeded into MongoDB (`skill_synonyms`) on first start so the
   table can be edited. Unknown skills are kept as written and listed separately.
   JD alternatives ("FastAPI or Django") become one requirement that either skill satisfies.

## How the ATS score works

| Component | Weight | How |
|---|---|---|
| Keywords | 35% | Must-have (85%) and nice-to-have (15%) skill coverage. "X or Y" requirements are met by either. A skill the LLM missed still counts if it is written in the resume text. |
| Semantic | 25% | Each JD responsibility is matched to the closest resume lines with local embeddings (`bge-base-en-v1.5`), then reranked by a cross-encoder (`jina-reranker-v1-tiny`). The best line is kept as evidence. |
| Experience | 15% | Years from role dates (internships count half) vs the JD minimum. |
| Title | 10% | Embedding similarity of job titles with seniority words removed. |
| Education | 5% | Degree level vs requirement; a mismatched field costs 25%. |
| Format | 10% | The ATS format score from parsing. |

Components that don't apply (e.g. the JD states no minimum years) are dropped and their weight
is redistributed. Bands: **strong** ≥ 75, **good** ≥ 50, otherwise **weak**. All weights and
calibration ranges live in `app/pipeline/scoring/config.py`, measured on real model outputs,
and every score records its `scoring_version`.

The scoring models run locally on CPU (ONNX via fastembed, ~340 MB). They download into
`backend/.models` on first start, or ahead of time with:

```bash
uv run python -m app.pipeline.scoring.download
```

Embeddings implement LangChain's `Embeddings` interface, so any LangChain provider can replace
the local model.

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
└── pipeline/      # parse → sections → contact → format check
    ├── extraction/  # redact → LLM extraction → skill normalization → experience maths
    └── scoring/     # keyword, semantic (embeddings + reranker), experience, title,
                     # education, format → weighted ATS score
```
