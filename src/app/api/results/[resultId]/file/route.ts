import { readFile } from "node:fs/promises";
import path from "node:path";

import { db } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ resultId: string }> }) {
  const { resultId } = await context.params;
  const result = await db.generationResult.findUnique({ where: { id: resultId } });
  if (!result) return Response.json({ error: "Result not found" }, { status: 404 });

  const storageRoot = path.join(process.cwd(), "storage");
  const absolutePath = path.resolve(storageRoot, result.storageKey);
  if (!absolutePath.startsWith(storageRoot)) {
    return Response.json({ error: "Invalid result path" }, { status: 400 });
  }

  const bytes = await readFile(absolutePath);
  return new Response(bytes, {
    headers: {
      "Content-Type": result.mimeType,
      "Content-Length": String(result.sizeBytes),
      "Cache-Control": "private, no-store",
    },
  });
}
