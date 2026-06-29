import crypto from "node:crypto";

import type { ImageProvider } from "@/lib/generation/providers/imageProvider";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64",
);

export function createMockImageProvider(options?: { model?: string }): ImageProvider {
  return {
    name: "mock",
    model: options?.model ?? "mock-image-provider",
    async generate(input) {
      const hash = crypto.createHash("sha256").update(input.prompt).digest("hex");

      return {
        bytes: onePixelPng,
        mimeType: "image/png",
        metadata: {
          provider: "mock",
          model: options?.model ?? "mock-image-provider",
          promptHash: hash,
          referenceImageCount: input.referenceImages.length,
          generatedAt: new Date(0).toISOString(),
        },
      };
    },
  };
}
