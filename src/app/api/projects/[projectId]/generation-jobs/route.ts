import { createGenerationJob } from "@/lib/generation/generationService";

export async function POST(_request: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const job = await createGenerationJob(projectId);
  return Response.json(job);
}
