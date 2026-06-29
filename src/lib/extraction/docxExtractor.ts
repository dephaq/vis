import mammoth from "mammoth";

import { scoreTextQuality } from "@/lib/extraction/quality";

export async function extractDocxText(bytes: Buffer) {
  const result = await mammoth.extractRawText({ buffer: bytes });
  const text = result.value.trim();
  const warnings = result.messages.map((message) => message.message);

  return {
    extractor: "docx-text",
    extractorVersion: "mammoth-plain-text",
    text,
    pageCount: null,
    parseQuality: scoreTextQuality(text),
    metadata: {},
    warnings,
  };
}
