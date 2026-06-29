import { extractDocxText } from "@/lib/extraction/docxExtractor";
import { extractImageMetadata } from "@/lib/extraction/imageMetadataExtractor";
import { extractPdfText } from "@/lib/extraction/pdfExtractor";
import { scoreTextQuality } from "@/lib/extraction/quality";

export async function extractFile(input: {
  bytes: Buffer;
  extension: string;
  mimeType: string;
  manualDescription?: string | null;
}) {
  const extension = input.extension.toLowerCase();

  if (extension === ".docx") return extractDocxText(input.bytes);
  if (extension === ".pdf") return extractPdfText(input.bytes);
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(extension) || input.mimeType.startsWith("image/")) {
    return extractImageMetadata(input.bytes);
  }
  if (extension === ".txt" || input.mimeType === "text/plain") {
    const text = input.bytes.toString("utf8").trim();
    return {
      extractor: "manual",
      extractorVersion: "plain-text-fixture",
      text,
      pageCount: null,
      parseQuality: text ? "good" : scoreTextQuality(text),
      metadata: {},
      warnings: [],
    };
  }

  return {
    extractor: "unsupported",
    extractorVersion: "attachment-only",
    text: input.manualDescription?.trim() ?? "",
    pageCount: null,
    parseQuality: "unsupported" as const,
    metadata: {},
    warnings: [`${extension || "file"} is stored as an attachment and requires manual description`],
  };
}
