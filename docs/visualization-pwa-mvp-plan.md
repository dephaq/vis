---
title: Visualization PWA MVP Implementation Plan
type: feat
status: completed
date: 2026-06-29
---

# Visualization PWA MVP Implementation Plan

## 1. Цель MVP

Построить минимальный веб-интерфейс для проектов интерьерной визуализации: пользователь создает проект, загружает ТЗ и чертежи, получает черновой brief/prompt, вручную правит его, запускает генерацию изображения через backend adapter для Nano Banana Pro и видит историю результатов. Интерфейс должен устанавливаться как PWA на телефон, планшет и компьютер.

Текущий каталог является greenfield workspace: существующего приложения, `package.json`, backend, базы данных, тестов и `docs/` не было найдено. В корне уже лежат реальные входные файлы проекта визуализации: DOCX, PDF и DWG.

## 2. Что входит в MVP

- Создание проекта визуализации.
- Загрузка DOCX, PDF, изображений и сохранение исходных файлов.
- Просмотр списка файлов проекта, статусов обработки и базовых метаданных.
- Простое извлечение текста из DOCX/PDF.
- Fallback для плохо парсящихся PDF: файл сохраняется, пользователь вручную описывает документ.
- Генерация draft prompt/brief из извлеченного текста и manual descriptions.
- Ручной редактор prompt.
- Backend-only интеграция с Nano Banana Pro через provider adapter.
- Список generation jobs, результатов и истории prompt/result по проекту.
- PWA wrapper: manifest, icons, installability, mobile-friendly shell.
- Минимальная документация и тестовый harness, соответствующий `agent-harness-guide.md`.

## 3. Что НЕ входит в MVP

- Сложная CRM, роли, multi-user permissions и billing.
- Публичные share links и полноценная админка.
- Полный OCR/vision-анализ всех чертежей.
- Автоматическое понимание планировки на 100%.
- Сложная классификация страниц PDF.
- Поддержка многих image providers.
- Pixel-perfect дизайн.
- Автоматический парсинг DWG: DWG сохраняется как attachment, для MVP пользователь загружает PDF/image export или добавляет описание вручную.

## 4. Пользовательский сценарий

1. Пользователь открывает PWA и создает проект, например "Кухня-гостиная-столовая".
2. Загружает ТЗ в DOCX/PDF, PDF с планом пола и мебели, PDF с потолком и светом, PDF с развертками, изображения и референсы.
3. Система сохраняет файлы, показывает список и запускает простое извлечение текста.
4. Пользователь видит извлеченный текст, предупреждения по файлам и поля ручного описания для плохо распознанных PDF/DWG.
5. Система собирает draft brief/prompt из извлеченного текста, имен файлов, типов документов и manual descriptions.
6. Пользователь редактирует prompt руками.
7. Пользователь нажимает Generate, backend создает generation job и вызывает Nano Banana Pro через provider adapter.
8. Пользователь видит статус job, результат изображения или ошибку.
9. Пользователь делает новую версию prompt и повторяет генерацию, сохраняя историю в проекте.

## 5. Минимальные экраны

- `Projects list`: список проектов, создание нового проекта, переход в проект.
- `Project detail`: основная рабочая область проекта.
- `Upload files block`: drag/drop и file picker для DOCX/PDF/images/DWG attachments.
- `Files list`: имя, тип, размер, статус, качество extraction, manual-description-needed badge.
- `Extracted text / draft brief block`: просмотр извлеченного текста и собранного чернового brief.
- `Prompt editor`: textarea/editor с autosave/manual save, reset to draft, prompt version selector.
- `Generate button + job status`: запуск, running/succeeded/failed/canceled состояния, retry.
- `Results gallery`: карточки результатов с prompt version, provider metadata, preview/download.
- `PWA install behavior`: install prompt, standalone layout, offline shell warning.

Для MVP можно начать с двух маршрутов: `/projects` и `/projects/[projectId]`. На мобильных устройствах `Project detail` должен идти вертикальным flow: Upload -> Files -> Brief -> Prompt -> Generate -> Results.

## 6. Минимальная data model

`Project`
- `id`
- `name`
- `description`
- `status`: `active | archived`
- `createdAt`
- `updatedAt`

