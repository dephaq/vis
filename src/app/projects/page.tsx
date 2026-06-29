import Link from "next/link";

import { createProjectAction } from "@/app/actions/projects";
import { listProjects } from "@/lib/projects/projectService";

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2 border-b border-stone-300 pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-700">Visualization PWA</p>
        <h1 className="text-3xl font-semibold text-stone-950 sm:text-5xl">Interior Visualization</h1>
        <p className="max-w-2xl text-base text-stone-700">
          Local workspace for project files, extracted briefs, editable prompts, and mock-safe image generation.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form action={createProjectAction} className="rounded-md border border-stone-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">Create project</h2>
          <label className="mt-4 block text-sm font-medium text-stone-800" htmlFor="name">
            Project name
          </label>
          <input
            id="name"
            name="name"
            required
            className="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            placeholder="Кухня-гостиная-столовая"
          />
          <label className="mt-4 block text-sm font-medium text-stone-800" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="mt-2 min-h-24 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            placeholder="Short project note"
          />
          <button className="mt-4 w-full rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800">
            Create project
          </button>
        </form>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-950">Projects</h2>
          {projects.length === 0 ? (
            <p className="rounded-md border border-dashed border-stone-300 p-6 text-sm text-stone-600">
              No projects yet. Create the first workspace to upload files and build a prompt.
            </p>
          ) : (
            <ul className="grid gap-3">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}`}
                    className="block rounded-md border border-stone-300 bg-white p-4 transition hover:border-blue-500 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-stone-950">{project.name}</h3>
                        <p className="mt-1 text-sm text-stone-600">{project.description || "No description"}</p>
                      </div>
                      <span className="rounded bg-stone-100 px-2 py-1 text-xs text-stone-600">
                        {project.files.length} files
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
