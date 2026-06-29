type Prompt = {
  id: string;
  title: string;
  version: number;
  draftSource: string;
  promptText: string;
} | null;

export function DraftBriefPanel({
  prompt,
  projectId,
  buildAction,
}: {
  prompt: Prompt;
  projectId: string;
  buildAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <section className="rounded-md border border-stone-300 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-stone-950">Draft brief</h2>
          <p className="text-sm text-stone-600">{prompt ? `${prompt.title} · v${prompt.version}` : "No prompt yet"}</p>
        </div>
        <form action={buildAction}>
          <input type="hidden" name="projectId" value={projectId} />
          <button className="rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-800">
            Build draft
          </button>
        </form>
      </div>
      <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-stone-50 p-3 text-sm text-stone-700">
        {prompt?.promptText ?? "Build a draft after uploading source files."}
      </pre>
    </section>
  );
}
