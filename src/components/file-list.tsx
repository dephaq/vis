import { updateFileDescriptionAction } from "@/app/actions/prompts";

type FileWithTexts = {
  id: string;
  originalName: string;
  kind: string;
  status: string;
  sizeBytes: number;
  manualDescription: string | null;
  extractedTexts: Array<{ parseQuality: string }>;
};

export function FileList({ projectId, files }: { projectId: string; files: FileWithTexts[] }) {
  return (
    <section className="rounded-md border border-stone-300 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-950">Files</h2>
      {files.length === 0 ? (
        <p className="mt-3 text-sm text-stone-600">No files uploaded yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {files.map((file) => (
            <li key={file.id} className="rounded-md border border-stone-200 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium text-stone-950">{file.originalName}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    {file.kind} · {(file.sizeBytes / 1024).toFixed(1)} KB · {file.extractedTexts[0]?.parseQuality ?? "pending"}
                  </p>
                </div>
                <span className="shrink-0 rounded bg-stone-100 px-2 py-1 text-xs text-stone-700">{file.status}</span>
              </div>
              {file.status === "needs_manual_description" && (
                <form action={updateFileDescriptionAction} className="mt-3">
                  <input type="hidden" name="projectId" value={projectId} />
                  <input type="hidden" name="fileId" value={file.id} />
                  <label className="text-xs font-medium text-stone-700" htmlFor={`manual-${file.id}`}>
                    Manual description
                  </label>
                  <textarea
                    id={`manual-${file.id}`}
                    name="manualDescription"
                    defaultValue={file.manualDescription ?? ""}
                    className="mt-1 min-h-20 w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                  />
                  <button className="mt-2 rounded-md border border-blue-700 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    Save note
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
