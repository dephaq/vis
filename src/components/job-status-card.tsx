"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Job = {
  id: string;
  status: string;
  provider: string;
  model: string;
  errorMessage: string | null;
  createdAt: Date;
};

export function JobStatusCard({ projectId, jobs }: { projectId: string; jobs: Job[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const latest = jobs[0];

  async function generate() {
    setPending(true);
    await fetch(`/api/projects/${projectId}/generation-jobs`, { method: "POST" });
    setPending(false);
    router.refresh();
  }

  return (
    <section className="sticky top-4 rounded-md border border-stone-300 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-950">Generate</h2>
      <p className="mt-1 text-sm text-stone-600">Default provider is a deterministic mock for local work and tests.</p>
      <button
        onClick={() => void generate()}
        disabled={pending}
        className="mt-4 w-full rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-stone-400"
      >
        {pending ? "Generating" : "Generate image"}
      </button>
      {latest && (
        <div className="mt-4 rounded-md bg-stone-50 p-3 text-sm">
          <p className="font-medium text-stone-950">Latest job: {latest.status}</p>
          <p className="mt-1 text-xs text-stone-600">
            {latest.provider} · {latest.model}
          </p>
          {latest.errorMessage && <p className="mt-2 text-xs text-red-700">{latest.errorMessage}</p>}
        </div>
      )}
    </section>
  );
}
