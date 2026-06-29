import Link from "next/link";
import { notFound } from "next/navigation";

import { buildDraftPromptAction, savePromptAction } from "@/app/actions/prompts";
import { DraftBriefPanel } from "@/components/draft-brief-panel";
import { ExtractedTextPanel } from "@/components/extracted-text-panel";
import { FileList } from "@/components/file-list";
import { JobStatusCard } from "@/components/job-status-card";
import { PromptEditor } from "@/components/prompt-editor";
import { ResultsGallery } from "@/components/results-gallery";
import { UploadDropzone } from "@/components/upload-dropzone";
import { getProjectWorkspace } from "@/lib/projects/projectService";

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getProjectWorkspace(projectId);
  if (!project) notFound();

  const activePrompt = project.promptVersions.find((prompt) => prompt.isActive) ?? project.promptVersions[0] ?? null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 border-b border-stone-300 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/projects" className="text-sm font-medium text-blue-700 hover:text-blue-900">
            Back to projects
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">{project.name}</h1>
          <p className="mt-1 text-sm text-stone-600">{project.description || "No project description yet"}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-stone-600">
          <span className="rounded-md border border-stone-300 bg-white px-3 py-2">{project.files.length} files</span>
          <span className="rounded-md border border-stone-300 bg-white px-3 py-2">{project.promptVersions.length} prompts</span>
          <span className="rounded-md border border-stone-300 bg-white px-3 py-2">{project.generationJobs.length} jobs</span>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[320px_1fr_340px]">
        <aside className="space-y-5">
          <UploadDropzone projectId={project.id} />
          <FileList projectId={project.id} files={project.files} />
        </aside>

        <section className="space-y-5">
          <ExtractedTextPanel files={project.files} />
          <DraftBriefPanel prompt={activePrompt} buildAction={buildDraftPromptAction} projectId={project.id} />
          <PromptEditor prompt={activePrompt} projectId={project.id} saveAction={savePromptAction} />
        </section>

        <aside className="space-y-5">
          <JobStatusCard projectId={project.id} jobs={project.generationJobs} />
          <ResultsGallery jobs={project.generationJobs} />
        </aside>
      </section>
    </main>
  );
}
