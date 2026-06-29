# Interior Visualization PWA

## Identity
Next.js App Router + TypeScript MVP for local interior visualization projects: upload files, extract source text, build/edit prompts, and run backend-only image generation.

## Critical Rules
- Never expose `GEMINI_API_KEY` or provider request secrets to client components, logs, persisted metadata, or result JSON.
- Uploaded documents and generated outputs are private project data; do not add service-worker caching for `/uploads`, `/results`, or result file routes.
- DWG parsing is out of scope for MVP. Store DWG as an attachment and ask for manual description.
- Prompt generation must only use extracted text, filenames, file kinds, and manual descriptions. Do not infer drawing content that was not parsed.
- New behavior needs tests that fail before implementation and pass after.

## Architecture Map
- `docs/architecture.md` - modules, data flow, and boundaries.
- `docs/conventions.md` - code style and implementation conventions.
- `docs/tools.md` - local commands and test harness.
- `docs/quality.md` - quality gates and known MVP limits.
- `docs/visualization-pwa-mvp-plan.md` - source implementation plan.

## Main Paths
- `src/app/` - App Router pages, server actions, and API routes.
- `src/components/` - project workspace UI components.
- `src/lib/` - database, storage, extraction, prompt, upload, and generation services.
- `prisma/schema.prisma` - SQLite data model.
- `tests/` - unit, integration, and Playwright smoke/PWA tests.
