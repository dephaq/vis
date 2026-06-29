import { rm } from "node:fs/promises";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { resetDatabaseForTests } from "@/lib/test/resetDatabaseForTests";
import { createProject } from "@/lib/projects/projectService";
import { uploadAndProcessFile } from "@/lib/uploads/uploadService";

describe("upload and process pipeline", () => {
  let storageRoot: string;

  beforeEach(async () => {
    storageRoot = path.join(process.cwd(), "storage");
    await rm(storageRoot, { recursive: true, force: true });
    await resetDatabaseForTests();
  });

  afterEach(async () => {
    await rm(storageRoot, { recursive: true, force: true });
  });

  it("stores unsupported DWG as an attachment that needs manual description", async () => {
    const project = await createProject({
      name: "Кухня-гостиная-столовая",
      description: "",
    });

    const result = await uploadAndProcessFile({
      projectId: project.id,
      originalName: "Найтсбридж_9_Развертки_кухни_гостиной.dwg",
      mimeType: "application/acad",
      bytes: Buffer.from("dwg-binary"),
      manualDescription: "Файл разверток для ручного описания",
    });

    expect(result.file.originalName).toContain("Развертки");
    expect(result.file.status).toBe("needs_manual_description");
    expect(result.file.sha256).toHaveLength(64);
    expect(result.extractedText?.extractor).toBe("unsupported");
    expect(result.extractedText?.parseQuality).toBe("unsupported");
  });

  it("extracts text from plain text uploads for local smoke fixtures", async () => {
    const project = await createProject({
      name: "Тестовый проект",
      description: "",
    });

    const result = await uploadAndProcessFile({
      projectId: project.id,
      originalName: "brief.txt",
      mimeType: "text/plain",
      bytes: Buffer.from("Материалы: дерево, камень", "utf8"),
    });

    expect(result.file.status).toBe("extracted");
    expect(result.extractedText?.text).toContain("дерево");
    expect(result.extractedText?.parseQuality).toBe("good");
  });
});
