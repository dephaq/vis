import { describe, expect, it } from "vitest";

import { createMockImageProvider } from "@/lib/generation/providers/mockImageProvider";
import { mapProviderError } from "@/lib/generation/providerErrors";

describe("mock image provider", () => {
  it("returns deterministic image bytes and metadata without requiring an API key", async () => {
    delete process.env.GEMINI_API_KEY;
    const provider = createMockImageProvider({ model: "mock-model" });

    const result = await provider.generate({
      prompt: "Render a warm kitchen-living room",
      projectId: "project-1",
      jobId: "job-1",
      referenceImages: [
        {
          filename: "референс.png",
          mimeType: "image/png",
          bytes: Buffer.from("image"),
        },
      ],
    });

    expect(result.mimeType).toBe("image/png");
    expect(result.bytes.byteLength).toBeGreaterThan(0);
    expect(result.metadata.model).toBe("mock-model");
    expect(JSON.stringify(result.metadata)).not.toContain("GEMINI_API_KEY");
  });

  it("maps provider failures to sanitized public errors", () => {
    const mapped = mapProviderError(new Error("GEMINI_API_KEY=secret invalid"));

    expect(mapped.code).toBe("provider_error");
    expect(mapped.message).not.toContain("secret");
    expect(mapped.retryable).toBe(false);
  });
});
