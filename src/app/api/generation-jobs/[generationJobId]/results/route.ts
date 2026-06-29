import { db } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ generationJobId: string }> }) {
  const { generationJobId } = await context.params;
  const results = await db.generationResult.findMany({
    where: { jobId: generationJobId },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(results);
}
