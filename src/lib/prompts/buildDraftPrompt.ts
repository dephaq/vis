export type DraftPromptInput = {
  project: {
    name: string;
    description?: string | null;
  };
  files: Array<{
    id: string;
    originalName: string;
    kind: string;
    status: string;
    manualDescription?: string | null;
    extractedTexts?: Array<{
      text?: string | null;
      parseQuality: string;
      warnings?: string[];
    }>;
  }>;
};

export type DraftPromptResult = {
  title: string;
  promptText: string;
  sourceSummary: {
    files: Array<{
      id: string;
      originalName: string;
      kind: string;
      status: string;
      parseQuality?: string;
      warnings: string[];
    }>;
  };
};

export function buildDraftPrompt(input: DraftPromptInput): DraftPromptResult {
  const sections: string[] = [
    `Interior visualization brief for project: ${input.project.name.trim()}`,
  ];

  const description = input.project.description?.trim();
  if (description) {
    sections.push(`Project note: ${description}`);
  }

  const sourceSummary = {
    files: input.files.map((file) => {
      const primaryText = file.extractedTexts?.[0];
      return {
        id: file.id,
        originalName: file.originalName,
        kind: file.kind,
        status: file.status,
        parseQuality: primaryText?.parseQuality,
        warnings: primaryText?.warnings ?? [],
      };
    }),
  };

  const extractedBlocks: string[] = [];
  const manualBlocks: string[] = [];
  const warnings: string[] = [];

  for (const file of input.files) {
    const primaryText = file.extractedTexts?.[0];
    const text = primaryText?.text?.trim();
    if (text) {
      extractedBlocks.push(`Source "${file.originalName}" (${file.kind}):\n${text}`);
    }

    const manualDescription = file.manualDescription?.trim();
    if (manualDescription) {
      manualBlocks.push(`Manual description for "${file.originalName}":\n${manualDescription}`);
    }

    for (const warning of primaryText?.warnings ?? []) {
      if (warning.trim()) warnings.push(`${file.originalName}: ${warning}`);
    }

    if (file.status === "needs_manual_description" && !manualDescription) {
      warnings.push(`${file.originalName}: manual description is needed before relying on this source.`);
    }
  }

  if (input.files.length > 0) {
    sections.push(`Source files:\n${input.files.map((file) => `- ${file.originalName} (${file.kind}, ${file.status})`).join("\n")}`);
  }
  if (extractedBlocks.length > 0) sections.push(`Extracted project content:\n${extractedBlocks.join("\n\n")}`);
  if (manualBlocks.length > 0) sections.push(`Manual source descriptions:\n${manualBlocks.join("\n\n")}`);
  if (warnings.length > 0) sections.push(`Extraction warnings:\n${warnings.map((warning) => `- ${warning}`).join("\n")}`);

  sections.push(
    "Generate one realistic interior visualization image. Preserve constraints from the brief, furniture plan, lighting plan, elevations, and reference images. Do not invent unavailable measurements; when drawings are unclear, use the manual descriptions and keep the composition plausible.",
  );

  return {
    title: `Draft brief for ${input.project.name.trim()}`,
    promptText: sections.filter(Boolean).join("\n\n"),
    sourceSummary,
  };
}