`UploadedFile`
- `id`
- `projectId`
- `originalName`
- `mimeType`
- `extension`
- `sizeBytes`
- `sha256`
- `kind`: `brief | plan_pdf | elevation_pdf | lighting_pdf | reference_image | dwg | other`
- `storageKey`
- `status`: `uploaded | extracting | extracted | needs_manual_description | failed`
- `manualDescription`
- `error`
- `createdAt`

`ExtractedText`
- `id`
- `uploadedFileId`
- `extractor`: `docx-text | pdf-text | image-metadata | manual | unsupported`
- `extractorVersion`
- `text`
- `pageCount`
- `parseQuality`: `good | partial | poor | unsupported`
- `metadataJson`
- `warningsJson`
- `createdAt`

`PromptVersion`
- `id`
- `projectId`
- `version`
- `draftSource`: `auto | manual`
- `title`
- `promptText`
- `sourceSummaryJson`
- `isActive`
- `createdAt`
- `updatedAt`

`GenerationJob`
- `id`
- `projectId`
- `promptVersionId`
- `status`: `queued | running | succeeded | failed | canceled`
- `provider`: `nano_banana | mock`
- `model`
- `inputSnapshotJson`
- `inputHash`
- `startedAt`
- `completedAt`
- `errorCode`
- `errorMessage`
- `createdAt`

`GenerationResult`
- `id`
- `jobId`
- `kind`: `image | text | json | file`
- `storageKey`
- `mimeType`
- `sizeBytes`
- `sha256`
- `providerMetadataJson`
- `createdAt`

## 7. Минимальный backend

Рекомендуемый стек для пустого проекта: Next.js App Router + TypeScript, API route handlers/server actions, Prisma + SQLite для local MVP. Файлы хранить на локальном диске через storage abstraction, чтобы позже заменить на S3-compatible storage. Если приложение сразу разворачивается как shared/cloud app, заменить SQLite на Postgres до production.

Endpoints/server actions:

- `createProject`: создать проект.
- `uploadFile`: принять multipart upload, проверить тип/размер, сохранить файл, создать `UploadedFile`.
- `processFile`: извлечь текст/metadata, создать `ExtractedText`, обновить статус файла.
- `buildDraftPrompt`: собрать draft prompt из extracted texts, filenames, kinds и manual descriptions.
- `updatePrompt`: сохранить ручную правку как новую `PromptVersion` или обновить активную версию.
- `createGenerationJob`: создать job, snapshot prompt/input files, вызвать provider adapter.
- `getGenerationStatus`: вернуть статус job и sanitized error.
- `listResults`: вернуть результаты проекта/job.

Likely modules:
- `prisma/schema.prisma`
- `src/lib/db.ts`
- `src/lib/storage/localStorage.ts`
- `src/lib/uploads/uploadService.ts`
- `src/lib/extraction/*`
- `src/lib/prompts/buildDraftPrompt.ts`
- `src/lib/generation/*`
- `src/app/actions/projects.ts`
- `src/app/actions/prompts.ts`
- `src/app/api/projects/[projectId]/uploads/route.ts`
- `src/app/api/uploads/[uploadedFileId]/process/route.ts`
- `src/app/api/projects/[projectId]/generation-jobs/route.ts`
- `src/app/api/generation-jobs/[generationJobId]/route.ts`
- `src/app/api/generation-jobs/[generationJobId]/results/route.ts`

## 8. File processing MVP

Pipeline:

1. Upload получает файл и optional manual note.
2. Backend сохраняет оригинал без изменений, считает `sha256`, размер, MIME и extension.
3. Router выбирает extractor:
   - DOCX: извлечь paragraphs и table text.
   - PDF: извлечь page text и page count.
   - Image: сохранить файл, hash, dimensions, MIME, optional caption/manual note.
   - DWG: сохранить как attachment, статус `unsupported` или `needs_manual_description`.
4. Extractor сохраняет `ExtractedText` с `parseQuality` и warnings.
5. Если PDF extraction слабый, система не додумывает содержание, а показывает manual description fields.
6. Draft prompt builder использует то, что реально извлечено, плюс ручные описания.

Простые библиотеки для Next.js/Node MVP:
- DOCX: `mammoth` или аналог для plain text extraction.
- PDF: `pdf-parse`/`pdfjs-dist` для текста и page count.
- Images: `sharp` или `image-size` для dimensions/metadata.

