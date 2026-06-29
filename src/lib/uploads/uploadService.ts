import crypto from "node:crypto";
import path from "node:path";

import { db } from "@/lib/db";
import { extractFile } from "@/lib/extraction/extractFile";
import { statusForQuality } from "@/lib/extraction/quality";
import { toJson } from "@/lib/json";
import { writeProjectFile } from "@/lib/storage/localStorage";

const MAX_UPLOAD_BYTES = 30 * 1024 * 1024;

export type UploadAndProcessInput = {
  projectId: string;
  originalName: string;
  mimeType: string;
  bytes: Buffer;
  manualDescription?: string | null;
};

export function classifyFileKind(filename: string, mimeType: string) {
  const extension = path.extname(filename).toLowerCase();
  const lowerName = filename.toLowerCase();

  if (extension === ".docx") return "brief";
  if (extension === ".dwg") return "dwg";
  if (mimeType.startsWith("image/")) return "reference_image";
  if (extension === ".pdf" && lowerName.includes("свет")) return "lighting_pdf";
  if (extension === ".pdf" && lowerName.includes("развер")) return "elevation_pdf";
  if (extension === ".pdf" && (lowerName.includes("план") || lowerName.includes("мебел"))) return "plan_pdf";
  if (extension === ".pdf") return "plan_pdf";
  return "other";
}

export async function uploadAndProcessFile(input: UploadAndProcessInput) {
  if (input.bytes.byteLength === 0) throw new Error("File is empty");
  if (input.bytes.byteLength > MAX_UPLOAD_BYTES) throw new Error("File exceeds 30 MB MVP limit");

  const project = await db.project.findUnique({ where: { id: input.projectId } });
  if (!project) throw new Error("Project not found");

  const extension = path.extname(input.originalName).toLowerCase();
  const sha256 = crypto.createHash("sha256").update(input.bytes).digest("hex");
  const kind = classifyFileKind(input.originalName, input.mimeType);

  const file = await db.uploadedFile.create({
    data: {
      projectId: input.projectId,
      originalName: input.originalName,
      mimeType: input.mimeType || "application/octet-stream",
      extension,
      sizeBytes: input.bytes.byteLength,
      sha256,
      kind,
      storageKey: "",
      status: "extracting",
      manualDescription: input.manualDescription?.trim() || null,
    },
  });

  const storageKey = await writeProjectFile({
    projectId: input.projectId,
    fileId: file.id,
    originalName: input.originalName,
    bytes: input.bytes,
  });

  const extraction = await extractFile({
    bytes: input.bytes,
    extension,
    mimeType: input.mimeType,
    manualDescription: input.manualDescription,
  });
  const status = extraction.parseQuality === "unsupported" ? "needs_manual_description" : statusForQuality(extraction.parseQuality);

  const [updatedFile, extractedText] = await db.$transaction([
    db.uploadedFile.update({
      where: { id: file.id },
      data: {
        storageKey,
        status,
      },
    }),
    db.extractedText.create({
      data: {
        uploadedFileId: file.id,
        extractor: extraction.extractor,
        extractorVersion: extraction.extractorVersion,
        text: extraction.text,
        pageCount: extraction.pageCount,
        parseQuality: extraction.parseQuality,
        metadataJson: toJson(extraction.metadata),
        warningsJson: toJson(extraction.warnings),
      },
    }),
  ]);

  return { file: updatedFile, extractedText };
}
