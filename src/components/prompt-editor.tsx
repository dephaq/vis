type Prompt = {
  title: string;
  version: number;
  promptText: string;
} | null;

export function PromptEditor({
  prompt,
  projectId,
  saveAction,
}: {
  prompt: Prompt;
  projectId: string;
  saveAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <section className="rounded-md border border-stone-300 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-950">Prompt editor</h2>
      <form action={saveAction} className="mt-3 space-y-3">
        <input type="hidden" name="projectId" value={projectId} />
        <label className="block text-sm font-medium text-stone-800" htmlFor="prompt-title">
          Version title
        </label>
        <input
          id="prompt-title"
          name="title"
          defaultValue={prompt ? `${prompt.title} edited` : "Manual prompt"}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <label className="block text-sm font-medium text-stone-800" htmlFor="promptText">
          Prompt text
        </label>
        <textarea
          id="promptText"
          name="promptText"
          defaultValue={prompt?.promptText ?? ""}
          className="min-h-64 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
          placeholder="Build or write a prompt before generation."
        />
        <button className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800">
          Save prompt
        </button>
      </form>
    </section>
  );
}