Если extraction в Node окажется хрупким на реальных PDF, допустимый упрощенный вариант: вынести extraction в маленький Python worker/script с `python-docx`, `PyMuPDF` и `Pillow`, вызываемый backend-ом. Это должно остаться implementation-time решением, не отдельной архитектурой MVP.

## 9. Nano Banana Pro integration

Интеграция только на backend. API keys никогда не попадают во frontend, browser logs, result metadata или persisted provider request.

Provider adapter:
- `src/lib/generation/providers/imageProvider.ts`: общий интерфейс.
- `src/lib/generation/providers/nanoBananaProvider.ts`: реальный adapter.
- `src/lib/generation/providers/mockImageProvider.ts`: deterministic mock для tests/local dev.
- `src/lib/generation/generationService.ts`: orchestration, status transitions, storage, metadata.

Env vars:
- `IMAGE_GENERATION_PROVIDER=nano_banana | mock`
- `GEMINI_API_KEY`
- `NANO_BANANA_MODEL=gemini-3-pro-image`
- `NANO_BANANA_TIMEOUT_MS=120000`
- `NANO_BANANA_MAX_RETRIES=2`
- `NANO_BANANA_OUTPUT_MIME_TYPE=image/png`

Flow:

1. `createGenerationJob` валидирует prompt и проект.
2. Job получает статус `queued`/`running`.
3. `generationService` вызывает выбранный provider.
4. Adapter отправляет prompt и optional reference images.
5. Adapter нормализует ответ в `GenerationResult`.
6. Output image сохраняется в `storage/projects/{projectId}/results/{jobId}/`.
7. Metadata сохраняет provider, model, duration, output mime/size/hash, sanitized error; secrets не сохраняются.

Error handling:
- validation/config/auth/model errors становятся понятными failed states без retry;
- rate limit и transient 5xx можно retry с коротким backoff;
- provider blocked/safety/empty-output сохраняется как sanitized failure reason;
- real provider smoke test должен быть opt-in, mock provider обязателен для CI/local tests.

## 10. PWA

- `src/app/manifest.ts`: name `Interior Visualization`, short name `Viz MVP`, `start_url: "/"`, `display: "standalone"`, theme/background colors.
- `public/icons/`: минимум 192x192 и 512x512 PNG icons.
- Service worker: cache только app shell, icons и static assets.
- Не cache-ить uploaded documents и generated outputs по умолчанию: это приватные проектные данные.
- Offline shell: дешево сделать баннер "offline", оставить просмотр cached shell, отключить upload/generate.
- Mobile layout: responsive single-column flow with sticky generate/status controls.
- Desktop layout: file rail + brief/prompt workspace + results/status panel.

## 11. Implementation phases

### Phase 1: repo setup + docs

**Цель:** создать минимальный app scaffold и project knowledge base.

**Задачи:**
- Инициализировать Next.js + TypeScript app.
- Добавить Tailwind; shadcn/ui подключить только если это не раздувает setup.
- Создать `AGENTS.md` как короткую карту проекта по `agent-harness-guide.md`.
- Оставить этот план в `docs/visualization-pwa-mvp-plan.md`.

**Acceptance criteria:**
- App стартует локально.
- Есть базовый layout.
- Документация объясняет стек, тесты и границы MVP.

**Вероятные файлы:** `package.json`, `next.config.ts`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `AGENTS.md`, `docs/visualization-pwa-mvp-plan.md`.

### Phase 2: project model + project pages

**Цель:** пользователь может создать проект и открыть project detail.

**Задачи:**
- Добавить Prisma + SQLite schema.
- Реализовать `Project`.
- Сделать `Projects list` и `Project detail`.

**Acceptance criteria:**
- Новый проект создается и отображается в списке.
- Project detail открывается по id.

**Вероятные файлы:** `prisma/schema.prisma`, `src/lib/db.ts`, `src/app/projects/page.tsx`, `src/app/projects/[projectId]/page.tsx`, `src/app/actions/projects.ts`.

### Phase 3: file upload + storage

**Цель:** файлы проекта сохраняются и отображаются.

**Задачи:**
- Реализовать local storage abstraction.
- Реализовать multipart upload endpoint.
- Добавить upload block и files list.
- Сохранять DOCX/PDF/images/DWG как attachments.

**Acceptance criteria:**
- Файл загружается, появляется в списке, имеет статус и metadata.
- Binary не хранится в SQLite.
- Cyrillic filenames отображаются корректно.

