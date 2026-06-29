"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createProject } from "@/lib/projects/projectService";

export async function createProjectAction(formData: FormData) {
  const project = await createProject({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  });

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}
