import { db } from "@/lib/db";

export async function resetDatabaseForTests() {
  await db.generationResult.deleteMany();
  await db.generationJob.deleteMany();
  await db.promptVersion.deleteMany();
  await db.extractedText.deleteMany();
  await db.uploadedFile.deleteMany();
  await db.project.deleteMany();
}
