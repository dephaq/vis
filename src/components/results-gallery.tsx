type JobWithResults = {
  id: string;
  status: string;
  promptVersion: { version: number };
  results: Array<{ id: string; mimeType: string; providerMetadataJson: string; createdAt: Date }>;
};

export function ResultsGallery({ jobs }: { jobs: JobWithResults[] }) {
  const results = jobs.flatMap((job) => job.results.map((result) => ({ job, result })));

  return (
    <section className="rounded-md border border-stone-300 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-950">Results</h2>
      {results.length === 0 ? (
        <p className="mt-3 text-sm text-stone-600">Generated images will appear here.</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {results.map(({ job, result }) => (
            <article key={result.id} className="overflow-hidden rounded-md border border-stone-200">
              {/* eslint-disable-next-line @next/next/no-img-element -- Generated results are private local files, so Next image optimization should not cache or proxy them. */}
              <img
                src={`/api/results/${result.id}/file`}
                alt={`Generated result for prompt v${job.promptVersion.version}`}
                className="aspect-video w-full bg-stone-100 object-cover"
              />
              <div className="p-3 text-xs text-stone-600">
                <p className="font-medium text-stone-950">Prompt v{job.promptVersion.version}</p>
                <a className="mt-2 inline-block text-blue-700" href={`/api/results/${result.id}/file`} download>
                  Download
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
