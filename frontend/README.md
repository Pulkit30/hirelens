# HireLens frontend

React 19 + TypeScript + Vite, Tailwind CSS v4, TanStack Query, React Router.

```bash
npm install
npm run dev        # http://localhost:5173 (proxies /api to the backend on :8000)
npm test           # Vitest + Testing Library
npm run lint       # oxlint
npm run build      # type-check + production build into dist/
npm run gen:api    # regenerate src/api/schema.d.ts from the backend's OpenAPI schema
```

Set `BACKEND_URL` in `.env` if the backend isn't on `localhost:8000` (see `.env.example`).
