import { db } from "@/lib/db";

export async function POST(_request: Request, context: { params: Promise<{ uploadedFileId: string }> }) {
  const { uploadedFileId } = await context.params;
  const file = await db.uploadedFile.findUnique({
    where: { id: uploadedFileId },
    include: { extractedTexts: true },
  });

  if (!file) return Response.json({ error: "Upload not found" }, { status: 404 });
  return Response.json(file);
}
