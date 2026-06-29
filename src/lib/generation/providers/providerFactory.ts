import { createMockImageProvider } from "@/lib/generation/providers/mockImageProvider";
import { createNanoBananaProvider } from "@/lib/generation/providers/nanoBananaProvider";

export function getImageProvider() {
  if (process.env.IMAGE_GENERATION_PROVIDER === "nano_banana") {
    return createNanoBananaProvider();
  }

  return createMockImageProvider({ model: process.env.NANO_BANANA_MODEL ?? "mock-image-provider" });
}
