import { db } from "@/lib/db";

export type CreateProjectInput = {
  name: string;
  description?: string;
};

export async function createProject(input: CreateProjectInput) {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Project name is required");
  }

  return db.project.create({
    data: {
      name,
      description: input.description?.trim() ?? "",
    },
  });
}

export async function listProjects() {
  return db.project.findMany({
    where: { status: "active" },
    orderBy: { updatedAt: "desc" },
    include: {
      files: true,
      generationJobs: true,
    },
  });
}

export async function getProjectWorkspace(projectId: string) {
  return db.project.findUnique({
    where: { id: projectId },
    include: {
      files: {
        orderBy: { createdAt: "desc" },
        include: { extractedTexts: { orderBy: { createdAt: "desc" } } },
      },
      promptVersions: {
        orderBy: { version: "desc" },
      },
      generationJobs: {
        orderBy: { createdAt: "desc" },
        include: {
          promptVersion: true,
          results: { orderBy: { createdAt: "desc" } },
        },
      },
    },
  });
}
