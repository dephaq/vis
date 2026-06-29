import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const unsafeNamePattern = /[<>:"/\\|?*\u0000-\u001f]/g;

export function getLocalStorageRoot() {
  return path.join(process.cwd(), "storage");
}

export function sanitizeFilename(filename: string) {
  const cleaned = filename.replace(unsafeNamePattern, "_").trim();
  return cleaned || "file";
}

export async function writeProjectFile(input: {
  projectId: string;
  fileId: string;
  originalName: string;
  bytes: Buffer;
}) {
  const filename = sanitizeFilename(input.originalName);
  const directory = path.join(getLocalStorageRoot(), "projects", input.projectId, "uploads", input.fileId);
  await mkdir(directory, { recursive: true });
  const absolutePath = path.join(directory, filename);
  await writeFile(absolutePath, input.bytes);
  return path.relative(getLocalStorageRoot(), absolutePath).replaceAll("\\", "/");
}

export async function writeResultFile(input: {
  projectId: string;
  jobId: string;
  filename: string;
  bytes: Buffer;
}) {
  const directory = path.join(getLocalStorageRoot(), "projects", input.projectId, "results", input.jobId);
  await mkdir(directory, { recursive: true });
  const absolutePath = path.join(directory, sanitizeFilename(input.filename));
  await writeFile(absolutePath, input.bytes);
  return path.relative(getLocalStorageRoot(), absolutePath).replaceAll("\\", "/");
}

export async function readStorageFile(storageKey: string) {
  const root = getLocalStorageRoot();
  const absolutePath = path.resolve(root, storageKey);
  if (!absolutePath.startsWith(root)) {
    throw new Error("Invalid storage key");
  }

  return readFile(absolutePath);
}
