# Quality

## Gates
- Unit tests cover prompt building and provider error behavior.
- Integration tests cover upload/process persistence and unsupported fallback.
- E2E tests cover project creation and PWA shell availability.
- `npm run build` must pass before shipping.

## MVP Limits
- PDF extraction may be sparse for drawings.
- DWG parsing is unsupported.
- Real Nano Banana/Gemini smoke testing is opt-in because it requires secrets and may cost money.
- SQLite is suitable for local MVP only.
