import { NextRequest } from "next/server";

import { buildAndSaveDraftPrompt } from "@/lib/prompts/promptService";
import { uploadAndProcessFile } from "@/lib/uploads/uploadService";

export async function POST(request: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "file is required" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const result = await uploadAndProcessFile({
    projectId,
    originalName: file.name,
    mimeType: file.type || "application/octet-stream",
    bytes,
    manualDescription: String(formData.get("manualDescription") ?? ""),
  });
  await buildAndSaveDraftPrompt(projectId);

  return Response.json(result);
}
