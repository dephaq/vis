"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { buildAndSaveDraftPrompt, saveManualPrompt } from "@/lib/prompts/promptService";

export async function buildDraftPromptAction(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  await buildAndSaveDraftPrompt(projectId);
  revalidatePath(`/projects/${projectId}`);
}

export async function savePromptAction(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  await saveManualPrompt({
    projectId,
    promptText: String(formData.get("promptText") ?? ""),
    title: String(formData.get("title") ?? ""),
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function updateFileDescriptionAction(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const fileId = String(formData.get("fileId") ?? "");
  await db.uploadedFile.update({
    where: { id: fileId },
    data: {
      manualDescription: String(formData.get("manualDescription") ?? "").trim() || null,
    },
  });
  await buildAndSaveDraftPrompt(projectId);
  revalidatePath(`/projects/${projectId}`);
}
