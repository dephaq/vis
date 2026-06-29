# Architecture

## Stack
The MVP is a local-first Next.js App Router application with TypeScript, Tailwind CSS, Prisma, and SQLite. Files are stored on local disk through `src/lib/storage/localStorage.ts`; only metadata and relationships are stored in SQLite.

## Data Flow
1. `/projects` creates a `Project`.
2. `/projects/[projectId]` uploads files through `POST /api/projects/[projectId]/uploads`.
3. `uploadService` stores the original bytes, records metadata, runs the extractor, and records `ExtractedText`.
4. `promptService` builds a draft from actual extracted text plus manual descriptions.
5. The user saves manual prompt versions.
6. `generationService` creates a `GenerationJob`, calls the configured provider, stores results, and records sanitized metadata.

## Boundaries
- Extraction is deliberately shallow. Poor PDF/DWG results become `needs_manual_description`.
- `mock` image generation is default. `nano_banana` is opt-in through server-side environment variables.
- Service worker caching is limited to the app shell and icons.
