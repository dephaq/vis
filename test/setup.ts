import "@testing-library/jest-dom/vitest";

process.env.IMAGE_GENERATION_PROVIDER ??= "mock";
process.env.NANO_BANANA_MODEL ??= "gemini-3-pro-image";
process.env.NANO_BANANA_OUTPUT_MIME_TYPE ??= "image/png";
process.env.LOCAL_STORAGE_ROOT ??= ".test-storage";
