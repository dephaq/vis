import crypto from "node:crypto";

import { db } from "@/lib/db";
import { mapProviderError } from "@/lib/generation/providerErrors";
import { getImageProvider } from "@/lib/generation/providers/providerFactory";
import { toJson } from "@/lib/json";
import { getOrCreateActivePrompt } from "@/lib/prompts/promptService";
import { readStorageFile, writeResultFile } from "@/lib/storage/localStorage";

export async function createGenerationJob(projectId: string) {
  const prompt = await getOrCreateActivePrompt(projectId);
  const provider = getImageProvider();
  const files = await db.uploadedFile.findMany({
    where: { projectId, kind: "reference_image" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  const snapshot = {
    promptVersionId: prompt.id,
    promptText: prompt.promptText,
    files: files.map((file) => ({
      id: file.id,
      originalName: file.originalName,
      kind: file.kind,
      sha256: file.sha256,
    })),
  };
  const inputHash = crypto.createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");

  const job = await db.generationJob.create({
    data: {
      projectId,
      promptVersionId: prompt.id,
      status: "running",
      provider: provider.name,
      model: provider.model,
      inputSnapshotJson: toJson(snapshot),
      inputHash,
      startedAt: new Date(),
    },
  });

  try {
    const referenceImages = await Promise.all(
      files.map(async (file) => ({
        filename: file.originalName,
        mimeType: file.mimeType,
        bytes: await readStorageFile(file.storageKey),
      })),
    );
    const generated = await provider.generate({
      prompt: prompt.promptText,
      projectId,
      jobId: job.id,
      referenceImages,
    });
    const storageKey = await writeResultFile({
      projectId,
      jobId: job.id,
      filename: `result-${job.id}.png`,
      bytes: generated.bytes,
    });
    const sha256 = crypto.createHash("sha256").update(generated.bytes).digest("hex");

    await db.generationResult.create({
      data: {
        jobId: job.id,
        kind: "image",
        storageKey,
        mimeType: generated.mimeType,
        sizeBytes: generated.bytes.byteLength,
        sha256,
        providerMetadataJson: toJson(generated.metadata),
      },
    });

    return db.generationJob.update({
      where: { id: job.id },
      data: { status: "succeeded", completedAt: new Date() },
      include: { results: true, promptVersion: true },
    });
  } catch (error) {
    const mapped = mapProviderError(error);
    return db.generationJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        completedAt: new Date(),
        errorCode: mapped.code,
        errorMessage: mapped.message,
      },
      include: { results: true, promptVersion: true },
    });
  }
}
