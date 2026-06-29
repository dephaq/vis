import { describe, expect, it } from "vitest";

import { buildDraftPrompt } from "@/lib/prompts/buildDraftPrompt";

describe("buildDraftPrompt", () => {
  it("preserves Cyrillic extracted text, manual descriptions, source filenames, and warnings", () => {
    const prompt = buildDraftPrompt({
      project: {
        name: "Кухня-гостиная-столовая",
        description: "Современный интерьер для семейной квартиры",
      },
      files: [
        {
          id: "file-docx",
          originalName: "ТЗ на виз гостиная-столовая.docx",
          kind: "brief",
          status: "extracted",
          manualDescription: null,
          extractedTexts: [
            {
              text: "Материалы: светлый камень, теплое дерево. Свет: трековые светильники.",
              parseQuality: "good",
              warnings: [],
            },
          ],
        },
        {
          id: "file-pdf",
          originalName: "Найтсбридж_9_План_пола_и_мебели.pdf",
          kind: "plan_pdf",
          status: "needs_manual_description",
          manualDescription: "План показывает остров, диванную группу и обеденный стол.",
          extractedTexts: [
            {
              text: "",
              parseQuality: "poor",
              warnings: ["PDF text extraction was too sparse"],
            },
          ],
        },
      ],
    });

    expect(prompt.promptText).toContain("Кухня-гостиная-столовая");
    expect(prompt.promptText).toContain("светлый камень");
    expect(prompt.promptText).toContain("План показывает остров");
    expect(prompt.promptText).toContain("ТЗ на виз гостиная-столовая.docx");
    expect(prompt.promptText).toContain("PDF text extraction was too sparse");
    expect(prompt.promptText).not.toContain("undefined");
    expect(prompt.sourceSummary.files).toHaveLength(2);
  });

  it("omits empty optional sections instead of adding placeholders", () => {
    const prompt = buildDraftPrompt({
      project: { name: "Проект", description: "" },
      files: [],
    });

    expect(prompt.promptText).toContain("Проект");
    expect(prompt.promptText).not.toContain("N/A");
    expect(prompt.promptText).not.toContain("undefined");
  });
});
