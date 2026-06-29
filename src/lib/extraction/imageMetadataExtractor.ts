import { imageSize } from "image-size";

export function extractImageMetadata(bytes: Buffer) {
  const dimensions = imageSize(bytes);

  return {
    extractor: "image-metadata",
    extractorVersion: "image-size",
    text: "",
    pageCount: null,
    parseQuality: "partial" as const,
    metadata: {
      width: dimensions.width ?? null,
      height: dimensions.height ?? null,
      type: dimensions.type ?? null,
    },
    warnings: ["Images are saved as references; describe important visual details manually when needed"],
  };
}
