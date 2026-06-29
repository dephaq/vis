import { db } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ generationJobId: string }> }) {
  const { generationJobId } = await context.params;
  const job = await db.generationJob.findUnique({
    where: { id: generationJobId },
    include: { results: true },
  });
  if (!job) return Response.json({ error: "Job not found" }, { status: 404 });
  return Response.json(job);
}
