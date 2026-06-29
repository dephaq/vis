import type { ImageProvider } from "@/lib/generation/providers/imageProvider";

type GeminiPart = {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
};

export function createNanoBananaProvider(): ImageProvider {
  const model = process.env.NANO_BANANA_MODEL ?? "gemini-3-pro-image-preview";

  return {
    name: "nano_banana",
    model,
    async generate(input) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is required for nano_banana provider");

      const parts: GeminiPart[] = [
        { text: input.prompt },
        ...input.referenceImages.slice(0, 6).map((image) => ({
          inlineData: {
            mimeType: image.mimeType,
            data: image.bytes.toString("base64"),
          },
        })),
      ];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ["Image"],
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini image request failed with ${response.status}`);
      }

      const payload = (await response.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> };
        }>;
      };
      const inlineData = payload.candidates?.[0]?.content?.parts?.find((part) => part.inlineData)?.inlineData;
      if (!inlineData?.data) throw new Error("Gemini image response did not include image data");

      return {
        bytes: Buffer.from(inlineData.data, "base64"),
        mimeType: inlineData.mimeType ?? process.env.NANO_BANANA_OUTPUT_MIME_TYPE ?? "image/png",
        metadata: {
          provider: "nano_banana",
          model,
          referenceImageCount: input.referenceImages.length,
        },
      };
    },
  };
}
