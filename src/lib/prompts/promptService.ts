import { db } from "@/lib/db";
import { parseJson, toJson } from "@/lib/json";
import { buildDraftPrompt } from "@/lib/prompts/buildDraftPrompt";

function mapWorkspaceForPrompt(project: Awaited<ReturnType<typeof getProjectForPrompt>>) {
  if (!project) throw new Error("Project not found");

  return {
    project: {
      name: project.name,
      description: project.description,
    },
    files: project.files.map((file) => ({
      id: file.id,
      originalName: file.originalName,
      kind: file.kind,
      status: file.status,
      manualDescription: file.manualDescription,
      extractedTexts: file.extractedTexts.map((text) => ({
        text: text.text,
        parseQuality: text.parseQuality,
        warnings: parseJson<string[]>(text.warningsJson, []),
      })),
    })),
  };
}

async function getProjectForPrompt(projectId: string) {
  return db.project.findUnique({
    where: { id: projectId },
    include: {
      files: {
        orderBy: { createdAt: "asc" },
        include: { extractedTexts: { orderBy: { createdAt: "desc" }, take: 1 } },
      },
    },
  });
}

export async function buildAndSaveDraftPrompt(projectId: string) {
  const project = await getProjectForPrompt(projectId);
  const draft = buildDraftPrompt(mapWorkspaceForPrompt(project));
  const latest = await db.promptVersion.findFirst({
    where: { projectId },
    orderBy: { version: "desc" },
  });
  const version = (latest?.version ?? 0) + 1;

  await db.promptVersion.updateMany({
    where: { projectId },
    data: { isActive: false },
  });

  return db.promptVersion.create({
    data: {
      projectId,
      version,
      draftSource: "auto",
      title: draft.title,
      promptText: draft.promptText,
      sourceSummaryJson: toJson(draft.sourceSummary),
      isActive: true,
    },
  });
}

export async function saveManualPrompt(input: {
  projectId: string;
  promptText: string;
  title?: string;
}) {
  const promptText = input.promptText.trim();
  if (!promptText) throw new Error("Prompt text is required");

  const latest = await db.promptVersion.findFirst({
    where: { projectId: input.projectId },
    orderBy: { version: "desc" },
  });
  const version = (latest?.version ?? 0) + 1;

  await db.promptVersion.updateMany({
    where: { projectId: input.projectId },
    data: { isActive: false },
  });

  return db.promptVersion.create({
    data: {
      projectId: input.projectId,
      version,
      draftSource: "manual",
      title: input.title?.trim() || `Manual prompt v${version}`,
      promptText,
      sourceSummaryJson: latest?.sourceSummaryJson ?? "{}",
      isActive: true,
    },
  });
}

export async function getOrCreateActivePrompt(projectId: string) {
  const active = await db.promptVersion.findFirst({
    where: { projectId, isActive: true },
    orderBy: { version: "desc" },
  });

  return active ?? buildAndSaveDraftPrompt(projectId);
}
