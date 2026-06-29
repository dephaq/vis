# Interior Visualization PWA

Local MVP for interior visualization projects. The app lets a user create a project, upload DOCX/PDF/image/DWG source files, extract simple text/metadata, build and edit a prompt, run mock-safe image generation, and view result history.

## Getting Started

Install dependencies and prepare the local SQLite database:

```bash
npm install
npx prisma generate
npx prisma db push
```

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000/projects`.

## Checks

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

## Provider Configuration

The app defaults to `IMAGE_GENERATION_PROVIDER=mock`. To opt into the real backend adapter, configure server-side environment variables only:

```bash
IMAGE_GENERATION_PROVIDER=nano_banana
GEMINI_API_KEY=...
NANO_BANANA_MODEL=gemini-3-pro-image-preview
```

Never expose provider keys to client code.

## Scope

See `docs/visualization-pwa-mvp-plan.md` for the full MVP plan and `AGENTS.md` for coding-agent context.
