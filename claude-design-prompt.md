# Prompt for Claude Design

You are improving the visual design of an existing Next.js App Router PWA for interior visualization projects.

## What you will receive

The archive contains the relevant project files only: `src/app`, `src/components`, core `src/lib` contracts, `prisma/schema.prisma`, PWA assets, tests, and project docs. It intentionally excludes `node_modules`, `.next`, SQLite DB files, local storage, generated Prisma client, and heavy user source documents.

## Goal

Make the app feel like a polished, professional interior-visualization production tool, not a generic starter dashboard.

Keep the current product scope and behavior:

- Projects list at `/projects`
- Project detail at `/projects/[projectId]`
- Upload block for DOCX/PDF/images/DWG
- Files list with statuses and manual-description fallback
- Extracted text panel
- Draft brief panel
- Prompt editor
- Generate/status panel
- Results gallery
- PWA manifest/service worker/offline banner

## Design Direction

Use a quiet, refined, design-studio/workroom feel:

- Calm operational UI, dense enough for repeated work
- High-end interior/material sensibility without decorative clutter
- Strong hierarchy, clear scanning, restrained borders and shadows
- Warm neutral base with a confident non-purple accent
- No oversized marketing hero, no generic SaaS card grid, no decorative gradient blobs
- Cards only where they contain real interactive units or repeated items
- Mobile project detail should remain a vertical workflow: Upload -> Files -> Brief -> Prompt -> Generate -> Results

## Constraints

- Preserve all current backend/API/data behavior.
- Do not expose provider secrets or change image-provider security boundaries.
- Do not cache uploaded/generated private data in the service worker.
- Do not add authentication, roles, billing, public sharing, or extra product scope.
- Do not remove tests. Update tests only if design changes require selector/copy adjustments.
- Prefer editing `src/app/globals.css`, `src/app/layout.tsx`, `src/app/projects/**/*.tsx`, and `src/components/**/*.tsx`.
- Avoid large new dependencies unless clearly justified.
- Keep TypeScript strict and Next.js build clean.

## Expected Output

Return a ZIP archive containing only changed files, preserving repository-relative paths.

Also include a short `DESIGN_CHANGELOG.md` in the returned archive with:

- What visual direction you applied
- Files changed
- Any tests you ran
- Any known limitations or follow-up suggestions

## Verification Before Returning

Run:

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

If any command cannot be run, state exactly why in `DESIGN_CHANGELOG.md`.

## Important

This archive is meant to be applied over the existing project. Do not return a full repo with `node_modules`, `.next`, local DB files, generated Prisma client, or runtime storage.