**Вероятные файлы:** `src/lib/storage/localStorage.ts`, `src/lib/uploads/uploadService.ts`, `src/app/api/projects/[projectId]/uploads/route.ts`, `src/components/upload-dropzone.tsx`, `src/components/file-list.tsx`.

### Phase 4: DOCX/PDF text extraction

**Цель:** система извлекает простой текст и честно помечает слабый результат.

**Задачи:**
- Добавить DOCX extractor.
- Добавить PDF extractor.
- Добавить image metadata extractor.
- Добавить quality gate и manual description state.

**Acceptance criteria:**
- DOCX дает извлеченный русский текст.
- PDF дает текст/page count или статус `needs_manual_description`.
- DWG сохраняется, но не парсится.

**Вероятные файлы:** `src/lib/extraction/docxExtractor.ts`, `src/lib/extraction/pdfExtractor.ts`, `src/lib/extraction/imageMetadataExtractor.ts`, `src/lib/extraction/quality.ts`, `src/app/api/uploads/[uploadedFileId]/process/route.ts`, `src/components/extracted-text-panel.tsx`.

### Phase 5: draft prompt builder + prompt editor

**Цель:** пользователь получает draft prompt и может его править.

**Задачи:**
- Собрать prompt builder из extracted text, file metadata и manual descriptions.
- Добавить `PromptVersion`.
- Реализовать prompt editor и save/reset.

**Acceptance criteria:**
- Draft prompt содержит помещение, материалы/мебель/свет из ТЗ, ссылки на исходные файлы по именам и предупреждения по слабым PDF.
- Пользователь может сохранить ручную версию prompt.

**Вероятные файлы:** `src/lib/prompts/buildDraftPrompt.ts`, `src/app/actions/prompts.ts`, `src/components/draft-brief-panel.tsx`, `src/components/prompt-editor.tsx`, `tests/unit/prompt-builder.test.ts`.

### Phase 6: Nano Banana provider adapter + mocked tests

**Цель:** backend умеет запускать генерацию через единый adapter и mock.

**Задачи:**
- Добавить `ImageProvider` interface.
- Реализовать `mockImageProvider`.
- Реализовать `nanoBananaProvider`.
- Добавить env validation и sanitized error mapping.

**Acceptance criteria:**
- Tests не требуют real API key.
- Provider request не логирует secrets.
- Model configurable через env.

**Вероятные файлы:** `src/lib/generation/providers/imageProvider.ts`, `src/lib/generation/providers/mockImageProvider.ts`, `src/lib/generation/providers/nanoBananaProvider.ts`, `src/lib/generation/providerErrors.ts`, `tests/unit/provider-adapter.test.ts`.

### Phase 7: generation jobs + results gallery

**Цель:** генерации сохраняются как история проекта.

**Задачи:**
- Добавить `GenerationJob` и `GenerationResult`.
- Реализовать create/status/results endpoints.
- Добавить job status UI и results gallery.

**Acceptance criteria:**
- Prompt запускает mocked generation и результат появляется в галерее.
- Повторная генерация создает новую запись истории.
- Failed job показывает понятную ошибку.

**Вероятные файлы:** `src/lib/generation/generationService.ts`, `src/app/api/projects/[projectId]/generation-jobs/route.ts`, `src/app/api/generation-jobs/[generationJobId]/route.ts`, `src/app/api/generation-jobs/[generationJobId]/results/route.ts`, `src/components/job-status-card.tsx`, `src/components/results-gallery.tsx`.

### Phase 8: PWA wrapper

**Цель:** приложение installable и нормально работает на mobile/tablet/desktop.

**Задачи:**
- Добавить manifest.
- Добавить icons.
- Добавить basic service worker/offline shell.
- Добавить install prompt и offline banner.

**Acceptance criteria:**
- Manifest проходит базовую installability проверку.
- App открывается в standalone display mode.
- Offline state не обещает upload/generate.

**Вероятные файлы:** `src/app/manifest.ts`, `public/icons/*`, `public/sw.js`, `src/components/install-prompt.tsx`, `src/components/offline-banner.tsx`, `tests/e2e/pwa.spec.ts`.

### Phase 9: smoke tests + polish

**Цель:** зафиксировать минимальный harness и убрать очевидные UX-провалы.

**Задачи:**
- Добавить Vitest + React Testing Library.
- Добавить Playwright smoke test.
- Проверить полный путь: project -> upload -> extraction -> prompt -> mocked generation -> result.
- Проверить mobile layout и Cyrillic filenames.

