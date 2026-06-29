import { scoreTextQuality } from "@/lib/extraction/quality";

export async function extractPdfText(bytes: Buffer) {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: bytes });
    const [textResult, infoResult] = await Promise.all([parser.getText(), parser.getInfo().catch(() => null)]);
    await parser.destroy();
    const text = (textResult.text ?? "").trim();
    const parseQuality = scoreTextQuality(text);

    return {
      extractor: "pdf-text",
      extractorVersion: "pdf-parse",
      text,
      pageCount: infoResult?.total ?? null,
      parseQuality,
      metadata: { info: infoResult?.info ?? null },
      warnings: parseQuality === "poor" ? ["PDF text extraction was too sparse"] : [],
    };
  } catch (error) {
    return {
      extractor: "pdf-text",
      extractorVersion: "pdf-parse",
      text: "",
      pageCount: null,
      parseQuality: "poor" as const,
      metadata: {},
      warnings: [`PDF extraction failed: ${error instanceof Error ? error.message : "unknown error"}`],
    };
  }
}
