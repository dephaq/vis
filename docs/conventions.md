# Conventions

- Keep server-only code under `src/lib` or route/server-action files. Add `server-only` when secrets or filesystem access are involved.
- Prefer server components for data loading and small client components for upload/generate interactions.
- Store JSON-shaped provider metadata as serialized strings in SQLite fields ending with `Json`.
- Keep UI copy operational and concise. This is a work tool, not a marketing site.
- Do not add new providers until the single provider interface needs them.