**Acceptance criteria:**
- Unit tests покрывают prompt builder и provider adapter.
- Integration test покрывает upload/process.
- E2E smoke flow проходит с mock provider.

**Вероятные файлы:** `vitest.config.mts`, `test/setup.ts`, `playwright.config.ts`, `tests/unit/*`, `tests/integration/upload-process.test.ts`, `tests/e2e/smoke.spec.ts`, `tests/e2e/pwa.spec.ts`.

## 12. Subagent work breakdown

На implementation stage можно распараллелить такие независимые задачи:

- Repo/Foundation Agent: Next.js scaffold, TypeScript, Tailwind, AGENTS/docs, basic layout.
- Data/Storage Agent: Prisma schema, SQLite setup, local storage abstraction, upload metadata.
- Frontend Agent: project pages, upload block, file list, prompt editor, results gallery.
- File Processing Agent: DOCX/PDF/image extractors, quality gate, manual fallback.
- Prompt Agent: draft prompt builder, prompt versioning behavior, prompt builder tests.
- Provider Agent: image provider interface, Nano Banana adapter, mock provider, error mapping.
- PWA Agent: manifest, icons, service worker, install prompt, offline banner.
- QA Agent: Vitest/Playwright setup, smoke flow, PWA installability check, manual QA checklist.

Parallel safety: agents should have disjoint write ownership and must not edit the same files concurrently. Shared files such as `prisma/schema.prisma`, `src/lib/types.ts`, `package.json`, and app routes should be owned by one agent or integrated serially.

## 13. Tests / checks

- Unit test `buildDraftPrompt`: deterministic output, Cyrillic text preserved, empty/undefined placeholders excluded, manual descriptions included.
- Unit test provider adapter with mock: request shape, configurable model, sanitized errors, no real network/API key.
- Upload/process integration test: valid DOCX/PDF upload creates file/extraction records; unsupported/poor PDF sets fallback status.
- Smoke test: create project -> upload fixture -> process -> edit prompt -> mocked generation -> result appears.
- PWA check: manifest exists, required fields/icons present, service worker registered if enabled.
- Manual QA: desktop Chrome, mobile viewport, PWA install, offline shell, Cyrillic filenames, provider failure state.

## 14. Risks

- PDF extraction quality may be poor for drawing exports; fallback/manual description is part of MVP, not a failure.
- Nano Banana Pro/Gemini API request shape or model name can change; keep model/env configurable and adapter isolated.
- Large DOCX/PDF files can block serverless/runtime limits; set file size limits and keep local MVP expectations clear.
- Generation cost can grow quickly; show explicit generate action and avoid automatic real-provider calls in tests.
- API key security: only backend env, never frontend.
- User expectations: MVP assembles a usable prompt, it does not fully understand architectural drawings automatically.
- Current workspace is not a git repo; implementation should initialize version control before code work.

## 15. Final checklist

- [ ] Initialize greenfield Next.js + TypeScript app.
- [ ] Add project documentation map (`AGENTS.md`, `docs/`).
- [ ] Add Prisma + SQLite data model.
- [ ] Implement project list and project detail pages.
- [ ] Implement file upload and local storage.
- [ ] Implement DOCX/PDF/image extraction with fallback.
- [ ] Implement draft prompt builder.
- [ ] Implement prompt editor and prompt versions.
- [ ] Implement Nano Banana provider adapter and mock provider.
- [ ] Implement generation jobs and results gallery.
- [ ] Add PWA manifest, icons, service worker/offline shell.
- [ ] Add unit, integration, smoke and PWA checks.
- [ ] Validate full MVP flow with mock provider before real API calls.

## Sources

- `agent-harness-guide.md`
- Next.js PWA guide: https://nextjs.org/docs/app/guides/progressive-web-apps
- Next.js testing guide: https://nextjs.org/docs/app/guides/testing
- Google Gemini image generation guide: https://ai.google.dev/gemini-api/docs/image-generation
- Gemini 3 Pro Image model docs: https://ai.google.dev/gemini-api/docs/models/gemini-3-pro-image
- Chrome installable manifest guidance: https://developer.chrome.com/docs/lighthouse/pwa/installable-manifest
- Vitest mocking guide: https://vitest.dev/guide/mocking
- Playwright docs: https://playwright.dev/docs/intro
